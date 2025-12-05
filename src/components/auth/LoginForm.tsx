'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth/auth-service';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginForm() {
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
            const user = await authService.login(formData.email, formData.password);

            // Redirect to industry portal dashboard
            // Note: In a real app, we'd fetch the company's industry. 
            // For now, we might need to store industry in the user record or fetch the company.
            // Let's assume the authService.login returns the user with companyId, 
            // and we can fetch the company to get the industry, or just redirect to a generic portal if industry is missing.

            // Wait, authService.login returns User which has companyId.
            // But User interface doesn't strictly have industry. 
            // We should probably fetch the company to get the industry.
            // For this prototype, let's just redirect to 'mobile' or fetch the company.

            // Set session cookie via API - use Firebase's currentUser for getting the token
            const { auth } = await import('@/lib/firebase/client');
            const firebaseUser = auth.currentUser;
            if (!firebaseUser) throw new Error('No Firebase session');
            const idToken = await firebaseUser.getIdToken();
            await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });

            // Let's quickly fetch the company to get the industry
            const { ref, get } = await import('firebase/database');
            const { database } = await import('@/lib/firebase/client');
            const companySnapshot = await get(ref(database, `companies/${user.companyId}`));

            if (companySnapshot.exists()) {
                const company = companySnapshot.val();
                router.push(`/portals/${company.industry}/dashboard`);
            } else {
                throw new Error('Company profile not found');
            }

        } catch (err: any) {
            console.error('Login error:', err);
            setError('Invalid email or password');
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                <p className="text-gray-500 mt-2">Sign in to your account</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium flex justify-center items-center gap-2"
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

            <div className="mt-6 text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                    Create one
                </Link>
            </div>
        </div>
    );
}
