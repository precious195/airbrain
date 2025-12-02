'use client';

import { useIndustry } from '@/components/portals/PortalLayout';
import { useState, useEffect } from 'react';
import { Landmark, TrendingUp, Users, DollarSign, CheckCircle } from 'lucide-react';

export default function MicrofinanceDashboard() {
    const industry = useIndustry();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 500);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const stats = [
        { label: 'Active Borrowers', value: '180K', change: '+7%', icon: Users, positive: true },
        { label: 'Loan Applications', value: '2,340', change: '+15%', icon: TrendingUp, positive: true },
        { label: 'Total Portfolio', value: 'K450M', change: '+10%', icon: DollarSign, positive: true },
        { label: 'Repayment Rate', value: '94.5%', change: '+2%', icon: CheckCircle, positive: true },
    ];

    const loanApplications = [
        { id: 'APP-001', borrower: 'John M.', amount: 'K5,000', type: 'Business', status: 'pending', date: 'Today' },
        { id: 'APP-002', borrower: 'Sarah K.', amount: 'K3,500', type: 'Personal', status: 'approved', date: 'Today' },
        { id: 'APP-003', borrower: 'Peter L.', amount: 'K8,000', type: 'Agriculture', status: 'reviewing', date: 'Yesterday' },
        { id: 'APP-004', borrower: 'Mary C.', amount: 'K2,000', type: 'Education', status: 'approved', date: 'Yesterday' },
    ];

    const loanProducts = [
        { name: 'Business Loan', disbursed: 45000, rate: '12%', term: '12 months' },
        { name: 'Personal Loan', disbursed: 32000, rate: '15%', term: '6 months' },
        { name: 'Agriculture Loan', disbursed: 28000, rate: '10%', term: '18 months' },
        { name: 'Education Loan', disbursed: 15000, rate: '8%', term: '24 months' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Microfinance Dashboard</h1>
                <p className="text-gray-600 mt-1">Track loans, applications, and repayments</p>
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
                                {stat.change} from last month
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Recent Applications */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">📝 Recent Applications</h2>
                    <div className="space-y-4">
                        {loanApplications.map((app) => (
                            <div key={app.id} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{app.borrower}</div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        {app.type} Loan • {app.date}
                                    </div>
                                </div>
                                <div className="text-right mr-4">
                                    <div className="font-bold text-gray-900">{app.amount}</div>
                                    <div className="text-xs text-gray-500">{app.id}</div>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${app.status === 'approved'
                                        ? 'bg-green-100 text-green-700'
                                        : app.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {app.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Loan Products */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">💰 Loan Products</h2>
                    <div className="space-y-4">
                        {loanProducts.map((product, index) => (
                            <div key={product.name} className="pb-4 border-b border-gray-100 last:border-0">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <div className="font-medium text-gray-900">{product.name}</div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            Rate: {product.rate} • Term: {product.term}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-orange-600">K{product.disbursed.toLocaleString()}</div>
                                        <div className="text-xs text-gray-500">disbursed</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition">
                        <div className="text-sm opacity-90">Review</div>
                        <div className="font-bold">Applications</div>
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition">
                        <div className="text-sm opacity-90">Disburse</div>
                        <div className="font-bold">Approved Loans</div>
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition">
                        <div className="text-sm opacity-90">Track</div>
                        <div className="font-bold">Repayments</div>
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition">
                        <div className="text-sm opacity-90">Generate</div>
                        <div className="font-bold">Report</div>
                    </button>
                </div>
            </div>
        </div>
    );
}
