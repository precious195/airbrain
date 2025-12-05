// src/lib/ai/gemini-provider.ts
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export class GeminiProvider {
    private genAI: GoogleGenerativeAI;
    private flashModel: GenerativeModel;
    private proModel: GenerativeModel;

    constructor() {
        // Hardcoded API key as requested
        const apiKey = 'AIzaSyB971YbsbiHG4_RMynyEeB76xXoc7bkWfY';
        this.genAI = new GoogleGenerativeAI(apiKey);

        // Gemini 2.0 Flash Experimental (Available on this key)
        this.flashModel = this.genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 4096,
            },
        });

        // Gemini 3 Pro Preview - Most intelligent model for complex agentic tasks
        this.proModel = this.genAI.getGenerativeModel({
            model: 'gemini-3-pro-preview',
            generationConfig: {
                temperature: 0.8,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 16384, // Increased for complex reasoning
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
    useProModel = false,
    conversationHistory: { role: string; parts: { text: string }[] }[] = []
): Promise<string> {
    if (typeof prompt === 'string' && conversationHistory.length > 0) {
        const convertedHistory = conversationHistory.map(msg => ({
            role: msg.role === 'model' ? 'assistant' : 'user',
            content: msg.parts[0].text
        }));

        const fullPrompt = [
            ...convertedHistory,
            { role: 'user', content: prompt }
        ];

        return geminiProvider.generateResponse(fullPrompt, useProModel);
    }

    return geminiProvider.generateResponse(prompt, useProModel);
}

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

export async function generateEmbedding(text: string): Promise<number[]> {
    return geminiProvider.generateEmbedding(text);
}
