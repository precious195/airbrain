import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface Entity {
    type: 'amount' | 'date' | 'phone' | 'account' | 'product' | 'location' | 'email';
    value: string;
    raw: string;
    confidence?: number;
}

export interface ExtractedEntities {
    amounts: Entity[];
    dates: Entity[];
    phones: Entity[];
    accounts: Entity[];
    products: Entity[];
    locations: Entity[];
    emails: Entity[];
}

/**
 * Advanced entity extraction using Gemini AI and regex patterns
 */
export class EntityExtractor {
    private model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    /**
     * Extract entities from text using regex patterns
     */
    private extractWithRegex(text: string): ExtractedEntities {
        const entities: ExtractedEntities = {
            amounts: [],
            dates: [],
            phones: [],
            accounts: [],
            products: [],
            locations: [],
            emails: []
        };

        // Extract ticket numbers (MT-827193, BK-123456, etc.)
        const ticketRegex = /[A-Z]{2}-\d{6,}/g;
        let match;
        while ((match = ticketRegex.exec(text)) !== null) {
            entities.accounts.push({
                type: 'account',
                value: match[0],
                raw: match[0],
                confidence: 0.95
            });
        }

        // Extract amounts (K500, $100, 500 ZMW, etc.)
        const amountRegex = /(?:K|ZMW|\$|USD)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:K|ZMW|\$|USD)?/gi;
        while ((match = amountRegex.exec(text)) !== null) {
            entities.amounts.push({
                type: 'amount',
                value: match[1].replace(/,/g, ''),
                raw: match[0],
                confidence: 0.9
            });
        }

        // Extract phone numbers (+260 XXX XXX XXX, 0XXX XXX XXX)
        const phoneRegex = /(?:\+260|0)\s*\d{2,3}\s*\d{3}\s*\d{3,4}/g;
        while ((match = phoneRegex.exec(text)) !== null) {
            entities.phones.push({
                type: 'phone',
                value: match[0].replace(/\s/g, ''),
                raw: match[0],
                confidence: 0.95
            });
        }

        // Extract emails
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        while ((match = emailRegex.exec(text)) !== null) {
            entities.emails.push({
                type: 'email',
                value: match[0],
                raw: match[0],
                confidence: 0.95
            });
        }

        // Extract account numbers (8-12 digit sequences, excluding ticket numbers)
        const accountRegex = /\b\d{8,12}\b/g;
        while ((match = accountRegex.exec(text)) !== null) {
            // Avoid duplicating phone numbers and ticket numbers
            if (!entities.phones.some(p => p.value.includes(match![0]))) {
                entities.accounts.push({
                    type: 'account',
                    value: match[0],
                    raw: match[0],
                    confidence: 0.7
                });
            }
        }

        return entities;
    }

    /**
     * Extract entities using Gemini AI for complex cases
     */
    private async extractWithAI(text: string): Promise<Partial<ExtractedEntities>> {
        try {
            const prompt = `Extract structured information from this customer message. Return a JSON object with these fields:
- products: array of product/bundle names mentioned
- dates: array of dates/times mentioned (normalize to ISO format if possible)
- locations: array of locations mentioned

Message: "${text}"

Return only valid JSON, no explanation.`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const extracted = JSON.parse(jsonMatch[0]);

                return {
                    products: (extracted.products || []).map((p: string) => ({
                        type: 'product' as const,
                        value: p,
                        raw: p,
                        confidence: 0.8
                    })),
                    dates: (extracted.dates || []).map((d: string) => ({
                        type: 'date' as const,
                        value: d,
                        raw: d,
                        confidence: 0.75
                    })),
                    locations: (extracted.locations || []).map((l: string) => ({
                        type: 'location' as const,
                        value: l,
                        raw: l,
                        confidence: 0.8
                    }))
                };
            }
        } catch (error) {
            console.error('AI entity extraction failed:', error);
        }

        return { products: [], dates: [], locations: [] };
    }

    /**
     * Extract all entities from text
     */
    async extract(text: string): Promise<ExtractedEntities> {
        // Start with regex-based extraction
        const regexEntities = this.extractWithRegex(text);

        // Enhance with AI extraction for complex entities
        const aiEntities = await this.extractWithAI(text);

        return {
            amounts: regexEntities.amounts,
            dates: [...regexEntities.dates, ...(aiEntities.dates || [])],
            phones: regexEntities.phones,
            accounts: regexEntities.accounts,
            products: aiEntities.products || [],
            locations: aiEntities.locations || [],
            emails: regexEntities.emails
        };
    }
}

export const entityExtractor = new EntityExtractor();
