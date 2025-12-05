'use client';

import SignUpForm from '@/components/auth/SignUpForm';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useState, useEffect } from 'react';

export default function SignUpPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 gradient-mesh -z-10" />
            <div className="noise" />

            {/* Floating Orbs */}
            <div className="fixed top-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-float opacity-60 dark:opacity-30" />
            <div className="fixed bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-float-delayed opacity-50 dark:opacity-20" />

            {/* Header */}
            <header className="relative z-10 p-6 flex justify-between items-center">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                </Link>
                <ThemeToggle />
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col justify-center items-center p-4 relative z-10">
                <div className={`w-full max-w-md mb-8 text-center ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm mb-6">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">Start your AI journey</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-2">
                        Create Account
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Join the AI-Powered Customer Service Platform
                    </p>
                </div>

                <div className={`w-full max-w-md ${mounted ? 'animate-slide-up stagger-1' : 'opacity-0'}`}>
                    <SignUpForm />
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 p-6 text-center text-sm text-muted-foreground">
                © 2025 AI Customer Service Platform
            </footer>
        </div>
    );
}
