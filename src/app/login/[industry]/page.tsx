'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, database } from '@/lib/firebase/client';
import { Loader2, AlertCircle, ArrowLeft, Smartphone, Building2, Shield, Landmark, Tv, XCircle, MessageSquare, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const industryConfig: Record<string, { name: string; icon: any; gradient: string; lightGradient: string }> = {
    mobile: {
        name: 'Mobile Telecom',
        icon: Smartphone,
        gradient: 'from-blue-500 via-blue-400 to-cyan-400',
        lightGradient: 'from-blue-500/20 to-cyan-500/20'
    },
    banking: {
        name: 'Banking',
        icon: Building2,
        gradient: 'from-emerald-500 via-green-400 to-teal-400',
        lightGradient: 'from-emerald-500/20 to-teal-500/20'
    },
    insurance: {
        name: 'Insurance',
        icon: Shield,
        gradient: 'from-purple-500 via-violet-400 to-indigo-400',
        lightGradient: 'from-purple-500/20 to-indigo-500/20'
    },
    microfinance: {
        name: 'Microfinance',
        icon: Landmark,
        gradient: 'from-orange-500 via-amber-400 to-yellow-400',
        lightGradient: 'from-orange-500/20 to-yellow-500/20'
    },
    television: {
        name: 'Television',
        icon: Tv,
        gradient: 'from-pink-500 via-rose-400 to-red-400',
        lightGradient: 'from-pink-500/20 to-rose-500/20'
    }
};

interface AccessDeniedState {
    show: boolean;
    correctIndustry: string;
    companyName: string;
}

export default function IndustryLoginPage() {
    const router = useRouter();
    const params = useParams();
    const industry = params.industry as string;
    const config = industryConfig[industry];
    const [mounted, setMounted] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [accessDenied, setAccessDenied] = useState<AccessDeniedState>({
        show: false,
        correctIndustry: '',
        companyName: ''
    });
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!config) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="fixed inset-0 gradient-mesh -z-10" />
                <div className="glass-card p-8 text-center">
                    <h1 className="text-2xl font-bold mb-2">Invalid Portal</h1>
                    <p className="text-muted-foreground mb-4">The selected industry portal does not exist.</p>
                    <Link href="/login" className="btn-primary">
                        <span>← Back to Portal Selection</span>
                    </Link>
                </div>
            </div>
        );
    }

    const Icon = config.icon;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setAccessDenied({ show: false, correctIndustry: '', companyName: '' });
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;
            const userSnapshot = await get(ref(database, `users/${user.uid}`));

            if (!userSnapshot.exists()) {
                throw new Error('User profile not found');
            }

            const userData = userSnapshot.val();
            const companyId = userData.companyId;

            if (!companyId) {
                throw new Error('No company associated with this account');
            }

            const idToken = await user.getIdToken();
            const validationResponse = await fetch('/api/auth/validate-industry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.uid,
                    companyId,
                    selectedIndustry: industry,
                    idToken
                }),
            });

            const validationResult = await validationResponse.json();

            if (!validationResult.valid) {
                await auth.signOut();
                setAccessDenied({
                    show: true,
                    correctIndustry: validationResult.correctIndustry,
                    companyName: validationResult.companyName || 'Your company'
                });
                setLoading(false);
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 100));
            window.location.href = `/portals/${industry}/dashboard`;

        } catch (err: any) {
            console.error('Login error:', err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                setError('Invalid email or password');
            } else if (err.code === 'auth/user-not-found') {
                setError('No account found with this email');
            } else {
                setError(err.message || 'Login failed. Please try again.');
            }
            setLoading(false);
        }
    };

    // Access Denied Screen
    if (accessDenied.show) {
        const correctConfig = industryConfig[accessDenied.correctIndustry];
        const CorrectIcon = correctConfig?.icon || Smartphone;

        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="fixed inset-0 gradient-mesh -z-10" />
                <div className="noise" />

                <div className={`glass-card p-8 max-w-md w-full text-center ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/25">
                        <XCircle className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p className="text-muted-foreground mb-6">
                        <strong>{accessDenied.companyName}</strong> is registered for the{' '}
                        <strong className="gradient-text">{correctConfig?.name}</strong> portal,
                        not {config.name}.
                    </p>

                    <div className="glass p-4 rounded-xl mb-6">
                        <p className="text-sm text-muted-foreground mb-3">You have access to:</p>
                        <div className={`inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r ${correctConfig?.gradient} text-white rounded-xl shadow-lg`}>
                            <CorrectIcon className="w-5 h-5" />
                            <span className="font-medium">{correctConfig?.name} Portal</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Link
                            href={`/login/${accessDenied.correctIndustry}`}
                            className={`block w-full py-3 bg-gradient-to-r ${correctConfig?.gradient} text-white rounded-xl font-medium hover:opacity-90 transition shadow-lg`}
                        >
                            Go to {correctConfig?.name} Portal
                        </Link>
                        <Link
                            href="/login"
                            className="block w-full py-3 glass text-foreground rounded-xl font-medium hover:bg-muted transition"
                        >
                            Back to Portal Selection
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-background overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 gradient-mesh -z-10" />
            <div className="noise" />

            {/* Floating Orbs */}
            <div className={`fixed top-20 left-20 w-80 h-80 bg-gradient-to-br ${config.lightGradient} rounded-full blur-3xl animate-float opacity-60 dark:opacity-30`} />
            <div className="fixed bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float-delayed opacity-50 dark:opacity-20" />

            {/* Left Side - Branding */}
            <div className={`hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12`}>
                {/* Gradient Background with Glass */}
                <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-90`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />

                <div className="relative z-10">
                    <Link href="/login" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Portals
                    </Link>
                </div>

                <div className="relative z-10 text-white">
                    <div className={`w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center mb-8 shadow-2xl animate-float`}>
                        <Icon className="w-12 h-12" />
                    </div>
                    <h1 className="text-5xl font-bold mb-6">{config.name} Portal</h1>
                    <p className="text-xl text-white/80 max-w-md leading-relaxed">
                        Access your {config.name.toLowerCase()} management dashboard with AI-powered customer service tools.
                    </p>
                </div>

                <div className="relative z-10 text-white/60 text-sm">
                    © 2025 AI Customer Service Platform. All rights reserved.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col">
                {/* Mobile Header with Theme Toggle */}
                <div className="flex justify-end p-4">
                    <ThemeToggle />
                </div>

                <div className="flex-1 flex items-center justify-center p-8">
                    <div className={`w-full max-w-md ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
                        {/* Mobile Header */}
                        <div className="lg:hidden mb-8">
                            <Link href="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition mb-6 group">
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Back to Portals
                            </Link>
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold">{config.name}</h1>
                            </div>
                        </div>

                        <div className="glass-card p-8">
                            <div className="mb-8 text-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm mb-4">
                                    <Sparkles className="w-4 h-4 text-yellow-500" />
                                    <span>Secure Login</span>
                                </div>
                                <h2 className="text-2xl font-bold">Welcome Back</h2>
                                <p className="text-muted-foreground mt-2">Sign in to your {config.name} account</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm border border-red-500/20">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="input-field"
                                        placeholder="you@company.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="input-field"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-gradient-to-r ${config.gradient} text-white py-3.5 rounded-xl hover:opacity-90 transition font-medium flex justify-center items-center gap-2 shadow-lg disabled:opacity-50`}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <Link href={`/signup?industry=${industry}`} className="gradient-text font-medium hover:underline">
                                    Create one
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
