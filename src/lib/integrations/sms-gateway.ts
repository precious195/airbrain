// src/lib/integrations/sms-gateway.ts

/**
 * Integration Layer - SMS Gateways
 * Supports Twilio, AfricasTalking, and custom SMS providers
 */

export interface SMSConfig {
    provider: 'twilio' | 'africas_talking' | 'custom';
    accountSid?: string; // Twilio
    authToken?: string; // Twilio
    apiKey?: string; // AfricasTalking, Custom
    username?: string; // AfricasTalking
    fromNumber: string; // Sender ID
    apiUrl?: string; // Custom provider
}

export interface SMSMessage {
    id: string;
    to: string;
    from: string;
    message: string;
    status: 'queued' | 'sent' | 'delivered' | 'failed';
    timestamp: string;
    errorMessage?: string;
    cost?: number;
}

/**
 * Twilio SMS Client
 */
export class TwilioSMSClient {
    private config: SMSConfig;

    constructor(config: SMSConfig) {
        this.config = config;
    }

    /**
     * Send SMS via Twilio
     */
    async sendSMS(
        to: string,
        message: string
    ): Promise<SMSMessage> {
        try {
            const auth = Buffer.from(
                `${this.config.accountSid}:${this.config.authToken}`
            ).toString('base64');

            const response = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        To: to,
                        From: this.config.fromNumber,
                        Body: message,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'SMS send failed');
            }

            const data = await response.json();

            return {
                id: data.sid,
                to: data.to,
                from: data.from,
                message,
                status: data.status === 'queued' ? 'queued' : 'sent',
                timestamp: new Date().toISOString(),
                cost: parseFloat(data.price || '0'),
            };
        } catch (error) {
            return {
                id: `FAILED_${Date.now()}`,
                to,
                from: this.config.fromNumber,
                message,
                status: 'failed',
                timestamp: new Date().toISOString(),
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Send bulk SMS
     */
    async sendBulkSMS(
        recipients: string[],
        message: string
    ): Promise<SMSMessage[]> {
        const promises = recipients.map(to => this.sendSMS(to, message));
        return Promise.all(promises);
    }

    /**
     * Get message status
     */
    async getMessageStatus(messageId: string): Promise<SMSMessage> {
        try {
            const auth = Buffer.from(
                `${this.config.accountSid}:${this.config.authToken}`
            ).toString('base64');

            const response = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages/${messageId}.json`,
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Status check failed');
            }

            const data = await response.json();

            return {
                id: data.sid,
                to: data.to,
                from: data.from,
                message: data.body,
                status: data.status === 'delivered' ? 'delivered' : data.status,
                timestamp: data.date_sent,
                cost: parseFloat(data.price || '0'),
            };
        } catch (error) {
            throw new Error(`Failed to get message status: ${error}`);
        }
    }
}

/**
 * Africa's Talking SMS Client
 */
export class AfricasTalkingSMSClient {
    private config: SMSConfig;

    constructor(config: SMSConfig) {
        this.config = config;
    }

    /**
     * Send SMS via Africa's Talking
     */
    async sendSMS(
        to: string,
        message: string
    ): Promise<SMSMessage> {
        try {
            const response = await fetch(
                'https://api.africastalking.com/version1/messaging',
                {
                    method: 'POST',
                    headers: {
                        'apiKey': this.config.apiKey || '',
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        username: this.config.username || '',
                        to,
                        message,
                        from: this.config.fromNumber,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('SMS send failed');
            }

            const data = await response.json();
            const recipient = data.SMSMessageData.Recipients[0];

            return {
                id: recipient.messageId,
                to,
                from: this.config.fromNumber,
                message,
                status: recipient.status === 'Success' ? 'sent' : 'failed',
                timestamp: new Date().toISOString(),
                cost: parseFloat(recipient.cost || '0'),
                errorMessage: recipient.status !== 'Success' ? recipient.status : undefined,
            };
        } catch (error) {
            return {
                id: `FAILED_${Date.now()}`,
                to,
                from: this.config.fromNumber,
                message,
                status: 'failed',
                timestamp: new Date().toISOString(),
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Send bulk SMS
     */
    async sendBulkSMS(
        recipients: string[],
        message: string
    ): Promise<SMSMessage[]> {
        const toList = recipients.join(',');

        try {
            const response = await fetch(
                'https://api.africastalking.com/version1/messaging',
                {
                    method: 'POST',
                    headers: {
                        'apiKey': this.config.apiKey || '',
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        username: this.config.username || '',
                        to: toList,
                        message,
                        from: this.config.fromNumber,
                    }),
                }
            );

            const data = await response.json();
            const recipientData = data.SMSMessageData.Recipients;

            return recipientData.map((recipient: any) => ({
                id: recipient.messageId,
                to: recipient.number,
                from: this.config.fromNumber,
                message,
                status: recipient.status === 'Success' ? 'sent' : 'failed',
                timestamp: new Date().toISOString(),
                cost: parseFloat(recipient.cost || '0'),
            }));
        } catch (error) {
            return recipients.map(to => ({
                id: `FAILED_${Date.now()}`,
                to,
                from: this.config.fromNumber,
                message,
                status: 'failed' as const,
                timestamp: new Date().toISOString(),
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            }));
        }
    }
}

/**
 * Custom SMS Gateway Client
 */
export class CustomSMSClient {
    private config: SMSConfig;

    constructor(config: SMSConfig) {
        this.config = config;
    }

    async sendSMS(to: string, message: string): Promise<SMSMessage> {
        try {
            const response = await fetch(`${this.config.apiUrl}/send`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to,
                    from: this.config.fromNumber,
                    message,
                }),
            });

            if (!response.ok) {
                throw new Error('SMS send failed');
            }

            const data = await response.json();

            return {
                id: data.message_id || `SMS${Date.now()}`,
                to,
                from: this.config.fromNumber,
                message,
                status: data.status || 'sent',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                id: `FAILED_${Date.now()}`,
                to,
                from: this.config.fromNumber,
                message,
                status: 'failed',
                timestamp: new Date().toISOString(),
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async sendBulkSMS(recipients: string[], message: string): Promise<SMSMessage[]> {
        const promises = recipients.map(to => this.sendSMS(to, message));
        return Promise.all(promises);
    }
}

/**
 * SMS Service Factory
 */
export class SMSService {
    private client: TwilioSMSClient | AfricasTalkingSMSClient | CustomSMSClient;

    constructor(config: SMSConfig) {
        switch (config.provider) {
            case 'twilio':
                this.client = new TwilioSMSClient(config);
                break;
            case 'africas_talking':
                this.client = new AfricasTalkingSMSClient(config);
                break;
            case 'custom':
                this.client = new CustomSMSClient(config);
                break;
            default:
                throw new Error(`Unsupported SMS provider: ${config.provider}`);
        }
    }

    async sendSMS(to: string, message: string): Promise<SMSMessage> {
        return this.client.sendSMS(to, message);
    }

    async sendBulkSMS(recipients: string[], message: string): Promise<SMSMessage[]> {
        return this.client.sendBulkSMS(recipients, message);
    }

    async sendOTP(to: string, otp: string): Promise<SMSMessage> {
        const message = `Your verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
        return this.sendSMS(to, message);
    }

    async sendTransactionAlert(
        to: string,
        amount: number,
        type: 'debit' | 'credit',
        balance: number
    ): Promise<SMSMessage> {
        const sign = type === 'debit' ? '-' : '+';
        const message = `Transaction Alert: ${sign}K${amount}. Account Balance: K${balance}`;
        return this.sendSMS(to, message);
    }

    async sendPaymentReminder(
        to: string,
        amount: number,
        dueDate: string
    ): Promise<SMSMessage> {
        const message = `Payment Reminder: K${amount} due on ${dueDate}. Please pay to avoid penalties.`;
        return this.sendSMS(to, message);
    }
}
