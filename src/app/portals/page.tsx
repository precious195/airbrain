'use client';

import Link from 'next/link';
import {
    Smartphone,
    Building2,
    Shield,
    Landmark,
    Tv
} from 'lucide-react';

const industries = [
    {
        id: 'mobile',
        name: 'Mobile Telecom',
        icon: Smartphone,
        description: 'Manage bundles, network support, and customer subscriptions',
        color: 'bg-blue-500',
        hoverColor: 'hover:bg-blue-600',
        stats: { customers: '2.5M', tickets: '1.2K', satisfaction: '94%' }
    },
    {
        id: 'banking',
        name: 'Banking',
        icon: Building2,
        description: 'Account management, transactions, and financial services',
        color: 'bg-green-500',
        hoverColor: 'hover:bg-green-600',
        stats: { customers: '500K', tickets: '850', satisfaction: '96%' }
    },
    {
        id: 'insurance',
        name: 'Insurance',
        icon: Shield,
        description: 'Policy management, claims processing, and renewals',
        color: 'bg-purple-500',
        hoverColor: 'hover:bg-purple-600',
        stats: { customers: '350K', tickets: '420', satisfaction: '92%' }
    },
    {
        id: 'microfinance',
        name: 'Microfinance',
        icon: Landmark,
        description: 'Loan applications, disbursements, and repayment tracking',
        color: 'bg-orange-500',
        hoverColor: 'hover:bg-orange-600',
        stats: { customers: '180K', tickets: '320', satisfaction: '91%' }
    },
    {
        id: 'television',
        name: 'Television',
        icon: Tv,
        description: 'Subscription management, packages, and billing',
        color: 'bg-pink-500',
        hoverColor: 'hover:bg-pink-600',
        stats: { customers: '1.1M', tickets: '670', satisfaction: '89%' }
    }
];

export default function PortalsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Industry Portals</h1>
                            <p className="text-gray-600 mt-1">Select your industry to access the management portal</p>
                        </div>
                        <Link
                            href="/"
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {industries.map((industry) => {
                        const Icon = industry.icon;
                        return (
                            <Link
                                key={industry.id}
                                href={`/portals/${industry.id}/dashboard`}
                                className="group"
                            >
                                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                                    {/* Header with colored background */}
                                    <div className={`${industry.color} ${industry.hoverColor} transition-colors p-6`}>
                                        <div className="flex items-center justify-between text-white">
                                            <div>
                                                <h2 className="text-2xl font-bold">{industry.name}</h2>
                                                <p className="text-white/90 text-sm mt-1">Portal</p>
                                            </div>
                                            <Icon className="w-12 h-12 opacity-90" />
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-6">
                                        <p className="text-gray-600 mb-6">{industry.description}</p>

                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">{industry.stats.customers}</div>
                                                <div className="text-xs text-gray-500">Customers</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">{industry.stats.tickets}</div>
                                                <div className="text-xs text-gray-500">Active</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-green-600">{industry.stats.satisfaction}</div>
                                                <div className="text-xs text-gray-500">CSAT</div>
                                            </div>
                                        </div>

                                        {/* Access Button */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                            <span className="text-sm text-gray-500">Access Portal</span>
                                            <span className="text-primary-600 group-hover:translate-x-1 transition-transform">→</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Info Section */}
                <div className="mt-12 bg-white rounded-xl shadow-sm p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">About Industry Portals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">🎯 Purpose</h4>
                            <p className="text-sm">
                                Each industry portal provides dedicated tools and analytics tailored to your specific business needs,
                                allowing you to manage customer service data independently.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">🔒 Data Isolation</h4>
                            <p className="text-sm">
                                Your industry data is completely isolated from other industries,
                                ensuring privacy and security while maintaining a unified AI platform.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">📊 Analytics</h4>
                            <p className="text-sm">
                                Get industry-specific insights, metrics, and reports that matter to your business,
                                with real-time data visualization and export capabilities.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">⚙️ Customization</h4>
                            <p className="text-sm">
                                Configure industry-specific settings, manage your data structures,
                                and customize the AI responses to match your brand voice.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
