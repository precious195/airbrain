'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    Smartphone,
    Building2,
    Shield,
    Landmark,
    Tv,
    ArrowRight,
    MessageSquare,
    Sparkles
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const industries = [
    {
        id: 'mobile',
        name: 'Mobile Telecom',
        icon: Smartphone,
        description: 'Manage bundles, network support, and customer subscriptions',
        gradient: 'from-blue-500 via-blue-400 to-cyan-400',
        lightGradient: 'from-blue-500/20 to-cyan-500/20',
        shadowColor: 'shadow-blue-500/25'
    },
    {
        id: 'banking',
        name: 'Banking',
        icon: Building2,
        description: 'Account management, transactions, and financial services',
        gradient: 'from-emerald-500 via-green-400 to-teal-400',
        lightGradient: 'from-emerald-500/20 to-teal-500/20',
        shadowColor: 'shadow-emerald-500/25'
    },
    {
        id: 'insurance',
        name: 'Insurance',
        icon: Shield,
        description: 'Policy management, claims processing, and renewals',
        gradient: 'from-purple-500 via-violet-400 to-indigo-400',
        lightGradient: 'from-purple-500/20 to-indigo-500/20',
        shadowColor: 'shadow-purple-500/25'
    },
    {
        id: 'microfinance',
        name: 'Microfinance',
        icon: Landmark,
        description: 'Loan applications, disbursements, and repayment tracking',
        gradient: 'from-orange-500 via-amber-400 to-yellow-400',
        lightGradient: 'from-orange-500/20 to-yellow-500/20',
        shadowColor: 'shadow-orange-500/25'
    },
    {
        id: 'television',
        name: 'Television',
        icon: Tv,
        description: 'Subscription management, packages, and billing',
        gradient: 'from-pink-500 via-rose-400 to-red-400',
        lightGradient: 'from-pink-500/20 to-rose-500/20',
        shadowColor: 'shadow-pink-500/25'
    }
];

export default function PortalSelectionPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-background overflow-hidden relative">
            {/* Animated Background */}
            <div className="fixed inset-0 gradient-mesh -z-10" />
            <div className="noise" />

            {/* Floating Orbs */}
            <div className="fixed top-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-float opacity-60 dark:opacity-30" />
            <div className="fixed top-60 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-float-delayed opacity-50 dark:opacity-20" />
            <div className="fixed bottom-20 left-1/3 w-72 h-72 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-full blur-3xl animate-float opacity-40 dark:opacity-20" />

            {/* Header */}
            <header className="relative z-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="glass-card px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">AI Customer Service</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <Link
                                href="/"
                                className="text-muted-foreground hover:text-foreground transition text-sm"
                            >
                                ← Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex flex-col items-center justify-center p-6 pt-12">
                <div className={`text-center mb-16 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">Select Your Industry Portal</span>
                    </div>
                    <h2 className="text-5xl font-bold mb-4">
                        Choose Your <span className="gradient-text">Portal</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Access your industry-specific AI customer service platform
                    </p>
                </div>

                {/* Industry Cards Grid - 3D Animated */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full perspective-1000">
                    {industries.map((industry, index) => {
                        const Icon = industry.icon;
                        return (
                            <Link
                                key={industry.id}
                                href={`/login/${industry.id}`}
                                className={`group ${mounted ? 'animate-slide-up' : 'opacity-0'}`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className={`card-3d glass-card p-8 h-full relative overflow-hidden ${industry.shadowColor} hover:shadow-2xl`}>
                                    {/* Gradient Glow Background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${industry.lightGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                    {/* Content */}
                                    <div className="relative z-10">
                                        {/* Icon with Gradient */}
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${industry.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg ${industry.shadowColor}`}>
                                            <Icon className="w-8 h-8 text-white" />
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-2xl font-bold mb-3 group-hover:translate-x-1 transition-transform">
                                            {industry.name}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-muted-foreground mb-6">
                                            {industry.description}
                                        </p>

                                        {/* Access Link */}
                                        <div className={`flex items-center gap-2 font-semibold bg-gradient-to-r ${industry.gradient} bg-clip-text text-transparent`}>
                                            <span>Access Portal</span>
                                            <ArrowRight className={`w-5 h-5 group-hover:translate-x-2 transition-transform text-transparent bg-gradient-to-r ${industry.gradient} bg-clip-text`} style={{ stroke: 'url(#gradient)' }} />
                                            <svg width="0" height="0">
                                                <defs>
                                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="#3b82f6" />
                                                        <stop offset="100%" stopColor="#8b5cf6" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Decorative Corner Gradient */}
                                    <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${industry.gradient} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Sign Up CTA */}
                <div className={`mt-16 ${mounted ? 'animate-slide-up stagger-6' : 'opacity-0'}`}>
                    <div className="glass-card px-8 py-6 text-center">
                        <p className="text-muted-foreground mb-4">
                            New to our platform?
                        </p>
                        <Link
                            href="/signup"
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            <span>Create an Account</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 p-6 text-center text-muted-foreground text-sm border-t border-border/50 mt-12">
                © 2025 AI Customer Service Platform. Enterprise-grade AI solutions.
            </footer>
        </div>
    );
}
