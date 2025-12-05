// src/app/api/chat/route.ts
import { NextRequest } from 'next/server';
import { ConversationMemory } from '@/lib/ai/conversation-memory';
import { generateStreamingResponse } from '@/lib/ai/gemini-provider';
import { detectIntent, shouldEscalate } from '@/lib/ai/intent-detector';
import type { IndustryType } from '@/types/database';

/**
 * POST /api/chat - Streaming chat endpoint for web widget
 */
export async function POST(request: NextRequest) {
    try {
        const { conversationId, customerId, message, industry } = await request.json();

        const memory = new ConversationMemory(conversationId, customerId);

        // Add customer message
        await memory.addMessage('customer', message);

        // Detect intent
        const intent = await detectIntent(message, industry as IndustryType);
        console.log('DEBUG: Detected Intent:', JSON.stringify(intent, null, 2));

        // Check escalation
        if (shouldEscalate(intent, message)) {
            await memory.escalate();

            const encoder = new TextEncoder();
            const stream = new ReadableStream({
                start(controller) {
                    const text = 'I understand your concern. Let me connect you with a human agent who can better assist you.';
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text, done: true })}\n\n`));
                    controller.close();
                },
            });

            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
            });
        }

        // Get conversation history
        const history = await memory.getHistory();

        // Create streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    let fullResponse = '';

                    for await (const chunk of generateStreamingResponse(message, history)) {
                        fullResponse += chunk;
                        const data = JSON.stringify({ content: chunk, done: false });
                        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                    }

                    // Save complete AI response
                    await memory.addMessage('ai', fullResponse, intent.intent, intent.confidence);

                    // Send done signal
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: '', done: true })}\n\n`));
                    controller.close();
                } catch (error) {
                    console.error('Streaming error:', error);
                    controller.error(error);
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return Response.json({ error: 'Failed to process message' }, { status: 500 });
    }
}
