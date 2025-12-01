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
