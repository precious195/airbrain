// src/lib/ai/voice-agent.ts

import { geminiProvider } from './gemini-provider';
import { intentDetector } from './intent-detector';
import { reasoningEngine } from './reasoning-engine';
import { conversationMemory } from './conversation-memory';
import { CRMService } from '../integrations/crm';

/**
 * AI Voice Agent
 * Handles human-like voice interactions, call management, and integrations.
 */

export interface VoiceConfig {
    provider: 'twilio' | 'vapi' | 'bland_ai';
    voiceId: string;
    language: string; // 'en-US', 'en-ZM', 'bem', 'nya'
    transcriptionModel: string;
    recordingEnabled: boolean;
}

export interface CallSession {
    callId: string;
    callerNumber: string;
    startTime: string;
    status: 'ringing' | 'in_progress' | 'completed' | 'failed';
    transcript: TranscriptItem[];
    context: Record<string, any>;
    detectedLanguage?: string;
}

export interface TranscriptItem {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

export interface VoiceResponse {
    text: string;
    audioUrl?: string; // If pre-generated
    action?: 'listen' | 'hangup' | 'transfer';
    transferTo?: string; // Phone number or SIP URI
}

export class VoiceAgent {
    private config: VoiceConfig;
    private activeCalls: Map<string, CallSession> = new Map();

    constructor(config: VoiceConfig) {
        this.config = config;
    }

    /**
     * Handle incoming call
     */
    async handleIncomingCall(callId: string, callerNumber: string): Promise<VoiceResponse> {
        const session: CallSession = {
            callId,
            callerNumber,
            startTime: new Date().toISOString(),
            status: 'ringing',
            transcript: [],
            context: {},
        };

        this.activeCalls.set(callId, session);

        // Lookup customer in CRM
        const crm = CRMService.createClient({ provider: 'custom', apiUrl: 'http://localhost:3000/api/crm', apiKey: 'mock' });
        try {
            // In a real scenario, we'd search by phone number
            // const customer = await crm.getCustomerByPhone(callerNumber);
            // session.context.customer = customer;
            // greeting = `Hello ${customer.firstName}, ...`
        } catch (e) {
            console.warn('Customer lookup failed', e);
        }

        const greeting = "Hello, thank you for calling. I am your AI assistant. How can I help you today?";

        session.transcript.push({
            role: 'assistant',
            content: greeting,
            timestamp: new Date().toISOString(),
        });

        session.status = 'in_progress';

        return {
            text: greeting,
            action: 'listen',
        };
    }

    /**
     * Process voice input (speech-to-text result)
     */
    async processVoiceInput(callId: string, userText: string): Promise<VoiceResponse> {
        const session = this.activeCalls.get(callId);
        if (!session) {
            throw new Error(`Call session ${callId} not found`);
        }

        // 1. Update Transcript
        session.transcript.push({
            role: 'user',
            content: userText,
            timestamp: new Date().toISOString(),
        });

        // 2. Detect Intent & Language
        // Simple language detection heuristic or use dedicated service
        const detectedLang = this.detectLanguage(userText);
        if (detectedLang) session.detectedLanguage = detectedLang;

        const intent = await intentDetector.detectIntent(userText);

        // 3. Update Memory
        await conversationMemory.addMessage(session.callId, userText, 'user', {
            channel: 'voice',
            sentiment: 'neutral', // We'll integrate emotional analysis later
        });

        // 4. Reasoning Engine Decision
        const decision = await reasoningEngine.decideAction({
            conversationId: session.callId,
            lastMessage: userText,
            intent,
            context: session.context,
        });

        let responseText = "";
        let action: VoiceResponse['action'] = 'listen';
        let transferTo: string | undefined;

        // 5. Execute Decision
        switch (decision.action) {
            case 'ESCALATE':
                responseText = "I understand this is urgent. I am transferring you to a human agent now. Please hold.";
                action = 'transfer';
                transferTo = '+260970000000'; // Support line

                // Create ticket
                const crm = CRMService.createClient({ provider: 'custom', apiUrl: 'http://localhost:3000/api/crm', apiKey: 'mock' });
                await crm.createTicket({
                    customerId: session.callerNumber, // Use phone as ID for now
                    subject: `Voice Call Escalation: ${intent.primaryIntent}`,
                    description: `User said: "${userText}". Escalated by AI Voice Agent.`,
                    priority: 'high',
                    status: 'open',
                    category: intent.primaryIntent,
                });
                break;

            case 'RESPOND':
            case 'REQUEST_INFO':
                // Generate response using LLM
                responseText = await geminiProvider.generateResponse([
                    { role: 'system', content: `You are a helpful voice assistant. Keep answers concise (under 2 sentences) as they are spoken. Current intent: ${intent.primaryIntent}.` },
                    ...session.transcript.map(t => ({ role: t.role as 'user' | 'model', content: t.content }))
                ]);
                break;

            case 'EXECUTE_ACTION':
                // Execute workflow (mocked here, would integrate with workflow-automation.ts)
                responseText = `I will process that ${intent.primaryIntent} for you. One moment... Done. Is there anything else?`;
                break;
        }

        // 6. Update Transcript with Response
        session.transcript.push({
            role: 'assistant',
            content: responseText,
            timestamp: new Date().toISOString(),
        });

        await conversationMemory.addMessage(session.callId, responseText, 'model', {
            channel: 'voice',
        });

        return {
            text: responseText,
            action,
            transferTo,
        };
    }

    /**
     * End call
     */
    async endCall(callId: string): Promise<void> {
        const session = this.activeCalls.get(callId);
        if (session) {
            session.status = 'completed';
            // Save full transcript to CRM/Database
            console.log(`Call ${callId} ended. Duration: ${Date.now() - new Date(session.startTime).getTime()}ms`);
            this.activeCalls.delete(callId);
        }
    }

    private detectLanguage(text: string): string | null {
        // Simple heuristic for demo
        const lower = text.toLowerCase();
        if (lower.includes('mulishani') || lower.includes('shani')) return 'bem';
        if (lower.includes('muli bwanji') || lower.includes('bwanji')) return 'nya';
        return 'en';
    }
}

export const voiceAgent = new VoiceAgent({
    provider: 'twilio',
    voiceId: 'alice',
    language: 'en-US',
    transcriptionModel: 'deepgram',
    recordingEnabled: true,
});
