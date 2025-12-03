import { intentClassifier, IntentResult } from './intent-classifier';
import { entityExtractor, ExtractedEntities } from './entity-extractor';
import { IndustryType } from '@/types/database';

export interface NLPResult {
    intent: IntentResult;
    entities: ExtractedEntities;
    sentiment?: 'positive' | 'negative' | 'neutral';
    topics?: string[];
}

/**
 * Comprehensive NLP processor combining intent, entities, and sentiment
 */
export class NLPProcessor {
    /**
     * Process customer message with full NLP pipeline
     */
    async process(text: string, industry: IndustryType): Promise<NLPResult> {
        // Run intent classification and entity extraction in parallel
        const [intent, entities] = await Promise.all([
            intentClassifier.classify(text, industry),
            entityExtractor.extract(text)
        ]);

        // Basic sentiment analysis (can be enhanced with Gemini later)
        const sentiment = this.analyzeSentiment(text);

        return {
            intent,
            entities,
            sentiment
        };
    }

    /**
     * Simple sentiment analysis based on keywords
     */
    private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
        const lowerText = text.toLowerCase();

        const positiveWords = ['thank', 'thanks', 'great', 'good', 'excellent', 'happy', 'love', 'perfect', 'wonderful'];
        const negativeWords = ['bad', 'terrible', 'angry', 'frustrated', 'disappointed', 'worst', 'awful', 'hate', 'useless', 'problem', 'issue'];

        let positiveCount = 0;
        let negativeCount = 0;

        for (const word of positiveWords) {
            if (lowerText.includes(word)) positiveCount++;
        }

        for (const word of negativeWords) {
            if (lowerText.includes(word)) negativeCount++;
        }

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }
}

export const nlpProcessor = new NLPProcessor();
