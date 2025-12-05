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
            timestamp: Date.now(),
        };

        if (intent) message.intent = intent;
        if (confidence !== undefined) message.confidence = confidence;

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
    /**
     * Escalate conversation to human agent
     */
    async escalate(agentId?: string): Promise<void> {
        const updates: any = {
            status: 'escalated',
        };
        if (agentId) updates.assignedAgent = agentId;

        await update(ref(database, `conversations/${this.conversationId}`), updates);
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
    /**
     * Generate conversation summary
     */
    async generateSummary(): Promise<string> {
        const conversation = await this.getConversation();
        if (!conversation || !conversation.messages) {
            return '';
        }

        const messages = Object.values(conversation.messages)
            .sort((a, b) => a.timestamp - b.timestamp);

        if (messages.length === 0) {
            return '';
        }

        // Simple summary: last few exchanges
        const recentMessages = messages.slice(-6);
        const summary = recentMessages
            .map(m => `${m.sender}: ${m.content}`)
            .join('\n');

        return `Summary of last ${recentMessages.length} messages:\n${summary}`;
    }

    /**
     * Get history with token management
     */
    async getHistoryWithTokenLimit(maxTokens: number = 4000): Promise<{ role: string; parts: { text: string }[] }[]> {
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

        // Estimate tokens (rough: ~4 chars per token)
        let tokenCount = 0;
        const limited: typeof history = [];

        // Start from most recent
        for (let i = history.length - 1; i >= 0; i--) {
            const estimatedTokens = Math.ceil(history[i].parts[0].text.length / 4);

            if (tokenCount + estimatedTokens > maxTokens) {
                break;
            }

            limited.unshift(history[i]);
            tokenCount += estimatedTokens;
        }

        // If we had to cut off history, add summary as context
        if (limited.length < history.length && limited.length > 0) {
            const summary = await this.generateSummary();
            limited.unshift({
                role: 'model',
                parts: [{ text: `[Context from earlier in conversation]: ${summary}` }]
            });
        }

        return limited;
    }

    /**
     * Add enriched message with NLP data
     */
    async addEnrichedMessage(
        sender: 'customer' | 'ai' | 'agent',
        content: string,
        nlpData?: {
            intent?: string;
            confidence?: number;
            entities?: any;
            sentiment?: string;
        }
    ): Promise<string> {
        const messageRef = push(ref(database, `conversations/${this.conversationId}/messages`));
        const messageId = messageRef.key!;

        const message: Message = {
            id: messageId,
            sender,
            content,
            timestamp: Date.now(),
        };

        if (nlpData?.intent) message.intent = nlpData.intent;
        if (nlpData?.confidence !== undefined) message.confidence = nlpData.confidence;

        if (nlpData) {
            message.metadata = {};
            if (nlpData.entities) message.metadata.entities = nlpData.entities;
            if (nlpData.sentiment) message.metadata.sentiment = nlpData.sentiment;
            // If metadata ends up empty, delete it
            if (Object.keys(message.metadata).length === 0) delete message.metadata;
        }

        await set(messageRef, message);

        // Update conversation lastMessageAt
        await update(ref(database, `conversations/${this.conversationId}`), {
            lastMessageAt: Date.now(),
        });

        return messageId;
    }
}

/**
 * Create a new conversation
 */
export async function createConversation(
    customerId: string,
    channel: 'whatsapp' | 'sms' | 'web' | 'voice' | 'email',
    industry: string,
    companyId: string  // Add companyId parameter
): Promise<string> {
    const conversationRef = push(ref(database, `companies/${companyId}/conversations`));
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
