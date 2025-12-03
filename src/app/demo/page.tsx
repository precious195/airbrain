// src/app/demo/page.tsx
'use client';

import { useState } from 'react';
import ChatWindow from '@/components/chat/ChatWindow';
import { createConversation } from '@/lib/ai/conversation-memory';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DemoPage() {
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [industry, setIndustry] = useState<string>('mobile');

    const startChat = async () => {
        // Create a demo conversation
        const demoCustomerId = `demo_${Date.now()}`;
        const id = await createConversation(demoCustomerId, 'web', industry, 'demo-company');
        setConversationId(id);
        setIsMinimized(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8">
                <Link href="/" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Home
                </Link>

                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Try Our AI Assistant
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Experience the power of AI-driven customer service. Start a conversation below.
                    </p>

                    {!conversationId ? (
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <h2 className="text-2xl font-semibold mb-6">Select Your Industry</h2>

                            <div className="grid md:grid-cols-2 gap-4 mb-8">
                                {[
                                    { id: 'mobile', name: 'Mobile Operators', emoji: '📱', description: 'Bundles, balance, network issues' },
                                    { id: 'banking', name: 'Banking', emoji: '🏦', description: 'Accounts, transactions, loans' },
                                    { id: 'microfinance', name: 'Microfinance', emoji: '💰', description: 'Loans, repayments, eligibility' },
                                    { id: 'insurance', name: 'Insurance', emoji: '🛡️', description: 'Policies, claims, quotes' },
                                    { id: 'tv', name: 'TV/Streaming', emoji: '📺', description: 'Subscriptions, decoder, packages' },
                                ].map((ind) => (
                                    <button
                                        key={ind.id}
                                        onClick={() => setIndustry(ind.id)}
                                        className={`p-6 rounded-lg border-2 transition-all text-left ${industry === ind.id
                                            ? 'border-primary-600 bg-primary-50'
                                            : 'border-gray-200 hover:border-primary-300'
                                            }`}
                                    >
                                        <div className="text-4xl mb-2">{ind.emoji}</div>
                                        <h3 className="font-semibold text-lg mb-1">{ind.name}</h3>
                                        <p className="text-sm text-gray-600">{ind.description}</p>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={startChat}
                                className="btn-primary w-full text-lg py-4"
                            >
                                Start Chat with AI Assistant
                            </button>

                            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Demo Features:</h3>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>✅ Real-time streaming AI responses</li>
                                    <li>✅ Industry-specific knowledge</li>
                                    <li>✅ Automatic intent detection</li>
                                    <li>✅ Smart escalation to human agents</li>
                                    <li>✅ Conversation memory & context</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                                <h2 className="text-2xl font-semibold mb-4">Chat Active</h2>
                                <p className="text-gray-600 mb-4">
                                    The AI assistant is ready to help you. Try asking questions like:
                                </p>
                                <ul className="list-disc list-inside text-gray-700 space-y-2">
                                    {industry === 'mobile' && (
                                        <>
                                            <li>"What's my balance?"</li>
                                            <li>"Show me available data bundles"</li>
                                            <li>"I want to buy a 5GB bundle"</li>
                                            <li>"My network is not working"</li>
                                        </>
                                    )}
                                    {industry === 'banking' && (
                                        <>
                                            <li>"Check my account balance"</li>
                                            <li>"Show my recent transactions"</li>
                                            <li>"I want to apply for a loan"</li>
                                            <li>"Report a lost card"</li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            <ChatWindow
                                conversationId={conversationId}
                                customerId={`demo_${Date.now()}`}
                                industry={industry}
                                onClose={() => setConversationId(null)}
                                isMinimized={isMinimized}
                                onToggleMinimize={() => setIsMinimized(!isMinimized)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
