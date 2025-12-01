// src/lib/integrations/mobile-money.ts

/**
 * Integration Layer - Mobile Money Providers
 * Supports: Airtel Money, MTN MoMo, Zamtel Kwacha
 */

export interface MobileMoneyTransaction {
    transactionId: string;
    externalReference?: string;
    amount: number;
    currency: string;
    phoneNumber: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    timestamp: string;
    errorMessage?: string;
}

export interface MobileMoneyConfig {
    provider: 'airtel' | 'mtn' | 'zamtel';
    apiUrl: string;
    clientId: string;
    clientSecret: string;
    merchantCode: string;
    environment: 'sandbox' | 'production';
}

/**
 * Airtel Money Integration
 */
export class AirtelMoneyClient {
    private config: MobileMoneyConfig;
    private accessToken?: string;
    private tokenExpiry?: number;

    constructor(config: MobileMoneyConfig) {
        this.config = config;
    }

    /**
     * Authenticate and get access token
     */
    private async authenticate(): Promise<string> {
        // Check if cached token is still valid
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            // TODO: Replace with actual Airtel Money OAuth endpoint
            const response = await fetch(`${this.config.apiUrl}/auth/oauth2/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: this.config.clientId,
                    client_secret: this.config.clientSecret,
                    grant_type: 'client_credentials',
                }),
            });

            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.statusText}`);
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 min buffer

            return this.accessToken!;
        } catch (error) {
            throw new Error(`Airtel Money authentication error: ${error}`);
        }
    }

    /**
     * Initiate payment collection
     */
    async collectPayment(
        phoneNumber: string,
        amount: number,
        reference: string,
        description: string
    ): Promise<MobileMoneyTransaction> {
        const token = await this.authenticate();

        try {
            // TODO: Replace with actual Airtel Money collection endpoint
            const response = await fetch(`${this.config.apiUrl}/merchant/v1/payments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Country': 'ZM',
                    'X-Currency': 'ZMW',
                },
                body: JSON.stringify({
                    reference,
                    subscriber: {
                        country: 'ZM',
                        currency: 'ZMW',
                        msisdn: phoneNumber.replace('+260', ''), // Remove country code
                    },
                    transaction: {
                        amount: amount.toString(),
                        country: 'ZM',
                        currency: 'ZMW',
                        id: reference,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error(`Payment collection failed: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                transactionId: reference,
                externalReference: data.data?.transaction?.id,
                amount,
                currency: 'ZMW',
                phoneNumber,
                status: data.status?.toLowerCase() || 'pending',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                transactionId: reference,
                amount,
                currency: 'ZMW',
                phoneNumber,
                status: 'failed',
                timestamp: new Date().toISOString(),
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Check transaction status
     */
    async checkStatus(transactionId: string): Promise<MobileMoneyTransaction> {
        const token = await this.authenticate();

        try {
            const response = await fetch(
                `${this.config.apiUrl}/merchant/v1/payments/${transactionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Country': 'ZM',
                        'X-Currency': 'ZMW',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Status check failed: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                transactionId,
                externalReference: data.data?.transaction?.id,
                amount: parseFloat(data.data?.transaction?.amount || '0'),
                currency: 'ZMW',
                phoneNumber: data.data?.subscriber?.msisdn || '',
                status: data.status?.toLowerCase() || 'pending',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            throw new Error(`Status check error: ${error}`);
        }
    }

    /**
     * Initiate refund
     */
    async refund(
        originalTransactionId: string,
        amount: number,
        reason: string
    ): Promise<MobileMoneyTransaction> {
        const token = await this.authenticate();

        try {
            const refundId = `REFUND_${Date.now()}`;

            const response = await fetch(`${this.config.apiUrl}/merchant/v1/refund`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Country': 'ZM',
                    'X-Currency': 'ZMW',
                },
                body: JSON.stringify({
                    transaction: {
                        id: refundId,
                        original_id: originalTransactionId,
                        amount: amount.toString(),
                    },
                    reason,
                }),
            });

            if (!response.ok) {
                throw new Error(`Refund failed: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                transactionId: refundId,
                externalReference: data.data?.transaction?.id,
                amount,
                currency: 'ZMW',
                phoneNumber: '',
                status: 'completed',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            throw new Error(`Refund error: ${error}`);
        }
    }

    /**
     * Query account balance
     */
    async getBalance(): Promise<{ available: number; currency: string }> {
        const token = await this.authenticate();

        try {
            const response = await fetch(`${this.config.apiUrl}/merchant/v1/balance`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Country': 'ZM',
                },
            });

            if (!response.ok) {
                throw new Error(`Balance query failed: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                available: parseFloat(data.data?.balance || '0'),
                currency: 'ZMW',
            };
        } catch (error) {
            throw new Error(`Balance query error: ${error}`);
        }
    }
}

/**
 * MTN MoMo Integration
 */
export class MTNMoMoClient {
    private config: MobileMoneyConfig;
    private apiKey?: string;

    constructor(config: MobileMoneyConfig) {
        this.config = config;
    }

    /**
     * Create API user (one-time setup)
     */
    async createAPIUser(): Promise<{ userId: string; apiKey: string }> {
        // TODO: Implement MTN MoMo API user creation
        return {
            userId: 'mock_user_id',
            apiKey: 'mock_api_key',
        };
    }

    /**
     * Request to pay
     */
    async requestToPay(
        phoneNumber: string,
        amount: number,
        reference: string,
        note: string
    ): Promise<MobileMoneyTransaction> {
        try {
            // TODO: Replace with actual MTN MoMo endpoint
            const response = await fetch(
                `${this.config.apiUrl}/collection/v1_0/requesttopay`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.config.clientSecret}`,
                        'X-Reference-Id': reference,
                        'X-Target-Environment': this.config.environment,
                        'Ocp-Apim-Subscription-Key': this.config.clientId,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: amount.toString(),
                        currency: 'ZMW',
                        externalId: reference,
                        payer: {
                            partyIdType: 'MSISDN',
                            partyId: phoneNumber.replace('+260', '260'),
                        },
                        payerMessage: note,
                        payeeNote: note,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Request to pay failed: ${response.statusText}`);
            }

            return {
                transactionId: reference,
                amount,
                currency: 'ZMW',
                phoneNumber,
                status: 'pending',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                transactionId: reference,
                amount,
                currency: 'ZMW',
                phoneNumber,
                status: 'failed',
                timestamp: new Date().toISOString(),
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Check request to pay status
     */
    async getTransactionStatus(referenceId: string): Promise<MobileMoneyTransaction> {
        try {
            const response = await fetch(
                `${this.config.apiUrl}/collection/v1_0/requesttopay/${referenceId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.clientSecret}`,
                        'X-Target-Environment': this.config.environment,
                        'Ocp-Apim-Subscription-Key': this.config.clientId,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Status check failed: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                transactionId: referenceId,
                externalReference: data.financialTransactionId,
                amount: parseFloat(data.amount),
                currency: data.currency,
                phoneNumber: data.payer?.partyId || '',
                status: data.status?.toLowerCase() || 'pending',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            throw new Error(`Status check error: ${error}`);
        }
    }
}

/**
 * Zamtel Kwacha Integration
 */
export class ZamtelKwachaClient {
    private config: MobileMoneyConfig;

    constructor(config: MobileMoneyConfig) {
        this.config = config;
    }

    /**
     * Initiate payment
     */
    async initiatePayment(
        phoneNumber: string,
        amount: number,
        reference: string
    ): Promise<MobileMoneyTransaction> {
        try {
            // TODO: Replace with actual Zamtel Kwacha endpoint
            const response = await fetch(`${this.config.apiUrl}/payments/initiate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    merchant_code: this.config.merchantCode,
                    phone_number: phoneNumber,
                    amount,
                    reference,
                    currency: 'ZMW',
                }),
            });

            if (!response.ok) {
                throw new Error(`Payment initiation failed: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                transactionId: reference,
                externalReference: data.transaction_id,
                amount,
                currency: 'ZMW',
                phoneNumber,
                status: data.status?.toLowerCase() || 'pending',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                transactionId: reference,
                amount,
                currency: 'ZMW',
                phoneNumber,
                status: 'failed',
                timestamp: new Date().toISOString(),
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Check transaction status
     */
    async checkStatus(transactionId: string): Promise<MobileMoneyTransaction> {
        try {
            const response = await fetch(
                `${this.config.apiUrl}/payments/status/${transactionId}`,
                {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Status check failed: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                transactionId,
                externalReference: data.transaction_id,
                amount: data.amount,
                currency: 'ZMW',
                phoneNumber: data.phone_number,
                status: data.status?.toLowerCase() || 'pending',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            throw new Error(`Status check error: ${error}`);
        }
    }
}

/**
 * Unified Mobile Money facade
 */
export class MobileMoneyService {
    private providers: Map<string, AirtelMoneyClient | MTNMoMoClient | ZamtelKwachaClient> = new Map();

    registerProvider(name: string, client: any): void {
        this.providers.set(name, client);
    }

    async processPayment(
        provider: 'airtel' | 'mtn' | 'zamtel',
        phoneNumber: string,
        amount: number,
        reference: string,
        description: string
    ): Promise<MobileMoneyTransaction> {
        const client = this.providers.get(provider);
        if (!client) {
            throw new Error(`Provider ${provider} not configured`);
        }

        if (client instanceof AirtelMoneyClient) {
            return await client.collectPayment(phoneNumber, amount, reference, description);
        } else if (client instanceof MTNMoMoClient) {
            return await client.requestToPay(phoneNumber, amount, reference, description);
        } else if (client instanceof ZamtelKwachaClient) {
            return await client.initiatePayment(phoneNumber, amount, reference);
        }

        throw new Error('Unknown provider type');
    }

    async checkStatus(
        provider: 'airtel' | 'mtn' | 'zamtel',
        transactionId: string
    ): Promise<MobileMoneyTransaction> {
        const client = this.providers.get(provider);
        if (!client) {
            throw new Error(`Provider ${provider} not configured`);
        }

        if (client instanceof AirtelMoneyClient) {
            return await client.checkStatus(transactionId);
        } else if (client instanceof MTNMoMoClient) {
            return await client.getTransactionStatus(transactionId);
        } else if (client instanceof ZamtelKwachaClient) {
            return await client.checkStatus(transactionId);
        }

        throw new Error('Unknown provider type');
    }
}
