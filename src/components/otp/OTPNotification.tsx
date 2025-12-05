'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, X, Clock, Loader2, AlertTriangle } from 'lucide-react';

interface OTPRequest {
    id: string;
    sessionId: string;
    companyId: string;
    systemUrl: string;
    systemName: string;
    otpType: 'sms' | 'email' | 'authenticator' | 'unknown';
    message: string;
    createdAt: number;
    expiresAt: number;
    status: 'pending' | 'received' | 'submitted' | 'expired' | 'cancelled';
}

interface OTPNotificationProps {
    companyId: string;
    pollInterval?: number;
}

export default function OTPNotification({ companyId, pollInterval = 3000 }: OTPNotificationProps) {
    const [requests, setRequests] = useState<OTPRequest[]>([]);
    const [otpValues, setOtpValues] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);

    // Poll for pending OTP requests
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await fetch(`/api/otp?companyId=${companyId}`);
                if (response.ok) {
                    const data = await response.json();
                    setRequests(data.requests || []);
                }
            } catch (err) {
                console.error('Failed to fetch OTP requests:', err);
            }
        };

        fetchRequests();
        const interval = setInterval(fetchRequests, pollInterval);
        return () => clearInterval(interval);
    }, [companyId, pollInterval]);

    const handleSubmitOTP = async (requestId: string) => {
        const otpValue = otpValues[requestId];
        if (!otpValue || otpValue.length < 4) {
            setError('Please enter a valid OTP code');
            return;
        }

        setSubmitting(prev => ({ ...prev, [requestId]: true }));
        setError(null);

        try {
            const response = await fetch('/api/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, otpValue })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to submit OTP');
            }

            // Remove from local state
            setRequests(prev => prev.filter(r => r.id !== requestId));
            setOtpValues(prev => {
                const updated = { ...prev };
                delete updated[requestId];
                return updated;
            });

        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(prev => ({ ...prev, [requestId]: false }));
        }
    };

    const handleCancelOTP = async (requestId: string) => {
        try {
            await fetch('/api/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, action: 'cancel' })
            });

            setRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (err) {
            console.error('Failed to cancel OTP:', err);
        }
    };

    const getTimeRemaining = (expiresAt: number): string => {
        const remaining = Math.max(0, expiresAt - Date.now());
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getOTPTypeIcon = (type: string) => {
        switch (type) {
            case 'sms':
                return '📱';
            case 'email':
                return '📧';
            case 'authenticator':
                return '🔐';
            default:
                return '🔒';
        }
    };

    if (requests.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md">
            {requests.map(request => (
                <div
                    key={request.id}
                    className="bg-white rounded-xl shadow-2xl border border-orange-200 overflow-hidden animate-slide-in"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white">
                            <ShieldCheck className="w-5 h-5" />
                            <span className="font-semibold">OTP Required</span>
                        </div>
                        <button
                            onClick={() => handleCancelOTP(request.id)}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4">
                        {/* System Info */}
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{getOTPTypeIcon(request.otpType)}</span>
                            <div>
                                <p className="font-medium text-gray-900">{request.systemName}</p>
                                <p className="text-sm text-gray-500">{request.message}</p>
                            </div>
                        </div>

                        {/* Timer */}
                        <div className="flex items-center gap-2 text-sm text-orange-600">
                            <Clock className="w-4 h-4" />
                            <span>Expires in {getTimeRemaining(request.expiresAt)}</span>
                        </div>

                        {/* OTP Input */}
                        <div>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={8}
                                placeholder="Enter OTP code"
                                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                value={otpValues[request.id] || ''}
                                onChange={e => setOtpValues(prev => ({
                                    ...prev,
                                    [request.id]: e.target.value.replace(/\D/g, '')
                                }))}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        handleSubmitOTP(request.id);
                                    }
                                }}
                                autoFocus
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-600 text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleCancelOTP(request.id)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSubmitOTP(request.id)}
                                disabled={submitting[request.id] || !otpValues[request.id]}
                                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {submitting[request.id] ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <style jsx>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
