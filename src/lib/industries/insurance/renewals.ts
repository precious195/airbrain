// src/lib/industries/insurance/renewals.ts

/**
 * Insurance module - Policy renewals and reminders
 */

export interface PolicyRenewal {
    policyNumber: string;
    policyType: 'life' | 'health' | 'auto' | 'property' | 'travel';
    customerId: string;
    expiryDate: string;
    renewalDue: string;
    currentPremium: number;
    renewalPremium: number;
    premiumChange: number; // percentage
    status: 'upcoming' | 'due' | 'overdue' | 'lapsed';
    daysUntilExpiry: number;
    autoRenewal: boolean;
    changes?: string[];
}

/**
 * Get policy renewal details
 */
export async function getPolicyRenewal(policyNumber: string): Promise<PolicyRenewal> {
    // TODO: Query insurance system

    await new Promise((resolve) => setTimeout(resolve, 500));

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    return {
        policyNumber,
        policyType: 'auto',
        customerId: 'CUST123',
        expiryDate: expiryDate.toISOString().split('T')[0],
        renewalDue: new Date(expiryDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currentPremium: 500,
        renewalPremium: 525,
        premiumChange: 5,
        status: 'upcoming',
        daysUntilExpiry: 30,
        autoRenewal: false,
        changes: [
            'Premium increased due to claims history',
            'New coverage for windscreen damage added',
        ],
    };
}

/**
 * Renew policy
 */
export async function renewPolicy(
    policyNumber: string,
    acceptChanges: boolean = true
): Promise<{ success: boolean; message: string; newPolicyNumber?: string }> {
    // TODO: Process renewal

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!acceptChanges) {
        return {
            success: false,
            message: 'Renewal requires acceptance of updated terms. Please review and confirm.',
        };
    }

    const newPolicyNumber = `POL${Date.now()}`;

    return {
        success: true,
        message: `Policy renewed successfully!\n\nNew policy: ${newPolicyNumber}\nValid from: ${new Date().toISOString().split('T')[0]}\nExpires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}\n\nPayment confirmation sent to your email.`,
        newPolicyNumber,
    };
}

/**
 * Enable auto-renewal
 */
export async function enableAutoRenewal(
    policyNumber: string,
    paymentMethod: 'card' | 'mobile_money' | 'bank_account'
): Promise<{ success: boolean; message: string }> {
    // TODO: Set up auto-renewal

    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        success: true,
        message: `Auto-renewal activated for policy ${policyNumber}.\n\nPayment method: ${paymentMethod}\nRenewal date: Automatic 30 days before expiry\n\nYou'll receive notifications before each renewal.`,
    };
}

/**
 * Get renewal reminders schedule
 */
export function getRenewalReminders(daysUntilExpiry: number): string[] {
    const reminders: string[] = [];

    if (daysUntilExpiry <= 60 && daysUntilExpiry > 30) {
        reminders.push('First reminder: 60 days before expiry');
    }
    if (daysUntilExpiry <= 30 && daysUntilExpiry > 14) {
        reminders.push('Second reminder: 30 days before expiry');
    }
    if (daysUntilExpiry <= 14 && daysUntilExpiry > 7) {
        reminders.push('Third reminder: 14 days before expiry');
    }
    if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        reminders.push('Final reminder: 7 days before expiry');
    }
    if (daysUntilExpiry <= 0) {
        reminders.push('URGENT: Policy expired or expiring today!');
    }

    return reminders;
}

/**
 * Calculate loyalty discount
 */
export function calculateLoyaltyDiscount(yearsWithCompany: number, claimsCount: number): number {
    let discount = 0;

    // Years of loyalty
    if (yearsWithCompany >= 5) discount += 10;
    else if (yearsWithCompany >= 3) discount += 5;
    else if (yearsWithCompany >= 1) discount += 2;

    // No claims bonus
    if (claimsCount === 0 && yearsWithCompany >= 1) {
        discount += 10;
    }

    return Math.min(discount, 20); // Max 20% discount
}

/**
 * Format renewal reminder
 */
export function formatRenewalReminder(renewal: PolicyRenewal): string {
    const statusEmojis = {
        upcoming: '📅',
        due: '⏰',
        overdue: '⚠️',
        lapsed: '❌',
    };

    const urgency = renewal.daysUntilExpiry <= 7 ? '🚨 URGENT: ' : '';

    return `${urgency}${statusEmojis[renewal.status]} Policy Renewal Notice

Policy: ${renewal.policyNumber}
Type: ${renewal.policyType.toUpperCase()}
Expires: ${renewal.expiryDate}
Days remaining: ${renewal.daysUntilExpiry}

Current Premium: K${renewal.currentPremium}
Renewal Premium: K${renewal.renewalPremium}
Change: ${renewal.premiumChange > 0 ? '+' : ''}${renewal.premiumChange}%

${renewal.changes && renewal.changes.length > 0 ? `\nChanges in renewal:\n${renewal.changes.map(c => `• ${c}`).join('\n')}\n` : ''}

${renewal.autoRenewal ? 'Auto-renewal: ENABLED ✅' : 'Auto-renewal: DISABLED\nAction required to renew'}

${renewal.status === 'due' || renewal.status === 'overdue' ? '\n⚠️ Please renew immediately to avoid lapse in coverage!' : ''}

To renew: Reply 'renew policy' or visit our website`;
}
