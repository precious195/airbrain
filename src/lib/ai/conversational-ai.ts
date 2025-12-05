import { TicketService } from '../tickets/ticket-service';
import { CustomerMemoryService } from '../ai/customer-memory';
import { nlpProcessor } from '../ai/nlp-processor';
import { geminiProvider } from '../ai/gemini-provider';
import { knowledgeAggregator, KnowledgeContext } from '../ai/knowledge-aggregator';
import { IndustryType } from '@/types/database';

export interface HumanLikeResponse {
    message: string;
    shouldDelay?: boolean; // Simulate "typing" delay
    delayMs?: number;
    requiresFollowUp?: boolean;
    ticketId?: string;
}

/**
 * Generate human-like conversational responses with contextual awareness
 */
export class ConversationalAI {
    private companyId: string;
    private industry: IndustryType;
    private ticketService: TicketService;
    private customerMemory: CustomerMemoryService;

    constructor(companyId: string, industry: IndustryType) {
        this.companyId = companyId;
        this.industry = industry;
        this.ticketService = new TicketService(companyId);
        this.customerMemory = new CustomerMemoryService(companyId);
    }

    /**
     * Process message and generate human-like response
     */
    async processMessage(
        customerId: string,
        message: string,
        conversationHistory: any[]
    ): Promise<HumanLikeResponse> {
        // Run NLP analysis
        const nlp = await nlpProcessor.process(message, this.industry);

        // Check for ticket number in message
        const ticketNumber = this.extractTicketNumber(nlp.entities.accounts);

        // Handle different intents
        if (ticketNumber) {
            return await this.handleTicketQuery(ticketNumber, nlp.intent.primary, customerId);
        }

        if (nlp.intent.primary === 'ticket_follow_up') {
            return await this.handleFollowUpRequest(customerId);
        }

        // Use HumanLikeAgent for advanced system interaction and contextual responses
        try {
            const { createHumanLikeAgent } = await import('../agents/human-like-agent');
            const agent = createHumanLikeAgent(customerId, this.companyId);

            // Reconstruct history for the agent
            // In a real app, we'd sync this better, but for now we pass the history
            // The agent manages its own history in memory, but we should initialize it if needed

            const response = await agent.processRequest(message);

            return {
                message: response.message,
                shouldDelay: message.length > 10,
                delayMs: Math.min(message.length * 20, 3000),
                // If the agent performed an action, we might want to flag it
                requiresFollowUp: response.action === 'asking' || response.action === 'executing'
            };
        } catch (error) {
            console.error('Agent processing failed, falling back to basic response:', error);
            // Fallback to basic generation
            return await this.generateContextualResponse(customerId, message, nlp, conversationHistory);
        }
    }

    /**
     * Extract ticket number from entities
     */
    private extractTicketNumber(accounts: any[]): string | null {
        // Look for ticket pattern (XX-XXXXXX)
        const ticketPattern = /^[A-Z]{2}-\d{6,}$/;
        const ticket = accounts.find(acc => ticketPattern.test(acc.value));
        return ticket?.value || null;
    }

    /**
     * Handle ticket status query
     */
    private async handleTicketQuery(
        ticketNumber: string,
        intent: string,
        customerId: string
    ): Promise<HumanLikeResponse> {
        // Simulate "looking up" delay
        const acknowledgment = "Let me check your ticket, please hold on a moment...";

        const ticket = await this.ticketService.getTicketByNumber(ticketNumber);

        if (!ticket) {
            return {
                message: `I couldn't find ticket ${ticketNumber}. Could you please verify the ticket number and try again?`,
                shouldDelay: false
            };
        }

        // Get friendly status
        const status = await this.ticketService.getCustomerFriendlyStatus(ticket.id);

        // Check if follow-up is requested
        if (intent === 'ticket_follow_up') {
            await this.ticketService.sendBackOfficeFollowUp(
                ticket.id,
                ticket.customerName || customerId,
                'Customer requested status update'
            );

            return {
                message: `${acknowledgment}\n\n${status}\n\nI have contacted the technical team on your behalf. I'll notify you as soon as they respond.`,
                shouldDelay: true,
                delayMs: 2000,
                requiresFollowUp: true,
                ticketId: ticket.id
            };
        }

        return {
            message: `${acknowledgment}\n\n${status}\n\nWould you like me to follow up with the technical team?`,
            shouldDelay: true,
            delayMs: 2000,
            ticketId: ticket.id
        };
    }

    /**
     * Handle general follow-up request (no ticket number mentioned)
     */
    private async handleFollowUpRequest(customerId: string): Promise<HumanLikeResponse> {
        // Find customer's most recent open ticket
        // This would query Firebase for tickets by customerId
        return {
            message: "I'd be happy to help! Could you please provide your ticket number so I can check the status for you?",
            shouldDelay: false
        };
    }

    /**
     * Generate contextual AI response (Fallback)
     */
    private async generateContextualResponse(
        customerId: string,
        message: string,
        nlp: any,
        history: any[]
    ): Promise<HumanLikeResponse> {
        // Get customer context from memory
        const customerContext = await this.customerMemory.getPersonalizationContext(customerId);

        // Build comprehensive knowledge context
        const knowledgeContext = await knowledgeAggregator.buildContext(
            this.industry,
            this.companyId,
            message,
            customerId
        );

        // Build enhanced prompt with all knowledge
        const prompt = this.buildEnhancedPrompt(message, nlp, customerContext, history, knowledgeContext);

        // Generate response
        const response = await geminiProvider.generateResponse(prompt);

        return {
            message: response,
            shouldDelay: message.length > 10, // Add delay for longer messages
            delayMs: Math.min(message.length * 20, 3000) // Simulate reading time
        };
    }

    /**
     * Build enhanced prompt with knowledge context
     */
    private buildEnhancedPrompt(
        message: string,
        nlp: any,
        customerContext: string,
        history: any[],
        knowledge: KnowledgeContext
    ): string {
        // Format knowledge context
        const knowledgePrompt = knowledgeAggregator.formatContextForPrompt(knowledge, message);

        return `${knowledge.systemPrompt}

**CRITICAL INSTRUCTIONS - Follow these EXACTLY:**
1. BE HUMAN-LIKE: Use natural, conversational language
2. SHOW EMPATHY: Acknowledge customer concerns genuinely
3. BE PROACTIVE: Offer next steps and ask clarifying questions
4. USE KNOWLEDGE: Reference products, FAQs, and guides from the context below
5. SIMULATE DELAY AWARENESS: You can say things like "Let me check that for you"

**Customer Memory:**
${customerContext || 'First-time interaction with this customer.'}

**Detected Intent:** ${nlp.intent.primary} (${Math.round(nlp.intent.confidence * 100)}% confidence)
**Sentiment:** ${nlp.sentiment}
**Entities Found:** ${this.formatEntities(nlp.entities)}

**Conversation History:**
${this.formatHistory(history)}

${knowledgePrompt}

**Your Response Guidelines:**
- Start with acknowledgment (e.g., "I understand", "Let me help you with that")
- Use relevant product information from the knowledge context
- Apply troubleshooting steps when appropriate
- Reference FAQs when they match the query
- Keep responses concise but complete (2-4 sentences ideal)

Respond naturally and helpfully:`;
    }

    /**
     * Build prompt for human-like responses (legacy method)
     */
    private buildHumanLikePrompt(
        message: string,
        nlp: any,
        customerContext: string,
        history: any[]
    ): string {
        return `You are a professional, empathetic customer service AI agent for a ${this.industry} company.

**CRITICAL INSTRUCTIONS - Follow these EXACTLY:**
1. BE HUMAN-LIKE: Use natural, conversational language
2. SHOW EMPATHY: Acknowledge customer concerns genuinely
3. BE PROACTIVE: Offer next steps and ask clarifying questions
4. USE CONTEXT: Reference previous interactions when relevant
5. SIMULATE DELAY AWARENESS: You can say things like "Let me check that for you" or "One moment please"

**Customer Context:**
${customerContext || 'First-time interaction with this customer.'}

**Customer Message:**
"${message}"

**Detected Intent:** ${nlp.intent.primary} (${Math.round(nlp.intent.confidence * 100)}% confidence)
**Sentiment:** ${nlp.sentiment}
**Entities Found:** ${this.formatEntities(nlp.entities)}

**Conversation History:**
${this.formatHistory(history)}

**Your Response Guidelines:**
- Start with acknowledgment (e.g., "I understand", "Let me help you with that")
- Provide clear, actionable information
- If you need to perform an action (like creating a ticket), explain what you're doing
- End with a question or offer of further assistance
- Keep responses concise but complete (2-4 sentences ideal)
- Use ticket numbers when creating tickets (format: XX-XXXXXX)

Respond naturally and helpfully:`;
    }

    /**
     * Format entities for prompt
     */
    private formatEntities(entities: any): string {
        const found = [];
        if (entities.amounts?.length) found.push(`Amounts: ${entities.amounts.map((a: any) => a.raw).join(', ')}`);
        if (entities.phones?.length) found.push(`Phones: ${entities.phones.map((p: any) => p.raw).join(', ')}`);
        if (entities.accounts?.length) found.push(`Ticket/Account: ${entities.accounts.map((a: any) => a.raw).join(', ')}`);
        return found.length > 0 ? found.join(' | ') : 'None';
    }

    /**
     * Format conversation history
     */
    private formatHistory(history: any[]): string {
        if (history.length === 0) return 'No previous messages in this conversation.';

        return history.slice(-4).map(msg =>
            `${msg.role === 'user' ? 'Customer' : 'You'}: ${msg.parts[0].text}`
        ).join('\n');
    }
}
