// WhatsApp Service for sending messages
import type { IndustryType } from '../knowledge-bases';

interface WhatsAppConfig {
    phoneNumberId: string;
    accessToken: string;
    businessAccountId: string;
}

export class WhatsAppService {
    private static instance: WhatsAppService;

    private constructor() { }

    static getInstance(): WhatsAppService {
        if (!WhatsAppService.instance) {
            WhatsAppService.instance = new WhatsAppService();
        }
        return WhatsAppService.instance;
    }

    /**
     * Send a WhatsApp message via Meta's WhatsApp Business API
     */
    async sendMessage(
        config: WhatsAppConfig,
        recipientPhone: string,
        message: string
    ): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            const url = `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: recipientPhone,
                    type: 'text',
                    text: {
                        preview_url: false,
                        body: message
                    }
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('WhatsApp API error:', error);
                return {
                    success: false,
                    error: error.error?.message || 'Failed to send message'
                };
            }

            const data = await response.json();
            return {
                success: true,
                messageId: data.messages?.[0]?.id
            };
        } catch (error) {
            console.error('WhatsApp send error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Send a WhatsApp template message
     */
    async sendTemplate(
        config: WhatsAppConfig,
        recipientPhone: string,
        templateName: string,
        languageCode: string = 'en',
        components?: any[]
    ): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            const url = `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: recipientPhone,
                    type: 'template',
                    template: {
                        name: templateName,
                        language: { code: languageCode },
                        components: components || []
                    }
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error?.message || 'Failed to send template'
                };
            }

            const data = await response.json();
            return {
                success: true,
                messageId: data.messages?.[0]?.id
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Mark message as read
     */
    async markAsRead(
        config: WhatsAppConfig,
        messageId: string
    ): Promise<{ success: boolean }> {
        try {
            const url = `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    status: 'read',
                    message_id: messageId
                }),
            });

            return { success: response.ok };
        } catch (error) {
            return { success: false };
        }
    }

    /**
     * Send typing indicator
     */
    async sendTypingIndicator(
        config: WhatsAppConfig,
        recipientPhone: string
    ): Promise<void> {
        // Note: WhatsApp Business API doesn't support typing indicators
        // This is a placeholder for future enhancement
    }
}

export const whatsappService = WhatsAppService.getInstance();
