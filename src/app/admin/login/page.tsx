'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, database } from '@/lib/firebase/client';
import {
    ShieldAlert,
    Loader2,
    Lock,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 1. Authenticate with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // 2. Check User Role
            const userSnapshot = await get(ref(database, `users/${user.uid}`));

            if (!userSnapshot.exists()) {
                throw new Error('User profile not found');
            }

            const userData = userSnapshot.val();

            if (userData.role !== 'platform_admin') {
                await auth.signOut();
                throw new Error('Access Denied: You do not have administrator privileges.');
            }

            // 3. Success - Redirect to Admin Dashboard
            // Small delay to ensure cookie is set if we were using server actions, 
            // but here we rely on client-side auth state or middleware picking up the session
            await new Promise(resolve => setTimeout(resolve, 500));
            window.location.href = '/admin/dashboard';

        } catch (err: any) {
            console.error('Admin login error:', err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                setError('Invalid credentials');
            } else {
                setError(err.message || 'Login failed');
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="p-8 text-center border-b border-slate-800 bg-slate-900/50">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20">
                            <ShieldAlert className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Platform Admin</h1>
                        <p className="text-slate-400 text-sm">Restricted Access Portal</p>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Admin Email</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-4 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition"
                                        placeholder="admin@platform.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-4 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition"
                                        placeholder="••••••••••••"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Verifying Access...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4" />
                                        Authenticate
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-slate-950/30 border-t border-slate-800 text-center">
                        <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                            <Lock className="w-3 h-3" />
                            Secure Connection • 256-bit Encryption
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
