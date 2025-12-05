'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase/client';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface IndustryContextType {
    industry: string;
    companyId: string;
    companyName: string;
    isValidated: boolean;
}

const IndustryContext = createContext<IndustryContextType | null>(null);

export const useIndustryContext = () => {
    const context = useContext(IndustryContext);
    if (!context) {
        throw new Error('useIndustryContext must be used within IndustryGuard');
    }
    return context;
};

interface IndustryGuardProps {
    children: ReactNode;
    requiredIndustry: string;
}

export function IndustryGuard({ children, requiredIndustry }: IndustryGuardProps) {
    const { user, loading: authLoading } = useAuth();
    const [state, setState] = useState<{
        loading: boolean;
        error: string | null;
        companyId: string;
        companyName: string;
        userIndustry: string;
        isValid: boolean;
    }>({
        loading: true,
        error: null,
        companyId: '',
        companyName: '',
        userIndustry: '',
        isValid: false
    });

    useEffect(() => {
        async function validateIndustryAccess() {
            if (authLoading || !user) return;

            try {
                // Fetch user data
                const userSnapshot = await get(ref(database, `users/${user.uid}`));
                if (!userSnapshot.exists()) {
                    setState(prev => ({ ...prev, loading: false, error: 'User profile not found' }));
                    return;
                }

                const userData = userSnapshot.val();
                const companyId = userData.companyId;

                if (!companyId) {
                    setState(prev => ({ ...prev, loading: false, error: 'No company associated' }));
                    return;
                }

                // Fetch company data
                const companySnapshot = await get(ref(database, `companies/${companyId}`));
                if (!companySnapshot.exists()) {
                    setState(prev => ({ ...prev, loading: false, error: 'Company not found' }));
                    return;
                }

                const company = companySnapshot.val();
                const userIndustry = company.industry;
                const isValid = userIndustry === requiredIndustry;

                setState({
                    loading: false,
                    error: isValid ? null : `Access denied for ${requiredIndustry} portal`,
                    companyId,
                    companyName: company.name || 'Unknown Company',
                    userIndustry,
                    isValid
                });
            } catch (error) {
                console.error('Industry validation error:', error);
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: 'Failed to validate access'
                }));
            }
        }

        validateIndustryAccess();
    }, [user, authLoading, requiredIndustry]);

    // Loading state
    if (authLoading || state.loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-gray-500 font-medium">Validating access...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Please sign in to continue</p>
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    // Access denied
    if (!state.isValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-6">
                        Your company ({state.companyName}) is registered for the{' '}
                        <strong>{state.userIndustry}</strong> portal, not {requiredIndustry}.
                    </p>
                    <div className="space-y-3">
                        <Link
                            href={`/portals/${state.userIndustry}/dashboard`}
                            className="block w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                            Go to Your Portal
                        </Link>
                        <Link
                            href="/login"
                            className="block w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                        >
                            Sign in with Different Account
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Access granted - provide context to children
    return (
        <IndustryContext.Provider value={{
            industry: requiredIndustry,
            companyId: state.companyId,
            companyName: state.companyName,
            isValidated: true
        }}>
            {children}
        </IndustryContext.Provider>
    );
}
