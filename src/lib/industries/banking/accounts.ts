// src/lib/industries/banking/accounts.ts

/**
 * Banking module - Account management and queries
 */

export interface BankAccount {
    accountNumber: string;
    accountType: 'savings' | 'checking' | 'fixed_deposit' | 'current';
    balance: number;
    currency: string;
    accountHolder: string;
    branch: string;
    status: 'active' | 'frozen' | 'closed';
    openedDate: string;
}

export interface Transaction {
    id: string;
    date: string;
    type: 'debit' | 'credit';
    amount: number;
    description: string;
    balance: number;
    reference: string;
}

/**
 * Get account balance
 */
export async function getAccountBalance(
    accountNumber: string,
    customerId: string
): Promise<BankAccount> {
    // TODO: Integrate with actual banking API

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        accountNumber,
        accountType: 'savings',
        balance: 15750.50,
        currency: 'ZMW',
        accountHolder: 'John Doe',
        branch: 'Lusaka Main Branch',
        status: 'active',
        openedDate: '2020-05-15',
    };
}

/**
 * Get recent transactions
 */
export async function getTransactionHistory(
    accountNumber: string,
    limit: number = 10
): Promise<Transaction[]> {
    // TODO: Integrate with banking API

    // Mock data
    await new Promise((resolve) => setTimeout(resolve, 500));

    const transactions: Transaction[] = [];
    let balance = 15750.50;

    for (let i = 0; i < limit; i++) {
        const isCredit = Math.random() > 0.5;
        const amount = Math.random() * 500 + 50;
        balance = isCredit ? balance + amount : balance - amount;

        transactions.push({
            id: `TXN${Date.now() + i}`,
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            type: isCredit ? 'credit' : 'debit',
            amount: parseFloat(amount.toFixed(2)),
            description: isCredit ? 'Salary Payment' : 'ATM Withdrawal',
            balance: parseFloat(balance.toFixed(2)),
            reference: `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        });
    }

    return transactions.reverse();
}

/**
 * Generate mini-statement SMS format
 */
export function formatMiniStatement(transactions: Transaction[]): string {
    let statement = 'Mini Statement:\n\n';

    transactions.slice(0, 5).forEach((txn) => {
        const sign = txn.type === 'credit' ? '+' : '-';
        statement += `${txn.date}: ${sign}K${txn.amount}\n`;
        statement += `${txn.description}\n`;
        statement += `Bal: K${txn.balance}\n\n`;
    });

    return statement;
}

/**
 * Format account balance for display
 */
export function formatAccountBalance(account: BankAccount): string {
    return `Account: ${account.accountNumber}
Type: ${account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
Balance: ${account.currency} ${account.balance.toLocaleString()}
Status: ${account.status.toUpperCase()}
Branch: ${account.branch}`;
}

/**
 * Transfer funds (Mock)
 */
export async function transferFunds(
    fromAccount: string,
    toAccount: string,
    amount: number,
    description: string
): Promise<{ success: boolean; message: string; reference?: string }> {
    // TODO: Integrate with banking API

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Validation
    if (amount <= 0) {
        return { success: false, message: 'Invalid amount' };
    }

    if (amount > 50000) {
        return {
            success: false,
            message: 'Transfer limit exceeded. Please visit branch for large transfers.'
        };
    }

    const reference = `TRF${Date.now()}`;

    return {
        success: true,
        message: `Successfully transferred K${amount} to ${toAccount}. Reference: ${reference}`,
        reference,
    };
    // src/lib/industries/banking/accounts.ts

    /**
     * Banking module - Account management and queries
     */

    export interface BankAccount {
        accountNumber: string;
        accountType: 'savings' | 'checking' | 'fixed_deposit' | 'current';
        balance: number;
        currency: string;
        accountHolder: string;
        branch: string;
        status: 'active' | 'frozen' | 'closed';
        openedDate: string;
    }

    export interface Transaction {
        id: string;
        date: string;
        type: 'debit' | 'credit';
        amount: number;
        description: string;
        balance: number;
        reference: string;
    }

    /**
     * Get account balance
     */
    export async function getAccountBalance(
        accountNumber: string,
        customerId: string
    ): Promise<BankAccount> {
        // TODO: Integrate with actual banking API

        // Mock implementation
        await new Promise((resolve) => setTimeout(resolve, 500));

        return {
            accountNumber,
            accountType: 'savings',
            balance: 15750.50,
            currency: 'ZMW',
            accountHolder: 'John Doe',
            branch: 'Lusaka Main Branch',
            status: 'active',
            openedDate: '2020-05-15',
        };
    }

    /**
     * Get recent transactions
     */
    export async function getTransactionHistory(
        accountNumber: string,
        limit: number = 10
    ): Promise<Transaction[]> {
        // TODO: Integrate with banking API

        // Mock data
        await new Promise((resolve) => setTimeout(resolve, 500));

        const transactions: Transaction[] = [];
        let balance = 15750.50;

        for (let i = 0; i < limit; i++) {
            const isCredit = Math.random() > 0.5;
            const amount = Math.random() * 500 + 50;
            balance = isCredit ? balance + amount : balance - amount;

            transactions.push({
                id: `TXN${Date.now() + i}`,
                date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                type: isCredit ? 'credit' : 'debit',
                amount: parseFloat(amount.toFixed(2)),
                description: isCredit ? 'Salary Payment' : 'ATM Withdrawal',
                balance: parseFloat(balance.toFixed(2)),
                reference: `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            });
        }

        return transactions.reverse();
    }

    /**
     * Generate mini-statement SMS format
     */
    export function formatMiniStatement(transactions: Transaction[]): string {
        let statement = 'Mini Statement:\n\n';

        transactions.slice(0, 5).forEach((txn) => {
            const sign = txn.type === 'credit' ? '+' : '-';
            statement += `${txn.date}: ${sign}K${txn.amount}\n`;
            statement += `${txn.description}\n`;
            statement += `Bal: K${txn.balance}\n\n`;
        });

        return statement;
    }

    /**
     * Format account balance for display
     */
    export function formatAccountBalance(account: BankAccount): string {
        return `Account: ${account.accountNumber}
Type: ${account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
Balance: ${account.currency} ${account.balance.toLocaleString()}
Status: ${account.status.toUpperCase()}
Branch: ${account.branch}`;
    }

    /**
     * Transfer funds (Mock)
     */
    export async function transferFunds(
        fromAccount: string,
        toAccount: string,
        amount: number,
        description: string
    ): Promise<{ success: boolean; message: string; reference?: string }> {
        // TODO: Integrate with banking API

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Validation
        if (amount <= 0) {
            return { success: false, message: 'Invalid amount' };
        }

        if (amount > 50000) {
            return {
                success: false,
                message: 'Transfer limit exceeded. Please visit branch for large transfers.'
            };
        }

        const reference = `TRF${Date.now()}`;

        return {
            success: true,
            message: `Successfully transferred K${amount} to ${toAccount}. Reference: ${reference}`,
            reference,
        };
    }

    /**
     * Open new account request
     */
    export async function requestAccountOpening(
        customerName: string,
        phoneNumber: string,
        accountType: 'savings' | 'checking' | 'current',
        initialDeposit: number
    ): Promise<{ success: boolean; message: string; applicationId?: string }> {
        // TODO: Integrate with banking system

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const applicationId = `APP${Date.now()}`;

        return {
            success: true,
            message: `Account opening request submitted. Application ID: ${applicationId}. Please visit any branch with your ID to complete the process.`,
            applicationId,
        };
    }

    /**
     * Online account opening wizard
     */
    export interface AccountOpeningSession {
        sessionId: string;
        step: number;
        data: {
            personalInfo?: {
                fullName?: string;
                nationalId?: string;
                dateOfBirth?: string;
                phoneNumber?: string;
                email?: string;
                address?: string;
            };
            employmentInfo?: {
                employed?: boolean;
                employer?: string;
                monthlyIncome?: number;
            };
            accountPreferences?: {
                accountType?: 'savings' | 'checking' | 'current';
                initialDeposit?: number;
                debitCard?: boolean;
                onlineBanking?: boolean;
            };
        };
    }

    export async function startAccountOpening(): Promise<AccountOpeningSession> {
        return {
            sessionId: `ACCT${Date.now()}`,
            step: 0,
            data: {},
        };
    }

    export function getAccountOpeningPrompt(session: AccountOpeningSession, userInput?: string): {
        session: AccountOpeningSession;
        message: string;
        options?: string[];
    } {
        if (userInput && session.step > 0) {
            // Process user input based on current step
            switch (session.step) {
                case 1:
                    if (!session.data.personalInfo) session.data.personalInfo = {};
                    session.data.personalInfo.fullName = userInput;
                    break;
                case 2:
                    session.data.personalInfo!.nationalId = userInput;
                    break;
                case 3:
                    session.data.personalInfo!.phoneNumber = userInput;
                    break;
                case 4:
                    session.data.personalInfo!.email = userInput;
                    break;
                case 5:
                    if (!session.data.accountPreferences) session.data.accountPreferences = {};
                    session.data.accountPreferences.accountType = userInput.toLowerCase() as any;
                    break;
            }
        }

        session.step++;

        const prompts: Record<number, { message: string; options?: string[] }> = {
            1: {
                message: `🏦 Open Bank Account Online - Step 1/6\n\nWelcome! Let's open your account.\n\nWhat is your full name?`,
            },
            2: {
                message: `Step 2/6\n\nNational ID number (format: 123456/78/1):`,
            },
            3: {
                message: `Step 3/6\n\nPhone number (+260XXXXXXXXX):`,
            },
            4: {
                message: `Step 4/6\n\nEmail address:`,
            },
            5: {
                message: `Step 5/6\n\nWhat type of account would you like?`,
                options: ['Savings', 'Checking', 'Current'],
            },
            6: {
                message: `Step 6/6\n\nMinimum initial deposit: K500\n\nHow much would you like to deposit?`,
            },
            7: {
                message: `✅ Application Complete!\n\nWhat happens next:\n\n1. ✅ Application submitted\n2. 📱 SMS with appointment details\n3. 🏦 Visit branch with:\n   • National ID\n   • Initial deposit\n   • Proof of address\n4. 🎉 Account activated immediately\n\nApplication ID: ${session.sessionId}\n\nAny questions? Reply 'account help'`,
            },
        };

        const prompt = prompts[session.step] || prompts[7];

        return {
            session,
            message: prompt.message,
            options: prompt.options,
        };
    }
