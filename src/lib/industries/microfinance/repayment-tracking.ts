// src/lib/industries/microfinance/repayment-tracking.ts

/**
 * Microfinance module - Loan repayment tracking and reminders
 */

export interface RepaymentSchedule {
    loanId: string;
    customerId: string;
    totalAmount: number;
    amountPaid: number;
    outstandingBalance: number;
    installments: Installment[];
    nextPaymentDate: string;
    nextPaymentAmount: number;
    status: 'current' | 'due_soon' | 'overdue' | 'paid_off' | 'defaulted';
}

export interface Installment {
    installmentNumber: number;
    dueDate: string;
    amount: number;
    principal: number;
    interest: number;
    penalty: number;
    paid: boolean;
    paidDate?: string;
    paidAmount?: number;
    daysOverdue?: number;
}

export interface PaymentReminder {
    loanId: string;
    customerId: string;
    dueDate: string;
    amount: number;
    daysUntilDue: number;
    urgency: 'info' | 'warning' | 'urgent' | 'critical';
    message: string;
}

/**
 * Get repayment schedule
 */
export async function getRepaymentSchedule(loanId: string): Promise<RepaymentSchedule> {
    // TODO: Query loan database

    await new Promise((resolve) => setTimeout(resolve, 500));

    const totalAmount = 11500; // Principal + interest
    const weeklyPayment = 958.33;
    const installments: Installment[] = [];

    // Generate 12-week schedule
    const startDate = new Date('2024-11-01');
    let paid = 0;

    for (let i = 0; i < 12; i++) {
        const dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() + i * 7);

        const isPaid = i < 4; // First 4 payments made
        const principal = 833.33;
        const interest = 125;

        installments.push({
            installmentNumber: i + 1,
            dueDate: dueDate.toISOString().split('T')[0],
            amount: weeklyPayment,
            principal,
            interest,
            penalty: 0,
            paid: isPaid,
            paidDate: isPaid ? dueDate.toISOString().split('T')[0] : undefined,
            paidAmount: isPaid ? weeklyPayment : undefined,
        });

        if (isPaid) paid += weeklyPayment;
    }

    const nextUnpaid = installments.find(i => !i.paid);
    const today = new Date();
    const nextPaymentDate = nextUnpaid ? new Date(nextUnpaid.dueDate) : today;
    const daysUntil = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let status: RepaymentSchedule['status'];
    if (paid >= totalAmount) status = 'paid_off';
    else if (daysUntil < 0) status = 'overdue';
    else if (daysUntil <= 3) status = 'due_soon';
    else status = 'current';

    return {
        loanId,
        customerId: 'CUST123',
        totalAmount,
        amountPaid: paid,
        outstandingBalance: totalAmount - paid,
        installments,
        nextPaymentDate: nextUnpaid?.dueDate || '',
        nextPaymentAmount: nextUnpaid?.amount || 0,
        status,
    };
}

/**
 * Calculate penalty for late payment
 */
export function calculatePenalty(
    originalAmount: number,
    daysOverdue: number,
    penaltyRate: number = 2 // 2% per week
): { penaltyAmount: number; totalDue: number } {
    const weeksOverdue = Math.ceil(daysOverdue / 7);
    const penaltyAmount = (originalAmount * penaltyRate * weeksOverdue) / 100;

    return {
        penaltyAmount: Math.floor(penaltyAmount),
        totalDue: originalAmount + Math.floor(penaltyAmount),
    };
}

/**
 * Generate payment reminders
 */
export async function generatePaymentReminders(loanId: string): Promise<PaymentReminder[]> {
    const schedule = await getRepaymentSchedule(loanId);
    const reminders: PaymentReminder[] = [];
    const today = new Date();

    // Find upcoming unpaid installments
    const upcomingPayments = schedule.installments.filter(i => !i.paid);

    for (const installment of upcomingPayments) {
        const dueDate = new Date(installment.dueDate);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        let urgency: PaymentReminder['urgency'];
        let message: string;

        if (daysUntilDue < 0) {
            urgency = 'critical';
            message = `⚠️ OVERDUE: Payment of K${installment.amount} was due ${Math.abs(daysUntilDue)} days ago. Pay now to avoid additional penalties.`;
        } else if (daysUntilDue === 0) {
            urgency = 'urgent';
            message = `🚨 DUE TODAY: Payment of K${installment.amount} is due today. Please pay before end of business day.`;
        } else if (daysUntilDue <= 3) {
            urgency = 'warning';
            message = `⏰ Payment of K${installment.amount} due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}. Plan your payment.`;
        } else if (daysUntilDue <= 7) {
            urgency = 'info';
            message = `📅 Reminder: Next payment of K${installment.amount} due on ${installment.dueDate}.`;
        } else {
            continue; // Skip reminders too far in future
        }

        reminders.push({
            loanId,
            customerId: schedule.customerId,
            dueDate: installment.dueDate,
            amount: installment.amount,
            daysUntilDue,
            urgency,
            message,
        });
    }

    return reminders;
}

/**
 * Record loan payment
 */
export async function recordPayment(
    loanId: string,
    amount: number,
    paymentMethod: 'mobile_money' | 'bank_transfer' | 'cash'
): Promise<{ success: boolean; message: string; newBalance?: number; receiptId?: string }> {
    // TODO: Process and record payment

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const schedule = await getRepaymentSchedule(loanId);
    const newBalance = schedule.outstandingBalance - amount;

    const receiptId = `REC${Date.now()}`;

    return {
        success: true,
        message: `Payment received successfully!\n\nAmount: K${amount}\nReceipt: ${receiptId}\nRemaining Balance: K${newBalance}\n\n${newBalance > 0 ? `Next payment of K${schedule.nextPaymentAmount} due ${schedule.nextPaymentDate}` : '🎉 Loan fully paid! Thank you!'}`,
        newBalance,
        receiptId,
    };
}

/**
 * Format repayment schedule
 */
export function formatRepaymentSchedule(schedule: RepaymentSchedule): string {
    const statusEmojis = {
        current: '✅',
        due_soon: '⏰',
        overdue: '🚨',
        paid_off: '🎉',
        defaulted: '❌',
    };

    return `${statusEmojis[schedule.status]} Loan Repayment Schedule

Loan ID: ${schedule.loanId}
Total Loan: K${schedule.totalAmount}
Amount Paid: K${schedule.amountPaid}
Outstanding: K${schedule.outstandingBalance}

Status: ${schedule.status.toUpperCase().replace('_', ' ')}
${schedule.status !== 'paid_off' ? `Next Payment: K${schedule.nextPaymentAmount} on ${schedule.nextPaymentDate}` : ''}

Payment History:
${schedule.installments.map((inst, idx) => {
        const status = inst.paid ? '✅' : inst.daysOverdue ? '🚨' : '⏳';
        return `${status} Week ${inst.installmentNumber}: K${inst.amount} - ${inst.dueDate}${inst.paid ? ' (PAID)' : inst.daysOverdue ? ` (${inst.daysOverdue} days overdue)` : ''}`;
    }).join('\n')}

${schedule.status === 'overdue' ? '\n⚠️ Please make payment immediately to avoid penalties' : ''}
${schedule.status === 'paid_off' ? '\n🎉 Congratulations! Your loan is fully paid!' : ''}`;
}

/**
 * Get reminder schedule
 */
export function getReminderSchedule(): string {
    return `📅 Payment Reminder Schedule

We send automatic reminders:

📱 SMS Reminders:
• 7 days before due date
• 3 days before due date
• On due date (morning)
• 1 day after due date
• 3 days after due  date
• Weekly thereafter

📧 Email Reminders:
• 7 days before
• On due date
• Weekly summary

📞 Phone Call:
• 3 days overdue
• 7 days overdue
• 14 days overdue

💡 Tips to Stay Current:
• Set up auto-payment (available soon)
• Enable push notifications
• Check balance regularly
• Pay early when possible
• Contact us if struggling

Reply 'payment plan' if you need help with payments`;
}
