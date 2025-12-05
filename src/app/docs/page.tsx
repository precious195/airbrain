'use client';

import Link from 'next/link';
import { ArrowRight, Book, Zap, Shield, MessageSquare, Sparkles, Brain, Bot, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DocsPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="space-y-12 relative">
            {/* Floating 3D Elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float -z-10" />
            <div className="absolute top-40 -left-20 w-72 h-72 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-float-delayed -z-10" />

            {/* Hero Section */}
            <div className={`text-center space-y-6 py-12 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm mb-4 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium">Next-Gen AI Documentation</span>
                </div>
                <h1 className="text-5xl font-bold gradient-text pb-2">
                    AirBrain Documentation
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Master the art of human-like AI customer service. Integrate, configure, and scale your intelligent agents with ease.
                </p>
            </div>

            {/* Human-Like AI Feature Spotlight */}
            <div className={`glass-card p-8 relative overflow-hidden group ${mounted ? 'animate-slide-up stagger-1' : 'opacity-0'}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">More Than Just a Bot</h2>
                        <p className="text-muted-foreground mb-6 text-lg">
                            AirBrain isn't just a script reader. It understands context, emotion, and nuance, providing support that feels genuinely human.
                        </p>
                        <ul className="space-y-3">
                            {[
                                'Context-aware conversations that remember history',
                                'Emotional intelligence to handle sensitive queries',
                                'Natural language processing for fluid dialogue',
                                'Adaptive learning from every interaction'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <Bot className="w-3 h-3 text-green-500" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative h-64 glass rounded-2xl flex items-center justify-center border border-white/10 dark:border-white/5">
                        {/* Abstract Representation of Human-AI Connection */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl" />
                        <div className="relative flex items-center gap-8">
                            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center animate-float">
                                <Users className="w-10 h-10 text-blue-500" />
                            </div>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse delay-75" />
                                <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse delay-150" />
                            </div>
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl flex items-center justify-center animate-float-delayed text-white">
                                <Brain className="w-10 h-10" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className={`grid md:grid-cols-2 gap-6 ${mounted ? 'animate-slide-up stagger-2' : 'opacity-0'}`}>
                <Link href="/docs/quickstart" className="card-3d group p-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                        <Zap className="w-6 h-6 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold mb-2 flex items-center gap-2 group-hover:text-blue-500 transition-colors">
                        Quick Start Guide
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    </h2>
                    <p className="text-muted-foreground">Get your AI agent up and running in less than 5 minutes.</p>
                </Link>

                <Link href="/docs/architecture" className="card-3d group p-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                        <Book className="w-6 h-6 text-purple-500" />
                    </div>
                    <h2 className="text-xl font-bold mb-2 flex items-center gap-2 group-hover:text-purple-500 transition-colors">
                        Platform Concepts
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    </h2>
                    <p className="text-muted-foreground">Understand how AirBrain processes messages and manages data.</p>
                </Link>
            </div>

            {/* Features Grid */}
            <div className={mounted ? 'animate-slide-up stagger-3' : 'opacity-0'}>
                <h2 className="text-2xl font-bold mb-6">Core Capabilities</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 hover:border-blue-500/30 transition-colors group">
                        <MessageSquare className="w-8 h-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold text-lg mb-2">AI Conversations</h3>
                        <p className="text-sm text-muted-foreground mb-4">Powered by Gemini 1.5 Pro for human-like interactions.</p>
                        <Link href="/docs/conversations" className="text-blue-500 text-sm font-medium hover:underline flex items-center gap-1">
                            Learn more <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="glass-card p-6 hover:border-purple-500/30 transition-colors group">
                        <Shield className="w-8 h-8 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold text-lg mb-2">Enterprise Security</h3>
                        <p className="text-sm text-muted-foreground mb-4">Bank-grade encryption and data isolation per company.</p>
                        <Link href="/docs/security" className="text-purple-500 text-sm font-medium hover:underline flex items-center gap-1">
                            Learn more <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="glass-card p-6 hover:border-pink-500/30 transition-colors group">
                        <Zap className="w-8 h-8 text-pink-500 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold text-lg mb-2">System Integration</h3>
                        <p className="text-sm text-muted-foreground mb-4">Connect to your backend via API or Browser Automation.</p>
                        <Link href="/docs/integrations" className="text-pink-500 text-sm font-medium hover:underline flex items-center gap-1">
                            Learn more <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Help Section */}
            <div className={`glass p-8 rounded-2xl flex items-center justify-between border border-blue-500/20 bg-blue-500/5 ${mounted ? 'animate-slide-up stagger-4' : 'opacity-0'}`}>
                <div>
                    <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">Need help?</h2>
                    <p className="text-muted-foreground">Our support team is available 24/7 to assist you.</p>
                </div>
                <Link href="/contact" className="btn-primary">
                    Contact Support
                </Link>
            </div>
        </div>
    );
}
