'use client';

import { useState, useEffect } from 'react';
import { Book, Search, FileText, Upload, RefreshCw, CheckCircle, Globe } from 'lucide-react';

export default function KnowledgeBasePage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className={`space-y-4 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm text-green-600 dark:text-green-400 border border-green-500/20">
                    <Book className="w-4 h-4" />
                    <span className="font-medium">Information Management</span>
                </div>
                <h1 className="text-4xl font-bold gradient-text">Knowledge Base</h1>
                <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
                    Teach your AI agent about your business. Upload documents, FAQs, and policies to create a comprehensive brain for your customer service.
                </p>
            </div>

            {/* Process Flow */}
            <div className={`grid md:grid-cols-3 gap-8 ${mounted ? 'animate-slide-up stagger-1' : 'opacity-0'}`}>
                <div className="relative">
                    <div className="glass-card p-6 h-full border-t-4 border-t-blue-500">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                            <Upload className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">1. Ingestion</h3>
                        <p className="text-sm text-muted-foreground">
                            Upload PDFs, Word docs, or scrape your website. We support bulk imports and automatic syncing.
                        </p>
                    </div>
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                        <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                    </div>
                </div>

                <div className="relative">
                    <div className="glass-card p-6 h-full border-t-4 border-t-purple-500">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                            <RefreshCw className="w-6 h-6 text-purple-500" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">2. Processing</h3>
                        <p className="text-sm text-muted-foreground">
                            Content is chunked, embedded, and indexed into a vector database for semantic understanding.
                        </p>
                    </div>
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                        <div className="w-8 h-1 bg-gradient-to-r from-purple-500 to-green-500 rounded-full" />
                    </div>
                </div>

                <div className="relative">
                    <div className="glass-card p-6 h-full border-t-4 border-t-green-500">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                            <Search className="w-6 h-6 text-green-500" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">3. Retrieval</h3>
                        <p className="text-sm text-muted-foreground">
                            When a user asks a question, the AI retrieves the most relevant chunks to generate an accurate answer.
                        </p>
                    </div>
                </div>
            </div>

            {/* Supported Formats */}
            <div className={`glass-card p-8 ${mounted ? 'animate-slide-up stagger-2' : 'opacity-0'}`}>
                <h2 className="text-2xl font-bold mb-6">Supported Content Types</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: FileText, label: 'PDF Documents' },
                        { icon: Globe, label: 'Web Pages' },
                        { icon: Book, label: 'Product Manuals' },
                        { icon: CheckCircle, label: 'Q&A Pairs' }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                            <item.icon className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium text-sm">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
