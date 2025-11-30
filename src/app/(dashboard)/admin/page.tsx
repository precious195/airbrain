'use client';

import { useEffect, useState } from 'react';
import { getDashboardMetrics, type DashboardMetrics } from '@/lib/analytics/metrics';

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

    useEffect(() => {
        loadMetrics();
        const interval = setInterval(loadMetrics, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshInterval]);

    async function loadMetrics() {
        try {
            const data = await getDashboardMetrics();
            setMetrics(data);
        } catch (error) {
            console.error('Failed to load metrics:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading || !metrics) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-1">Real-time customer service analytics</p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={refreshInterval}
                            onChange={(e) => setRefreshInterval(Number(e.target.value))}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value={10000}>Refresh: 10s</option>
                            <option value={30000}>Refresh: 30s</option>
                            <option value={60000}>Refresh: 1min</option>
                            <option value={300000}>Refresh: 5min</option>
                        </select>
                        <button
                            onClick={loadMetrics}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                        >
                            🔄 Refresh Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Real-Time Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Active Conversations"
                    value={metrics.realtime.activeConversations}
                    icon="💬"
                    trend="+12%"
                    trendUp={true}
                />
                <StatCard
                    title="Pending Tickets"
                    value={metrics.realtime.pendingTickets}
                    icon="🎫"
                    trend="-5%"
                    trendUp={false}
                />
                <StatCard
                    title="Online Agents"
                    value={`${metrics.agentPerformance.activeAgents}/${metrics.agentPerformance.totalAgents}`}
                    icon="👥"
                />
                <StatCard
                    title="Avg Response Time"
                    value={`${metrics.realtime.avgResponseTime}s`}
                    icon="⚡"
                    trend="-8%"
                    trendUp={false}
                />
            </div>

            {/* AI Performance & Customer Satisfaction */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* AI Performance */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">🤖 AI Performance</h2>
                    <div className="space-y-4">
                        <MetricBar
                            label="Accuracy Score"
                            value={metrics.aiPerformance.accuracyScore}
                            max={100}
                            color="blue"
                        />
                        <MetricBar
                            label="Resolution Rate"
                            value={metrics.aiPerformance.resolutionRate}
                            max={100}
                            color="green"
                        />
                        <MetricBar
                            label="Escalation Rate"
                            value={metrics.aiPerformance.escalationRate}
                            max={100}
                            color="yellow"
                            invert
                        />
                        <MetricBar
                            label="Avg Confidence"
                            value={metrics.aiPerformance.avgConfidence}
                            max={100}
                            color="purple"
                        />
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Total Interactions: <span className="font-semibold">{metrics.aiPerformance.totalInteractions.toLocaleString()}</span>
                        </p>
                    </div>
                </div>

                {/* Customer Satisfaction */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">⭐ Customer Satisfaction</h2>
                    <div className="flex items-center justify-center mb-6">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-primary-600">
                                {metrics.customerSatisfaction.overallScore.toFixed(1)}
                            </div>
                            <div className="text-gray-600 mt-1">out of 5.0</div>
                            <div className="flex justify-center mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        className={`text-2xl ${star <= Math.round(metrics.customerSatisfaction.overallScore)
                                                ? 'text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {metrics.customerSatisfaction.positiveRatings}
                            </div>
                            <div className="text-sm text-gray-600">Positive</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                                {metrics.customerSatisfaction.negativeRatings}
                            </div>
                            <div className="text-sm text-gray-600">Negative</div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">NPS Score:</span>
                            <span className="font-semibold">{metrics.customerSatisfaction.nps}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Avg Resolution Time:</span>
                            <span className="font-semibold">{metrics.customerSatisfaction.avgResolutionTime}min</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fraud Alerts & Top Issues */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Fraud Alerts */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">🚨 Fraud Alerts</h2>
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                            {metrics.fraudAlerts.criticalAlerts} Critical
                        </span>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-xl font-bold">{metrics.fraudAlerts.totalAlerts}</div>
                            <div className="text-xs text-gray-600">Total</div>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded">
                            <div className="text-xl font-bold text-red-600">{metrics.fraudAlerts.criticalAlerts}</div>
                            <div className="text-xs text-gray-600">Critical</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded">
                            <div className="text-xl font-bold text-yellow-600">{metrics.fraudAlerts.pendingAlerts}</div>
                            <div className="text-xs text-gray-600">Pending</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                            <div className="text-xl font-bold text-green-600">{metrics.fraudAlerts.resolvedAlerts}</div>
                            <div className="text-xs text-gray-600">Resolved</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {metrics.fraudAlerts.recentAlerts.slice(0, 3).map((alert) => (
                            <div
                                key={alert.id}
                                className={`p-3 rounded-lg border-l-4 ${alert.severity === 'critical'
                                        ? 'bg-red-50 border-red-500'
                                        : alert.severity === 'high'
                                            ? 'bg-orange-50 border-orange-500'
                                            : 'bg-yellow-50 border-yellow-500'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="font-semibold text-sm">{alert.description}</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            Customer: {alert.customerId} • Risk: {alert.riskScore}%
                                        </div>
                                    </div>
                                    <span
                                        className={`px-2 py-1 text-xs rounded ${alert.status === 'investigating'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {alert.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Issues */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Top Issues</h2>
                    <div className="space-y-3">
                        {metrics.analytics.topIssues.map((issue, index) => (
                            <div key={issue.issue} className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full font-bold text-sm">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{issue.issue}</span>
                                        <span className="text-sm text-gray-600">{issue.count.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                        <div
                                            className="bg-primary-600 h-2 rounded-full"
                                            style={{ width: `${(issue.count / metrics.analytics.topIssues[0].count) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <span
                                    className={`text-sm ${issue.trend === 'up'
                                            ? 'text-red-600'
                                            : issue.trend === 'down'
                                                ? 'text-green-600'
                                                : 'text-gray-600'
                                        }`}
                                >
                                    {issue.trend === 'up' ? '↑' : issue.trend === 'down' ? '↓' : '→'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Agent Performance */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🏆 Top Performing Agents</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {metrics.agentPerformance.topPerformers.map((agent, index) => (
                        <div
                            key={agent.agentId}
                            className={`p-4 rounded-lg border-2 ${index === 0
                                    ? 'border-yellow-400 bg-yellow-50'
                                    : index === 1
                                        ? 'border-gray-400 bg-gray-50'
                                        : 'border-orange-400 bg-orange-50'
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="text-3xl">
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                </div>
                                <div>
                                    <div className="font-bold">{agent.name}</div>
                                    <div className="text-sm text-gray-600">{agent.agentId}</div>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tickets Resolved:</span>
                                    <span className="font-semibold">{agent.ticketsResolved}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Avg Rating:</span>
                                    <span className="font-semibold">{agent.avgRating} ⭐</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Response Time:</span>
                                    <span className="font-semibold">{agent.responseTime}min</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Channel Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📱 Channel Distribution</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(metrics.analytics.channelDistribution).map(([channel, count]) => (
                        <div key={channel} className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-3xl mb-2">
                                {channel === 'whatsapp' ? '💬' : channel === 'sms' ? '📱' : channel === 'web' ? '🌐' : '📞'}
                            </div>
                            <div className="font-semibold capitalize">{channel}</div>
                            <div className="text-2xl font-bold text-primary-600 mt-1">{count.toLocaleString()}</div>
                            <div className="text-xs text-gray-600 mt-1">
                                {((count / Object.values(metrics.analytics.channelDistribution).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({
    title,
    value,
    icon,
    trend,
    trendUp,
}: {
    title: string;
    value: string | number;
    icon: string;
    trend?: string;
    trendUp?: boolean;
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">{title}</span>
                <span className="text-2xl">{icon}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            {trend && (
                <div className={`text-sm mt-2 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {trendUp ? '↑' : '↓'} {trend} from last period
                </div>
            )}
        </div>
    );
}

// Metric Bar Component
function MetricBar({
    label,
    value,
    max,
    color,
    invert = false,
}: {
    label: string;
    value: number;
    max: number;
    color: 'blue' | 'green' | 'yellow' | 'purple';
    invert?: boolean;
}) {
    const colorClasses = {
        blue: 'bg-blue-600',
        green: 'bg-green-600',
        yellow: 'bg-yellow-600',
        purple: 'bg-purple-600',
    };

    const percentage = (value / max) * 100;
    const isGood = invert ? percentage < 20 : percentage > 70;

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className={`text-sm font-bold ${isGood ? 'text-green-600' : 'text-gray-900'}`}>
                    {value.toFixed(1)}%
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                    className={`${colorClasses[color]} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}
