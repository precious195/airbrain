'use client';

import { useState, useEffect } from 'react';
import { Settings, Plug, Code, Lock, Globe, Database } from 'lucide-react';

export default function IntegrationsPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className={`space-y-4 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm text-orange-600 dark:text-orange-400 border border-orange-500/20">
                    <Plug className="w-4 h-4" />
                    <span className="font-medium">Connectivity</span>
                </div>
                <h1 className="text-4xl font-bold gradient-text">System Integrations</h1>
                <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
                    Connect AirBrain to your existing tools. Whether it's a CRM, a ticketing system, or a custom database, we have you covered.
                </p>
            </div>

            {/* Integration Types */}
            <div className={`grid md:grid-cols-2 gap-8 ${mounted ? 'animate-slide-up stagger-1' : 'opacity-0'}`}>
                <div className="glass-card p-8 border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Code className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl">API Webhooks</h3>
                            <p className="text-sm text-muted-foreground">Real-time data exchange</p>
                        </div>
                    </div>
                    <p className="text-muted-foreground mb-6">
                        Configure webhooks to trigger actions in your backend when specific intents are detected. Perfect for checking order status or updating user profiles.
                    </p>
                    <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-blue-400 overflow-x-auto">
                        POST /api/v1/webhook<br />
                        {`{ "intent": "check_balance", "userId": "123" }`}
                    </div>
                </div>

                <div className="glass-card p-8 border-l-4 border-l-purple-500">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Globe className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl">Browser Automation</h3>
                            <p className="text-sm text-muted-foreground">Legacy system support</p>
                        </div>
                    </div>
                    <p className="text-muted-foreground mb-6">
                        For systems without APIs, our secure browser agents can log in, navigate, and perform actions just like a human agent would.
                    </p>
                    <div className="flex items-center gap-2 text-sm font-medium text-purple-500">
                        <Lock className="w-4 h-4" />
                        Encrypted Credential Storage
                    </div>
                </div>
            </div>

            {/* Pre-built Connectors */}
            <div className={`glass-card p-8 ${mounted ? 'animate-slide-up stagger-2' : 'opacity-0'}`}>
                <h2 className="text-2xl font-bold mb-6">Pre-built Connectors</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {['Salesforce', 'Zendesk', 'HubSpot', 'Shopify', 'Stripe', 'Slack', 'Jira', 'ServiceNow'].map((tool) => (
                        <div key={tool} className="flex items-center justify-center p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                            <span className="font-semibold">{tool}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
