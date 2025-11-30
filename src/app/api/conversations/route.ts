// src/app/api/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createConversation, ConversationMemory } from '@/lib/ai/conversation-memory';
import { generateResponse } from '@/lib/ai/gemini-provider';
import { detectIntent, shouldEscalate } from '@/lib/ai/intent-detector';
import type { IndustryType } from '@/types/database';

/**
 * POST /api/conversations - Create a new conversation
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { customerId, channel, industry, initialMessage } = body;

        // Validate input
        if (!customerId || !channel || !industry) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create conversation
        const conversationId = await createConversation(customerId, channel, industry);
        const memory = new ConversationMemory(conversationId, customerId);

        // If there's an initial message, process it
        if (initialMessage) {
            // Add customer message
            await memory.addMessage('customer', initialMessage);

            // Detect intent
            const intent = await detectIntent(initialMessage, industry as IndustryType);

            // Update context with intent
            await memory.updateContext({
                intent: intent.intent,
                industry: industry as IndustryType,
            });

            // Check if escalation needed
            if (shouldEscalate(intent, initialMessage)) {
                await memory.escalate();

                return NextResponse.json({
                    conversationId,
                    requiresEscalation: true,
                    message: 'Your query has been forwarded to a human agent who will assist you shortly.',
                });
            }

            // Generate AI response
            const aiPrompt = buildIndustryPrompt(initialMessage, industry as IndustryType, intent.intent);
            const aiResponse = await generateResponse(aiPrompt);

            // Save AI response
            await memory.addMessage('ai', aiResponse, intent.intent, intent.confidence);

            return NextResponse.json({
                conversationId,
                response: aiResponse,
                intent: intent.intent,
                confidence: intent.confidence,
            });
        }

        return NextResponse.json({ conversationId });
    } catch (error) {
        console.error('Conversation creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create conversation' },
            { status: 500 }
        );
    }
}

/**
 * Build industry-specific prompts for better AI responses
 */
function buildIndustryPrompt(message: string, industry: IndustryType, intent: string): string {
    const basePrompt = `You are a helpful customer service AI for a ${industry} company.

Customer query: "${message}"
Detected intent: ${intent}

Provide a helpful, professional response. Be concise but complete.
If you need more information to help the customer, ask clarifying questions.
If the request requires actions you cannot perform (like actual transactions), explain that a representative will assist.`;

    const industrySpecificGuidelines: Record<IndustryType, string> = {
        mobile: `
Guidelines for mobile operators:
- Help with balance inquiries, bundle purchases, data plans
- Provide network troubleshooting steps
- Explain how to check balances (e.g., dial *123#)
- Offer bundle recommendations based on usage patterns`,

        banking: `
Guidelines for banking:
- Never share sensitive account details
- Guide users on how to check balances via app or USSD
- Explain common banking procedures
- For fraud/security issues, escalate immediately`,

        microfinance: `
Guidelines for microfinance:
 - Explain loan eligibility criteria
- Provide general information about loan products
- Guide on repayment methods
- Calculate estimated repayments if asked`,

        insurance: `
Guidelines for insurance:
- Explain policy coverage and benefits
- Guide through claims process
- Provide quote estimates based on general criteria
- Clarify premium payment options`,

        tv: `
Guidelines for TV/subscription:
- Help with decoder issues and troubleshooting
- Explain package features and pricing
- Guide through activation process
- Provide signal troubleshooting steps`,
    };

    return basePrompt + '\n' + (industrySpecificGuidelines[industry] || '');
}
