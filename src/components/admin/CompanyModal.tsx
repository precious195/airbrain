'use client';

import { useState } from 'react';
import {
    X,
    Building2,
    Globe,
    CreditCard,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { IndustryType } from '@/components/portals/PortalLayout';

interface CompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
}

export default function CompanyModal({ isOpen, onClose, onSubmit }: CompanyModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        industry: 'mobile' as IndustryType,
        domain: '',
        plan: 'pro'
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Error creating company:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 animate-slide-up">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        Add New Company
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Company Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Acme Telecom"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Industry</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.industry}
                            onChange={e => setFormData({ ...formData, industry: e.target.value as IndustryType })}
                        >
                            <option value="mobile">Mobile Telecom</option>
                            <option value="banking">Banking</option>
                            <option value="insurance">Insurance</option>
                            <option value="microfinance">Microfinance</option>
                            <option value="television">Television</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Custom Domain (Optional)</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="portal.company.com"
                                value={formData.domain}
                                onChange={e => setFormData({ ...formData, domain: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Subscription Plan</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['starter', 'pro', 'enterprise'].map((plan) => (
                                <button
                                    key={plan}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, plan })}
                                    className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${formData.plan === plan
                                            ? 'border-blue-500 bg-blue-500/10 text-blue-600'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    {plan}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Create Company
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
