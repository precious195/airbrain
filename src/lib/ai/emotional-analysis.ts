// src/lib/ai/emotional-analysis.ts

import { geminiProvider } from './gemini-provider';

/**
 * Emotional Analysis Engine
 * Identifies angry/frustrated customers and triggers escalation.
 */

export interface SentimentResult {
    score: number; // -1.0 (Negative) to 1.0 (Positive)
    label: 'positive' | 'neutral' | 'negative' | 'very_negative';
    emotions: EmotionScore[];
    escalationRequired: boolean;
    reason?: string;
}

export interface EmotionScore {
    emotion: 'anger' | 'frustration' | 'joy' | 'sadness' | 'fear' | 'surprise' | 'neutral';
    intensity: number; // 0.0 to 1.0
}

export class EmotionalAnalysisEngine {

    /**
     * Analyze text for sentiment and emotions
     */
    async analyzeSentiment(text: string, context?: string): Promise<SentimentResult> {
        // In a real production system, we might use a specialized smaller model (BERT/RoBERTa) for speed.
        // Here we use Gemini for its reasoning capabilities.

        const prompt = `
      Analyze the sentiment and emotions of the following customer message.
      Context: ${context || 'Customer service interaction'}
      Message: "${text}"
      
      Return a JSON object with:
      - score: number (-1.0 to 1.0)
      - emotions: array of objects { emotion: string, intensity: number 0-1 }
      - escalation_required: boolean (true if anger/frustration > 0.7 or score < -0.6)
      - reason: string (brief explanation)
      
      Supported emotions: anger, frustration, joy, sadness, fear, surprise, neutral.
    `;

        try {
            const response = await geminiProvider.generateResponse([
                { role: 'user', content: prompt }
            ]);

            // Clean up response to ensure valid JSON
            const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(jsonStr);

            // Map to our interface
            const sentimentResult: SentimentResult = {
                score: result.score,
                label: this.getLabelFromScore(result.score),
                emotions: result.emotions,
                escalationRequired: result.escalation_required,
                reason: result.reason,
            };

            return sentimentResult;

        } catch (error) {
            console.error('Emotional analysis failed:', error);
            // Fallback
            return {
                score: 0,
                label: 'neutral',
                emotions: [{ emotion: 'neutral', intensity: 1.0 }],
                escalationRequired: false,
                reason: 'Analysis failed',
            };
        }
    }

    /**
     * Check if a conversation should be escalated based on history
     */
    async shouldEscalate(messages: string[]): Promise<boolean> {
        // Analyze the trend of the last 3 messages
        const recentMessages = messages.slice(-3);
        let negativeCount = 0;

        for (const msg of recentMessages) {
            const analysis = await this.analyzeSentiment(msg);
            if (analysis.score < -0.5 || analysis.emotions.some(e => (e.emotion === 'anger' || e.emotion === 'frustration') && e.intensity > 0.6)) {
                negativeCount++;
            }
        }

        return negativeCount >= 2; // Escalate if 2 out of last 3 are negative
    }

    private getLabelFromScore(score: number): SentimentResult['label'] {
        if (score >= 0.3) return 'positive';
        if (score <= -0.6) return 'very_negative';
        if (score < 0) return 'negative';
        return 'neutral';
    }
}

export const emotionalAnalysis = new EmotionalAnalysisEngine();
