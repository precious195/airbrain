import { SystemIntegration } from '@/types/database';

// Simple encryption/decryption utilities
// In production, use a proper encryption library like crypto-js
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

function simpleEncrypt(text: string): string {
    // Basic XOR encryption for demo - use proper encryption in production
    return Buffer.from(text).toString('base64');
}

function simpleDecrypt(encrypted: string): string {
    return Buffer.from(encrypted, 'base64').toString('utf-8');
}

export const externalSystemService = {
    /**
     * Test connection to external system
     */
    async testConnection(config: SystemIntegration): Promise<{ success: boolean; message: string }> {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                ...(config.headers || {})
            };

            // Add authentication
            if (config.authType === 'basic') {
                const credentials = Buffer.from(`${config.username}:${simpleDecrypt(config.password)}`).toString('base64');
                headers['Authorization'] = `Basic ${credentials}`;
            } else if (config.authType === 'bearer' && config.apiKey) {
                headers['Authorization'] = `Bearer ${simpleDecrypt(config.apiKey)}`;
            } else if (config.authType === 'apiKey' && config.apiKey) {
                headers['X-API-Key'] = simpleDecrypt(config.apiKey);
            }

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), config.timeout || 10000);

            const response = await fetch(config.systemUrl, {
                method: 'GET',
                headers,
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (response.ok) {
                return { success: true, message: 'Connection successful' };
            } else {
                return { success: false, message: `HTTP ${response.status}: ${response.statusText}` };
            }
        } catch (error: any) {
            console.error('External system connection test failed:', error);
            return { success: false, message: error.message || 'Connection failed' };
        }
    },

    /**
     * Query customer data from external system
     */
    async queryCustomerData(config: SystemIntegration, customerId: string): Promise<any> {
        if (!config.enabled || !config.rules.canViewCustomerInfo) {
            throw new Error('Customer data access not enabled');
        }

        return this.makeRequest(config, `/customers/${customerId}`, 'GET');
    },

    /**
     * Query account balance
     */
    async queryBalance(config: SystemIntegration, accountId: string): Promise<any> {
        if (!config.enabled || !config.rules.canViewBalance) {
            throw new Error('Balance query not enabled');
        }

        return this.makeRequest(config, `/accounts/${accountId}/balance`, 'GET');
    },

    /**
     * Query transactions
     */
    async queryTransactions(config: SystemIntegration, accountId: string, limit: number = 10): Promise<any> {
        if (!config.enabled || !config.rules.canViewTransactions) {
            throw new Error('Transaction query not enabled');
        }

        return this.makeRequest(config, `/accounts/${accountId}/transactions?limit=${limit}`, 'GET');
    },

    /**
     * Execute custom operation
     */
    async executeCustomOperation(config: SystemIntegration, operationName: string, params?: any): Promise<any> {
        if (!config.enabled) {
            throw new Error('System integration not enabled');
        }

        const operation = config.rules.customOperations?.find(op => op.name === operationName && op.enabled);
        if (!operation) {
            throw new Error(`Operation ${operationName} not found or not enabled`);
        }

        return this.makeRequest(config, operation.endpoint, operation.method, params);
    },

    /**
     * Generic request method
     */
    async makeRequest(
        config: SystemIntegration,
        path: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
        body?: any
    ): Promise<any> {
        try {
            const url = `${config.systemUrl}${path}`;
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                ...(config.headers || {})
            };

            // Add authentication
            if (config.authType === 'basic') {
                const credentials = Buffer.from(`${config.username}:${simpleDecrypt(config.password)}`).toString('base64');
                headers['Authorization'] = `Basic ${credentials}`;
            } else if (config.authType === 'bearer' && config.apiKey) {
                headers['Authorization'] = `Bearer ${simpleDecrypt(config.apiKey)}`;
            } else if (config.authType === 'apiKey' && config.apiKey) {
                headers['X-API-Key'] = simpleDecrypt(config.apiKey);
            }

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), config.timeout || 10000);

            const response = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error: any) {
            console.error('External system request failed:', error);
            throw error;
        }
    },

    /**
     * Encrypt sensitive data before storage
     */
    encryptCredentials(text: string): string {
        return simpleEncrypt(text);
    },

    /**
     * Decrypt credentials for use
     */
    decryptCredentials(encrypted: string): string {
        return simpleDecrypt(encrypted);
    }
};
