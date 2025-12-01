// src/lib/integrations/banking.ts

/**
 * Integration Layer - Core Banking Systems
 * Supports REST APIs, SOAP, and direct database connections
 */

export interface BankingConfig {
    apiUrl: string;
    apiKey?: string;
    username?: string;
    password?: string;
    bankCode: string;
    environment: 'sandbox' | 'production';
}

export interface AccountInfo {
    accountNumber: string;
    accountName: string;
    accountType: 'savings' | 'checking' | 'current' | 'fixed_deposit';
    balance: number;
    availableBalance: number;
    currency: string;
    status: 'active' | 'frozen' | 'closed';
    branch: string;
}

export interface Transaction {
    transactionId: string;
    accountNumber: string;
    date: string;
    type: 'debit' | 'credit';
    amount: number;
    description: string;
    balance: number;
    reference: string;
    channel?: string;
}

export interface TransferRequest {
    fromAccount: string;
    toAccount: string;
    amount: number;
    currency: string;
    description: string;
    reference?: string;
}

export interface TransferResponse {
    success: boolean;
    transactionId?: string;
    reference: string;
    timestamp: string;
    message: string;
}

/**
 * Core Banking System Client
 */
export class CoreBankingClient {
    private config: BankingConfig;
    private sessionToken?: string;

    constructor(config: BankingConfig) {
        this.config = config;
    }

    /**
     * Authenticate with banking system
     */
    private async authenticate(): Promise<string> {
        if (this.sessionToken) {
            return this.sessionToken;
        }

        try {
            // TODO: Replace with actual banking API authentication
            const response = await fetch(`${this.config.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Bank-Code': this.config.bankCode,
                },
                body: JSON.stringify({
                    username: this.config.username,
                    password: this.config.password,
                    api_key: this.config.apiKey,
                }),
            });

            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.statusText}`);
            }

            const data = await response.json();
            this.sessionToken = data.session_token || data.access_token;

            return this.sessionToken!;
        } catch (error) {
            throw new Error(`Banking authentication error: ${error}`);
        }
    }

    /**
     * Get account information
     */
    async getAccountInfo(accountNumber: string, customerId: string): Promise<AccountInfo> {
        const token = await this.authenticate();

        try {
            const response = await fetch(
                `${this.config.apiUrl}/accounts/${accountNumber}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Customer-Id': customerId,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Account query failed: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                accountNumber: data.account_number || accountNumber,
                accountName: data.account_name || data.customer_name,
                accountType: data.account_type || 'savings',
                balance: parseFloat(data.balance || data.current_balance || '0'),
                availableBalance: parseFloat(data.available_balance || data.balance || '0'),
                currency: data.currency || 'ZMW',
                status: data.status || 'active',
                branch: data.branch_name || data.branch_code || 'Main Branch',
            };
        } catch (error) {
            throw new Error(`Failed to fetch account info: ${error}`);
        }
    }

    /**
     * Get transaction history
     */
    async getTransactions(
        accountNumber: string,
        startDate?: string,
        endDate?: string,
        limit: number = 50
    ): Promise<Transaction[]> {
        const token = await this.authenticate();

        try {
            const params = new URLSearchParams({
                account: accountNumber,
                limit: limit.toString(),
                ...(startDate && { start_date: startDate }),
                ...(endDate && { end_date: endDate }),
            });

            const response = await fetch(
                `${this.config.apiUrl}/transactions?${params}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Transaction query failed: ${response.statusText}`);
            }

            const data = await response.json();
            const transactions = data.transactions || data.data || [];

            return transactions.map((txn: any) => ({
                transactionId: txn.id || txn.transaction_id,
                accountNumber,
                date: txn.date || txn.transaction_date,
                type: txn.type || (txn.amount > 0 ? 'credit' : 'debit'),
                amount: Math.abs(parseFloat(txn.amount)),
                description: txn.description || txn.narrative,
                balance: parseFloat(txn.balance || txn.running_balance || '0'),
                reference: txn.reference || txn.ref_number,
                channel: txn.channel,
            }));
        } catch (error) {
            throw new Error(`Failed to fetch transactions: ${error}`);
        }
    }

    /**
     * Execute fund transfer
     */
    async transfer(request: TransferRequest): Promise<TransferResponse> {
        const token = await this.authenticate();
        const reference = request.reference || `TRF${Date.now()}`;

        try {
            const response = await fetch(`${this.config.apiUrl}/transfers`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Reference': reference,
                },
                body: JSON.stringify({
                    from_account: request.fromAccount,
                    to_account: request.toAccount,
                    amount: request.amount,
                    currency: request.currency,
                    description: request.description,
                    reference,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                return {
                    success: false,
                    reference,
                    timestamp: new Date().toISOString(),
                    message: error.message || 'Transfer failed',
                };
            }

            const data = await response.json();

            return {
                success: true,
                transactionId: data.transaction_id || data.id,
                reference,
                timestamp: new Date().toISOString(),
                message: 'Transfer completed successfully',
            };
        } catch (error) {
            return {
                success: false,
                reference,
                timestamp: new Date().toISOString(),
                message: error instanceof Error ? error.message : 'Transfer failed',
            };
        }
    }

    /**
     * Verify account (check if account exists and is valid)
     */
    async verifyAccount(accountNumber: string): Promise<{
        valid: boolean;
        accountName?: string;
        message: string;
    }> {
        const token = await this.authenticate();

        try {
            const response = await fetch(
                `${this.config.apiUrl}/accounts/verify/${accountNumber}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                return {
                    valid: false,
                    message: 'Account not found or invalid',
                };
            }

            const data = await response.json();

            return {
                valid: true,
                accountName: data.account_name || data.customer_name,
                message: 'Account verified successfully',
            };
        } catch (error) {
            return {
                valid: false,
                message: 'Account verification failed',
            };
        }
    }

    /**
     * Get mini statement (last 5 transactions)
     */
    async getMiniStatement(accountNumber: string): Promise<Transaction[]> {
        return this.getTransactions(accountNumber, undefined, undefined, 5);
    }

    /**
     * Check account balance
     */
    async getBalance(accountNumber: string, customerId: string): Promise<{
        balance: number;
        availableBalance: number;
        currency: string;
    }> {
        const accountInfo = await this.getAccountInfo(accountNumber, customerId);

        return {
            balance: accountInfo.balance,
            availableBalance: accountInfo.availableBalance,
            currency: accountInfo.currency,
        };
    }

    /**
     * Get customer accounts
     */
    async getCustomerAccounts(customerId: string): Promise<AccountInfo[]> {
        const token = await this.authenticate();

        try {
            const response = await fetch(
                `${this.config.apiUrl}/customers/${customerId}/accounts`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Customer accounts query failed: ${response.statusText}`);
            }

            const data = await response.json();
            const accounts = data.accounts || data.data || [];

            return accounts.map((acc: any) => ({
                accountNumber: acc.account_number,
                accountName: acc.account_name,
                accountType: acc.account_type,
                balance: parseFloat(acc.balance || '0'),
                availableBalance: parseFloat(acc.available_balance || acc.balance || '0'),
                currency: acc.currency || 'ZMW',
                status: acc.status || 'active',
                branch: acc.branch,
            }));
        } catch (error) {
            throw new Error(`Failed to fetch customer accounts: ${error}`);
        }
    }

    /**
     * Request account statement (email/download)
     */
    async requestStatement(
        accountNumber: string,
        email: string,
        startDate: string,
        endDate: string,
        format: 'pdf' | 'csv' = 'pdf'
    ): Promise<{ success: boolean; message: string; statementId?: string }> {
        const token = await this.authenticate();

        try {
            const response = await fetch(`${this.config.apiUrl}/statements/request`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    account_number: accountNumber,
                    start_date: startDate,
                    end_date: endDate,
                    format,
                    delivery_method: 'email',
                    email,
                }),
            });

            if (!response.ok) {
                throw new Error('Statement request failed');
            }

            const data = await response.json();

            return {
                success: true,
                message: `Statement will be sent to ${email}`,
                statementId: data.statement_id || data.request_id,
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to request statement',
            };
        }
    }
}

/**
 * Banking service wrapper
 */
export class BankingService {
    private clients: Map<string, CoreBankingClient> = new Map();

    registerBank(bankCode: string, client: CoreBankingClient): void {
        this.clients.set(bankCode, client);
    }

    getClient(bankCode: string): CoreBankingClient | undefined {
        return this.clients.get(bankCode);
    }

    async getAccountInfo(
        bankCode: string,
        accountNumber: string,
        customerId: string
    ): Promise<AccountInfo> {
        const client = this.getClient(bankCode);
        if (!client) {
            throw new Error(`Bank ${bankCode} not configured`);
        }

        return client.getAccountInfo(accountNumber, customerId);
    }

    async transfer(bankCode: string, request: TransferRequest): Promise<TransferResponse> {
        const client = this.getClient(bankCode);
        if (!client) {
            throw new Error(`Bank ${bankCode} not configured`);
        }

        return client.transfer(request);
    }
}
