'use client';

import { useIndustry, useCompany, IndustryType } from '@/components/portals/PortalLayout';
import { useState, useEffect } from 'react';
import {
    TrendingUp,
    Users,
    DollarSign,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    MessageSquare,
    Clock,
    CheckCircle
} from 'lucide-react';
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist';
import AIChatTester from '@/components/dashboard/AIChatTester';
import { LucideIcon } from 'lucide-react';

interface DashboardConfig {
    title: string;
    subtitle: string;
    stats: {
        label: string;
        value: string;
        change: string;
        icon: LucideIcon;
        positive: boolean;
    }[];
    quickActions: {
        subtitle: string;
        title: string;
    }[];
}

const dashboardConfigs: Record<IndustryType, DashboardConfig> = {
    mobile: {
        title: 'Mobile Telecom Dashboard',
        subtitle: 'Real-time overview of your mobile service operations',
        stats: [
            { label: 'Active Subscribers', value: '2.4M', change: '+12%', icon: Users, positive: true },
            { label: 'Bundle Sales Today', value: '15.2K', change: '+8%', icon: DollarSign, positive: true },
            { label: 'Network Issues', value: '3', change: '-15%', icon: AlertCircle, positive: true },
            { label: 'Data Usage (TB)', value: '847', change: '+25%', icon: TrendingUp, positive: true },
        ],
        quickActions: [
            { subtitle: 'Create', title: 'New Bundle' },
            { subtitle: 'View', title: 'All Customers' },
            { subtitle: 'Generate', title: 'Sales Report' },
            { subtitle: 'Manage', title: 'Promotions' },
        ]
    },
    banking: {
        title: 'Banking Dashboard',
        subtitle: 'Monitor your banking operations and customer activities',
        stats: [
            { label: 'Active Accounts', value: '1.8M', change: '+5%', icon: Users, positive: true },
            { label: 'Transactions Today', value: '45.3K', change: '+18%', icon: DollarSign, positive: true },
            { label: 'Pending Reviews', value: '12', change: '-8%', icon: AlertCircle, positive: true },
            { label: 'Loan Applications', value: '234', change: '+32%', icon: TrendingUp, positive: true },
        ],
        quickActions: [
            { subtitle: 'Review', title: 'Loan Requests' },
            { subtitle: 'View', title: 'Transactions' },
            { subtitle: 'Generate', title: 'Financial Report' },
            { subtitle: 'Manage', title: 'Interest Rates' },
        ]
    },
    insurance: {
        title: 'Insurance Dashboard',
        subtitle: 'Track policies, claims, and customer inquiries',
        stats: [
            { label: 'Active Policies', value: '560K', change: '+7%', icon: Users, positive: true },
            { label: 'Claims Today', value: '89', change: '+12%', icon: DollarSign, positive: true },
            { label: 'Pending Claims', value: '156', change: '-5%', icon: AlertCircle, positive: true },
            { label: 'Premium Revenue', value: 'K2.4M', change: '+15%', icon: TrendingUp, positive: true },
        ],
        quickActions: [
            { subtitle: 'Process', title: 'New Claims' },
            { subtitle: 'View', title: 'Policy Holders' },
            { subtitle: 'Generate', title: 'Claims Report' },
            { subtitle: 'Manage', title: 'Coverage Plans' },
        ]
    },
    microfinance: {
        title: 'Microfinance Dashboard',
        subtitle: 'Overview of loans, repayments, and member activities',
        stats: [
            { label: 'Active Members', value: '125K', change: '+9%', icon: Users, positive: true },
            { label: 'Loans Disbursed', value: 'K8.5M', change: '+22%', icon: DollarSign, positive: true },
            { label: 'Overdue Payments', value: '45', change: '-12%', icon: AlertCircle, positive: true },
            { label: 'Repayment Rate', value: '94%', change: '+3%', icon: TrendingUp, positive: true },
        ],
        quickActions: [
            { subtitle: 'Process', title: 'Loan Application' },
            { subtitle: 'View', title: 'Member Accounts' },
            { subtitle: 'Generate', title: 'Collection Report' },
            { subtitle: 'Manage', title: 'Interest Rates' },
        ]
    },
    television: {
        title: 'Television Dashboard',
        subtitle: 'Monitor subscriptions, packages, and viewer engagement',
        stats: [
            { label: 'Active Subscribers', value: '890K', change: '+6%', icon: Users, positive: true },
            { label: 'New Signups Today', value: '1.2K', change: '+28%', icon: DollarSign, positive: true },
            { label: 'Service Issues', value: '7', change: '-20%', icon: AlertCircle, positive: true },
            { label: 'Viewing Hours', value: '2.1M', change: '+15%', icon: TrendingUp, positive: true },
        ],
        quickActions: [
            { subtitle: 'Create', title: 'New Package' },
            { subtitle: 'View', title: 'Subscribers' },
            { subtitle: 'Generate', title: 'Viewership Report' },
            { subtitle: 'Manage', title: 'Channels' },
        ]
    }
};

interface PortalDashboardProps {
    industryType?: IndustryType;
}

export default function PortalDashboard({ industryType }: PortalDashboardProps) {
    const industry = useIndustry();
    const company = useCompany();
    const config = dashboardConfigs[industryType || industry.id];
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const recentActivities = [
        { type: 'message', text: 'New conversation started', time: '2 min ago' },
        { type: 'resolved', text: 'Ticket #1234 resolved by AI', time: '5 min ago' },
        { type: 'message', text: 'Customer inquiry received', time: '12 min ago' },
        { type: 'resolved', text: 'Payment query handled', time: '18 min ago' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{config.title}</h1>
                    <p className="text-muted-foreground mt-1">{config.subtitle}</p>
                </div>
                <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${industry.lightGradient} flex items-center gap-2`}>
                    <Sparkles className={`w-4 h-4 ${industry.color}`} />
                    <span className="text-sm font-medium">Live Data</span>
                </div>
            </div>

            <OnboardingChecklist />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {config.stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className={`glass-card p-6 hover:shadow-xl transition-all duration-300 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}
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
                {/* Recent Activity */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Clock className={`w-5 h-5 ${industry.color}`} />
                        Recent Activity
                    </h2>
                    <div className="space-y-4">
                        {recentActivities.map((activity, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.type === 'resolved'
                                        ? 'bg-green-500/20'
                                        : `bg-gradient-to-br ${industry.lightGradient}`
                                    }`}>
                                    {activity.type === 'resolved' ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <MessageSquare className={`w-5 h-5 ${industry.color}`} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">{activity.text}</div>
                                    <div className="text-sm text-muted-foreground">{activity.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Performance */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Sparkles className={`w-5 h-5 ${industry.color}`} />
                        AI Performance
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Resolution Rate</span>
                                <span className="font-medium">78%</span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${industry.gradient} rounded-full`} style={{ width: '78%' }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Customer Satisfaction</span>
                                <span className="font-medium">92%</span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${industry.gradient} rounded-full`} style={{ width: '92%' }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Avg Response Time</span>
                                <span className="font-medium">1.8s</span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${industry.gradient} rounded-full`} style={{ width: '95%' }} />
                            </div>
                        </div>
                    </div>
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
                                    {config.quickActions.map((action, idx) => (
                                        <button key={idx} className="glass p-4 rounded-xl text-left hover:bg-white/20 transition group">
                                            <div className="text-sm opacity-80">{action.subtitle}</div>
                                            <div className="font-bold group-hover:translate-x-1 transition-transform">{action.title} →</div>
                                        </button>
                                    ))}
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
