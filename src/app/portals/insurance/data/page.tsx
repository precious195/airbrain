'use client';

import { useIndustry } from '@/components/portals/PortalLayout';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

interface PolicyTemplate {
    id: string;
    name: string;
    type: string;
    premium: number;
    coverage: number;
    term: string;
    active: boolean;
}

export default function InsuranceDataManagement() {
    const industry = useIndustry();
    const [policies, setPolicies] = useState<PolicyTemplate[]>([
        { id: '1', name: 'Basic Life Cover', type: 'Life', premium: 150, coverage: 50000, term: '20 years', active: true },
        { id: '2', name: 'Comprehensive Health', type: 'Health', premium: 200, coverage: 100000, term: '1 year', active: true },
        { id: '3', name: 'Vehicle Insurance', type: 'Auto', premium: 350, coverage: 80000, term: '1 year', active: true },
        { id: '4', name: 'Home Protection', type: 'Property', premium: 250, coverage: 150000, term: '1 year', active: true },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    const filteredPolicies = policies.filter(policy =>
        policy.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this policy template?')) {
            setPolicies(policies.filter(p => p.id !== id));
        }
    };

    const handleToggleActive = (id: string) => {
        setPolicies(policies.map(p =>
            p.id === id ? { ...p, active: !p.active } : p
        ));
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
                <p className="text-gray-600 mt-1">Manage policy templates and coverage plans</p>
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search policy templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <button
                        className={`${industry.bgColor} text-white px-6 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2`}
                    >
                        <Plus className="w-5 h-5" />
                        Add Policy Template
                    </button>
                </div>
            </div>

            {/* Policies Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Policy Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Premium (ZMW/month)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Coverage (ZMW)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Term
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPolicies.map((policy) => (
                            <tr key={policy.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{policy.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                                        {policy.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">K{policy.premium}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">K{policy.coverage.toLocaleString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{policy.term}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleToggleActive(policy.id)}
                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${policy.active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {policy.active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex items-center gap-2">
                                        <button className="text-purple-600 hover:text-purple-800">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(policy.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-sm text-gray-600 mb-1">Total Templates</div>
                    <div className="text-3xl font-bold text-gray-900">{policies.length}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-sm text-gray-600 mb-1">Active Templates</div>
                    <div className="text-3xl font-bold text-green-600">
                        {policies.filter(p => p.active).length}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-sm text-gray-600 mb-1">Avg Premium</div>
                    <div className="text-3xl font-bold text-purple-600">
                        K{Math.round(policies.reduce((sum, p) => sum + p.premium, 0) / policies.length)}
                    </div>
                </div>
            </div>
        </div>
    );
}
