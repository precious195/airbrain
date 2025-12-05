'use client';

import { useIndustry, useCompany } from '@/components/portals/PortalLayout';
import { useState, useEffect } from 'react';
import { TrendingUp, Users, Clock, ThumbsUp, MessageSquare, Bot, ArrowUp, ArrowDown } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase/client';

interface AnalyticsData {
    totalConversations: number;
    aiResolutionRate: number;
    avgResponseTime: number;
    customerSatisfaction: number;
    totalCustomers: number;
    activeTickets: number;
    // Trend data (percentage change)
    conversationTrend: number;
    resolutionTrend: number;
    responseTrend: number;
    satisfactionTrend: number;
}

interface ChartData {
    label: string;
    value: number;
}

export default function PortalAnalytics() {
    const industry = useIndustry();
    const company = useCompany();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AnalyticsData>({
        totalConversations: 0,
        aiResolutionRate: 0,
        avgResponseTime: 0,
        customerSatisfaction: 0,
        totalCustomers: 0,
        activeTickets: 0,
        conversationTrend: 0,
        resolutionTrend: 0,
        responseTrend: 0,
        satisfactionTrend: 0,
    });

    // Sample weekly data for charts
    const [weeklyData, setWeeklyData] = useState<ChartData[]>([
        { label: 'Mon', value: 45 },
        { label: 'Tue', value: 62 },
        { label: 'Wed', value: 78 },
        { label: 'Thu', value: 55 },
        { label: 'Fri', value: 89 },
        { label: 'Sat', value: 34 },
        { label: 'Sun', value: 28 },
    ]);

    const [channelData, setChannelData] = useState<ChartData[]>([
        { label: 'WhatsApp', value: 65 },
        { label: 'SMS', value: 20 },
        { label: 'Web', value: 10 },
        { label: 'Voice', value: 5 },
    ]);

    useEffect(() => {
        loadAnalytics();
    }, [company.id]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);

            // Load analytics from Firebase
            const analyticsRef = ref(database, `companies/${company.id}/analytics`);
            const snapshot = await get(analyticsRef);

            if (snapshot.exists()) {
                setData(prev => ({ ...prev, ...snapshot.val() }));
            } else {
                // Generate sample data for demo
                setData({
                    totalConversations: 1247,
                    aiResolutionRate: 78,
                    avgResponseTime: 2.4,
                    customerSatisfaction: 92,
                    totalCustomers: 3856,
                    activeTickets: 23,
                    conversationTrend: 12,
                    resolutionTrend: 5,
                    responseTrend: -8,
                    satisfactionTrend: 3,
                });
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const metrics = [
        {
            label: 'Total Conversations',
            value: data.totalConversations.toLocaleString(),
            trend: data.conversationTrend,
            icon: MessageSquare,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            label: 'AI Resolution Rate',
            value: `${data.aiResolutionRate}%`,
            trend: data.resolutionTrend,
            icon: Bot,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            label: 'Avg Response Time',
            value: `${data.avgResponseTime}s`,
            trend: data.responseTrend,
            icon: Clock,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
            invertTrend: true // Lower is better
        },
        {
            label: 'Customer Satisfaction',
            value: `${data.customerSatisfaction}%`,
            trend: data.satisfactionTrend,
            icon: ThumbsUp,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100'
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    const maxWeeklyValue = Math.max(...weeklyData.map(d => d.value));

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600 mt-1">Track your {industry.name} performance and key metrics</p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {metrics.map((metric) => {
                    const Icon = metric.icon;
                    const isPositive = metric.invertTrend ? metric.trend < 0 : metric.trend > 0;
                    return (
                        <div key={metric.label} className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${metric.bgColor} p-3 rounded-lg`}>
                                    <Icon className={`w-6 h-6 ${metric.color}`} />
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                    {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                    {Math.abs(metric.trend)}%
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                            <div className="text-sm text-gray-500">{metric.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Weekly Conversations Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Conversations</h2>
                    <div className="flex items-end justify-between h-48 gap-2">
                        {weeklyData.map((day, index) => (
                            <div key={day.label} className="flex-1 flex flex-col items-center">
                                <div
                                    className={`w-full ${industry.bgColor} rounded-t-lg transition-all duration-300 hover:opacity-80`}
                                    style={{ height: `${(day.value / maxWeeklyValue) * 100}%` }}
                                ></div>
                                <span className="text-xs text-gray-500 mt-2">{day.label}</span>
                                <span className="text-xs font-medium text-gray-700">{day.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Channel Distribution */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Channel Distribution</h2>
                    <div className="space-y-4">
                        {channelData.map((channel, index) => {
                            const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500'];
                            return (
                                <div key={channel.label}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-gray-700">{channel.label}</span>
                                        <span className="text-gray-500">{channel.value}%</span>
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${colors[index]} rounded-full transition-all duration-500`}
                                            style={{ width: `${channel.value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Users className={`w-8 h-8 ${industry.color}`} />
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{data.totalCustomers.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">Total Customers</div>
                        </div>
                    </div>
                    <div className="text-sm text-green-600">+156 this week</div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className={`w-8 h-8 ${industry.color}`} />
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{data.activeTickets}</div>
                            <div className="text-sm text-gray-500">Active Tickets</div>
                        </div>
                    </div>
                    <div className="text-sm text-yellow-600">5 high priority</div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Bot className={`w-8 h-8 ${industry.color}`} />
                        <div>
                            <div className="text-2xl font-bold text-gray-900">89%</div>
                            <div className="text-sm text-gray-500">AI Handled</div>
                        </div>
                    </div>
                    <div className="text-sm text-green-600">No escalation needed</div>
                </div>
            </div>
        </div>
    );
}
