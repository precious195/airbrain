// src/app/(dashboard)/page.tsx
import { MessageSquare, Users, Zap, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Conversations"
                    value="1,234"
                    change="+12%"
                    icon={<MessageSquare className="w-8 h-8 text-primary-600" />}
                />
                <StatCard
                    title="Active Tickets"
                    value="42"
                    change="-8%"
                    icon={<Users className="w-8 h-8 text-orange-600" />}
                />
                <StatCard
                    title="AI Resolution Rate"
                    value="84%"
                    change="+5%"
                    icon={<Zap className="w-8 h-8 text-green-600" />}
                />
                <StatCard
                    title="Avg Response Time"
                    value="1.2s"
                    change="-15%"
                    icon={<TrendingUp className="w-8 h-8 text-blue-600" />}
                />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Conversations</h2>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                                <div>
                                    <p className="font-medium text-gray-900">Customer #{i}2345</p>
                                    <p className="text-sm text-gray-500">WhatsApp • 5 minutes ago</p>
                                </div>
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                    Resolved
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Active Tickets</h2>
                    <div className="space-y-4">
                        {[
                            { id: 1, title: 'Network connectivity issue', priority: 'High', status: 'In Progress' },
                            { id: 2, title: 'Bundle purchase failed', priority: 'Medium', status: 'Open' },
                            { id: 3, title: 'Account balance inquiry', priority: 'Low', status: 'Resolved' },
                        ].map((ticket) => (
                            <div key={ticket.id} className="pb-4 border-b border-gray-100 last:border-0">
                                <div className="flex items-start justify-between mb-2">
                                    <p className="font-medium text-gray-900">{ticket.title}</p>
                                    <span
                                        className={`px-2 py-1 text-xs font-semibold rounded ${ticket.priority === 'High'
                                                ? 'bg-red-100 text-red-700'
                                                : ticket.priority === 'Medium'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-green-100 text-green-700'
                                            }`}
                                    >
                                        {ticket.priority}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">Status: {ticket.status}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    change,
    icon,
}: {
    title: string;
    value: string;
    change: string;
    icon: React.ReactNode;
}) {
    const isPositive = change.startsWith('+');

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
                {icon}
            </div>
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                <span
                    className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'
                        }`}
                >
                    {change}
                </span>
            </div>
        </div>
    );
}
