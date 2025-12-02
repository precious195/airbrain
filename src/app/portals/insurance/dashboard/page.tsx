'use client';

import { useIndustry } from '@/components/portals/PortalLayout';
import { useState, useEffect } from 'react';
import { Shield, FileText, DollarSign, CheckCircle, Clock } from 'lucide-react';

export default function InsuranceDashboard() {
    const industry = useIndustry();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 500);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const stats = [
        { label: 'Active Policies', value: '350K', change: '+3%', icon: Shield, positive: true },
        { label: 'Claims This Month', value: '1,245', change: '+8%', icon: FileText, positive: false },
        { label: 'Premium Collected', value: 'K15.2M', change: '+12%', icon: DollarSign, positive: true },
        { label: 'Processing Time', value: '2.5 days', change: '-18%', icon: Clock, positive: true },
    ];

    const recentClaims = [
        { id: 'CLM-001', policy: 'Life Insurance', amount: 'K50,000', status: 'approved', date: 'Today' },
        { id: 'CLM-002', policy: 'Auto Insurance', amount: 'K12,000', status: 'pending', date: 'Yesterday' },
        { id: 'CLM-003', policy: 'Health Insurance', amount: 'K8,500', status: 'under_review', date: '2 days ago' },
        { id: 'CLM-004', policy: 'Property Insurance', amount: 'K35,000', status: 'approved', date: '3 days ago' },
    ];

    const policyStats = [
        { type: 'Life Insurance', active: 145000, renewals: 1200 },
        { type: 'Health Insurance', active: 98000, renewals: 850 },
        { type: 'Auto Insurance', active: 67000, renewals: 620 },
        { type: 'Property Insurance', active: 42000, renewals: 380 },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Insurance Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage policies, claims, and renewals</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-600 text-sm font-medium">{stat.label}</span>
                                <Icon className={`w-8 h-8 ${industry.color}`} />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                            <div className={`text-sm ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.change} from last month
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Recent Claims */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Recent Claims</h2>
                    <div className="space-y-4">
                        {recentClaims.map((claim) => (
                            <div key={claim.id} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{claim.id}</div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        {claim.policy} • {claim.date}
                                    </div>
                                </div>
                                <div className="text-right mr-4">
                                    <div className="font-bold text-gray-900">{claim.amount}</div>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${claim.status === 'approved'
                                        ? 'bg-green-100 text-green-700'
                                        : claim.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {claim.status.replace('_', ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Policy Distribution */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Policy Distribution</h2>
                    <div className="space-y-4">
                        {policyStats.map((policy, index) => (
                            <div key={policy.type} className="pb-4 border-b border-gray-100 last:border-0">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium text-gray-900">{policy.type}</div>
                                    <div className="text-sm text-gray-500">{policy.active.toLocaleString()} active</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full"
                                            style={{ width: `${(policy.active / 145000) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-green-600 font-semibold">
                                        {policy.renewals} renewals
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition">
                        <div className="text-sm opacity-90">Process</div>
                        <div className="font-bold">New Claim</div>
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition">
                        <div className="text-sm opacity-90">Issue</div>
                        <div className="font-bold">New Policy</div>
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition">
                        <div className="text-sm opacity-90">Generate</div>
                        <div className="font-bold">Quote</div>
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition">
                        <div className="text-sm opacity-90">View</div>
                        <div className="font-bold">Renewals</div>
                    </button>
                </div>
            </div>
        </div>
    );
}
