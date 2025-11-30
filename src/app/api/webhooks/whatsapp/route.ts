// src/app/api/webhooks/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createConversation, ConversationMemory } from '@/lib/ai/conversation-memory';
import { generateResponse } from '@/lib/ai/gemini-provider';
import { detectIntent, shouldEscalate } from '@/lib/ai/intent-detector';

/**
 * POST /api/webhooks/whatsapp - Handle incoming WhatsApp messages from Twilio
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const from = formData.get('From') as string; // Customer's WhatsApp number
        const body = formData.get('Body') as string; // Message content
        const profileName = formData.get('ProfileName') as string; // Customer name

        if (!from || !body) {
            return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
        }

        // Extract phone number (remove 'whatsapp:' prefix)
        const phoneNumber = from.replace('whatsapp:', '');

        // Get or create customer ID based on phone number
        const customerId = await getOrCreateCustomer(phoneNumber, profileName);

        // Get or create active conversation
        const conversationId = await getActiveConversation(customerId)
            || await createConversation(customerId, 'whatsapp', 'mobile'); // Default to mobile for now

        const memory = new ConversationMemory(conversationId, customerId);

        // Add customer message to conversation
        await memory.addMessage('customer', body);

        // Detect intent
        const intent = await detectIntent(body, 'mobile');

        // Check if escalation needed
        if (shouldEscalate(intent, body)) {
            await memory.escalate();

            const escalationMessage = 'Thank you for your message. A customer service representative will contact you shortly to assist you better.';
            await sendWhatsAppMessage(from, escalationMessage);

            return new NextResponse('Escalated', { status: 200 });
        }

        // Get conversation history
        const history = await memory.getHistory();

        // Generate AI response
        const aiResponse = await generateResponse(
            body,
            false, // Use Flash model for speed
            history
        );

        // Save AI response to conversation
        await memory.addMessage('ai', aiResponse, intent.intent, intent.confidence);

        // Send response via WhatsApp
        await sendWhatsAppMessage(from, aiResponse);

        return new NextResponse('Message processed', { status: 200 });
    } catch (error) {
        console.error('WhatsApp webhook error:', error);
        return NextResponse.json(
            { error: 'Failed to process message' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/webhooks/whatsapp - Webhook verification for Twilio
 */
export async function GET(request: NextRequest) {
    return new NextResponse('WhatsApp webhook is active', { status: 200 });
}

/**
 * Helper: Get or create customer based on phone number
 */
async function getOrCreateCustomer(phoneNumber: string, name?: string): Promise<string> {
    // TODO: Implement customer lookup/creation in Firebase
    // For now, use phone number as customer ID
    return `customer_${phoneNumber.replace(/[^0-9]/g, '')}`;
}

/**
 * Helper: Get active conversation for customer
 */
async function getActiveConversation(customerId: string): Promise<string | null> {
    // TODO: Query Firebase for active conversation
    // For now, return null to create new conversation
    return null;
}

/**
 * Helper: Send WhatsApp message via Twilio
 */
async function sendWhatsAppMessage(to: string, message: string): Promise<void> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !from) {
        console.error('Twilio credentials not configured');
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
            console.error('Twilio API error:', error);
        }
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error);
    }
}
