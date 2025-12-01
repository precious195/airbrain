// src/lib/ai/conversation-memory.ts
import { ref, set, get, update, push } from 'firebase/database';
import { database } from '../firebase/client';
import type { Conversation, Message, ConversationContext } from '@/types/database';

/**
 * Manage conversation context and history in Firebase Realtime Database
 */
export class ConversationMemory {
    private conversationId: string;
    private customerId: string;

    constructor(conversationId: string, customerId: string) {
        this.conversationId = conversationId;
        this.customerId = customerId;
    }

    /**
     * Get conversation history for Gemini API
     */
    async getHistory(): Promise<{ role: string; parts: { text: string }[] }[]> {
        const conversationRef = ref(database, `conversations/${this.conversationId}`);
        const snapshot = await get(conversationRef);

        if (!snapshot.exists()) {
            return [];
        }

        const conversation: Conversation = snapshot.val();
        const messages = conversation.messages || {};

        // Convert to Gemini format
        const history = Object.values(messages)
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((msg: Message) => ({
                role: msg.sender === 'customer' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            }));

        return history;
    }

    /**
     * Add a new message to the conversation
     */
    async addMessage(
        sender: 'customer' | 'ai' | 'agent',
        content: string,
        intent?: string,
        confidence?: number
    ): Promise<string> {
        const messageRef = push(ref(database, `conversations/${this.conversationId}/messages`));
        const messageId = messageRef.key!;

        const message: Message = {
            id: messageId,
            sender,
            content,
            intent,
            confidence,
            timestamp: Date.now(),
        };

        await set(messageRef, message);

        // Update conversation lastMessageAt
        await update(ref(database, `conversations/${this.conversationId}`), {
            lastMessageAt: Date.now(),
        });

        return messageId;
    }

    /**
     * Update conversation context
     */
    async updateContext(context: Partial<ConversationContext>): Promise<void> {
        const contextRef = ref(database, `conversations/${this.conversationId}/context`);
        await update(contextRef, context);
    }

    /**
     * Get conversation context
     */
    async getContext(): Promise<ConversationContext | null> {
        const contextRef = ref(database, `conversations/${this.conversationId}/context`);
        const snapshot = await get(contextRef);

        if (!snapshot.exists()) {
            return null;
        }

        return snapshot.val();
    }

    /**
     * Mark conversation as resolved
     */
    async resolve(): Promise<void> {
        await update(ref(database, `conversations/${this.conversationId}`), {
            status: 'resolved',
            endedAt: Date.now(),
        });
    }

    /**
     * Escalate conversation to human agent
     */
    async escalate(agentId?: string): Promise<void> {
        await update(ref(database, `conversations/${this.conversationId}`), {
            status: 'escalated',
            assignedAgent: agentId,
        });
    }

    /**
     * Get full conversation details
     */
    async getConversation(): Promise<Conversation | null> {
        const conversationRef = ref(database, `conversations/${this.conversationId}`);
        const snapshot = await get(conversationRef);

        if (!snapshot.exists()) {
            return null;
        }

        return snapshot.val();
    }
}

/**
 * Create a new conversation
 */
export async function createConversation(
    customerId: string,
    channel: 'whatsapp' | 'sms' | 'web' | 'voice' | 'email',
    industry: string
): Promise<string> {
    const conversationRef = push(ref(database, 'conversations'));
    const conversationId = conversationRef.key!;

    const conversation: Partial<Conversation> = {
        id: conversationId,
        customerId,
        channel,
        status: 'active',
        startedAt: Date.now(),
        lastMessageAt: Date.now(),
        context: {
            industry: industry as any,
        },
        messages: {},
    };

    await set(conversationRef, conversation);

    return conversationId;
}

/**
 * Singleton service for conversation memory (used by VoiceAgent)
 */
export class ConversationMemoryService {
    async addMessage(
        conversationId: string,
        content: string,
        role: 'user' | 'model' | 'system',
        metadata?: any
    ): Promise<string> {
        const sender = role === 'user' ? 'customer' : 'ai';

        const messageRef = push(ref(database, `conversations/${conversationId}/messages`));
        const messageId = messageRef.key!;

        const message: any = {
            id: messageId,
            sender,
            content,
            timestamp: Date.now(),
            ...metadata
        };

        await set(messageRef, message);

        await update(ref(database, `conversations/${conversationId}`), {
            lastMessageAt: Date.now(),
        });

        return messageId;
    }
}

export const conversationMemory = new ConversationMemoryService();
