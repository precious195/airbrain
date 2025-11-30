// src/lib/industries/mobile/bundles.ts
import type { IndustryType } from '@/types/database';

/**
 * Mobile operator bundle definitions and purchase logic
 */

export interface MobileBundle {
    id: string;
    name: string;
    operator: 'airtel' | 'mtn' | 'zamtel';
    type: 'data' | 'voice' | 'sms' | 'combo';
    dataAmount?: string; // e.g., "1GB", "5GB"
    voiceMinutes?: number;
    smsCount?: number;
    price: number;
    validity: string; // e.g., "24 hours", "7 days", "30 days"
    description: string;
}

export const MOBILE_BUNDLES: MobileBundle[] = [
    // Airtel Bundles
    {
        id: 'airtel_data_1gb',
        name: 'Airtel 1GB Daily',
        operator: 'airtel',
        type: 'data',
        dataAmount: '1GB',
        price: 10,
        validity: '24 hours',
        description: '1GB data valid for 24 hours',
    },
    {
        id: 'airtel_data_5gb',
        name: 'Airtel 5GB Weekly',
        operator: 'airtel',
        type: 'data',
        dataAmount: '5GB',
        price: 45,
        validity: '7 days',
        description: '5GB data valid for 7 days',
    },
    {
        id: 'airtel_data_20gb',
        name: 'Airtel 20GB Monthly',
        operator: 'airtel',
        type: 'data',
        dataAmount: '20GB',
        price: 150,
        validity: '30 days',
        description: '20GB data valid for 30 days',
    },

    // MTN Bundles
    {
        id: 'mtn_data_1gb',
        name: 'MTN 1GB Daily',
        operator: 'mtn',
        type: 'data',
        dataAmount: '1GB',
        price: 10,
        validity: '24 hours',
        description: '1GB data valid for 24 hours',
    },
    {
        id: 'mtn_data_10gb',
        name: 'MTN 10GB Weekly',
        operator: 'mtn',
        type: 'data',
        dataAmount: '10GB',
        price: 80,
        validity: '7 days',
        description: '10GB data valid for 7 days',
    },

    // Zamtel Bundles
    {
        id: 'zamtel_data_2gb',
        name: 'Zamtel 2GB Daily',
        operator: 'zamtel',
        type: 'data',
        dataAmount: '2GB',
        price: 15,
        validity: '24 hours',
        description: '2GB data valid for 24 hours',
    },
];

/**
 * Get bundles for specific operator
 */
export function getBundlesByOperator(operator: 'airtel' | 'mtn' | 'zamtel'): MobileBundle[] {
    return MOBILE_BUNDLES.filter((bundle) => bundle.operator === operator);
}

/**
 * Get bundle by ID
 */
export function getBundleById(bundleId: string): MobileBundle | undefined {
    return MOBILE_BUNDLES.find((bundle) => bundle.id === bundleId);
}

/**
 * Recommend bundles based on usage pattern
 */
export function recommendBundles(
    operator: 'airtel' | 'mtn' | 'zamtel',
    averageDailyUsageMB: number
): MobileBundle[] {
    const bundles = getBundlesByOperator(operator);

    // Simple recommendation logic
    if (averageDailyUsageMB < 500) {
        // Light user - recommend daily bundles
        return bundles.filter((b) => b.validity === '24 hours');
    } else if (averageDailyUsageMB < 2000) {
        // Medium user - recommend weekly bundles
        return bundles.filter((b) => b.validity === '7 days');
    } else {
        // Heavy user - recommend monthly bundles
        return bundles.filter((b) => b.validity === '30 days');
    }
}

/**
 * Purchase bundle (Mock implementation - integrate with actual operator API)
 */
export async function purchaseBundle(
    customerId: string,
    phoneNumber: string,
    bundleId: string
): Promise<{ success: boolean; message: string; transactionId?: string }> {
    try {
        const bundle = getBundleById(bundleId);

        if (!bundle) {
            return {
                success: false,
                message: 'Bundle not found',
            };
        }

        // TODO: Integrate with actual mobile operator API
        // For now, simulate successful purchase

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const transactionId = `TXN${Date.now()}`;

        // In production, this would:
        // 1. Check customer balance
        // 2. Call operator API to purchase bundle
        // 3. Deduct amount from customer account
        // 4. Log transaction
        // 5. Send confirmation SMS

        return {
            success: true,
            message: `Successfully purchased ${bundle.name} for K${bundle.price}. Valid for ${bundle.validity}.`,
            transactionId,
        };
    } catch (error) {
        console.error('Bundle purchase error:', error);
        return {
            success: false,
            message: 'Failed to purchase bundle. Please try again.',
        };
    }
}

/**
 * Get balance (Mock implementation)
 */
export async function getBalance(
    phoneNumber: string,
    operator: 'airtel' | 'mtn' | 'zamtel'
): Promise<{ airtime: number; data: string; validUntil?: string }> {
    // TODO: Integrate with actual operator API
    // For now, return mock data

    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        airtime: 25.50,
        data: '2.5GB',
        validUntil: '2025-12-15',
    };
}

/**
 * Format bundle information for AI to present to customer
 */
export function formatBundleInfo(bundle: MobileBundle): string {
    return `${bundle.name} - K${bundle.price}
${bundle.description}
Validity: ${bundle.validity}`;
}

/**
 * Format multiple bundles for display
 */
export function formatBundleList(bundles: MobileBundle[]): string {
    return bundles.map((bundle, index) =>
        `${index + 1}. ${formatBundleInfo(bundle)}`
    ).join('\n\n');
}
