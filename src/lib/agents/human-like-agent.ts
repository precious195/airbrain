/**
 * Human-Like Agent
 * 
 * Provides natural, human-like interaction patterns for the AI agent.
 * Handles context, memory, communication style, and decision-making.
 */

import { geminiProvider } from '../ai/gemini-provider';
import { UniversalAgent, AgentTask, AgentAction } from './universal-agent';
import { systemLearner, SystemKnowledge } from './system-learner';

export interface ConversationContext {
    userId: string;
    companyId: string;
    conversationHistory: { role: string; content: string }[];
    currentTask?: AgentTask;
    knownSystems: Map<string, SystemKnowledge>;
    userPreferences?: Record<string, any>;
}

export interface AgentResponse {
    message: string;
    action?: 'none' | 'executing' | 'asking' | 'completed' | 'failed';
    taskProgress?: {
        current: number;
        total: number;
        description: string;
    };
    data?: any;
    suggestedFollowUp?: string[];
}

export class HumanLikeAgent {
    private context: ConversationContext;
    private universalAgent: UniversalAgent;

    constructor(userId: string, companyId: string) {
        this.context = {
            userId,
            companyId,
            conversationHistory: [],
            knownSystems: new Map()
        };
        this.universalAgent = new UniversalAgent(companyId);
    }

    /**
     * Process a natural language request from the user
     */
    async processRequest(userMessage: string): Promise<AgentResponse> {
        // Add to conversation history
        this.context.conversationHistory.push({ role: 'user', content: userMessage });

        // Analyze user intent
        const intent = await this.analyzeIntent(userMessage);

        console.log(`🧠 Detected intent: ${intent.type} (${intent.confidence}% confidence)`);

        let response: AgentResponse;

        switch (intent.type) {
            case 'system_interaction':
                response = await this.handleSystemInteraction(userMessage, intent);
                break;

            case 'information_query':
                response = await this.handleInformationQuery(userMessage, intent);
                break;

            case 'task_execution':
                response = await this.handleTaskExecution(userMessage, intent);
                break;

            case 'clarification':
            case 'unknown':
            default:
                response = await this.handleGeneralConversation(userMessage);
        }

        // Add agent response to history
        this.context.conversationHistory.push({ role: 'assistant', content: response.message });

        return response;
    }

    /**
     * Analyze user intent using AI
     */
    private async analyzeIntent(message: string): Promise<{
        type: 'system_interaction' | 'information_query' | 'task_execution' | 'clarification' | 'unknown';
        confidence: number;
        entities: Record<string, string>;
        systemUrl?: string;
        action?: string;
    }> {
        const prompt = `Analyze this user message and determine their intent.

MESSAGE: "${message}"

CONVERSATION CONTEXT:
${this.context.conversationHistory.slice(-4).map(h => `${h.role}: ${h.content}`).join('\n')}

Determine:
1. Intent type:
   - system_interaction: User wants to interact with an external system (e.g., "check balance on mobile portal")
   - information_query: User wants information (e.g., "what's my ticket status")
   - task_execution: User wants a multi-step task done (e.g., "update customer address")
   - clarification: User is asking for clarification or confirming something
   - unknown: Cannot determine intent

2. Extract relevant entities:
   - systemUrl: URL or system name if mentioned
   - action: specific action requested
   - customerId, accountId, etc.

Return JSON:
{
  "type": "system_interaction",
  "confidence": 85,
  "entities": {"customerId": "12345"},
  "systemUrl": "https://billing.example.com",
  "action": "check_balance"
}

Return ONLY valid JSON.`;

        try {
            const response = await geminiProvider.generateResponse(prompt, true);
            const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(cleanedResponse);
        } catch (error) {
            return { type: 'unknown', confidence: 0, entities: {} };
        }
    }

    /**
     * Handle requests to interact with external systems
     */
    private async handleSystemInteraction(
        message: string,
        intent: any
    ): Promise<AgentResponse> {
        if (!intent.systemUrl) {
            return {
                message: "I'd be happy to help you interact with an external system. Could you please provide the system URL or tell me which system you'd like me to access?",
                action: 'asking',
                suggestedFollowUp: [
                    "Access the billing portal at https://...",
                    "Check the CRM system",
                    "Look up customer in the banking system"
                ]
            };
        }

        // Check if we know this system
        let systemKnowledge = this.context.knownSystems.get(intent.systemUrl);

        if (!systemKnowledge) {
            return {
                message: `I haven't connected to ${intent.systemUrl} before. Let me analyze the system first. This may take a moment...`,
                action: 'executing',
                taskProgress: {
                    current: 1,
                    total: 3,
                    description: 'Analyzing system structure'
                }
            };
        }

        try {
            const result = await this.universalAgent.executeTask(
                message,
                intent.systemUrl,
                intent.entities.credentials
            );

            return {
                message: this.formatTaskResult(result, intent.action),
                action: 'completed',
                data: result.data
            };
        } catch (error: any) {
            return {
                message: `I encountered an issue while trying to access the system: ${error.message}. Would you like me to try a different approach?`,
                action: 'failed',
                suggestedFollowUp: [
                    "Try again",
                    "Use a different method",
                    "Contact support"
                ]
            };
        }
    }

    /**
     * Handle information queries
     */
    private async handleInformationQuery(message: string, intent: any): Promise<AgentResponse> {
        const prompt = `You are a helpful customer service agent. Answer this query based on the context.

QUERY: ${message}
ENTITIES: ${JSON.stringify(intent.entities)}

Provide a helpful, human-like response. If you need more information to answer properly, politely ask for it.`;

        const response = await geminiProvider.generateResponse(prompt);

        return {
            message: response,
            action: 'none'
        };
    }

    /**
     * Handle multi-step task execution
     */
    private async handleTaskExecution(message: string, intent: any): Promise<AgentResponse> {
        // First, confirm the task with the user
        if (!this.context.currentTask) {
            return {
                message: `I understand you want me to: ${intent.action || message}. 

Before I proceed, let me confirm:
${intent.entities ? '• I have the following information: ' + JSON.stringify(intent.entities) : '• I may need some additional information.'}

Should I go ahead with this task?`,
                action: 'asking',
                suggestedFollowUp: [
                    "Yes, please proceed",
                    "No, let me clarify",
                    "I need to add more details"
                ]
            };
        }

        // Execute the confirmed task
        try {
            const result = await this.universalAgent.executeTask(
                message,
                intent.systemUrl || '',
                intent.entities.credentials
            );

            return {
                message: `I've completed the task successfully!\n\n${this.formatTaskResult(result, intent.action)}`,
                action: 'completed',
                data: result.data
            };
        } catch (error: any) {
            return {
                message: `I ran into a problem: ${error.message}\n\nWould you like me to try a different approach or escalate this to a human agent?`,
                action: 'failed'
            };
        }
    }

    /**
     * Handle general conversation
     */
    private async handleGeneralConversation(message: string): Promise<AgentResponse> {
        const prompt = `You are a friendly, professional customer service AI assistant. You can:
- Interact with external systems (APIs, web portals, databases)
- Look up customer information
- Execute tasks on behalf of users
- Answer questions about services

CURRENT CONVERSATION:
${this.context.conversationHistory.slice(-6).map(h => `${h.role}: ${h.content}`).join('\n')}

USER: ${message}

Respond naturally and helpfully. If the user seems to want to interact with a system, offer to help.`;

        const response = await geminiProvider.generateResponse(prompt);

        return {
            message: response,
            action: 'none'
        };
    }

    /**
     * Format task result for human-readable output
     */
    private formatTaskResult(result: any, action?: string): string {
        if (!result.data || Object.keys(result.data).length === 0) {
            return "The task was completed, but no data was retrieved.";
        }

        let formatted = "Here's what I found:\n\n";

        for (const [key, value] of Object.entries(result.data)) {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            formatted += `• **${formattedKey}**: ${value}\n`;
        }

        return formatted;
    }

    /**
     * Learn a new system
     */
    async learnSystem(url: string): Promise<SystemKnowledge> {
        const playwright = require('playwright');
        const browser = await playwright.chromium.launch({ headless: true });
        const page = await browser.newPage();

        try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            const knowledge = await systemLearner.analyzePage(page);
            this.context.knownSystems.set(url, knowledge);
            return knowledge;
        } finally {
            await browser.close();
        }
    }

    /**
     * Get the current conversation context
     */
    getContext(): ConversationContext {
        return { ...this.context };
    }

    /**
     * Clear conversation history
     */
    clearHistory(): void {
        this.context.conversationHistory = [];
        this.context.currentTask = undefined;
    }
}

/**
 * Factory function to create a human-like agent
 */
export function createHumanLikeAgent(userId: string, companyId: string): HumanLikeAgent {
    return new HumanLikeAgent(userId, companyId);
}
