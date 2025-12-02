'use client';

import { useIndustry } from '@/components/portals/PortalLayout';
import { useState, useEffect } from 'react';
import {
    Building2,
    TrendingUp,
    Users,
    DollarSign,
    Shield
} from 'lucide-react';

export default function BankingDashboard() {
    const industry = useIndustry();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 500);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const stats = [
        { label: 'Total Accounts', value: '500K', change: '+5%', icon: Users, positive: true },
        { label: 'Transactions Today', value: '25,680', change: '+12%', icon: TrendingUp, positive: true },
        { label: 'Fraud Alerts', value: '8', change: '-20%', icon: Shield, positive: true },
        { label: 'Transaction Volume', value: 'K12.5M', change: '+18%', icon: DollarSign, positive: true },
    ];

    const topTransactions = [
        { type: 'Transfer', count: 12450, volume: 'K5.2M' },
        { type: 'Balance Inquiry', count: 8760, volume: 'N/A' },
        { type: 'Bill Payment', count: 3210, volume: 'K2.1M' },
        { type: 'Airtime Purchase', count: 2680, volume: 'K450K' },
    ];

    const recentAlerts = [
        { id: '001', account: 'ACC-XXXX-1234', alert: 'Multiple failed login attempts', severity: 'high', time: '2min ago' },
        { id: '002', account: 'ACC-XXXX-5678', alert: 'Large transaction detected', severity: 'medium', time: '15min ago' },
        { id: '003', account: 'ACC-XXXX-9012', alert: 'Unusual location access', severity: 'high', time: '28min ago' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Banking Dashboard</h1>
                <p className="text-gray-600 mt-1">Monitor accounts, transactions, and security</p>
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
                                {stat.change} from yesterday
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Top Transactions */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">💳 Top Transaction Types</h2>
                    <div className="space-y-4">
                        {topTransactions.map((transaction, index) => (
                            <div key={transaction.type} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-700 rounded-full font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{transaction.type}</div>
                                        <div className="text-sm text-gray-500">{transaction.count} transactions</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-green-600">{transaction.volume}</div>
                                    <div className="text-xs text-gray-500">volume</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security Alerts */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">🔒 Security Alerts</h2>
                    <div className="space-y-4">
                        {recentAlerts.map((alert) => (
                            <div key={alert.id} className="pb-4 border-b border-gray-100 last:border-0">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{alert.alert}</div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {alert.account} • {alert.time}
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${alert.severity === 'high'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {alert.severity}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition">
                        <div className="text-sm opacity-90">Create</div>
                        <div className="font-bold">New Account</div>
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition">
                        <div className="text-sm opacity-90">View</div>
                        <div className="font-bold">All Customers</div>
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition">
                        <div className="text-sm opacity-90">Generate</div>
                        <div className="font-bold">Report</div>
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition">
                        <div className="text-sm opacity-90">Review</div>
                        <div className="font-bold">Alerts</div>
                    </button>
                </div>
            </div>
        </div>
    );
}
