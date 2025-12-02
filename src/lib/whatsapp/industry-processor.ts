// Industry Message Processor
import { ref, get, set, push, update } from 'firebase/database';
import { database } from '../firebase/client';
import type { IndustryType } from '../knowledge-bases';
import { getKnowledgeBase, findSolution, shouldEscalateIssue } from '../knowledge-bases';
import { intentDetector } from '../ai/intent-detector';
import { geminiProvider } from '../ai/gemini-provider';

export interface WhatsAppIndustryConfig {
    enabled: boolean;
    phoneNumberId: string;
    accessToken: string;
    businessAccountId: string;
    webhookVerifyToken: string;
    autoResponse: boolean;
    escalationThreshold: number; // 0-100
    businessHours: {
        enabled: boolean;
        timezone: string;
        schedule: Record<string, { start: string; end: string }>;
    };
    welcomeMessage: string;
    offlineMessage: string;
}

export interface ProcessMessageParams {
    industry: IndustryType;
    customerPhone: string;
    customerName?: string;
    messageText: string;
    messageId: string;
    config: WhatsAppIndustryConfig;
}

export interface ResponsePayload {
    shouldRespond: boolean;
    text: string;
    escalate: boolean;
    ticketId?: string;
    conversationId?: string;
}

export async function processIndustryMessage(
    params: ProcessMessageParams
): Promise<ResponsePayload> {
    const { industry, customerPhone, customerName, messageText, messageId, config } = params;

    try {
        // 1. Get or create conversation
        const conversationId = await getOrCreateConversation(industry, customerPhone, customerName);

        // 2. Save customer message
        await saveMessage(conversationId, {
            id: messageId,
            role: 'user',
            content: messageText,
            timestamp: Date.now(),
        });

        // 3. Check business hours
        if (config.businessHours.enabled && !isWithinBusinessHours(config.businessHours)) {
            return {
                shouldRespond: true,
                text: config.offlineMessage || 'We are currently offline. We will respond during business hours.',
                escalate: false,
                conversationId
            };
        }

        // 4. Detect intent
        const intent = await intentDetector.detectIntent(messageText, industry);

        // 5. Check escalation threshold
        if (intent.confidence < config.escalationThreshold / 100) {
            const ticketId = await createEscalationTicket(industry, conversationId, customerPhone, messageText);

            return {
                shouldRespond: true,
                text: `I want to make sure you get the best help. I've connected you with a specialist who will assist you shortly.\n\nReference: ${ticketId}`,
                escalate: true,
                ticketId,
                conversationId
            };
        }

        // 6. Get knowledge base
        const knowledgeBase = getKnowledgeBase(industry);

        // 7. Check for direct solution in knowledge base
        const solution = findSolution(industry, intent.intent);
        if (solution) {
            const shouldEscalate = shouldEscalateIssue(industry, intent.intent);

            let responseText = solution;
            if (shouldEscalate) {
                const ticketId = await createEscalationTicket(industry, conversationId, customerPhone, messageText);
                responseText += `\n\n📋 Support ticket created: ${ticketId}`;
            }

            // Save AI response
            await saveMessage(conversationId, {
                id: `ai_${Date.now()}`,
                role: 'assistant',
                content: responseText,
                timestamp: Date.now(),
                metadata: { intent: intent.intent, confidence: intent.confidence }
            });

            return {
                shouldRespond: true,
                text: responseText,
                escalate: shouldEscalate,
                ticketId: shouldEscalate ? `TKT-${Date.now()}` : undefined,
                conversationId
            };
        }

        // 8. Generate AI response using Gemini
        const conversationHistory = await getConversationHistory(conversationId);
        const aiResponse = await generateIndustryResponse(
            industry,
            messageText,
            intent,
            knowledgeBase,
            conversationHistory
        );

        // Save AI response
        await saveMessage(conversationId, {
            id: `ai_${Date.now()}`,
            role: 'assistant',
            content: aiResponse,
            timestamp: Date.now(),
            metadata: { intent: intent.intent, confidence: intent.confidence }
        });

        return {
            shouldRespond: true,
            text: aiResponse,
            escalate: false,
            conversationId
        };

    } catch (error) {
        console.error('Error processing industry message:', error);
        return {
            shouldRespond: true,
            text: 'I apologize, but I encountered an error. Please try again or contact our support team.',
            escalate: true
        };
    }
}

async function getOrCreateConversation(
    industry: IndustryType,
    customerPhone: string,
    customerName?: string
): Promise<string> {
    // Check for existing active conversation
    const conversationsRef = ref(database, 'conversations');
    const snapshot = await get(conversationsRef);

    if (snapshot.exists()) {
        const conversations = snapshot.val();
        for (const [id, conv] of Object.entries<any>(conversations)) {
            if (conv.industry === industry &&
                conv.customerPhone === customerPhone &&
                conv.status === 'active') {
                return id;
            }
        }
    }

    // Create new conversation
    const newConvRef = push(conversationsRef);
    const conversationId = newConvRef.key!;

    await set(newConvRef, {
        id: conversationId,
        industry,
        customerPhone,
        customerName: customerName || 'Unknown',
        channel: 'whatsapp',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: []
    });

    return conversationId;
}

async function saveMessage(conversationId: string, message: any): Promise<void> {
    const messageRef = push(ref(database, `conversations/${conversationId}/messages`));
    await set(messageRef, message);

    // Update conversation timestamp
    await update(ref(database, `conversations/${conversationId}`), {
        updatedAt: Date.now()
    });
}

async function getConversationHistory(conversationId: string): Promise<any[]> {
    const messagesRef = ref(database, `conversations/${conversationId}/messages`);
    const snapshot = await get(messagesRef);

    if (!snapshot.exists()) {
        return [];
    }

    const messages = snapshot.val();
    return Object.values(messages).slice(-10); // Last 10 messages
}

async function generateIndustryResponse(
    industry: IndustryType,
    messageText: string,
    intent: any,
    knowledgeBase: any,
    history: any[]
): Promise<string> {
    const systemPrompt = `You are a helpful customer service AI for a ${industry} company. 
Use the following knowledge base to answer questions accurately and professionally.

Knowledge Base:
${JSON.stringify(knowledgeBase, null, 2)}

Guidelines:
- Be concise and helpful
- Use emojis sparingly for clarity
- Provide specific instructions when available
- If you don't know, admit it and offer to escalate
- Always be polite and professional

Customer's detected intent: ${intent.intent} (confidence: ${Math.round(intent.confidence * 100)}%)`;

    const response = await geminiProvider.generateResponse(
        [
            ...history.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
            { role: 'user', content: `${systemPrompt}\n\nUser message: ${messageText}` }
        ],
        false // use Flash for speed
    );

    return response;
}

async function createEscalationTicket(
    industry: IndustryType,
    conversationId: string,
    customerPhone: string,
    issue: string
): Promise<string> {
    const ticketsRef = ref(database, 'tickets');
    const ticketRef = push(ticketsRef);
    const ticketId = `TKT-${Date.now()}`;

    await set(ticketRef, {
        id: ticketId,
        industry,
        conversationId,
        customerPhone,
        subject: issue.substring(0, 100),
        description: issue,
        priority: 'medium',
        status: 'open',
        assignedTo: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
    });

    return ticketId;
}

function isWithinBusinessHours(businessHours: WhatsAppIndustryConfig['businessHours']): boolean {
    if (!businessHours.enabled) return true;

    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const schedule = businessHours.schedule[dayName];

    if (!schedule) return false;

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMin] = schedule.start.split(':').map(Number);
    const [endHour, endMin] = schedule.end.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    return currentTime >= startTime && currentTime <= endTime;
}

export async function getIndustryByPhone(phoneNumberId: string): Promise<IndustryType | null> {
    const mappingRef = ref(database, `phoneMapping/${phoneNumberId}`);
    const snapshot = await get(mappingRef);

    if (snapshot.exists()) {
        return snapshot.val() as IndustryType;
    }

    return null;
}

export async function getIndustryWhatsAppConfig(industry: IndustryType): Promise<WhatsAppIndustryConfig | null> {
    const configRef = ref(database, `industries/${industry}/whatsappConfig`);
    const snapshot = await get(configRef);

    if (snapshot.exists()) {
        return snapshot.val() as WhatsAppIndustryConfig;
    }

    return null;
}
