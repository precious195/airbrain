'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { useState, useRef, useEffect } from 'react';
import {
    FlaskConical,
    Send,
    Loader2,
    Sparkles,
    Building2,
    MessageSquare,
    User,
    Bot,
    RefreshCw,
    Copy,
    CheckCircle,
    Info,
    Zap
} from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: number;
    knowledge?: {
        faqs?: number;
        actions?: number;
        troubleshooting?: number;
        terms?: number;
    };
}

const industries = [
    { id: 'mobile', name: 'Mobile Telecom', icon: '📱', color: 'from-blue-500 to-cyan-500' },
    { id: 'banking', name: 'Banking', icon: '🏦', color: 'from-green-500 to-emerald-500' },
    { id: 'insurance', name: 'Insurance', icon: '🛡️', color: 'from-purple-500 to-pink-500' },
    { id: 'microfinance', name: 'Microfinance', icon: '💰', color: 'from-yellow-500 to-orange-500' },
    { id: 'television', name: 'Television', icon: '📺', color: 'from-red-500 to-rose-500' }
];

const sampleQueries: Record<string, string[]> = {
    mobile: [
        'How do I check my balance?',
        'I want to buy a data bundle',
        'My internet is very slow',
        'How do I transfer airtime?',
        'What is my phone number?'
    ],
    banking: [
        'How do I transfer money?',
        'I forgot my PIN',
        'What are your loan interest rates?',
        'My card got blocked',
        'How do I open a new account?'
    ],
    insurance: [
        'How do I file a claim?',
        'What does my policy cover?',
        'When is my premium due?',
        'How long does claim processing take?',
        'I want to add a beneficiary'
    ],
    microfinance: [
        'How do I apply for a loan?',
        'What is my outstanding balance?',
        'When is my next payment due?',
        'Can I pay my loan early?',
        'What happens if I pay late?'
    ],
    television: [
        'How do I pay my subscription?',
        'I have E16 error on my screen',
        'How do I upgrade my package?',
        'My decoder has no signal',
        'How do I add extra view?'
    ]
};

export default function TestModePage() {
    const [selectedIndustry, setSelectedIndustry] = useState('mobile');
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || loading) return;

        const userMessage: Message = {
            id: `msg_${Date.now()}`,
            role: 'user',
            content: inputValue,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: inputValue,
                    industry: selectedIndustry,
                    testMode: true
                })
            });

            const data = await response.json();

            const aiMessage: Message = {
                id: `msg_${Date.now()}_ai`,
                role: 'ai',
                content: data.response || data.error || 'No response received',
                timestamp: Date.now(),
                knowledge: data.knowledgeUsed
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error: any) {
            const errorMessage: Message = {
                id: `msg_${Date.now()}_error`,
                role: 'ai',
                content: `Error: ${error.message}`,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickQuery = (query: string) => {
        setInputValue(query);
    };

    const clearConversation = () => {
        setMessages([]);
    };

    const copyMessage = (content: string, id: string) => {
        navigator.clipboard.writeText(content);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const selectedIndustryData = industries.find(i => i.id === selectedIndustry);

    return (
        <AdminLayout>
            <div className="space-y-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                <FlaskConical className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">AI Test Mode</h1>
                                <p className="text-muted-foreground">Test AI knowledge and responses by industry</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={clearConversation}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Clear Chat
                    </button>
                </div>

                {/* Industry Selector */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        Select Industry
                    </h2>
                    <div className="grid grid-cols-5 gap-3">
                        {industries.map(industry => (
                            <button
                                key={industry.id}
                                onClick={() => setSelectedIndustry(industry.id)}
                                className={`p-4 rounded-xl border-2 transition-all ${selectedIndustry === industry.id
                                        ? `border-transparent bg-gradient-to-br ${industry.color} text-white shadow-lg`
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                            >
                                <div className="text-2xl mb-2">{industry.icon}</div>
                                <div className="font-medium text-sm">{industry.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Chat Area */}
                    <div className="col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col h-[500px]">
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <Sparkles className="w-12 h-12 mb-4 opacity-30" />
                                    <p className="font-medium">Start testing the AI</p>
                                    <p className="text-sm mt-1">Send a message or use a sample query</p>
                                </div>
                            ) : (
                                messages.map(message => (
                                    <div
                                        key={message.id}
                                        className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                                                ? 'bg-blue-500 text-white'
                                                : `bg-gradient-to-br ${selectedIndustryData?.color} text-white`
                                            }`}>
                                            {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                        </div>
                                        <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                                            <div className={`inline-block p-4 rounded-2xl ${message.role === 'user'
                                                    ? 'bg-blue-500 text-white rounded-tr-sm'
                                                    : 'bg-slate-100 dark:bg-slate-800 rounded-tl-sm'
                                                }`}>
                                                <p className="whitespace-pre-wrap">{message.content}</p>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                                                {message.role === 'ai' && (
                                                    <button
                                                        onClick={() => copyMessage(message.content, message.id)}
                                                        className="hover:text-foreground"
                                                    >
                                                        {copied === message.id ? (
                                                            <CheckCircle className="w-3 h-3 text-green-500" />
                                                        ) : (
                                                            <Copy className="w-3 h-3" />
                                                        )}
                                                    </button>
                                                )}
                                                {message.knowledge && (
                                                    <span className="flex items-center gap-1 text-purple-500">
                                                        <Zap className="w-3 h-3" />
                                                        Knowledge used
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            {loading && (
                                <div className="flex gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${selectedIndustryData?.color} text-white`}>
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm p-4">
                                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder={`Ask anything about ${selectedIndustryData?.name}...`}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-purple-500 outline-none"
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || loading}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium disabled:opacity-50 flex items-center gap-2 hover:shadow-lg transition-shadow"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Send
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Sample Queries Panel */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 h-[500px] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-purple-500" />
                            Sample Queries
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Click to use these {selectedIndustryData?.name} queries:
                        </p>
                        <div className="space-y-2">
                            {sampleQueries[selectedIndustry]?.map((query, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickQuery(query)}
                                    className="w-full text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                                >
                                    {query}
                                </button>
                            ))}
                        </div>

                        {/* Info Panel */}
                        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                            <div className="flex items-start gap-2">
                                <Info className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-purple-700 dark:text-purple-300">Testing Tips</p>
                                    <ul className="mt-2 space-y-1 text-purple-600 dark:text-purple-400">
                                        <li>• Try industry-specific terminology</li>
                                        <li>• Test error scenarios</li>
                                        <li>• Check troubleshooting guidance</li>
                                        <li>• Test product inquiries</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
