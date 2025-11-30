// src/lib/industries/mobile/promotions.ts

/**
 * Mobile operators module - Promotions and bundle recommendations
 */

import type { MobileBundle } from './bundles';
import { MOBILE_BUNDLES } from './bundles';

export interface Promotion {
    id: string;
    operator: 'airtel' | 'mtn' | 'zamtel';
    title: string;
    description: string;
    discount: number; // percentage
    originalPrice: number;
    promoPrice: number;
    startDate: string;
    endDate: string;
    terms: string[];
    category: 'data' | 'voice' | 'sms' | 'combo';
}

/**
 * Get active promotions
 */
export async function getActivePromotions(
    operator: 'airtel' | 'mtn' | 'zamtel'
): Promise<Promotion[]> {
    // TODO: Fetch from marketing/promotions system

    await new Promise((resolve) => setTimeout(resolve, 500));

    const promotions: Promotion[] = [
        {
            id: 'promo_1',
            operator,
            title: 'Weekend Data Bonanza!',
            description: 'Get 50% extra data on all bundles purchased Saturday & Sunday',
            discount: 50,
            originalPrice: 100,
            promoPrice: 100,
            startDate: '2024-11-30',
            endDate: '2024-12-01',
            terms: [
                'Valid on weekends only',
                'Extra data valid for 24 hours',
                'Applies to all data bundles',
            ],
            category: 'data',
        },
        {
            id: 'promo_2',
            operator,
            title: 'Night Owl Special',
            description: '10GB Data for K50 - Valid 12AM to 5AM',
            discount: 70,
            originalPrice: 150,
            promoPrice: 50,
            startDate: '2024-11-01',
            endDate: '2024-12-31',
            terms: [
                'Valid between 12AM and 5AM only',
                'One-time purchase per day',
                'Cannot be used during daytime',
            ],
            category: 'data',
        },
    ];

    return promotions;
}

/**
 * Get personalized bundle recommendations based on usage
 */
export function getBundleRecommendations(
    usageProfile: {
        avgDailyDataMB: number;
        avgMonthlyVoiceMin: number;
        avgMonthlySMS: number;
        budget: number;
    },
    operator: 'airtel' | 'mtn' | 'zamtel'
): {
    recommended: MobileBundle[];
    reason: string;
    savings: number;
} {
    const bundles = MOBILE_BUNDLES.filter(b => b.operator === operator);

    // Calculate monthly data need
    const monthlyDataGB = (usageProfile.avgDailyDataMB * 30) / 1024;

    let recommended: MobileBundle[] = [];
    let reason = '';

    // Heavy data user (>60GB/month)
    if (monthlyDataGB > 60) {
        recommended = bundles
            .filter(b => b.validity === '30 days' && b.dataAmount)
            .sort((a, b) => {
                const aGB = parseInt(a.dataAmount || '0');
                const bGB = parseInt(b.dataAmount || '0');
                return bGB - aGB;
            })
            .slice(0, 3);

        reason = `Based on your ${monthlyDataGB.toFixed(0)}GB monthly usage, these unlimited or large bundles offer best value.`;
    }
    // Medium user (20-60GB/month)
    else if (monthlyDataGB > 20) {
        recommended = bundles
            .filter(b => b.validity === '7 days' || b.validity === '30 days')
            .filter(b => b.price <= usageProfile.budget * 1.2)
            .slice(0, 3);

        reason = `Your average ${monthlyDataGB.toFixed(0)}GB monthly usage is best served by weekly or monthly bundles.`;
    }
    // Light user (<20GB/month)
    else {
        recommended = bundles
            .filter(b => b.validity === '24 hours' || b.validity === '7 days')
            .filter(b => b.price <= usageProfile.budget)
            .slice(0, 3);

        reason = `As a light user (${monthlyDataGB.toFixed(0)}GB/month), daily bundles give you flexibility without waste.`;
    }

    // Calculate estimated savings
    const estimatedMonthlyCost = recommended[0]?.price * (30 / (
        recommended[0]?.validity === '24 hours' ? 1 :
            recommended[0]?.validity === '7 days' ? 7 : 30
    )) || 0;

    const savings = usageProfile.budget - estimatedMonthlyCost;

    return {
        recommended,
        reason,
        savings: Math.max(0, savings),
    };
}

/**
 * Format promotion details
 */
export function formatPromotion(promo: Promotion): string {
    const discountEmoji = promo.discount >= 50 ? '🔥' : '🎉';

    return `${discountEmoji} ${promo.title}

${promo.description}

💰 Was: K${promo.originalPrice}
💰 Now: K${promo.promoPrice}
📊 Save: ${promo.discount}%

📅 Valid: ${promo.startDate} to ${promo.endDate}

Terms & Conditions:
${promo.terms.map(t => `• ${t}`).join('\n')}

To activate, dial *123# or reply 'buy ${promo.id}'`;
}

/**
 * Format bundle recommendations
 */
export function formatBundleRecommendations(
    recommendations: ReturnType<typeof getBundleRecommendations>
): string {
    let text = `📊 Recommended Bundles for You:\n\n${recommendations.reason}\n\n`;

    recommendations.recommended.forEach((bundle, index) => {
        text += `${index + 1}. ${bundle.name} - K${bundle.price}\n`;
        text += `   ${bundle.description}\n`;
        text += `   Valid: ${bundle.validity}\n\n`;
    });

    if (recommendations.savings > 0) {
        text += `💰 Potential savings: K${recommendations.savings.toFixed(2)}/month`;
    }

    return text;
}

/**
 * Get seasonal/special  occasion bundles
 */
export function getSeasonalPromos(
    occasion: 'christmas' | 'new_year' | 'easter' | 'valentines' | 'independence'
): string {
    const promos = {
        christmas: `🎄 Christmas Special Bundles:

1. Family Connect Package
   • 20GB Data + 200 min + 100 SMS
   • K200 (Save 40%)
   • Share with family
   • Valid till Jan 1st

2. Holiday Unlimited
   • Unlimited data 12AM-6AM
   • K150 for 7 days
   • Perfect for late-night streaming

3. Gift Bundles
   • Send data to loved ones
   • Special Christmas wrapping
   • Surprise your family!

Dial *123# to activate or reply with bundle name`,

        new_year: `🎆 New Year Mega Deals:

1. Fresh Start Bundle
   • 50GB Data + Unlimited Social Media
   • K300 for 30 days
   • Limited time only

2. Resolution Package
   • Pay K500, get K750 worth
   • Valid for 60 days
   • Perfect way to start the year

3. Party Night Special
   • Unlimited calls + data Dec 31st
   • K100 for 24 hours
   • Ring in the new year!

Valid Jan 1-7. Dial *123#`,

        valentines: `❤️ Valentine's Day Specials:

1. Love Connection
   • Unlimited calls to 1 number
   • K50 for 24 hours
   • Stay connected all day

2. Data for Two
   • 10GB shareable data
   • K100
   • Share the love

3. Sweet Talk Bundle
   • 500 min + 5GB
   • K150
   • Valid Feb 14-15

Share love, not just messages! Dial *123#`,

        easter: `🐣 Easter Weekend Offers:

1. Easter Egg Surprise
   • Buy 5GB, get 5GB FREE
   • K75 total
   • Valid Easter weekend

2. Long Weekend Unlimited
   • Unlimited data Fri-Mon
   • K200
   • Stream all weekend

3. Family Bundle
   • 20GB + 200 min
   • K180
   • Connect with family

Valid Easter weekend. Dial *123#`,

        independence: `🇿🇲 Independence Day Specials:

1. Freedom Bundle
   • 18GB Data (for 1964!)
   • K100
   • Celebrate with data

2. Zambia Connect
   • Unlimited local calls
   • K150 for 24 hours
   • Call friends & family

3. Patriot Package
   • 30GB + 500 min
   • K250
   • Show your patriotism

Happy Independence! Dial *123#`,
    };

    return promos[occasion];
}
