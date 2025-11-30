// src/lib/industries/banking/fees.ts

/**
 * Banking module - Fees, charges, and explanations
 */

export interface BankFee {
    category: string;
    name: string;
    amount: number;
    frequency: 'one-time' | 'monthly' | 'per-transaction' | 'annual';
    description: string;
    waiver?: string;
}

export interface ChargeExplanation {
    transactionId: string;
    date: string;
    description: string;
    amount: number;
    category: 'fee' | 'interest' | 'penalty' | 'reversal';
    explanation: string;
    canDispute: boolean;
}

/**
 * Get fee schedule
 */
export function getFeeSchedule(): BankFee[] {
    return [
        // Account Maintenance
        {
            category: 'Account Maintenance',
            name: 'Monthly Account Fee',
            amount: 15,
            frequency: 'monthly',
            description: 'Basic account maintenance charge',
            waiver: 'Waived if minimum balance of K5,000 maintained',
        },
        {
            category: 'Account Maintenance',
            name: 'Dormant Account Fee',
            amount: 50,
            frequency: 'monthly',
            description: 'Charged on accounts inactive for 6+ months',
            waiver: 'Reactivate account by making any transaction',
        },
        {
            category: 'Account Maintenance',
            name: 'Account Closure Fee',
            amount: 100,
            frequency: 'one-time',
            description: 'Fee to close account',
            waiver: 'Waived if account open for 1+ year',
        },

        // Transactions
        {
            category: 'Transactions',
            name: 'ATM Withdrawal (Own)',
            amount: 0,
            frequency: 'per-transaction',
            description: 'Withdrawal from our ATMs',
            waiver: 'First 3 per month free, then K5 each',
        },
        {
            category: 'Transactions',
            name: 'ATM Withdrawal (Other Bank)',
            amount: 15,
            frequency: 'per-transaction',
            description: 'Withdrawal from other bank ATMs',
        },
        {
            category: 'Transactions',
            name: 'Balance Inquiry',
            amount: 2,
            frequency: 'per-transaction',
            description: 'ATM balance check',
            waiver: 'Free via mobile app',
        },
        {
            category: 'Transactions',
            name: 'Mini Statement',
            amount: 5,
            frequency: 'per-transaction',
            description: 'Printed mini statement at ATM',
            waiver: 'Free via mobile app or SMS',
        },

        // Transfers
        {
            category: 'Transfers',
            name: 'Internal Transfer',
            amount: 0,
            frequency: 'per-transaction',
            description: 'Transfer between own accounts',
        },
        {
            category: 'Transfers',
            name: 'Interbank Transfer (RTGS)',
            amount: 50,
            frequency: 'per-transaction',
            description: 'Real-time transfer to other banks',
        },
        {
            category: 'Transfers',
            name: 'Mobile Money Transfer',
            amount: 25,
            frequency: 'per-transaction',
            description: 'Transfer to mobile money account',
        },

        // Cards
        {
            category: 'Cards',
            name: 'Debit Card Issuance',
            amount: 50,
            frequency: 'one-time',
            description: 'New debit card',
            waiver: 'Free for new accounts',
        },
        {
            category: 'Cards',
            name: 'Card Replacement',
            amount: 75,
            frequency: 'one-time',
            description: 'Lost/damaged card replacement',
        },
        {
            category: 'Cards',
            name: 'Card Annual Fee',
            amount: 100,
            frequency: 'annual',
            description: 'Debit card annual maintenance',
        },

        // Overdraft
        {
            category: 'Overdraft',
            name: 'Overdraft Interest',
            amount: 20,
            frequency: 'monthly',
            description: '20% per annum on overdrawn amount',
        },
        {
            category: 'Overdraft',
            name: 'Overdraft Setup Fee',
            amount: 200,
            frequency: 'one-time',
            description: 'One-time overdraft facility setup',
        },

        // Other Services
        {
            category: 'Other Services',
            name: 'Cheque Book (25 leaves)',
            amount: 50,
            frequency: 'per-transaction',
            description: 'Cheque book issuance',
        },
        {
            category: 'Other Services',
            name: 'Stop Payment Order',
            amount: 30,
            frequency: 'per-transaction',
            description: 'Stop a cheque payment',
        },
        {
            category: 'Other Services',
            name: 'Full Statement (Printed)',
            amount: 20,
            frequency: 'per-transaction',
            description: 'Printed account statement',
            waiver: 'Free via email',
        },
    ];
}

/**
 * Explain transaction charge
 */
export async function explainCharge(
    transactionId: string,
    chargeAmount: number,
    chargeDescription: string
): Promise<ChargeExplanation> {
    // TODO: Query transaction details from banking system

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Determine charge type and explanation
    let category: ChargeExplanation['category'] = 'fee';
    let explanation = '';
    let canDispute = false;

    if (chargeDescription.toLowerCase().includes('atm')) {
        category = 'fee';
        explanation = `ATM transaction fee. We charge K15 for withdrawals from other banks' ATMs. Use our ATMs to avoid this fee (first 3 free per month).`;
        canDispute = false;
    } else if (chargeDescription.toLowerCase().includes('monthly')) {
        category = 'fee';
        explanation = `Monthly account maintenance fee of K15. This fee can be waived by maintaining a minimum balance of K5,000 throughout the month.`;
        canDispute = false;
    } else if (chargeDescription.toLowerCase().includes('overdraft')) {
        category = 'interest';
        explanation = `Overdraft interest charged at 20% per annum. Your account was overdrawn and interest accrued on the negative balance. Maintain positive balance to avoid this.`;
        canDispute = false;
    } else if (chargeDescription.toLowerCase().includes('penalty')) {
        category = 'penalty';
        explanation = `Penalty charge for dishonored cheque or failed transaction. Please ensure sufficient funds before initiating transactions.`;
        canDispute = true;
    } else {
        category = 'fee';
        explanation = `Bank service charge as per our fee schedule. Please 'check fees' for complete fee structure.`;
        canDispute = true;
    }

    return {
        transactionId,
        date: new Date().toISOString().split('T')[0],
        description: chargeDescription,
        amount: chargeAmount,
        category,
        explanation,
        canDispute,
    };
}

/**
 * Format fee schedule
 */
export function formatFeeSchedule(category?: string): string {
    const fees = getFeeSchedule();
    const filteredFees = category
        ? fees.filter(f => f.category.toLowerCase() === category.toLowerCase())
        : fees;

    if (filteredFees.length === 0) {
        return `No fees found for category: ${category}\n\nAvailable categories:\n${Array.from(new Set(fees.map(f => f.category))).join('\n')}`;
    }

    const categories = Array.from(new Set(filteredFees.map(f => f.category)));

    let text = '💰 Bank Fee Schedule\n\n';

    categories.forEach(cat => {
        text += `${cat}:\n`;
        const catFees = filteredFees.filter(f => f.category === cat);

        catFees.forEach(fee => {
            text += `• ${fee.name}: K${fee.amount}`;
            if (fee.frequency !== 'one-time') {
                text += ` (${fee.frequency.replace('-', ' ')})`;
            }
            text += `\n  ${fee.description}\n`;
            if (fee.waiver) {
                text += `  💡 ${fee.waiver}\n`;
            }
        });
        text += '\n';
    });

    text += 'Questions about charges? Reply "explain charge" with transaction details.';

    return text;
}

/**
 * Calculate monthly fees for account
 */
export function calculateMonthlyFees(
    accountType: 'savings' | 'checking' | 'current',
    averageBalance: number,
    numATMWithdrawals: number,
    numTransfers: number
): { totalFees: number; breakdown: Array<{ item: string; amount: number }> } {
    const breakdown: Array<{ item: string; amount: number }> = [];
    let totalFees = 0;

    // Account maintenance
    if (averageBalance < 5000) {
        breakdown.push({ item: 'Monthly Account Fee', amount: 15 });
        totalFees += 15;
    }

    // ATM withdrawals (first 3 free)
    if (numATMWithdrawals > 3) {
        const chargeableWithdrawals = numATMWithdrawals - 3;
        const atmFees = chargeableWithdrawals * 5;
        breakdown.push({ item: `ATM Withdrawals (${chargeableWithdrawals})`, amount: atmFees });
        totalFees += atmFees;
    }

    return { totalFees, breakdown };
}

/**
 * Format charge explanation
 */
export function formatChargeExplanation(explanation: ChargeExplanation): string {
    const categoryEmojis = {
        fee: '💵',
        interest: '📈',
        penalty: '⚠️',
        reversal: '🔄',
    };

    return `${categoryEmojis[explanation.category]} Charge Explanation

Transaction ID: ${explanation.transactionId}
Date: ${explanation.date}
Description: ${explanation.description}
Amount: K${explanation.amount}

${explanation.explanation}

${explanation.canDispute ? '💡 You can dispute this charge if you believe it was applied incorrectly. Reply "dispute charge" to start the process.' : ''}`;
}
