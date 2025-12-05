'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Smartphone, Building2, Shield, Landmark, Tv, ArrowRight } from 'lucide-react';
import { Suspense } from 'react';

const industryConfig: Record<string, { name: string; icon: any; color: string; bgGradient: string }> = {
    mobile: {
        name: 'Mobile Telecom',
        icon: Smartphone,
        color: 'text-blue-600',
        bgGradient: 'from-blue-500 to-blue-600'
    },
    banking: {
        name: 'Banking',
        icon: Building2,
        color: 'text-green-600',
        bgGradient: 'from-green-500 to-green-600'
    },
    insurance: {
        name: 'Insurance',
        icon: Shield,
        color: 'text-purple-600',
        bgGradient: 'from-purple-500 to-purple-600'
    },
    microfinance: {
        name: 'Microfinance',
        icon: Landmark,
        color: 'text-orange-600',
        bgGradient: 'from-orange-500 to-orange-600'
    },
    television: {
        name: 'Television',
        icon: Tv,
        color: 'text-pink-600',
        bgGradient: 'from-pink-500 to-pink-600'
    }
};

function UnauthorizedContent() {
    const searchParams = useSearchParams();
    const attemptedIndustry = searchParams.get('attempted');
    const allowedIndustry = searchParams.get('allowed');

    const attemptedConfig = attemptedIndustry ? industryConfig[attemptedIndustry] : null;
    const allowedConfig = allowedIndustry ? industryConfig[allowedIndustry] : null;
    const AllowedIcon = allowedConfig?.icon || Smartphone;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                {/* Error Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="w-10 h-10 text-red-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h1>

                    <p className="text-gray-600 mb-6">
                        You attempted to access the{' '}
                        <strong className={attemptedConfig?.color}>{attemptedConfig?.name || 'unknown'}</strong> portal,
                        but your account only has access to{' '}
                        <strong className={allowedConfig?.color}>{allowedConfig?.name || 'a different portal'}</strong>.
                    </p>

                    {/* Security Notice */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm text-amber-800">
                            <strong>🔒 Security Notice:</strong> For data protection, each company can only access
                            their designated industry portal. This prevents unauthorized access to sensitive information.
                        </p>
                    </div>

                    {/* Allowed Portal */}
                    {allowedConfig && (
                        <div className="mb-6">
                            <p className="text-sm text-gray-500 mb-3">Your authorized portal:</p>
                            <div className={`inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r ${allowedConfig.bgGradient} text-white rounded-xl shadow-lg`}>
                                <AllowedIcon className="w-6 h-6" />
                                <span className="font-semibold text-lg">{allowedConfig.name}</span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {allowedIndustry && (
                            <Link
                                href={`/portals/${allowedIndustry}/dashboard`}
                                className={`flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r ${allowedConfig?.bgGradient} text-white rounded-lg font-medium hover:opacity-90 transition`}
                            >
                                Go to {allowedConfig?.name} Dashboard
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}
                        <Link
                            href="/login"
                            className="block w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                        >
                            Sign in with Different Account
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    If you believe this is an error, please contact your administrator.
                </p>
            </div>
        </div>
    );
}

export default function UnauthorizedPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        }>
            <UnauthorizedContent />
        </Suspense>
    );
}
