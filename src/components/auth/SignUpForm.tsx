'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, RegistrationData } from '@/lib/auth/auth-service';
import { IndustryType } from '@/types/database';
import { Loader2, AlertCircle, Sparkles, Building2, User, Mail, Lock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SignUpForm() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<RegistrationData>({
        email: '',
        password: '',
        fullName: '',
        companyName: '',
        industry: 'mobile'
    });

    const industries: { id: IndustryType; label: string }[] = [
        { id: 'mobile', label: 'Mobile Telecom' },
        { id: 'banking', label: 'Banking' },
        { id: 'insurance', label: 'Insurance' },
        { id: 'microfinance', label: 'Microfinance' },
        { id: 'television', label: 'Television' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { company } = await authService.registerCompany(formData);
            // Redirect to dashboard
            router.push(`/portals/${company.industry}/dashboard`);
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Failed to register. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-8">
            <div className="mb-8 text-center">
                <div className="flex justify-center mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                        <div className={`w-12 h-1 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                        <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold">
                    {step === 1 ? 'Personal Details' : 'Company Information'}
                </h2>
                <p className="text-muted-foreground mt-2">
                    {step === 1 ? 'Tell us about yourself' : 'Set up your organization'}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {step === 1 && (
                    <div className="space-y-4 animate-slide-up">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    required
                                    className="input-field pl-10"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    required
                                    className="input-field pl-10"
                                    placeholder="john@company.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                        >
                            Next Step
                            <CheckCircle className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-slide-up">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Company Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    required
                                    className="input-field pl-10"
                                    placeholder="Acme Inc."
                                    value={formData.companyName}
                                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Industry</label>
                            <select
                                className="input-field"
                                value={formData.industry}
                                onChange={e => setFormData({ ...formData, industry: e.target.value as IndustryType })}
                            >
                                {industries.map(ind => (
                                    <option key={ind.id} value={ind.id}>{ind.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 px-4 py-2 rounded-xl border border-border hover:bg-muted transition font-medium"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 btn-primary flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Create Account
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="gradient-text font-medium hover:underline">
                    Log in
                </Link>
            </div>
        </div>
    );
}
