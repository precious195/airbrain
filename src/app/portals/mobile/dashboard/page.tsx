'use client';

import { useIndustry, useCompany } from '@/components/portals/PortalLayout';
import { useState, useEffect } from 'react';
import {
    Smartphone,
    TrendingUp,
    Users,
    DollarSign,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles
} from 'lucide-react';
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist';
import AIChatTester from '@/components/dashboard/AIChatTester';
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

            const bundlesData = await dataService.getAll<Bundle>(company.id, 'bundles');
            setBundles(bundlesData);

            const ticketsData = await dataService.getAll<Ticket>(company.id, 'tickets');
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
                    <div className={`animate-spin rounded-full h-12 w-12 border-2 border-transparent bg-gradient-to-r ${industry.gradient} mx-auto mb-4`}
                        style={{ borderTopColor: 'currentColor', borderRightColor: 'currentColor' }}
                    ></div>
                    <p className="text-muted-foreground">Loading dashboard...</p>
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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Mobile Telecom Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Real-time overview of your mobile service operations</p>
                </div>
                <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${industry.lightGradient} flex items-center gap-2`}>
                    <Sparkles className={`w-4 h-4 ${industry.color}`} />
                    <span className="text-sm font-medium">Live Data</span>
                </div>
            </div>

            <OnboardingChecklist />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="glass-card p-6 hover:shadow-xl transition-all duration-300 animate-slide-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-muted-foreground text-sm font-medium">{stat.label}</span>
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${industry.gradient} flex items-center justify-center`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold mb-2">{stat.value}</div>
                            <div className={`flex items-center gap-1 text-sm ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                                {stat.positive ? (
                                    <ArrowUpRight className="w-4 h-4" />
                                ) : (
                                    <ArrowDownRight className="w-4 h-4" />
                                )}
                                {stat.change} from yesterday
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Bundles */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="text-2xl">📊</span>
                        Top Selling Bundles
                    </h2>
                    {bundles.length > 0 ? (
                        <div className="space-y-4">
                            {bundles.slice(0, 4).map((bundle, index) => (
                                <div key={bundle.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 flex items-center justify-center bg-gradient-to-br ${industry.gradient} text-white rounded-lg font-bold text-sm`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium">{bundle.name}</div>
                                            <div className="text-sm text-muted-foreground">{bundle.dataAmount} • {bundle.validity}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-500">K{bundle.price}</div>
                                        <div className="text-xs text-muted-foreground">per bundle</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No bundles configured yet.</p>
                            <p className="text-sm mt-2">Add bundles in Data Management to see them here.</p>
                        </div>
                    )}
                </div>

                {/* Recent Tickets */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="text-2xl">🎫</span>
                        Recent Support Tickets
                    </h2>
                    {tickets.length > 0 ? (
                        <div className="space-y-4">
                            {tickets.map((ticket) => (
                                <div key={ticket.id} className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="font-medium">{ticket.issue}</div>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {ticket.customerPhone} • {getTimeAgo(ticket.createdAt)}
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ticket.status === 'resolved' || ticket.status === 'closed'
                                                ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                                                : ticket.status === 'in_progress'
                                                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                                    : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                                            }`}>
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No support tickets yet.</p>
                            <p className="text-sm mt-2">Customer inquiries will appear here.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Chat Tester & Quick Actions */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-2xl">🤖</span>
                    Test AI Agent
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className={`rounded-2xl p-8 bg-gradient-to-br ${industry.gradient} text-white h-full flex flex-col justify-center relative overflow-hidden`}>
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform -translate-x-5 translate-y-5" />

                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button className="glass p-4 rounded-xl text-left hover:bg-white/20 transition group">
                                        <div className="text-sm opacity-80">Create</div>
                                        <div className="font-bold group-hover:translate-x-1 transition-transform">New Bundle →</div>
                                    </button>
                                    <button className="glass p-4 rounded-xl text-left hover:bg-white/20 transition group">
                                        <div className="text-sm opacity-80">View</div>
                                        <div className="font-bold group-hover:translate-x-1 transition-transform">All Customers →</div>
                                    </button>
                                    <button className="glass p-4 rounded-xl text-left hover:bg-white/20 transition group">
                                        <div className="text-sm opacity-80">Generate</div>
                                        <div className="font-bold group-hover:translate-x-1 transition-transform">Sales Report →</div>
                                    </button>
                                    <button className="glass p-4 rounded-xl text-left hover:bg-white/20 transition group">
                                        <div className="text-sm opacity-80">Manage</div>
                                        <div className="font-bold group-hover:translate-x-1 transition-transform">Promotions →</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <AIChatTester />
                    </div>
                </div>
            </div>
        </div>
    );
}
