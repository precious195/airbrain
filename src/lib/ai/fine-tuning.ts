// src/lib/ai/fine-tuning.ts

/**
 * AI Brain - Fine-tuning and company-specific customization
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface FineTuningDataset {
    id: string;
    name: string;
    industry: string;
    description: string;
    examples: TrainingExample[];
    createdAt: string;
    updatedAt: string;
    version: number;
}

export interface TrainingExample {
    input: string;
    output: string;
    intent: string;
    industry: string;
    metadata?: {
        customerType?: string;
        complexity?: 'low' | 'medium' | 'high';
        sentiment?: 'positive' | 'neutral' | 'negative';
        language?: 'en' | 'bem' | 'ny';
    };
}

export interface FineTuningJob {
    id: string;
    datasetId: string;
    status: 'preparing' | 'training' | 'completed' | 'failed';
    modelName: string;
    baseModel: string;
    progress: number; // 0-100
    epochs: number;
    accuracy?: number;
    loss?: number;
    startedAt: string;
    completedAt?: string;
    errorMessage?: string;
}

/**
 * Industry-specific prompts for Gemini
 */
export const INDUSTRY_PROMPTS = {
    banking: `You are an AI customer service assistant for a Zambian bank. You help customers with:
- Account balance inquiries
- Transaction history
- Fund transfers
- Card services (lost/blocked cards, PIN reset)
- Loan applications and status
- Fraud reporting
- General banking queries

Always be professional, secure, and helpful. Verify customer identity when needed.
Use simple language and be patient. If unsure, escalate to a human agent.
Speak in English, Bemba, or Nyanja based on customer preference.`,

    microfinance: `You are an AI assistant for a microfinance institution in Zambia. You help with:
- Loan eligibility checks
- Loan applications
- Repayment schedules
- Payment reminders
- Credit score inquiries
- Loan status tracking

Be empathetic and supportive. Explain terms clearly. Show calculations step-by-step.
Help customers understand their financial commitments.`,

    insurance: `You are an AI assistant for an insurance company. You help customers with:
- Insurance quotes (Life, Health, Auto, Property, Travel)
- Policy purchases
- Claims submission and tracking
- Premium payments
- Coverage explanations
- Beneficiary updates

Be clear about coverage, exclusions, and terms. Guide customers through processes patiently.`,

    mobile: `You are an AI assistant for a mobile network operator in Zambia. You help with:
- Data and airtime bundles
- Balance checks
- SIM registration and swap
- Network troubleshooting
- PUK code retrieval
- Promotions and offers

Be quick and efficient. Provide USSD codes for self-service. Troubleshoot technical issues step-by-step.`,

    television: `You are an AI assistant for a TV/satellite service provider. You help with:
- Subscription activation and renewal
- Package upgrades
- Decoder troubleshooting
- Signal issues
- Payment reminders
- Installation support

Be technical yet simple. Provide clear troubleshooting steps. Explain packages and features clearly.`,
};

/**
 * Get industry-specific system prompt
 */
export function getIndustryPrompt(industry: string): string {
    return INDUSTRY_PROMPTS[industry as keyof typeof INDUSTRY_PROMPTS] || INDUSTRY_PROMPTS.banking;
}

/**
 * Create training dataset
 */
export async function createTrainingDataset(
    name: string,
    industry: string,
    examples: TrainingExample[]
): Promise<{ success: boolean; datasetId?: string; message: string }> {
    // TODO: Save to Firebase

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (examples.length < 10) {
        return {
            success: false,
            message: 'Minimum 10 training examples required',
        };
    }

    const datasetId = `DATASET${Date.now()}`;

    return {
        success: true,
        datasetId,
        message: `Training dataset created with ${examples.length} examples`,
    };
}

/**
 * Get pre-built training examples for industries
 */
export function getIndustryTrainingExamples(industry: string): TrainingExample[] {
    const examples: Record<string, TrainingExample[]> = {
        banking: [
            {
                input: 'What is my account balance?',
                output: 'I can help you check your account balance. Please provide your account number.',
                intent: 'balance_check',
                industry: 'banking',
                metadata: { complexity: 'low', sentiment: 'neutral', language: 'en' },
            },
            {
                input: 'Ndalama shani za account yandi?',
                output: 'Ndakwafwilisha ukumona ndalama za account yenu. Tuleni account number.',
                intent: 'balance_check',
                industry: 'banking',
                metadata: { complexity: 'low', sentiment: 'neutral', language: 'bem' },
            },
            {
                input: 'I lost my ATM card',
                output: 'I\'m sorry to hear that. I can help you block your card immediately to prevent unauthorized use. Let me get your details.',
                intent: 'card_lost',
                industry: 'banking',
                metadata: { complexity: 'medium', sentiment: 'negative', language: 'en' },
            },
            {
                input: 'How do I transfer money to another account?',
                output: 'I can guide you through the transfer process. You can transfer via mobile app, USSD, or at any branch. Which method would you prefer?',
                intent: 'fund_transfer',
                industry: 'banking',
                metadata: { complexity: 'medium', sentiment: 'neutral', language: 'en' },
            },
        ],
        microfinance: [
            {
                input: 'Can I get a loan?',
                output: 'I can help check your loan eligibility. I\'ll need to know your monthly income and employment status.',
                intent: 'loan_eligibility',
                industry: 'microfinance',
                metadata: { complexity: 'medium', sentiment: 'neutral', language: 'en' },
            },
            {
                input: 'How much do I still owe?',
                output: 'Let me check your loan repayment status. Please provide your loan reference number or phone number.',
                intent: 'loan_balance',
                industry: 'microfinance',
                metadata: { complexity: 'low', sentiment: 'neutral', language: 'en' },
            },
        ],
        insurance: [
            {
                input: 'How much is car insurance?',
                output: 'I can provide a car insurance quote. I\'ll need the vehicle year, make, model, and current value.',
                intent: 'insurance_quote',
                industry: 'insurance',
                metadata: { complexity: 'medium', sentiment: 'neutral', language: 'en' },
            },
            {
                input: 'I want to claim for an accident',
                output: 'I\'m sorry about the accident. I\'ll help you submit your claim. Do you have your policy number?',
                intent: 'insurance_claim',
                industry: 'insurance',
                metadata: { complexity: 'medium', sentiment: 'negative', language: 'en' },
            },
        ],
    };

    return examples[industry] || [];
}

/**
 * Enhance prompts with context
 */
export function enhancePromptWithContext(
    userMessage: string,
    context: {
        industry: string;
        customerName?: string;
        conversationHistory?: Array<{ role: string; content: string }>;
        customerTier?: string;
        language?: string;
    }
): string {
    const systemPrompt = getIndustryPrompt(context.industry);

    let enhancedPrompt = systemPrompt + '\n\n';

    if (context.customerName) {
        enhancedPrompt += `Customer name: ${context.customerName}\n`;
    }

    if (context.customerTier === 'vip') {
        enhancedPrompt += 'This is a VIP customer. Provide priority service.\n';
    }

    if (context.language) {
        const langMap = { en: 'English', bem: 'Bemba', ny: 'Nyanja' };
        enhancedPrompt += `Respond in ${langMap[context.language as keyof typeof langMap]}.\n`;
    }

    if (context.conversationHistory && context.conversationHistory.length > 0) {
        enhancedPrompt += '\nConversation history:\n';
        context.conversationHistory.forEach(msg => {
            enhancedPrompt += `${msg.role}: ${msg.content}\n`;
        });
    }

    enhancedPrompt += `\nCustomer: ${userMessage}\nAssistant:`;

    return enhancedPrompt;
}

/**
 * Generate few-shot examples for prompt
 */
export function generateFewShotExamples(intent: string, count: number = 3): string {
    // Get relevant examples from training data
    const allExamples = Object.values(INDUSTRY_PROMPTS)
        .flatMap(industry => getIndustryTrainingExamples(industry));

    const relevantExamples = allExamples
        .filter(ex => ex.intent === intent)
        .slice(0, count);

    if (relevantExamples.length === 0) {
        return '';
    }

    let fewShotText = '\nHere are some examples of how to handle this type of request:\n\n';

    relevantExamples.forEach((example, index) => {
        fewShotText += `Example ${index + 1}:\n`;
        fewShotText += `Customer: ${example.input}\n`;
        fewShotText += `Assistant: ${example.output}\n\n`;
    });

    return fewShotText;
}

/**
 * Evaluate model performance
 */
export async function evaluateModelPerformance(
    datasetId: string,
    testExamples: TrainingExample[]
): Promise<{
    accuracy: number;
    intentAccuracy: number;
    avgConfidence: number;
    confusionMatrix: Record<string, Record<string, number>>;
}> {
    // TODO: Run model on test examples and calculate metrics

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock evaluation results
    return {
        accuracy: 87.5,
        intentAccuracy: 92.3,
        avgConfidence: 84.7,
        confusionMatrix: {
            balance_check: { balance_check: 45, transaction_history: 2, other: 1 },
            fund_transfer: { fund_transfer: 38, balance_check: 1, other: 0 },
            card_lost: { card_lost: 42, fraud_report: 2, other: 1 },
        },
    };
}

/**
 * Get model recommendations based on analysis
 */
export function getModelRecommendations(
    evaluationResults: Awaited<ReturnType<typeof evaluateModelPerformance>>
): string[] {
    const recommendations: string[] = [];

    if (evaluationResults.accuracy < 85) {
        recommendations.push('Overall accuracy below target. Add more training examples.');
    }

    if (evaluationResults.intentAccuracy < 90) {
        recommendations.push('Intent detection needs improvement. Review confusing intents.');
    }

    if (evaluationResults.avgConfidence < 80) {
        recommendations.push('Model confidence is low. Consider fine-tuning with more diverse examples.');
    }

    if (recommendations.length === 0) {
        recommendations.push('Model performance is good. Monitor for edge cases.');
    }

    return recommendations;
}

/**
 * Export training data in Gemini format
 */
export function exportForGeminiFineTuning(examples: TrainingExample[]): string {
    // Format for Gemini fine-tuning API
    const formatted = examples.map(example => ({
        text_input: example.input,
        output: example.output,
        metadata: {
            intent: example.intent,
            industry: example.industry,
            ...example.metadata,
        },
    }));

    return JSON.stringify(formatted, null, 2);
}
