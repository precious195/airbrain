// src/lib/ai/gemini-provider.ts
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export class GeminiProvider {
    private genAI: GoogleGenerativeAI;
    private flashModel: GenerativeModel;
    private proModel: GenerativeModel;

    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set in environment variables');
        }
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.flashModel = this.genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2048,
            },
        });
        this.proModel = this.genAI.getGenerativeModel({
            model: 'gemini-1.5-pro',
            generationConfig: {
                temperature: 0.8,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
            },
        });
    }

    async generateResponse(
        prompt: string | Array<{ role: string; content: string }>,
        useProModel = false
    ): Promise<string> {
        try {
            const model = useProModel ? this.proModel : this.flashModel;

            let result;
            if (typeof prompt === 'string') {
                result = await model.generateContent(prompt);
            } else {
                // Handle chat history format
                const history = prompt.slice(0, -1).map(p => ({
                    role: p.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: p.content }]
                }));
                const lastMsg = prompt[prompt.length - 1].content;

                const chat = model.startChat({ history });
                const chatResult = await chat.sendMessage(lastMsg);
                result = chatResult.response;
                return result.text();
            }

            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini API error:', error);
            throw new Error('Failed to generate AI response');
        }
    }

    async generateEmbedding(text: string): Promise<number[]> {
        try {
            const embeddingModel = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
            const result = await embeddingModel.embedContent(text);
            return result.embedding.values;
        } catch (error) {
            console.error('Embedding generation error:', error);
            throw new Error('Failed to generate embedding');
        }
    }
}

export const geminiProvider = new GeminiProvider();
export const geminiFlash = geminiProvider['flashModel']; // Backwards compatibility if needed
export const geminiPro = geminiProvider['proModel']; // Backwards compatibility if needed

// Standalone exports for backward compatibility
export async function generateResponse(
    prompt: string | Array<{ role: string; content: string }>,
    useProModel = false
): Promise<string> {
    return geminiProvider.generateResponse(prompt, useProModel);
}

export async function* generateStreamingResponse(
    prompt: string,
    conversationHistory: { role: string; parts: { text: string }[] }[] = []
): AsyncGenerator<string, void, unknown> {
    // Note: Streaming not yet implemented in class, using direct model access for now if needed or implementing in class
    // For now, let's implement it in the class or just recreate the logic here if the class doesn't have it yet.
    // The previous class implementation didn't have generateStreamingResponse. Let's add it to the class first or just put the logic here.
    // Actually, I should add it to the class.

    // But for quick fix, let's just use the provider's model.
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

export async function generateEmbedding(text: string): Promise<number[]> {
    return geminiProvider.generateEmbedding(text);
}
