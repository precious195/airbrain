// src/lib/industries/mobile/balance.ts

/**
 * Mobile account balance and usage queries
 */

export interface BalanceInfo {
    airtime: number;
    data: string;
    voice?: string;
    sms?: number;
    validUntil?: string;
    currency: string;
}

/**
 * Check airtime and data balance
 */
export async function checkBalance(
    phoneNumber: string,
    operator: 'airtel' | 'mtn' | 'zamtel'
): Promise<BalanceInfo> {
    try {
        // TODO: Integrate with operator API
        // Example for Airtel: Make API call to Airtel's balance check endpoint
        // Example for MTN: Make API call to MTN's USSD gateway
        // Example for Zamtel: Make API call to Zamtel's API

        // Mock implementation
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Simulated balance data
        return {
            airtime: Math.random() * 100,
            data: `${(Math.random() * 10).toFixed(2)}GB`,
            voice: `${Math.floor(Math.random() * 200)} minutes`,
            sms: Math.floor(Math.random() * 50),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            currency: 'ZMW', // Zambian Kwacha
        };
    } catch (error) {
        console.error('Balance check error:', error);
        throw new Error('Failed to retrieve balance');
    }
}

/**
 * Format balance information for customer
 */
export function formatBalanceInfo(balance: BalanceInfo): string {
    let message = `Your Account Balance:\n\n`;
    message += `💰 Airtime: K${balance.airtime.toFixed(2)}\n`;
    message += `📱 Data: ${balance.data}\n`;

    if (balance.voice) {
        message += `📞 Voice: ${balance.voice}\n`;
    }

    if (balance.sms) {
        message += `💬 SMS: ${balance.sms} messages\n`;
    }

    if (balance.validUntil) {
        message += `\n⏰ Valid until: ${balance.validUntil}`;
    }

    return message;
}

/**
 * Get USSD code for balance check (for customer self-service)
 */
export function getBalanceCheckCode(operator: 'airtel' | 'mtn' | 'zamtel'): string {
    const codes = {
        airtel: '*123#',
        mtn: '*124#',
        zamtel: '*125#',
    };

    return codes[operator];
}

/**
 * Get data usage history (mock)
 */
export async function getDataUsage(
    phoneNumber: string,
    days: number = 7
): Promise<{ date: string; dataUsedMB: number }[]> {
    // TODO: Integrate with operator API

    // Mock data
    const usage = [];
    for (let i = 0; i < days; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        usage.push({
            date: date.toISOString().split('T')[0],
            dataUsedMB: Math.floor(Math.random() * 1000),
        });
    }

    return usage.reverse();
}

/**
 * Calculate average daily usage
 */
export function calculateAverageDailyUsage(
    usage: { date: string; dataUsedMB: number }[]
): number {
    if (usage.length === 0) return 0;

    const total = usage.reduce((sum, day) => sum + day.dataUsedMB, 0);
    return Math.floor(total / usage.length);
}
