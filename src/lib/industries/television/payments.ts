// src/lib/industries/television/payments.ts

/**
 * Television module - Payment tracking and reminders
 */

export interface PaymentHistory {
    transactionId: string;
    decoderNumber: string;
    amount: number;
    packageName: string;
    paymentDate: string;
    paymentMethod: 'mobile_money' | 'card' | 'bank_transfer' | 'cash';
    status: 'completed' | 'pending' | 'failed';
}

export interface PaymentReminder {
    decoderNumber: string;
    packageName: string;
    monthlyAmount: number;
    dueDate: string;
    daysUntilDue: number;
    status: 'upcoming' | 'due' | 'overdue';
    outstandingAmount: number;
    autoPayment: boolean;
}

/**
 * Get payment history
 */
export async function getPaymentHistory(
    decoderNumber: string,
    limit: number = 10
): Promise<PaymentHistory[]> {
    // TODO: Query payment system

    await new Promise((resolve) => setTimeout(resolve, 500));

    const payments: PaymentHistory[] = [];

    for (let i = 0; i < Math.min(limit, 5); i++) {
        payments.push({
            transactionId: `TXN${Date.now() + i}`,
            decoderNumber,
            amount: 300,
            packageName: 'Standard Package',
            paymentDate: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            paymentMethod: ['mobile_money', 'card', 'bank_transfer'][Math.floor(Math.random() * 3)] as any,
            status: 'completed',
        });
    }

    return payments;
}

/**
 * Get payment reminder
 */
export async function getPaymentReminder(decoderNumber: string): Promise<PaymentReminder> {
    // TODO: Query subscription system

    await new Promise((resolve) => setTimeout(resolve, 500));

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const daysUntilDue = 7;

    return {
        decoderNumber,
        packageName: 'Standard Package',
        monthlyAmount: 300,
        dueDate: dueDate.toISOString().split('T')[0],
        daysUntilDue,
        status: daysUntilDue <= 3 ? 'due' : 'upcoming',
        outstandingAmount: 0,
        autoPayment: false,
    };
}

/**
 * Process payment
 */
export async function processPayment(
    decoderNumber: string,
    amount: number,
    paymentMethod: 'mobile_money' | 'card' | 'bank_transfer',
    packageId: string
): Promise<{ success: boolean; message: string; transactionId?: string; expiryDate?: string }> {
    // TODO: Integrate with payment gateway

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (amount < 50) {
        return {
            success: false,
            message: 'Minimum payment amount is K50',
        };
    }

    const transactionId = `TXN${Date.now()}`;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    return {
        success: true,
        message: `Payment successful!\n\nTransaction ID: ${transactionId}\nAmount: K${amount}\nDecoder: ${decoderNumber}\n\nYour subscription is now active until ${expiryDate.toISOString().split('T')[0]}`,
        transactionId,
        expiryDate: expiryDate.toISOString().split('T')[0],
    };
}

/**
 * Setup auto-payment
 */
export async function setupAutoPayment(
    decoderNumber: string,
    paymentMethod: 'mobile_money' | 'card' | 'bank_transfer',
    accountDetails: string
): Promise<{ success: boolean; message: string }> {
    // TODO: Configure auto-payment

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
        success: true,
        message: `Auto-payment activated for decoder ${decoderNumber}\n\nPayment method: ${paymentMethod}\nPayment will be processed automatically 3 days before expiry.\n\nYou'll receive SMS confirmations for each payment.`,
    };
}

/**
 * Get payment methods and instructions
 */
export function getPaymentMethods(): string {
    return `Payment Methods Available:

1. Mobile Money 📱
   • Airtel Money: Dial *115# > Pay Bill > Enter Merchant Code
   • MTN MoMo: Dial *303# > Payments > DStv/GOtv
   • Zamtel Kwacha: Dial *131# > Payments

2. Bank Transfer 🏦
   • Account Name: TV Provider Ltd
   • Account Number: 1234567890
   • Bank: Zanaco
   • Reference: Your Decoder Number

3. Debit/Credit Card 💳
   • Visit www.tvprovider.com/pay
   • Enter decoder number
   • Pay securely online

4. Cash Payment 💵
   • Visit any of our offices
   • Service centers nationwide
   • Open Mon-Sat 8AM-6PM

5. Auto-Payment (Recommended) ⚡
   • Set up once
   • Never miss a payment
   • 5% discount on annual plans

Reply 'setup auto payment' to enable automatic payments`;
}

/**
 * Format payment reminder
 */
export function formatPaymentReminder(reminder: PaymentReminder): string {
    const statusEmojis = {
        upcoming: '📅',
        due: '⏰',
        overdue: '🚨',
    };

    const urgency = reminder.daysUntilDue <= 3 ? '⚠️ URGENT: ' : '';

    return `${urgency}${statusEmojis[reminder.status]} Payment Reminder

Decoder: ${reminder.decoderNumber}
Package: ${reminder.packageName}
Amount: K${reminder.monthlyAmount}

Due Date: ${reminder.dueDate}
Days Remaining: ${reminder.daysUntilDue}

${reminder.outstandingAmount > 0 ? `Outstanding: K${reminder.outstandingAmount}\n` : ''}
${reminder.autoPayment ? 'Auto-payment: ENABLED ✅' : 'Auto-payment: DISABLED'}

${reminder.status === 'overdue' ? '\n🚨 Your subscription has expired. Please renew to continue watching.' : ''}
${reminder.status === 'due' ? '\n⏰ Payment due soon. Pay now to avoid service interruption.' : ''}

To pay: Reply 'pay now' or dial *115# (Airtel Money)`;
}

/**
 * Format payment history
 */
export function formatPaymentHistory(payments: PaymentHistory[]): string {
    let text = 'Payment History\n\n';

    payments.forEach((payment, index) => {
        text += `${index + 1}. ${payment.paymentDate}\n`;
        text += `   K${payment.amount} - ${payment.packageName}\n`;
        text += `   ${payment.paymentMethod.replace('_', ' ').toUpperCase()}\n`;
        text += `   ${payment.status === 'completed' ? '✅' : payment.status === 'pending' ? '⏳' : '❌'} ${payment.status.toUpperCase()}\n`;
        text += `   Ref: ${payment.transactionId}\n\n`;
    });

    return text;
}
