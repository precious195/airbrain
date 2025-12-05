'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Bot, User, Sparkles, Heart, Zap, Shield, Brain } from 'lucide-react';

export default function ConversationsPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const chatSamples = [
        {
            title: "Empathetic Support",
            description: "Handling a frustrated customer with patience and understanding.",
            messages: [
                { role: 'user', content: "I've been waiting for my refund for 5 days! This is ridiculous." },
                { role: 'ai', content: "I completely understand your frustration, and I'm truly sorry for the delay. Waiting for money to return is stressful. Let me check the status of that transaction for you right now." },
                { role: 'user', content: "It was supposed to be 3 days." },
                { role: 'ai', content: "You're absolutely right, our standard processing time is 3 days. I can see here that the bank had a minor delay on their end, but the funds were released this morning. You should see them in your account by end of day today. I've also flagged this to ensure it doesn't happen again." }
            ]
        },
        {
            title: "Complex Troubleshooting",
            description: "Guiding a user through a technical issue step-by-step.",
            messages: [
                { role: 'user', content: "My internet is down and the red light is blinking." },
                { role: 'ai', content: "I can help with that. A blinking red light usually means the router isn't getting a signal. First, could you check if the thin yellow cable is firmly plugged into the 'WAN' port on the back?" },
                { role: 'user', content: "Let me check... okay, it was a bit loose. I pushed it in." },
                { role: 'ai', content: "Great catch! Now, give it about 30 seconds. Does the light turn solid green?" },
                { role: 'user', content: "Yes! It's green now. Thank you!" },
                { role: 'ai', content: "Fantastic! You're back online. Is there anything else I can help you with today?" }
            ]
        },
        {
            title: "Proactive Sales",
            description: "Identifying needs and suggesting relevant upgrades naturally.",
            messages: [
                { role: 'user', content: "I'm running out of data too fast this month." },
                { role: 'ai', content: "I noticed that too. You've been streaming more video lately, which uses a lot of data. We actually have a 'Streamer Plus' bundle that gives you unlimited video data for just $5 more than you're paying now." },
                { role: 'user', content: "Really? Only $5 more?" },
                { role: 'ai', content: "Exactly. It would cover all your YouTube and Netflix usage, so your main data allowance stays untouched. Would you like me to switch you over starting next billing cycle?" }
            ]
        },
        {
            title: "Multilingual Fluency",
            description: "Seamlessly switching languages to accommodate the user.",
            messages: [
                { role: 'user', content: "Hola, necesito ayuda con mi factura." },
                { role: 'ai', content: "¡Hola! Claro que sí, puedo ayudarte con tu factura. ¿Qué duda tienes específicamente sobre el cobro?" },
                { role: 'user', content: "Why is it higher this month?" },
                { role: 'ai', content: "I see you switched to English. The bill is higher because of a one-time activation fee for the new roaming service you added on the 15th. Next month it will return to your normal rate." }
            ]
        },
        {
            title: "Fraud Protection",
            description: "Detecting suspicious activity and protecting the user gently.",
            messages: [
                { role: 'user', content: "I just got a code I didn't request." },
                { role: 'ai', content: "That's important. Please **do not share that code with anyone**, not even us. It looks like someone might be trying to access your account from a new device." },
                { role: 'user', content: "What should I do?" },
                { role: 'ai', content: "I've temporarily locked your account to keep it safe. I'll send a secure link to your verified email to reset your password. Once you do that, you'll be back in control. Does that sound good?" }
            ]
        }
    ];

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className={`space-y-4 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium">Core Capabilities</span>
                </div>
                <h1 className="text-4xl font-bold gradient-text">AI Conversations</h1>
                <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
                    Experience the difference of a truly intelligent agent. AirBrain goes beyond keywords to understand intent, emotion, and context.
                </p>
            </div>

            {/* Features Grid */}
            <div className={`grid md:grid-cols-3 gap-6 ${mounted ? 'animate-slide-up stagger-1' : 'opacity-0'}`}>
                <div className="glass-card p-6">
                    <Heart className="w-8 h-8 text-pink-500 mb-4" />
                    <h3 className="font-bold text-lg mb-2">Emotional Intelligence</h3>
                    <p className="text-sm text-muted-foreground">Detects frustration and adjusts tone to be more empathetic and soothing.</p>
                </div>
                <div className="glass-card p-6">
                    <Brain className="w-8 h-8 text-purple-500 mb-4" />
                    <h3 className="font-bold text-lg mb-2">Context Retention</h3>
                    <p className="text-sm text-muted-foreground">Remembers details from previous messages so users never have to repeat themselves.</p>
                </div>
                <div className="glass-card p-6">
                    <Zap className="w-8 h-8 text-yellow-500 mb-4" />
                    <h3 className="font-bold text-lg mb-2">Proactive Action</h3>
                    <p className="text-sm text-muted-foreground">Suggests solutions and performs actions (like refunds) autonomously.</p>
                </div>
            </div>

            {/* Chat Samples */}
            <div className={`space-y-8 ${mounted ? 'animate-slide-up stagger-2' : 'opacity-0'}`}>
                <h2 className="text-2xl font-bold">Live Interaction Samples</h2>
                <div className="grid gap-8">
                    {chatSamples.map((sample, index) => (
                        <div key={index} className="glass-card p-6 md:p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <MessageSquare className="w-24 h-24" />
                            </div>

                            <div className="relative z-10 mb-6">
                                <h3 className="text-xl font-bold mb-1">{sample.title}</h3>
                                <p className="text-muted-foreground">{sample.description}</p>
                            </div>

                            <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 md:p-6 border border-slate-200 dark:border-slate-800">
                                {sample.messages.map((msg, i) => (
                                    <div key={i} className={`flex gap-4 ${msg.role === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'ai'
                                                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                                                : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                            }`}>
                                            {msg.role === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                        </div>
                                        <div className={`flex-1 max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'ai'
                                                ? 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm rounded-tl-none'
                                                : 'bg-blue-500 text-white shadow-md shadow-blue-500/10 rounded-tr-none'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
