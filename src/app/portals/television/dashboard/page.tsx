'use client';

import { useIndustry, useCompany } from '@/components/portals/PortalLayout';
import { useState, useEffect } from 'react';
import {
    Smartphone,
    TrendingUp,
    Users,
    DollarSign,
    AlertCircle
} from 'lucide-react';
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist';
import { dataService } from '@/lib/data/data-service';

interface DashboardStats {
    activeSubscribers: number;
    bundleSalesToday: number;
    networkIssues: number;
    dataUsageTB: number;
}

interface Bundle {
    id: string;
    name: string;
    price: number;
    dataAmount: string;
    validity: string;
}

interface Ticket {
    id: string;
    customerId: string;
    customerPhone: string;
    issue: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    createdAt: number;
}

export default function MobileDashboard() {
    const industry = useIndustry();
    const company = useCompany();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [bundles, setBundles] = useState<Bundle[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, [company.id]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Load stats
            const statsData = await dataService.getById<DashboardStats>(
                company.id,
                'stats',
                'mobile'
            );
            setStats(statsData || {
                activeSubscribers: 0,
                bundleSalesToday: 0,
                networkIssues: 0,
                dataUsageTB: 0
            });

            // Load bundles
            const bundlesData = await dataService.getAll<Bundle>(company.id, 'bundles');
            setBundles(bundlesData);

            // Load recent tickets
            const ticketsData = await dataService.getAll<Ticket>(company.id, 'tickets');
            // Sort by createdAt descending and take top 5
            const recentTickets = ticketsData
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, 5);
            setTickets(recentTickets);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const getTimeAgo = (timestamp: number) => {
        const minutes = Math.floor((Date.now() - timestamp) / 60000);
        if (minutes < 60) return `${minutes}min ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const displayStats = [
        { label: 'Active Subscribers', value: formatNumber(stats?.activeSubscribers || 0), change: '+12%', icon: Users, positive: true },
        { label: 'Bundle Sales Today', value: formatNumber(stats?.bundleSalesToday || 0), change: '+8%', icon: DollarSign, positive: true },
        { label: 'Network Issues', value: stats?.networkIssues?.toString() || '0', change: '-15%', icon: AlertCircle, positive: true },
        { label: 'Data Usage (TB)', value: stats?.dataUsageTB?.toString() || '0', change: '+25%', icon: TrendingUp, positive: true },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Television Dashboard</h1>
                <p className="text-gray-600 mt-1">Real-time overview of your TV subscription operations</p>
            </div>

            <OnboardingChecklist />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {displayStats.map((stat) => {
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
                    {bundles.length > 0 ? (
                        <div className="space-y-4">
                            {bundles.slice(0, 4).map((bundle, index) => (
                                <div key={bundle.id} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{bundle.name}</div>
                                            <div className="text-sm text-gray-500">{bundle.dataAmount} • {bundle.validity}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-600">K{bundle.price}</div>
                                        <div className="text-xs text-gray-500">per bundle</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No bundles configured yet.</p>
                            <p className="text-sm mt-2">Add bundles in Data Management to see them here.</p>
                        </div>
                    )}
                </div>

                {/* Recent Tickets */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">🎫 Recent Support Tickets</h2>
                    {tickets.length > 0 ? (
                        <div className="space-y-4">
                            {tickets.map((ticket) => (
                                <div key={ticket.id} className="pb-4 border-b border-gray-100 last:border-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{ticket.issue}</div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {ticket.customerPhone} • {getTimeAgo(ticket.createdAt)}
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ticket.status === 'resolved' || ticket.status === 'closed'
                                            ? 'bg-green-100 text-green-700'
                                            : ticket.status === 'in_progress'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No support tickets yet.</p>
                            <p className="text-sm mt-2">Customer inquiries will appear here.</p>
                        </div>
                    )}
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
