'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { useState, useEffect } from 'react';
import {
    Building2,
    Users,
    Activity,
    Server,
    TrendingUp,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';
import { adminService, SystemStats } from '@/lib/admin/admin-service';
import { Company } from '@/types/database';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<SystemStats>({
        totalCompanies: 0,
        totalUsers: 0,
        activeSessions: 0,
        systemHealth: 'healthy',
        uptime: '99.99%'
    });
    const [recentSignups, setRecentSignups] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [systemStats, signups] = await Promise.all([
                adminService.getSystemStats(),
                adminService.getRecentSignups(5)
            ]);

            setStats(systemStats);
            setRecentSignups(signups);
        } catch (error) {
            console.error('Error loading admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTimeAgo = (timestamp: number) => {
        if (!timestamp) return 'Unknown';
        const minutes = Math.floor((Date.now() - timestamp) / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const getIndustryLabel = (industry: string) => {
        const labels: Record<string, string> = {
            mobile: 'Mobile Telecom',
            banking: 'Banking',
            insurance: 'Insurance',
            microfinance: 'Microfinance',
            television: 'Television'
        };
        return labels[industry] || industry;
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">System Overview</h1>
                        <p className="text-muted-foreground mt-1">Real-time platform monitoring and analytics</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${stats.systemHealth === 'healthy'
                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                            : stats.systemHealth === 'degraded'
                                ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                                : 'bg-red-500/10 text-red-600 border-red-500/20'
                        }`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${stats.systemHealth === 'healthy' ? 'bg-green-500'
                                : stats.systemHealth === 'degraded' ? 'bg-yellow-500'
                                    : 'bg-red-500'
                            }`} />
                        <span className="text-sm font-medium">
                            {stats.systemHealth === 'healthy' ? 'System Operational'
                                : stats.systemHealth === 'degraded' ? 'Degraded Performance'
                                    : 'System Issues'}
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 animate-pulse">
                                <div className="h-4 bg-muted rounded w-1/2 mb-4" />
                                <div className="h-8 bg-muted rounded w-1/3 mb-2" />
                                <div className="h-3 bg-muted rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            label="Total Companies"
                            value={stats.totalCompanies.toString()}
                            icon={Building2}
                            trend="Active tenants"
                            color="text-blue-500"
                            bgColor="bg-blue-500/10"
                        />
                        <StatCard
                            label="Total Users"
                            value={stats.totalUsers.toLocaleString()}
                            icon={Users}
                            trend="Across all companies"
                            color="text-purple-500"
                            bgColor="bg-purple-500/10"
                        />
                        <StatCard
                            label="Active Sessions"
                            value={stats.activeSessions.toString()}
                            icon={Activity}
                            trend="Current load"
                            color="text-orange-500"
                            bgColor="bg-orange-500/10"
                        />
                        <StatCard
                            label="System Uptime"
                            value={stats.uptime}
                            icon={Server}
                            trend="Last 30 days"
                            color="text-green-500"
                            bgColor="bg-green-500/10"
                        />
                    </div>
                )}

                {/* Recent Activity & Health */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* System Health */}
                    <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-500" />
                            System Health
                        </h2>
                        <div className="space-y-4">
                            <HealthItem label="Database Latency" value="12ms" status="healthy" />
                            <HealthItem label="API Response Time" value="45ms" status="healthy" />
                            <HealthItem label="AI Model Availability" value="100%" status="healthy" />
                            <HealthItem label="Storage Usage" value="45%" status="warning" />
                        </div>
                    </div>

                    {/* Recent Signups */}
                    <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-500" />
                            Recent Signups
                        </h2>
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 animate-pulse">
                                        <div className="w-10 h-10 rounded-full bg-muted" />
                                        <div className="flex-1">
                                            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                                            <div className="h-3 bg-muted rounded w-1/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recentSignups.length > 0 ? (
                            <div className="space-y-4">
                                {recentSignups.map((company) => (
                                    <div key={company.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{company.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {getIndustryLabel(company.industry)} • {company.settings?.plan || 'Free'} Plan
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{getTimeAgo(company.createdAt)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No companies signed up yet.</p>
                                <p className="text-sm mt-1">New signups will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({ label, value, icon: Icon, trend, color, bgColor }: any) {
    return (
        <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground text-sm font-medium">{label}</span>
                <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
            </div>
            <div className="text-3xl font-bold mb-2">{value}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-green-500" />
                {trend}
            </div>
        </div>
    );
}

function HealthItem({ label, value, status }: { label: string; value: string; status: 'healthy' | 'warning' | 'critical' }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <span className="font-medium text-sm">{label}</span>
            <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-muted-foreground">{value}</span>
                {status === 'healthy' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                {status === 'critical' && <AlertTriangle className="w-5 h-5 text-red-500" />}
            </div>
        </div>
    );
}
