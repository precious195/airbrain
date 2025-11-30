// src/lib/industries/television/subscriptions.ts

/**
 * Television/Streaming module - Subscription management
 */

export interface TVSubscription {
    decoderNumber: string;
    customerId: string;
    customerName: string;
    package: TVPackage;
    status: 'active' | 'suspended' | 'expired' | 'disconnected';
    activationDate: string;
    expiryDate: string;
    autoRenewal: boolean;
    lastPaymentDate?: string;
}

export interface TVPackage {
    id: string;
    name: string;
    price: number;
    channels: number;
    features: string[];
    category: 'basic' | 'standard' | 'premium' | 'sports' | 'movies';
}

/**
 * Available TV packages
 */
export const TV_PACKAGES: TVPackage[] = [
    {
        id: 'basic',
        name: 'Basic Package',
        price: 150,
        channels: 50,
        category: 'basic',
        features: [
            '50+ local and regional channels',
            'News and entertainment',
            'Educational content',
            'SD quality',
        ],
    },
    {
        id: 'standard',
        name: 'Standard Package',
        price: 300,
        channels: 120,
        category: 'standard',
        features: [
            '120+ channels',
            'HD channels',
            'Sports channels',
            'Movie channels',
            'Kids content',
        ],
    },
    {
        id: 'premium',
        name: 'Premium Package',
        price: 500,
        channels: 200,
        category: 'premium',
        features: [
            '200+ premium channels',
            'Full HD & 4K content',
            'All sports channels',
            'Premium movies',
            'Music channels',
            'Box Office',
        ],
    },
    {
        id: 'sports',
        name: 'Sports Add-on',
        price: 200,
        channels: 30,
        category: 'sports',
        features: [
            '30+ sports channels',
            'Live matches',
            'Football, cricket, rugby',
            'Sports documentaries',
        ],
    },
];

/**
 * Get subscription details
 */
export async function getSubscriptionDetails(
    decoderNumber: string
): Promise<TVSubscription | null> {
    // TODO: Integrate with TV provider API

    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        decoderNumber,
        customerId: 'CUST123',
        customerName: 'John Doe',
        package: TV_PACKAGES[1], // Standard package
        status: 'active',
        activationDate: '2024-01-01',
        expiryDate: '2024-12-31',
        autoRenewal: true,
        lastPaymentDate: '2024-11-01',
    };
}

/**
 * Activate or renew subscription
 */
export async function activateSubscription(
    decoderNumber: string,
    packageId: string,
    duration: number = 1 // months
): Promise<{ success: boolean; message: string; expiryDate?: string }> {
    // TODO: Process payment and activate

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const selectedPackage = TV_PACKAGES.find((p) => p.id === packageId);

    if (!selectedPackage) {
        return {
            success: false,
            message: 'Invalid package selected',
        };
    }

    const totalAmount = selectedPackage.price * duration;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + duration);

    return {
        success: true,
        message: `${selectedPackage.name} activated! Decoder: ${decoderNumber}. Valid until ${expiryDate.toISOString().split('T')[0]}. Total: K${totalAmount}`,
        expiryDate: expiryDate.toISOString().split('T')[0],
    };
}

/**
 * Reset decoder (clear errors)
 */
export async function resetDecoder(
    decoderNumber: string
): Promise<{ success: boolean; message: string }> {
    // TODO: Send reset command to decoder

    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
        success: true,
        message: `Decoder ${decoderNumber} has been reset successfully. Please wait 5 minutes and restart your decoder.`,
    };
}

/**
 * Upgrade package
 */
export async function upgradePackage(
    decoderNumber: string,
    newPackageId: string
): Promise<{ success: boolean; message: string; proDifference?: number }> {
    // TODO: Calculate pro-rata and upgrade

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newPackage = TV_PACKAGES.find((p) => p.id === newPackageId);

    if (!newPackage) {
        return {
            success: false,
            message: 'Invalid package selected',
        };
    }

    // Mock pro-rata calculation
    const proDifference = 150;

    return {
        success: true,
        message: `Package upgraded to ${newPackage.name}! Pro-rata amount: K${proDifference}. Channels will update within 15 minutes.`,
        proDifference,
    };
}

/**
 * Decoder troubleshooting guide
 */
export function getDecoderTroubleshooting(issue: string): string {
    const guides: Record<string, string> = {
        'no_signal': `No Signal Troubleshooting:

1. Check cable connections
   - Ensure LNB cable is firmly connected
   - Check for damaged cables

2. Check dish alignment
   - Ensure satellite dish is properly aligned
   - Check for physical obstructions

3. Restart decoder
   - Unplug power for 30 seconds
   - Plug back and wait for reboot

4. Check weather conditions
   - Heavy rain may affect signal

If issue persists, reply 'decoder reset' to reset your decoder.`,

        'error_code': `Error Code Help:

E16: Subscription expired - Renew your package
E30: Smart card error - Remove and reinsert card
E48: No signal - Check dish alignment
E100: Technical error - Contact support

To renew: Reply with 'renew subscription'
To reset decoder: Reply with 'decoder reset'`,

        'channel_missing': `Missing Channels:

1. Refresh decoder
   - Navigate to Settings > System Info
   - Press OK on Software Version

2. Check subscription
   - Ensure your package includes the channel
   - Verify subscription is active

3. Rescan channels
   - Settings > Installation > Scan

Reply 'upgrade package' to view higher packages.`,
    };

    return guides[issue] || 'Please describe your issue: no signal, error code, or missing channels.';
}

/**
 * Format package list
 */
export function formatPackageList(): string {
    return TV_PACKAGES.map((pkg, index) =>
        `${index + 1}. ${pkg.name} - K${pkg.price}/month
   ${pkg.channels} channels
   ${pkg.features.slice(0, 3).join(', ')}`
    ).join('\n\n');
}

/**
 * Format subscription details
 */
export function formatSubscriptionDetails(sub: TVSubscription): string {
    return `Your TV Subscription

Decoder: ${sub.decoderNumber}
Package: ${sub.package.name}
Monthly Fee: K${sub.package.price}

Status: ${sub.status.toUpperCase()}
${sub.status === 'active' ? `Expires: ${sub.expiryDate}` : ''}
Auto-renewal: ${sub.autoRenewal ? 'ON' : 'OFF'}

${sub.package.channels} channels including:
${sub.package.features.map((f) => `• ${f}`).join('\n')}`;
}
