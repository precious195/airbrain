// src/lib/integrations/tv-providers.ts

/**
 * Integration Layer - TV/Satellite Providers
 * Supports decoder activation, reset, subscription management
 */

export interface TVProviderConfig {
    provider: 'dstv' | 'gotv' | 'topstar' | 'custom';
    apiUrl: string;
    apiKey: string;
    dealerCode?: string;
    environment: 'sandbox' | 'production';
}

export interface Decoder {
    decoderNumber: string;
    smartcardNumber: string;
    customerName: string;
    status: 'active' | 'suspended' | 'disconnected';
    package: string;
    expiryDate: string;
    balance: number;
}

export interface Package {
    packageCode: string;
    packageName: string;
    price: number;
    channels: number;
    description: string;
    features: string[];
}

/**
 * TV Provider Client
 */
export class TVProviderClient {
    private config: TVProviderConfig;

    constructor(config: TVProviderConfig) {
        this.config = config;
    }

    /**
     * Get decoder information
     */
    async getDecoderInfo(decoderNumber: string): Promise<Decoder> {
        try {
            const response = await fetch(
                `${this.config.apiUrl}/decoders/${decoderNumber}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                        'X-Dealer-Code': this.config.dealerCode || '',
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Decoder query failed: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                decoderNumber: data.decoder_number || decoderNumber,
                smartcardNumber: data.smartcard_number || data.iuc_number,
                customerName: data.customer_name,
                status: data.status || 'active',
                package: data.package_name || data.bouquet,
                expiryDate: data.expiry_date || data.due_date,
                balance: parseFloat(data.balance || data.outstanding || '0'),
            };
        } catch (error) {
            throw new Error(`Failed to fetch decoder info: ${error}`);
        }
    }

    /**
     * Activate decoder
     */
    async activateDecoder(
        decoderNumber: string,
        packageCode: string
    ): Promise<{ success: boolean; message: string; activationId?: string }> {
        try {
            const response = await fetch(`${this.config.apiUrl}/decoders/activate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'X-Dealer-Code': this.config.dealerCode || '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    decoder_number: decoderNumber,
                    package_code: packageCode,
                }),
            });

            if (!response.ok) {
                throw new Error('Activation failed');
            }

            const data = await response.json();

            return {
                success: true,
                message: 'Decoder activated successfully',
                activationId: data.activation_id || data.transaction_id,
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Activation failed',
            };
        }
    }

    /**
     * Reset decoder (send refresh command)
     */
    async resetDecoder(
        decoderNumber: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch(`${this.config.apiUrl}/decoders/reset`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'X-Dealer-Code': this.config.dealerCode || '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    decoder_number: decoderNumber,
                    command: 'refresh',
                }),
            });

            if (!response.ok) {
                throw new Error('Reset command failed');
            }

            return {
                success: true,
                message: 'Reset command sent. Please wait 5-10 minutes and restart your decoder.',
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Reset failed',
            };
        }
    }

    /**
     * Get available packages
     */
    async getPackages(): Promise<Package[]> {
        try {
            const response = await fetch(`${this.config.apiUrl}/packages`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch packages');
            }

            const data = await response.json();
            const packages = data.packages || data.bouquets || [];

            return packages.map((pkg: any) => ({
                packageCode: pkg.code || pkg.package_code,
                packageName: pkg.name || pkg.package_name,
                price: parseFloat(pkg.price || pkg.amount || '0'),
                channels: pkg.channels || pkg.channel_count || 0,
                description: pkg.description || '',
                features: pkg.features || [],
            }));
        } catch (error) {
            throw new Error(`Failed to fetch packages: ${error}`);
        }
    }

    /**
     * Change package/upgrade
     */
    async changePackage(
        decoderNumber: string,
        newPackageCode: string
    ): Promise<{ success: boolean; message: string; effectiveDate?: string }> {
        try {
            const response = await fetch(`${this.config.apiUrl}/decoders/change-package`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'X-Dealer-Code': this.config.dealerCode || '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    decoder_number: decoderNumber,
                    new_package_code: newPackageCode,
                }),
            });

            if (!response.ok) {
                throw new Error('Package change failed');
            }

            const data = await response.json();

            return {
                success: true,
                message: 'Package changed successfully',
                effectiveDate: data.effective_date || new Date().toISOString(),
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Package change failed',
            };
        }
    }

    /**
     * Process payment for subscription
     */
    async processPayment(
        decoderNumber: string,
        amount: number,
        paymentMethod: 'mobile_money' | 'card' | 'bank',
        paymentReference: string
    ): Promise<{ success: boolean; message: string; transactionId?: string }> {
        try {
            const response = await fetch(`${this.config.apiUrl}/payments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'X-Dealer-Code': this.config.dealerCode || '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    decoder_number: decoderNumber,
                    amount,
                    payment_method: paymentMethod,
                    reference: paymentReference,
                }),
            });

            if (!response.ok) {
                throw new Error('Payment processing failed');
            }

            const data = await response.json();

            return {
                success: true,
                message: 'Payment processed successfully',
                transactionId: data.transaction_id,
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Payment failed',
            };
        }
    }

    /**
     * Get payment history
     */
    async getPaymentHistory(decoderNumber: string): Promise<Array<{
        date: string;
        amount: number;
        reference: string;
        status: string;
    }>> {
        try {
            const response = await fetch(
                `${this.config.apiUrl}/decoders/${decoderNumber}/payments`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch payment history');
            }

            const data = await response.json();
            const payments = data.payments || data.transactions || [];

            return payments.map((payment: any) => ({
                date: payment.date || payment.payment_date,
                amount: parseFloat(payment.amount),
                reference: payment.reference || payment.transaction_ref,
                status: payment.status,
            }));
        } catch (error) {
            throw new Error(`Failed to fetch payment history: ${error}`);
        }
    }

    /**
     * Get decoder error codes/diagnostics
     */
    async getDiagnostics(
        decoderNumber: string
    ): Promise<{ errors: string[]; recommendations: string[] }> {
        try {
            const response = await fetch(
                `${this.config.apiUrl}/decoders/${decoderNumber}/diagnostics`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                    },
                }
            );

            if (!response.ok) {
                return {
                    errors: [],
                    recommendations: ['Unable to fetch diagnostics. Try manual troubleshooting.'],
                };
            }

            const data = await response.json();

            return {
                errors: data.errors || [],
                recommendations: data.recommendations || [],
            };
        } catch (error) {
            return {
                errors: [],
                recommendations: ['Diagnostics unavailable. Contact support.'],
            };
        }
    }

    /**
     * Register new decoder
     */
    async registerDecoder(
        decoderNumber: string,
        smartcardNumber: string,
        customerInfo: {
            name: string;
            email: string;
            phone: string;
            address: string;
        }
    ): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch(`${this.config.apiUrl}/decoders/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'X-Dealer-Code': this.config.dealerCode || '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    decoder_number: decoderNumber,
                    smartcard_number: smartcardNumber,
                    customer: customerInfo,
                }),
            });

            if (!response.ok) {
                throw new Error('Decoder registration failed');
            }

            return {
                success: true,
                message: 'Decoder registered successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Registration failed',
            };
        }
    }

    /**
     * Swap decoder (transfer subscription to new decoder)
     */
    async swapDecoder(
        oldDecoderNumber: string,
        newDecoderNumber: string,
        newSmartcardNumber: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch(`${this.config.apiUrl}/decoders/swap`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'X-Dealer-Code': this.config.dealerCode || '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    old_decoder: oldDecoderNumber,
                    new_decoder: newDecoderNumber,
                    new_smartcard: newSmartcardNumber,
                }),
            });

            if (!response.ok) {
                throw new Error('Decoder swap failed');
            }

            return {
                success: true,
                message: 'Decoder swapped successfully. Wait 24 hours for activation.',
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Swap failed',
            };
        }
    }
}
