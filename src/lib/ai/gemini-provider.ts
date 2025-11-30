// src/lib/ai/gemini-provider.ts
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model configurations
export const geminiFlash = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
    },
});

export const geminiPro = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
    },
});

/**
 * Generate AI response for customer service queries
 * Uses Gemini Flash for speed, Pro for complex queries
 */
export async function generateResponse(
    prompt: string,
    useProModel = false,
    conversationHistory: { role: string; parts: { text: string }[] }[] = []
): Promise<string> {
    try {
        const model = useProModel ? geminiPro : geminiFlash;

        // Start chat session with history
        const chat = model.startChat({
            history: conversationHistory,
        });

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate AI response');
    }
}

/**
 * Generate streaming response for real-time chat
 */
export async function* generateStreamingResponse(
    prompt: string,
    conversationHistory: { role: string; parts: { text: string }[] }[] = []
): AsyncGenerator<string, void, unknown> {
    try {
        const chat = geminiFlash.startChat({
            history: conversationHistory,
        });

        const result = await chat.sendMessageStream(prompt);

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            yield chunkText;
        }
    } catch (error) {
        console.error('Gemini streaming error:', error);
        throw new Error('Failed to generate streaming response');
    }
}

/**
 * Generate embeddings for knowledge base articles
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('Embedding generation error:', error);
        throw new Error('Failed to generate embedding');
    }
}

export default genAI;
