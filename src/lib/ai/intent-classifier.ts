import { GoogleGenerativeAI } from '@google/generative-ai';
import { IndustryType } from '@/types/database';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface IntentResult {
    primary: string;
    secondary?: string[];
    confidence: number;
    category: 'inquiry' | 'complaint' | 'request' | 'feedback' | 'other';
    requiresAction: boolean;
}

/**
 * Industry-specific intent patterns
 */
const INTENT_PATTERNS: Record<IndustryType, Record<string, string[]>> = {
    mobile: {
        'check_balance': ['balance', 'airtime', 'credit', 'remaining', 'how much'],
        'buy_bundle': ['bundle', 'data', 'internet', 'buy', 'purchase'],
        'network_issue': ['network', 'signal', 'connection', 'not working', 'slow'],
        'activate_service': ['activate', 'enable', 'start', 'turn on'],
        'customer_care': ['speak', 'agent', 'human', 'representative', 'help']
    },
    banking: {
        'check_balance': ['balance', 'account', 'money', 'funds', 'how much'],
        'transfer_money': ['transfer', 'send', 'pay', 'payment'],
        'loan_inquiry': ['loan', 'borrow', 'credit'],
        'statement': ['statement', 'transactions', 'history'],
        'card_issue': ['card', 'atm', 'debit', 'credit card', 'blocked']
    },
    insurance: {
        'check_policy': ['policy', 'coverage', 'insured', 'premium'],
        'claim': ['claim', 'accident', 'damage', 'hospital'],
        'renewal': ['renew', 'renewal', 'expire', 'expiry'],
        'add_beneficiary': ['beneficiary', 'add', 'include'],
        'cancel_policy': ['cancel', 'stop', 'terminate']
    },
    microfinance: {
        'loan_application': ['apply', 'loan', 'borrow'],
        'check_loan_status': ['loan status', 'application', 'approved'],
        'repayment': ['repay', 'pay', 'payment', 'installment'],
        'loan_balance': ['balance', 'owe', 'remaining'],
        'loan_inquiry': ['loan', 'interest', 'terms', 'conditions']
    },
    television: {
        'check_subscription': ['subscription', 'package', 'plan'],
        'payment': ['pay', 'payment', 'recharge', 'top up'],
        'technical_issue': ['not working', 'error', 'problem', 'screen'],
        'upgrade_package': ['upgrade', 'change', 'better package'],
        'channel_inquiry': ['channel', 'station', 'show', 'watch']
    }
};

/**
 * Advanced intent classification using pattern matching and AI
 */
export class IntentClassifier {
    private model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    /**
     * Quick pattern-based intent detection
     */
    private detectWithPatterns(text: string, industry: IndustryType): IntentResult | null {
        const lowerText = text.toLowerCase();
        const patterns = INTENT_PATTERNS[industry] || {};

        let bestMatch: { intent: string; score: number } | null = null;

        for (const [intent, keywords] of Object.entries(patterns)) {
            let score = 0;
            for (const keyword of keywords) {
                if (lowerText.includes(keyword.toLowerCase())) {
                    score += 1;
                }
            }

            if (score > 0 && (!bestMatch || score > bestMatch.score)) {
                bestMatch = { intent, score };
            }
        }

        if (bestMatch && bestMatch.score > 0) {
            const confidence = Math.min(bestMatch.score / 2, 0.9);
            return {
                primary: bestMatch.intent,
                confidence,
                category: this.categorizeIntent(bestMatch.intent),
                requiresAction: this.requiresAction(bestMatch.intent)
            };
        }

        return null;
    }

    /**
     * AI-powered intent classification for complex cases
     */
    private async detectWithAI(text: string, industry: IndustryType): Promise<IntentResult> {
        try {
            const validIntents = Object.keys(INTENT_PATTERNS[industry] || {});

            const prompt = `You are an intent classifier for a ${industry} customer service AI.

Valid intents: ${validIntents.join(', ')}

Customer message: "${text}"

Classify the customer's intent. Return JSON with:
{
  "primary": "intent_name",
  "confidence": 0.0-1.0,
  "category": "inquiry|complaint|request|feedback|other",
  "requiresAction": true|false
}

Return only valid JSON.`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const intent = JSON.parse(jsonMatch[0]);
                return {
                    primary: intent.primary,
                    confidence: intent.confidence || 0.7,
                    category: intent.category || 'other',
                    requiresAction: intent.requiresAction || false
                };
            }
        } catch (error) {
            console.error('AI intent classification failed:', error);
        }

        // Fallback
        return {
            primary: 'general_inquiry',
            confidence: 0.5,
            category: 'inquiry',
            requiresAction: false
        };
    }

    /**
     * Classify customer intent
     */
    async classify(text: string, industry: IndustryType): Promise<IntentResult> {
        // Try pattern matching first (faster)
        const patternResult = this.detectWithPatterns(text, industry);

        if (patternResult && patternResult.confidence > 0.7) {
            return patternResult;
        }

        // Fall back to AI for complex cases
        return await this.detectWithAI(text, industry);
    }

    /**
     * Categorize intent
     */
    private categorizeIntent(intent: string): 'inquiry' | 'complaint' | 'request' | 'feedback' | 'other' {
        if (intent.includes('check') || intent.includes('inquiry')) return 'inquiry';
        if (intent.includes('issue') || intent.includes('problem')) return 'complaint';
        if (intent.includes('buy') || intent.includes('transfer') || intent.includes('apply')) return 'request';
        return 'other';
    }

    /**
     * Determine if intent requires action
     */
    private requiresAction(intent: string): boolean {
        const actionIntents = ['buy', 'transfer', 'apply', 'activate', 'cancel', 'upgrade', 'payment'];
        return actionIntents.some(action => intent.includes(action));
    }
}

export const intentClassifier = new IntentClassifier();
