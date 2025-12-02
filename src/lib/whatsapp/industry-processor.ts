// Industry Message Processor
import { ref, get, set, push, update } from 'firebase/database';
import { database } from '../firebase/client';
import type { IndustryType, WhatsAppIndustryConfig } from '@/types/database';
import { getKnowledgeBase, findSolution, shouldEscalateIssue } from '../knowledge-bases';
import { intentDetector } from '../ai/intent-detector';
import { geminiProvider } from '../ai/gemini-provider';
import { externalSystemService } from '../integrations/external-system-service';

export interface ProcessMessageParams {
    industry: IndustryType;
    companyId: string;
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
    const { industry, companyId, customerPhone, customerName, messageText, messageId, config } = params;

    try {
        // 1. Get or create conversation (scoped by company)
        const conversationId = await getOrCreateConversation(companyId, industry, customerPhone, customerName);

        // 2. Save customer message
        await saveMessage(companyId, conversationId, {
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
            const ticketId = await createEscalationTicket(companyId, industry, conversationId, customerPhone, messageText);

            return {
                shouldRespond: true,
                text: `I want to make sure you get the best help. I've connected you with a specialist who will assist you shortly.\n\nReference: ${ticketId}`,
                escalate: true,
                ticketId,
                conversationId
            };
        }

        // 6. Get knowledge base (static fallback)
        const knowledgeBase = getKnowledgeBase(industry);

        // 7. Check for direct solution in knowledge base
        const solution = findSolution(industry, intent.intent);
        if (solution) {
            const shouldEscalate = shouldEscalateIssue(industry, intent.intent);

            let responseText = solution;
            if (shouldEscalate) {
                const ticketId = await createEscalationTicket(companyId, industry, conversationId, customerPhone, messageText);
                responseText += `\n\n📋 Support ticket created: ${ticketId}`;
            }

            // Save AI response
            await saveMessage(companyId, conversationId, {
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
        const conversationHistory = await getConversationHistory(companyId, conversationId);
        const aiResponse = await generateIndustryResponse(
            industry,
            companyId,
            messageText,
            intent,
            knowledgeBase,
            conversationHistory,
            customerPhone
        );

        // Save AI response
        await saveMessage(companyId, conversationId, {
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
    companyId: string,
    industry: IndustryType,
    customerPhone: string,
    customerName?: string
): Promise<string> {
    // Check for existing active conversation
    const conversationsRef = ref(database, `companies/${companyId}/conversations`);
    const snapshot = await get(conversationsRef);

    if (snapshot.exists()) {
        const conversations = snapshot.val();
        for (const [id, conv] of Object.entries<any>(conversations)) {
            if (conv.customerPhone === customerPhone &&
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
        companyId,
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

async function saveMessage(companyId: string, conversationId: string, message: any): Promise<void> {
    const messageRef = push(ref(database, `companies/${companyId}/conversations/${conversationId}/messages`));
    await set(messageRef, message);

    // Update conversation timestamp
    await update(ref(database, `companies/${companyId}/conversations/${conversationId}`), {
        updatedAt: Date.now()
    });
}

async function getConversationHistory(companyId: string, conversationId: string): Promise<any[]> {
    const messagesRef = ref(database, `companies/${companyId}/conversations/${conversationId}/messages`);
    const snapshot = await get(messagesRef);

    if (!snapshot.exists()) {
        return [];
    }

    const messages = snapshot.val();
    return Object.values(messages).slice(-10); // Last 10 messages
}

async function generateIndustryResponse(
    industry: IndustryType,
    companyId: string,
    messageText: string,
    intent: any,
    staticKnowledge: any,
    history: any[],
    customerPhone?: string
): Promise<string> {
    // Fetch dynamic knowledge from Firebase
    const dynamicKnowledge = await getDynamicKnowledge(companyId);

    // Merge static and dynamic knowledge
    const knowledgeContext = {
        ...staticKnowledge,
        faqs: dynamicKnowledge.faqs || [],
        products: dynamicKnowledge.products || [],
        procedures: dynamicKnowledge.procedures || []
    };

    // Attempt to fetch external system data if integration is enabled
    let externalData: any = null;
    try {
        const systemIntegrationSnapshot = await get(ref(database, `companies/${companyId}/systemIntegration`));
        if (systemIntegrationSnapshot.exists()) {
            const systemIntegration = systemIntegrationSnapshot.val();

            if (systemIntegration.enabled && customerPhone) {
                const integrationType = systemIntegration.integrationType || 'api';

                // Try API integration first (if available)
                if (integrationType === 'api' || integrationType === 'hybrid') {
                    try {
                        if (intent.intent.includes('balance') && systemIntegration.rules.canViewBalance) {
                            externalData = {
                                type: 'balance',
                                source: 'api',
                                data: await externalSystemService.queryBalance(systemIntegration, customerPhone)
                            };
                        } else if (intent.intent.includes('transaction') && systemIntegration.rules.canViewTransactions) {
                            externalData = {
                                type: 'transactions',
                                source: 'api',
                                data: await externalSystemService.queryTransactions(systemIntegration, customerPhone, 5)
                            };
                        } else if (systemIntegration.rules.canViewCustomerInfo) {
                            externalData = {
                                type: 'customer_info',
                                source: 'api',
                                data: await externalSystemService.queryCustomerData(systemIntegration, customerPhone)
                            };
                        }
                    } catch (apiError) {
                        console.error('API integration failed:', apiError);
                        // If hybrid mode, fall back to browser automation
                        if (integrationType !== 'hybrid') {
                            throw apiError;
                        }
                    }
                }

                // Use browser automation if API failed (hybrid) or if browser-only mode
                if (!externalData && (integrationType === 'browser' || integrationType === 'hybrid')) {
                    try {
                        const { createAutomationWorker } = await import('../integrations/automation-worker');
                        const worker = await createAutomationWorker(companyId, systemIntegration);

                        if (intent.intent.includes('balance') && systemIntegration.rules.canViewBalance) {
                            const result = await worker.executeAction('checkBalance', { customerPhone });
                            externalData = {
                                type: 'balance',
                                source: 'browser',
                                data: result
                            };
                        } else if (intent.intent.includes('transaction') && systemIntegration.rules.canViewTransactions) {
                            const result = await worker.executeAction('viewTransactions', { customerPhone });
                            externalData = {
                                type: 'transactions',
                                source: 'browser',
                                data: result
                            };
                        } else if (systemIntegration.rules.canViewCustomerInfo) {
                            const result = await worker.executeAction('viewCustomerInfo', { customerPhone });
                            externalData = {
                                type: 'customer_info',
                                source: 'browser',
                                data: result
                            };
                        }

                        console.log(`Browser automation successful for ${companyId}`);
                    } catch (browserError) {
                        console.error('Browser automation failed:', browserError);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error loading system integration config:', error);
    }

    const systemPrompt = `You are a helpful customer service AI for a ${industry} company. 
Use the following knowledge base to answer questions accurately and professionally.

Knowledge Base:
${JSON.stringify(knowledgeContext, null, 2)}

${externalData ? `\nReal-time Customer Data from Company System:
${JSON.stringify(externalData, null, 2)}\n
IMPORTANT: Use this real-time data to provide accurate, up-to-date responses to the customer.` : ''}

Guidelines:
- Be concise and helpful
- Use emojis sparingly for clarity
- Provide specific instructions when available
- If you don't know, admit it and offer to escalate
- Always be polite and professional
${externalData ? '- Prioritize the real-time data from the company system over general knowledge' : ''}

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

async function getDynamicKnowledge(industry: IndustryType) {
    try {
        const knowledgeRef = ref(database, `industries/${industry}/knowledge`);
        const snapshot = await get(knowledgeRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            return {
                faqs: data.faqs ? Object.values(data.faqs) : [],
                products: data.products ? Object.values(data.products) : [],
                procedures: data.procedures ? Object.values(data.procedures) : []
            };
        }
        return { faqs: [], products: [], procedures: [] };
    } catch (error) {
        console.error('Error fetching dynamic knowledge:', error);
        return { faqs: [], products: [], procedures: [] };
    }
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

export async function getCompanyByPhone(phoneNumberId: string): Promise<{ companyId: string, industry: IndustryType } | null> {
    const mappingRef = ref(database, `phoneMapping/${phoneNumberId}`);
    const snapshot = await get(mappingRef);

    if (snapshot.exists()) {
        return snapshot.val();
    }

    return null;
}

export async function getCompanyWhatsAppConfig(companyId: string): Promise<WhatsAppIndustryConfig | null> {
    const configRef = ref(database, `companies/${companyId}/whatsappConfig`);
    const snapshot = await get(configRef);

    if (snapshot.exists()) {
        return snapshot.val() as WhatsAppIndustryConfig;
    }

    return null;
}
