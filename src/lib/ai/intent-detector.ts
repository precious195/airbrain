// src/lib/ai/intent-detector.ts
import { generateResponse, generateEmbedding } from './gemini-provider';
import type { IndustryType } from '@/types/database';

/**
 * Detect customer intent from message using Gemini AI
 */
export interface IntentResult {
    intent: string;
    confidence: number;
    category: 'inquiry' | 'complaint' | 'request' | 'feedback';
    requiresEscalation: boolean;
    sentiment: 'positive' | 'neutral' | 'negative';
}

const intentPrompt = (message: string, industry: IndustryType) => `
You are an intent detector for a customer service AI system for the ${industry} industry.

Analyze the following customer message and determine:
1. The primary intent (what the customer wants)
2. Confidence score (0-1)
3. Category (inquiry, complaint, request, or feedback)
4. Whether an exact response is needed or escalation to human agent is required
5. Sentiment (positive, neutral, or negative)

Customer message: "${message}"

Respond in JSON format:
{
  "intent": "brief description of intent",
  "confidence": 0.95,
  "category": "inquiry|complaint|request|feedback",
  "requiresEscalation": false,
  "sentiment": "positive|neutral|negative"
}
`;

export async function detectIntent(
    message: string,
    industry: IndustryType
): Promise<IntentResult> {
    try {
        const response = await generateResponse(intentPrompt(message, industry), false);

        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid response format from AI');
        }

        const result: IntentResult = JSON.parse(jsonMatch[0]);
        return result;
    } catch (error) {
        console.error('Intent detection error:', error);

        // Fallback intent
        return {
            intent: 'general_inquiry',
            confidence: 0.5,
            category: 'inquiry',
            requiresEscalation: false,
            sentiment: 'neutral',
        };
    }
}

/**
 * Common intents for each industry
 */
export const INDUSTRY_INTENTS = {
    mobile: [
        'balance_inquiry',
        'bundle_purchase',
        'data_purchase',
        'airtime_purchase',
        'sim_registration',
        'network_issue',
        'puk_code_request',
        'plan_upgrade',
    ],
    banking: [
        'balance_inquiry',
        'transaction_history',
        'loan_inquiry',
        'card_lost_stolen',
        'fraud_report',
        'account_opening',
        'forex_rates',
        'atm_issue',
    ],
    microfinance: [
        'loan_application',
        'loan_status',
        'repayment_inquiry',
        'loan_calculator',
        'eligibility_check',
        'payment_reminder',
    ],
    insurance: [
        'quote_request',
        'policy_inquiry',
        'claims_submission',
        'premium_payment',
        'coverage_details',
        'policy_renewal',
    ],
    tv: [
        'subscription_activation',
        'package_upgrade',
        'decoder_reset',
        'signal_issue',
        'payment_confirmation',
        'decoder_troubleshooting',
    ],
};

/**
 * Check if message indicates frustration or anger
 */
export function detectFrustration(message: string): boolean {
    const frustrationKeywords = [
        'angry',
        'frustrated',
        'terrible',
        'awful',
        'worst',
        'useless',
        'ridiculous',
        'unacceptable',
        'disappointed',
        'disgusted',
    ];

    const lowerMessage = message.toLowerCase();
    return frustrationKeywords.some((keyword) => lowerMessage.includes(keyword));
}

/**
 * Determine if message requires human escalation
 */
export function shouldEscalate(intentResult: IntentResult, message: string): boolean {
    // Escalate if low confidence
    if (intentResult.confidence < 0.6) return true;

    // Escalate if complaint with negative sentiment
    if (intentResult.category === 'complaint' && intentResult.sentiment === 'negative') return true;

    // Escalate if frustration detected
    if (detectFrustration(message)) return true;

    // Escalate if AI explicitly recommends it
    if (intentResult.requiresEscalation) return true;

    return false;
}
