'use client';

import { useIndustry, useCompany } from '@/components/portals/PortalLayout';
import { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { dataService } from '@/lib/data/data-service';

interface AnalyticsMetrics {
    totalConversations: number;
    aiResolutionRate: number;
    avgResponseTime: number;
    customerSatisfaction: number;
}

export default function AnalyticsPage() {
    const industry = useIndustry();
    const company = useCompany();
    const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, [company.id]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const data = await dataService.getById<AnalyticsMetrics>(
                company.id,
                'analytics',
                'metrics'
            );
            setMetrics(data || {
                totalConversations: 0,
                aiResolutionRate: 0,
                avgResponseTime: 0,
                customerSatisfaction: 0
            });
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const displayMetrics = [
        { label: 'Total Conversations', value: metrics?.totalConversations || 0, icon: Users, color: 'text-blue-600' },
        { label: 'AI Resolution Rate', value: `${metrics?.aiResolutionRate || 0}%`, icon: Activity, color: 'text-green-600' },
        { label: 'Avg Response Time', value: `${metrics?.avgResponseTime || 0}s`, icon: TrendingUp, color: 'text-purple-600' },
        { label: 'Customer Satisfaction', value: `${metrics?.customerSatisfaction || 0}%`, icon: DollarSign, color: 'text-orange-600' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600 mt-1">Track performance and key metrics</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {displayMetrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                        <div key={metric.label} className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-600 text-sm font-medium">{metric.label}</span>
                                <Icon className={`w-8 h-8 ${metric.color}`} />
                            </div>
                            <div className={`text-3xl font-bold ${metric.color}`}>{metric.value}</div>
                        </div>
                    );
                })}
            </div>

            {/* Chart Placeholder */}
            <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Over Time</h2>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center text-gray-500">
                        <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Charts will be available soon</p>
                        <p className="text-sm mt-1">Connect analytics service to see detailed insights</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
