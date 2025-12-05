'use client';

import { useState, useEffect } from 'react';
import { Shield, Lock, Key, Eye, FileCheck, Server } from 'lucide-react';

export default function SecurityPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className={`space-y-4 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm text-red-600 dark:text-red-400 border border-red-500/20">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">Enterprise Grade</span>
                </div>
                <h1 className="text-4xl font-bold gradient-text">Data Security</h1>
                <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
                    Security is not an afterthought; it's our foundation. We employ bank-grade encryption and strict isolation to keep your data safe.
                </p>
            </div>

            {/* Security Pillars */}
            <div className={`grid md:grid-cols-3 gap-6 ${mounted ? 'animate-slide-up stagger-1' : 'opacity-0'}`}>
                <div className="glass-card p-6">
                    <Lock className="w-8 h-8 text-blue-500 mb-4" />
                    <h3 className="font-bold text-lg mb-2">Encryption</h3>
                    <p className="text-sm text-muted-foreground">
                        All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Your sensitive keys are stored in a hardware security module.
                    </p>
                </div>
                <div className="glass-card p-6">
                    <Server className="w-8 h-8 text-purple-500 mb-4" />
                    <h3 className="font-bold text-lg mb-2">Data Isolation</h3>
                    <p className="text-sm text-muted-foreground">
                        Strict logical separation between tenants. Your data lives in its own dedicated namespace, inaccessible to other customers.
                    </p>
                </div>
                <div className="glass-card p-6">
                    <Eye className="w-8 h-8 text-green-500 mb-4" />
                    <h3 className="font-bold text-lg mb-2">Audit Logging</h3>
                    <p className="text-sm text-muted-foreground">
                        Every action, access, and change is logged immutably. You have full visibility into who did what and when.
                    </p>
                </div>
            </div>

            {/* Compliance Badges */}
            <div className={`glass-card p-8 ${mounted ? 'animate-slide-up stagger-2' : 'opacity-0'}`}>
                <h2 className="text-2xl font-bold mb-6">Compliance Standards</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <FileCheck className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">GDPR Compliant</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                We fully support the Right to be Forgotten and Data Portability. Our servers are located in EU regions for European customers.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                            <Shield className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">SOC 2 Type II</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                We undergo annual independent audits to verify our security, availability, and confidentiality controls.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
