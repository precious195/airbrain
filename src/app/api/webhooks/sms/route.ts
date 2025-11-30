// src/app/api/webhooks/sms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createConversation, ConversationMemory } from '@/lib/ai/conversation-memory';
import { generateResponse } from '@/lib/ai/gemini-provider';
import { detectIntent, shouldEscalate } from '@/lib/ai/intent-detector';

/**
 * POST /api/webhooks/sms - Handle incoming SMS messages from Twilio
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const from = formData.get('From') as string; // Customer's phone number
        const body = formData.get('Body') as string; // Message content

        if (!from || !body) {
            return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
        }

        // Get or create customer ID
        const customerId = await getOrCreateCustomer(from);

        // Get or create active conversation
        const conversationId = await getActiveConversation(customerId)
            || await createConversation(customerId, 'sms', 'mobile');

        const memory = new ConversationMemory(conversationId, customerId);

        // Add customer message
        await memory.addMessage('customer', body);

        // Detect intent
        const intent = await detectIntent(body, 'mobile');

        // Check if escalation needed
        if (shouldEscalate(intent, body)) {
            await memory.escalate();

            const escalationMessage = 'Your message has been forwarded to a customer service representative. You will receive a call shortly.';
            await sendSMS(from, escalationMessage);

            return new NextResponse('Escalated', { status: 200 });
        }

        // Get conversation history
        const history = await memory.getHistory();

        // Generate AI response (use Pro model for complex queries via SMS)
        const aiResponse = await generateResponse(
            body,
            intent.confidence < 0.7, // Use Pro if confidence is low
            history
        );

        // Keep SMS responses concise (160 character limit consideration)
        const smsResponse = aiResponse.length > 300
            ? aiResponse.substring(0, 297) + '...'
            : aiResponse;

        // Save AI response
        await memory.addMessage('ai', smsResponse, intent.intent, intent.confidence);

        // Send SMS response
        await sendSMS(from, smsResponse);

        return new NextResponse('Message processed', { status: 200 });
    } catch (error) {
        console.error('SMS webhook error:', error);
        return NextResponse.json(
            { error: 'Failed to process SMS' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/webhooks/sms - Webhook verification
 */
export async function GET(request: NextRequest) {
    return new NextResponse('SMS webhook is active', { status: 200 });
}

/**
 * Helper: Get or create customer
 */
async function getOrCreateCustomer(phoneNumber: string): Promise<string> {
    // TODO: Implement customer lookup/creation
    return `customer_${phoneNumber.replace(/[^0-9]/g, '')}`;
}

/**
 * Helper: Get active conversation
 */
async function getActiveConversation(customerId: string): Promise<string | null> {
    // TODO: Query Firebase for active conversation
    return null;
}

/**
 * Helper: Send SMS via Twilio
 */
async function sendSMS(to: string, message: string): Promise<void> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_SMS_NUMBER;

    if (!accountSid || !authToken || !from) {
        console.error('Twilio SMS credentials not configured');
        return;
    }

    try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
            },
            body: new URLSearchParams({
                From: from,
                To: to,
                Body: message,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Twilio SMS error:', error);
        }
    } catch (error) {
        console.error('Failed to send SMS:', error);
    }
}
