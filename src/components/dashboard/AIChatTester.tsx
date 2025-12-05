'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, RefreshCw } from 'lucide-react';
import { useIndustry } from '@/components/portals/PortalLayout';

interface Message {
    role: 'user' | 'ai';
    content: string;
    timestamp: number;
}

export default function AIChatTester() {
    const industry = useIndustry();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [conversationId, setConversationId] = useState('');

    useEffect(() => {
        // Generate a random conversation ID for this session
        setConversationId(`test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

        // Add initial greeting
        setMessages([{
            role: 'ai',
            content: `Hello! I'm your AI assistant for ${industry.name}. How can I help you test today?`,
            timestamp: Date.now()
        }]);
    }, [industry.name]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: Date.now() }]);
        setLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId,
                    customerId: 'test_user',
                    message: userMessage,
                    industry: industry.id
                })
            });

            if (!response.ok) throw new Error('Failed to send message');

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader available');

            // Add placeholder AI message
            setMessages(prev => [...prev, { role: 'ai', content: '', timestamp: Date.now() }]);

            const decoder = new TextDecoder();
            let aiResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.content) {
                                aiResponse += data.content;
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    const lastMessage = newMessages[newMessages.length - 1];
                                    if (lastMessage.role === 'ai') {
                                        lastMessage.content = aiResponse;
                                    }
                                    return newMessages;
                                });
                            }
                        } catch (e) {
                            console.error('Error parsing chunk:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'ai',
                content: 'Sorry, I encountered an error processing your request.',
                timestamp: Date.now()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setMessages([{
            role: 'ai',
            content: `Hello! I'm your AI assistant for ${industry.name}. How can I help you test today?`,
            timestamp: Date.now()
        }]);
        setConversationId(`test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                <div className="flex items-center gap-2">
                    <Bot className={`w-5 h-5 ${industry.color}`} />
                    <h3 className="font-semibold text-gray-900">AI Agent Simulator</h3>
                </div>
                <button
                    onClick={handleReset}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition"
                    title="Reset Conversation"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : `bg-gray-100 ${industry.color}`
                                }`}>
                                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                            </div>
                            <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                }`}>
                                {msg.content || <span className="animate-pulse">...</span>}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message to test..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className={`px-4 py-2 rounded-lg text-white transition flex items-center gap-2 ${!input.trim() || loading ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
                <div className="text-xs text-gray-400 mt-2 text-center">
                    This is a simulation. Actions will be performed in test mode.
                </div>
            </div>
        </div>
    );
}
