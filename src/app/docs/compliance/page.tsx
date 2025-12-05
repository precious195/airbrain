'use client';

import { useState, useEffect } from 'react';
import { FileCheck, Globe, Shield, AlertTriangle } from 'lucide-react';

export default function CompliancePage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className={`space-y-4 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <FileCheck className="w-4 h-4" />
                    <span className="font-medium">Regulatory Adherence</span>
                </div>
                <h1 className="text-4xl font-bold gradient-text">Compliance Center</h1>
                <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
                    Navigating regulations can be complex. We simplify it by building compliance into the core of our platform.
                </p>
            </div>

            {/* Regions */}
            <div className={`glass-card p-8 ${mounted ? 'animate-slide-up stagger-1' : 'opacity-0'}`}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Globe className="w-6 h-6 text-blue-500" />
                    Regional Compliance
                </h2>
                <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 pl-4 py-1">
                        <h3 className="font-bold text-lg">Europe (GDPR)</h3>
                        <p className="text-muted-foreground mt-1">
                            Full support for data residency, consent management, and data subject rights requests.
                        </p>
                    </div>
                    <div className="border-l-4 border-red-500 pl-4 py-1">
                        <h3 className="font-bold text-lg">California (CCPA)</h3>
                        <p className="text-muted-foreground mt-1">
                            Tools to manage "Do Not Sell My Info" requests and transparent data processing disclosures.
                        </p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4 py-1">
                        <h3 className="font-bold text-lg">Healthcare (HIPAA)</h3>
                        <p className="text-muted-foreground mt-1">
                            BAA available for Enterprise plans. Dedicated environments for PHI processing.
                        </p>
                    </div>
                </div>
            </div>

            {/* AI Ethics */}
            <div className={`glass-card p-8 border border-yellow-500/20 bg-yellow-500/5 ${mounted ? 'animate-slide-up stagger-2' : 'opacity-0'}`}>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                    AI Safety & Ethics
                </h2>
                <p className="text-muted-foreground mb-6">
                    We are committed to responsible AI development. Our models are tuned to avoid bias and harmful content.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                        <h4 className="font-bold mb-1">Hallucination Prevention</h4>
                        <p className="text-sm text-muted-foreground">Strict grounding in your Knowledge Base data.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                        <h4 className="font-bold mb-1">Content Filtering</h4>
                        <p className="text-sm text-muted-foreground">Real-time scanning for toxicity and PII leakage.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
