'use client';

import { useIndustry } from '@/components/portals/PortalLayout';
import { TrendingUp, Users, DollarSign, MessageSquare } from 'lucide-react';

export default function MobileAnalytics() {
    const industry = useIndustry();

    const metrics = [
        { label: 'Total Revenue', value: 'K1.2M', change: '+12%', icon: DollarSign },
        { label: 'New Customers', value: '2,345', change: '+8%', icon: Users },
        { label: 'Bundle Sales', value: '15,234', change: '+15%', icon: TrendingUp },
        { label: 'Support Tickets', value: '1,234', change: '-10%', icon: MessageSquare },
    ];

    const salesData = [
        { month: 'January', value: 85 },
        { month: 'February', value: 72 },
        { month: 'March', value: 90 },
        { month: 'April', value: 95 },
        { month: 'May', value: 110 },
        { month: 'June', value: 105 },
    ];

    const maxValue = Math.max(...salesData.map(d => d.value));

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600 mt-1">Insights and performance metrics</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {metrics.map((metric) => {
                    const Icon = metric.icon;
                    const isPositive = metric.change.startsWith('+');
                    return (
                        <div key={metric.label} className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-600 text-sm font-medium">{metric.label}</span>
                                <Icon className={`w-8 h-8 ${industry.color}`} />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</div>
                            <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.change} from last month
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Sales Trend */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Sales Trend</h2>
                    <div className="space-y-4">
                        {salesData.map((data) => (
                            <div key={data.month}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">{data.month}</span>
                                    <span className="text-sm font-bold text-gray-900">K{data.value}K</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`${industry.bgColor} h-3 rounded-full transition-all`}
                                        style={{ width: `${(data.value / maxValue) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bundle Distribution */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Bundle Sales Distribution</h2>
                    <div className="space-y-4">
                        {[
                            { name: 'Daily Bundles', percentage: 35, value: 'K420K' },
                            { name: 'Weekly Bundles', percentage: 28, value: 'K336K' },
                            { name: 'Monthly Bundles', percentage: 22, value: 'K264K' },
                            { name: 'Social Bundles', percentage: 15, value: 'K180K' },
                        ].map((bundle) => (
                            <div key={bundle.name}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">{bundle.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-gray-900">{bundle.value}</span>
                                        <span className="text-sm text-gray-500">({bundle.percentage}%)</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`${industry.bgColor} h-3 rounded-full`}
                                        style={{ width: `${bundle.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Customer Satisfaction */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Satisfaction</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                        <div className="text-5xl font-bold text-green-600 mb-2">94%</div>
                        <div className="text-sm text-gray-600">Overall CSAT Score</div>
                    </div>
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                        <div className="text-5xl font-bold text-blue-600 mb-2">4.7</div>
                        <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                    <div className="text-center p-6 bg-purple-50 rounded-lg">
                        <div className="text-5xl font-bold text-purple-600 mb-2">2.5h</div>
                        <div className="text-sm text-gray-600">Avg Resolution Time</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
