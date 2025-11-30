// src/lib/industries/banking/statements.ts

/**
 * Banking module - Statement generation
 */

import type { Transaction } from './accounts';

export interface BankStatement {
    accountNumber: string;
    accountHolder: string;
    statementPeriod: {
        from: string;
        to: string;
    };
    openingBalance: number;
    closingBalance: number;
    totalCredits: number;
    totalDebits: number;
    transactions: Transaction[];
    currency: string;
}

/**
 * Generate bank statement
 */
export async function generateStatement(
    accountNumber: string,
    periodType: 'last_30_days' | 'last_90_days' | 'custom',
    fromDate?: string,
    toDate?: string
): Promise<BankStatement> {
    // TODO: Retrieve transactions from banking system

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Calculate date range
    const to = toDate ? new Date(toDate) : new Date();
    let from: Date;

    if (periodType === 'last_30_days') {
        from = new Date(to);
        from.setDate(from.getDate() - 30);
    } else if (periodType === 'last_90_days') {
        from = new Date(to);
        from.setDate(from.getDate() - 90);
    } else {
        from = fromDate ? new Date(fromDate) : new Date(to.setDate(to.getDate() - 30));
    }

    // Mock transactions
    const transactions: Transaction[] = [];
    let balance = 15000;
    const openingBalance = balance;

    for (let i = 0; i < 20; i++) {
        const txnDate = new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));
        const isCredit = Math.random() > 0.4;
        const amount = parseFloat((Math.random() * 1000 + 100).toFixed(2));

        balance = isCredit ? balance + amount : balance - amount;

        transactions.push({
            id: `TXN${Date.now() + i}`,
            date: txnDate.toISOString().split('T')[0],
            type: isCredit ? 'credit' : 'debit',
            amount,
            description: isCredit
                ? ['Salary', 'Transfer In', 'Interest'][Math.floor(Math.random() * 3)]
                : ['ATM Withdrawal', 'POS Purchase', 'Transfer Out', 'Bill Payment'][Math.floor(Math.random() * 4)],
            balance: parseFloat(balance.toFixed(2)),
            reference: `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        });
    }

    // Sort by date
    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate totals
    const totalCredits = transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalDebits = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

    return {
        accountNumber,
        accountHolder: 'John Doe',
        statementPeriod: {
            from: from.toISOString().split('T')[0],
            to: to.toISOString().split('T')[0],
        },
        openingBalance,
        closingBalance: parseFloat(balance.toFixed(2)),
        totalCredits: parseFloat(totalCredits.toFixed(2)),
        totalDebits: parseFloat(totalDebits.toFixed(2)),
        transactions,
        currency: 'ZMW',
    };
}

/**
 * Format statement for SMS (mini-statement)
 */
export function formatMiniStatement(statement: BankStatement): string {
    const recentTxns = statement.transactions.slice(-5);

    let text = `Mini Statement\nAcc: ${statement.accountNumber}\n\n`;

    recentTxns.forEach(txn => {
        const sign = txn.type === 'credit' ? '+' : '-';
        text += `${txn.date}: ${sign}${txn.amount}\n`;
        text += `${txn.description.substring(0, 20)}\n`;
        text += `Bal: ${txn.balance}\n\n`;
    });

    return text;
}

/**
 * Format statement for email/PDF
 */
export function formatFullStatement(statement: BankStatement): string {
    let text = `BANK STATEMENT
Account Number: ${statement.accountNumber}
Account Holder: ${statement.accountHolder}
Period: ${statement.statementPeriod.from} to ${statement.statementPeriod.to}

SUMMARY
---------
Opening Balance: ${statement.currency} ${statement.openingBalance.toLocaleString()}
Total Credits: ${statement.currency} ${statement.totalCredits.toLocaleString()}
Total Debits: ${statement.currency} ${statement.totalDebits.toLocaleString()}
Closing Balance: ${statement.currency} ${statement.closingBalance.toLocaleString()}

TRANSACTIONS
---------
`;

    statement.transactions.forEach(txn => {
        const sign = txn.type === 'credit' ? '+' : '-';
        text += `${txn.date} | ${txn.description.padEnd(25)} | ${sign}${statement.currency} ${txn.amount.toString().padStart(10)} | ${statement.currency} ${txn.balance.toString().padStart(10)}\n`;
    });

    return text;
}

/**
 * Email statement to customer
 */
export async function emailStatement(
    accountNumber: string,
    email: string,
    statement: BankStatement
): Promise<{ success: boolean; message: string }> {
    // TODO: Generate PDF and send via email service

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
        success: true,
        message: `Statement for period ${statement.statementPeriod.from} to ${statement.statementPeriod.to} has been sent to ${email}`,
    };
}

/**
 * Get statement summary for AI response
 */
export function getStatementSummary(statement: BankStatement): string {
    return `Statement Summary (${statement.statementPeriod.from} to ${statement.statementPeriod.to}):

Opening Balance: ${statement.currency} ${statement.openingBalance.toLocaleString()}
Closing Balance: ${statement.currency} ${statement.closingBalance.toLocaleString()}

Total Credits: ${statement.currency} ${statement.totalCredits.toLocaleString()} (${statement.transactions.filter(t => t.type === 'credit').length} transactions)
Total Debits: ${statement.currency} ${statement.totalDebits.toLocaleString()} (${statement.transactions.filter(t => t.type === 'debit').length} transactions)

Recent Transactions:
${statement.transactions.slice(-5).map(t =>
        `${t.date}: ${t.type === 'credit' ? '+' : '-'}${t.amount} - ${t.description}`
    ).join('\n')}

Full statement can be sent to your email. Would you like me to send it?`;
}
