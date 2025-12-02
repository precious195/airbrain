'use client';

import { useIndustry } from '@/components/portals/PortalLayout';
import { useState, useEffect } from 'react';
import {
    Smartphone,
    TrendingUp,
    Users,
    DollarSign,
    AlertCircle
} from 'lucide-react';

import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist';

export default function MobileDashboard() {
    const industry = useIndustry();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate data loading
        setTimeout(() => setLoading(false), 500);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const stats = [
        { label: 'Active Subscribers', value: '2.5M', change: '+12%', icon: Users, positive: true },
        { label: 'Bundle Sales Today', value: '15,234', change: '+8%', icon: DollarSign, positive: true },
        { label: 'Network Issues', value: '23', change: '-15%', icon: AlertCircle, positive: true },
        { label: 'Data Usage (TB)', value: '450', change: '+25%', icon: TrendingUp, positive: true },
    ];

    const topBundles = [
        { name: 'Daily 1GB', sold: 5234, revenue: 'K52,340' },
        { name: 'Weekly 5GB', sold: 3456, revenue: 'K172,800' },
        { name: '30-Day Unlimited', sold: 2100, revenue: 'K630,000' },
        { name: 'Social Bundle', sold: 4567, revenue: 'K91,340' },
    ];

    const recentTickets = [
        { id: '001', customer: '+260 97X XXX XXX', issue: 'Bundle activation failed', status: 'resolved', time: '5min ago' },
        { id: '002', customer: '+260 96X XXX XXX', issue: 'No network coverage', status: 'pending', time: '12min ago' },
        { id: '003', customer: '+260 95X XXX XXX', issue: 'Data balance inquiry', status: 'resolved', time: '25min ago' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Mobile Telecom Dashboard</h1>
                <p className="text-gray-600 mt-1">Real-time overview of your mobile service operations</p>
            </div>

            <OnboardingChecklist />

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
                                {stat.change} from yesterday
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Top Bundles */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Top Selling Bundles</h2>
                    <div className="space-y-4">
                        {topBundles.map((bundle, index) => (
                            <div key={bundle.name} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{bundle.name}</div>
                                        <div className="text-sm text-gray-500">{bundle.sold} sold today</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-green-600">{bundle.revenue}</div>
                                    <div className="text-xs text-gray-500">revenue</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Tickets */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">🎫 Recent Support Tickets</h2>
                    <div className="space-y-4">
                        {recentTickets.map((ticket) => (
                            <div key={ticket.id} className="pb-4 border-b border-gray-100 last:border-0">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{ticket.issue}</div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {ticket.customer} • {ticket.time}
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ticket.status === 'resolved'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {ticket.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition">
                        <div className="text-sm opacity-90">Create</div>
                        <div className="font-bold">New Bundle</div>
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition">
                        <div className="text-sm opacity-90">View</div>
                        <div className="font-bold">All Customers</div>
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition">
                        <div className="text-sm opacity-90">Generate</div>
                        <div className="font-bold">Sales Report</div>
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition">
                        <div className="text-sm opacity-90">Manage</div>
                        <div className="font-bold">Promotions</div>
                    </button>
                </div>
            </div>
        </div>
    );
}
