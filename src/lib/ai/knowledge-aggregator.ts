/**
 * Knowledge Aggregator
 * 
 * Combines all knowledge sources into a unified context for AI responses.
 * Pulls from industry knowledge, detected products, knowledge base, and customer history.
 */

import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase/client';
import {
    getIndustryKnowledge,
    getSystemPromptContext,
    findRelevantFAQs,
    findRelevantActions,
    findTroubleshootingGuides,
    IndustryType,
    IndustryKnowledge,
    FAQ,
    IndustryAction,
    TroubleshootingGuide
} from './industry-knowledge';

export interface KnowledgeContext {
    industry: IndustryType;
    companyId: string;
    systemPrompt: string;
    industryKnowledge: IndustryKnowledge;
    companyProducts: ProductInfo[];
    relevantFAQs: FAQ[];
    relevantActions: IndustryAction[];
    troubleshootingGuides: TroubleshootingGuide[];
    customerContext?: CustomerContext;
    knowledgeArticles: KnowledgeArticle[];
}

export interface ProductInfo {
    id: string;
    name: string;
    type: string;
    category: string;
    price?: number;
    currency?: string;
    duration?: string;
    features: string[];
    description?: string;
}

export interface CustomerContext {
    customerId: string;
    name?: string;
    previousInteractions: number;
    lastIntent?: string;
    accountInfo?: Record<string, any>;
}

export interface KnowledgeArticle {
    id: string;
    title: string;
    content: string;
    tags: string[];
}

class KnowledgeAggregator {
    /**
     * Build complete knowledge context for an AI response
     */
    async buildContext(
        industry: IndustryType,
        companyId: string,
        query: string,
        customerId?: string
    ): Promise<KnowledgeContext> {
        console.log(`📚 Building knowledge context for ${industry}...`);

        // Get industry knowledge
        const industryKnowledge = getIndustryKnowledge(industry);
        const systemPrompt = this.buildEnhancedSystemPrompt(industry, companyId);

        // Find relevant FAQs and actions based on query
        const relevantFAQs = findRelevantFAQs(industry, query);
        const relevantActions = findRelevantActions(industry, query);
        const troubleshootingGuides = findTroubleshootingGuides(industry, query);

        // Get company products (detected from external systems)
        const companyProducts = await this.getCompanyProducts(companyId);

        // Get knowledge articles
        const knowledgeArticles = await this.getKnowledgeArticles(companyId, industry, query);

        // Get customer context if available
        let customerContext: CustomerContext | undefined;
        if (customerId) {
            customerContext = await this.getCustomerContext(companyId, customerId);
        }

        return {
            industry,
            companyId,
            systemPrompt,
            industryKnowledge,
            companyProducts,
            relevantFAQs,
            relevantActions,
            troubleshootingGuides,
            customerContext,
            knowledgeArticles
        };
    }

    /**
     * Build enhanced system prompt with all context
     */
    buildEnhancedSystemPrompt(industry: IndustryType, companyId: string): string {
        const basePrompt = getSystemPromptContext(industry);
        const industryKnowledge = getIndustryKnowledge(industry);

        return `${basePrompt}

## Company Knowledge Context
You have access to the company's products, services, and knowledge base. Use this information to provide accurate, helpful responses.

## Common Terms (${industry}):
${Object.entries(industryKnowledge.commonTerms).slice(0, 5).map(([term, def]) => `- ${term}: ${def}`).join('\n')}

## Response Guidelines:
1. Always be helpful and professional
2. Use the customer's name if available
3. Provide step-by-step instructions when needed
4. Suggest relevant products or services when appropriate
5. Escalate to human agent if unable to resolve
6. Never share sensitive account information without verification

## Available Actions:
${industryKnowledge.commonActions.slice(0, 3).map(a => `- ${a.name}: ${a.description}`).join('\n')}`;
    }

    /**
     * Get detected products for a company
     */
    private async getCompanyProducts(companyId: string): Promise<ProductInfo[]> {
        try {
            const snapshot = await get(ref(database, `companies/${companyId}/detectedProducts`));
            if (!snapshot.exists()) return [];

            const products: ProductInfo[] = [];
            snapshot.forEach((child) => {
                const product = child.val();
                if (product.status !== 'rejected') {
                    products.push({
                        id: child.key || product.id,
                        name: product.name,
                        type: product.type,
                        category: product.category,
                        price: product.price,
                        currency: product.currency,
                        duration: product.duration,
                        features: product.features || [],
                        description: product.description
                    });
                }
            });

            return products;
        } catch (error) {
            console.error('Failed to get company products:', error);
            return [];
        }
    }

    /**
     * Get knowledge articles relevant to query
     */
    private async getKnowledgeArticles(
        companyId: string,
        industry: IndustryType,
        query: string
    ): Promise<KnowledgeArticle[]> {
        try {
            const snapshot = await get(ref(database, `knowledge/${industry}`));
            if (!snapshot.exists()) return [];

            const articles: KnowledgeArticle[] = [];
            const queryLower = query.toLowerCase();

            snapshot.forEach((child) => {
                const article = child.val();
                // Simple relevance check - check if query words appear in title/tags
                const isRelevant = article.tags?.some((tag: string) =>
                    queryLower.includes(tag.toLowerCase())
                ) || queryLower.split(' ').some(word =>
                    article.title?.toLowerCase().includes(word)
                );

                if (isRelevant && article.published !== false) {
                    articles.push({
                        id: child.key || article.id,
                        title: article.title,
                        content: article.content?.substring(0, 500) || '',
                        tags: article.tags || []
                    });
                }
            });

            return articles.slice(0, 5); // Limit to 5 most relevant
        } catch (error) {
            console.error('Failed to get knowledge articles:', error);
            return [];
        }
    }

    /**
     * Get customer context for personalization
     */
    private async getCustomerContext(
        companyId: string,
        customerId: string
    ): Promise<CustomerContext | undefined> {
        try {
            const customerSnapshot = await get(ref(database, `customers/${customerId}`));
            if (!customerSnapshot.exists()) return undefined;

            const customer = customerSnapshot.val();

            // Get conversation count
            const convoSnapshot = await get(ref(database, `conversations`));
            let previousInteractions = 0;
            let lastIntent: string | undefined;

            if (convoSnapshot.exists()) {
                convoSnapshot.forEach((child) => {
                    const convo = child.val();
                    if (convo.customerId === customerId) {
                        previousInteractions++;
                        if (convo.context?.intent) {
                            lastIntent = convo.context.intent;
                        }
                    }
                });
            }

            return {
                customerId,
                name: customer.name,
                previousInteractions,
                lastIntent,
                accountInfo: customer.metadata
            };
        } catch (error) {
            console.error('Failed to get customer context:', error);
            return undefined;
        }
    }

    /**
     * Format context for AI prompt
     */
    formatContextForPrompt(context: KnowledgeContext, customerMessage: string): string {
        let prompt = '';

        // Add customer context if available
        if (context.customerContext) {
            prompt += `\n## Customer Context:
- Name: ${context.customerContext.name || 'Unknown'}
- Previous Interactions: ${context.customerContext.previousInteractions}
${context.customerContext.lastIntent ? `- Last Intent: ${context.customerContext.lastIntent}` : ''}
`;
        }

        // Add relevant products
        if (context.companyProducts.length > 0) {
            prompt += `\n## Available Products/Services:
${context.companyProducts.slice(0, 5).map(p =>
                `- ${p.name} (${p.category})${p.price ? ` - ${p.currency || ''} ${p.price}` : ''}${p.duration ? ` / ${p.duration}` : ''}`
            ).join('\n')}
`;
        }

        // Add relevant FAQs
        if (context.relevantFAQs.length > 0) {
            prompt += `\n## Relevant FAQs:
${context.relevantFAQs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}
`;
        }

        // Add troubleshooting if issue detected
        if (context.troubleshootingGuides.length > 0) {
            prompt += `\n## Troubleshooting Guide:
${context.troubleshootingGuides[0].issue}:
${context.troubleshootingGuides[0].solutions.map((s, i) => `${i + 1}. ${s}`).join('\n')}
`;
        }

        // Add relevant actions
        if (context.relevantActions.length > 0) {
            prompt += `\n## Suggested Actions:
${context.relevantActions.map(a => `- ${a.name}: ${a.steps.join(' → ')}`).join('\n')}
`;
        }

        // Add knowledge articles
        if (context.knowledgeArticles.length > 0) {
            prompt += `\n## Knowledge Base:
${context.knowledgeArticles.map(a => `### ${a.title}\n${a.content.substring(0, 200)}...`).join('\n\n')}
`;
        }

        prompt += `\n## Customer Message:
${customerMessage}

Respond helpfully based on the above context.`;

        return prompt;
    }
}

// Singleton instance
export const knowledgeAggregator = new KnowledgeAggregator();
