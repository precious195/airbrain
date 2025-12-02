'use client';

import { useIndustry } from '@/components/portals/PortalLayout';
import { useState, useEffect } from 'react';
import { Tv, TrendingUp, Users, DollarSign, Zap } from 'lucide-react';

export default function TelevisionDashboard() {
    const industry = useIndustry();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 500);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const stats = [
        { label: 'Active Subscribers', value: '1.1M', change: '+4%', icon: Users, positive: true },
        { label: 'New Subscriptions', value: '5,680', change: '+18%', icon: TrendingUp, positive: true },
        { label: 'Revenue This Month', value: 'K22M', change: '+9%', icon: DollarSign, positive: true },
        { label: 'Service Uptime', value: '99.8%', change: '+0.1%', icon: Zap, positive: true },
    ];

    const topPackages = [
        { name: 'Premium HD', subscribers: 345000, revenue: 'K8.6M', change: '+12%' },
        { name: 'Sports Package', subscribers: 287000, revenue: 'K7.2M', change: '+8%' },
        { name: 'Family Bundle', subscribers: 256000, revenue: 'K5.1M', change: '+15%' },
        { name: 'Basic Package', subscribers: 198000, revenue: 'K2.0M', change: '+3%' },
    ];

    const recentIssues = [
        { id: 'ISS-001', customer: 'SUB-XXXX-1234', issue: 'No signal on decoder', status: 'resolved', time: '10min ago' },
        { id: 'ISS-002', customer: 'SUB-XXXX-5678', issue: 'Subscription not activated', status: 'in_progress', time: '25min ago' },
        { id: 'ISS-003', customer: 'SUB-XXXX-9012', issue: 'Payment confirmation pending', status: 'pending', time: '1hr ago' },
        { id: 'ISS-004', customer: 'SUB-XXXX-3456', issue: 'Channel not showing', status: 'resolved', time: '2hrs ago' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Television Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage subscriptions, packages, and customer service</p>
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
                {/* Top Packages */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">📺 Top Packages</h2>
                    <div className="space-y-4">
                        {topPackages.map((pkg, index) => (
                            <div key={pkg.name} className="pb-4 border-b border-gray-100 last:border-0">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center bg-pink-100 text-pink-700 rounded-full font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{pkg.name}</div>
                                            <div className="text-sm text-gray-500">{pkg.subscribers.toLocaleString()} subscribers</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-pink-600">{pkg.revenue}</div>
                                        <div className="text-xs text-green-600">{pkg.change}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Support Issues */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">🎫 Recent Support Issues</h2>
                    <div className="space-y-4">
                        {recentIssues.map((issue) => (
                            <div key={issue.id} className="pb-4 border-b border-gray-100 last:border-0">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{issue.issue}</div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {issue.customer} • {issue.time}
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${issue.status === 'resolved'
                                            ? 'bg-green-100 text-green-700'
                                            : issue.status === 'in_progress'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {issue.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl shadow-lg p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition">
                        <div className="text-sm opacity-90">Add</div>
                        <div className="font-bold">New Package</div>
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition">
                        <div className="text-sm opacity-90">View</div>
                        <div className="font-bold">Subscribers</div>
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition">
                        <div className="text-sm opacity-90">Process</div>
                        <div className="font-bold">Payments</div>
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition">
                        <div className="text-sm opacity-90">Generate</div>
                        <div className="font-bold">Report</div>
                    </button>
                </div>
            </div>
        </div>
    );
}
