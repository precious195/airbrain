'use client';

import { useState, useEffect } from 'react';
import { Server, Database, Globe, Shield, Cpu, Layers, ArrowRight } from 'lucide-react';

export default function ArchitecturePage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className={`space-y-4 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    <Server className="w-4 h-4" />
                    <span className="font-medium">System Design</span>
                </div>
                <h1 className="text-4xl font-bold gradient-text">Platform Architecture</h1>
                <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
                    AirBrain is built on a scalable, event-driven microservices architecture designed for high availability and real-time processing.
                </p>
            </div>

            {/* Diagram Placeholder (CSS Art) */}
            <div className={`glass-card p-8 md:p-12 flex justify-center items-center overflow-hidden relative ${mounted ? 'animate-slide-up stagger-1' : 'opacity-0'}`}>
                <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center w-full max-w-4xl">
                    {/* Client Layer */}
                    <div className="flex flex-col gap-4">
                        <div className="glass p-4 rounded-xl text-center border-l-4 border-blue-500">
                            <Globe className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                            <div className="font-bold">Web Portal</div>
                        </div>
                        <div className="glass p-4 rounded-xl text-center border-l-4 border-green-500">
                            <MessageSquare className="w-6 h-6 mx-auto mb-2 text-green-500" />
                            <div className="font-bold">WhatsApp / SMS</div>
                        </div>
                    </div>

                    {/* Processing Layer */}
                    <div className="flex flex-col items-center gap-2">
                        <ArrowRight className="w-6 h-6 text-muted-foreground animate-pulse" />
                        <div className="glass-card p-6 rounded-2xl text-center border-2 border-purple-500/30 shadow-lg shadow-purple-500/20 w-full">
                            <Cpu className="w-8 h-8 mx-auto mb-3 text-purple-500" />
                            <div className="font-bold text-lg mb-1">AirBrain Core</div>
                            <div className="text-xs text-muted-foreground">Orchestration & Logic</div>
                        </div>
                        <ArrowRight className="w-6 h-6 text-muted-foreground animate-pulse" />
                    </div>

                    {/* Data Layer */}
                    <div className="flex flex-col gap-4">
                        <div className="glass p-4 rounded-xl text-center border-r-4 border-orange-500">
                            <Database className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                            <div className="font-bold">Vector DB</div>
                        </div>
                        <div className="glass p-4 rounded-xl text-center border-r-4 border-red-500">
                            <Shield className="w-6 h-6 mx-auto mb-2 text-red-500" />
                            <div className="font-bold">Secure Storage</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Components Grid */}
            <div className={`grid md:grid-cols-2 gap-6 ${mounted ? 'animate-slide-up stagger-2' : 'opacity-0'}`}>
                <div className="glass-card p-6">
                    <Layers className="w-8 h-8 text-blue-500 mb-4" />
                    <h3 className="font-bold text-lg mb-2">Event Bus</h3>
                    <p className="text-sm text-muted-foreground">
                        All system events are published to a central bus, allowing for decoupled services and easy scalability.
                    </p>
                </div>
                <div className="glass-card p-6">
                    <Shield className="w-8 h-8 text-green-500 mb-4" />
                    <h3 className="font-bold text-lg mb-2">Identity Provider</h3>
                    <p className="text-sm text-muted-foreground">
                        Centralized authentication and authorization handling multi-tenant access control.
                    </p>
                </div>
                <div className="glass-card p-6">
                    <Database className="w-8 h-8 text-orange-500 mb-4" />
                    <h3 className="font-bold text-lg mb-2">Knowledge Graph</h3>
                    <p className="text-sm text-muted-foreground">
                        Structured data representation of customer history, product details, and support policies.
                    </p>
                </div>
                <div className="glass-card p-6">
                    <Cpu className="w-8 h-8 text-purple-500 mb-4" />
                    <h3 className="font-bold text-lg mb-2">LLM Gateway</h3>
                    <p className="text-sm text-muted-foreground">
                        Manages prompts, context windows, and model selection (Gemini 1.5 Pro) for optimal responses.
                    </p>
                </div>
            </div>
        </div>
    );
}

import { MessageSquare } from 'lucide-react';
