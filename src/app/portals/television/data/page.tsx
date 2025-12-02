'use client';

import { useIndustry } from '@/components/portals/PortalLayout';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

interface Package {
    id: string;
    name: string;
    channels: number;
    price: number;
    category: string;
    active: boolean;
}

export default function TelevisionDataManagement() {
    const industry = useIndustry();
    const [packages, setPackages] = useState<Package[]>([
        { id: '1', name: 'Premium HD', channels: 150, price: 250, category: 'Premium', active: true },
        { id: '2', name: 'Sports Package', channels: 45, price: 200, category: 'Sports', active: true },
        { id: '3', name: 'Family Bundle', channels: 80, price: 150, category: 'Family', active: true },
        { id: '4', name: 'Basic Package', channels: 50, price: 80, category: 'Basic', active: true },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    const filteredPackages = packages.filter(pkg =>
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this package?')) {
            setPackages(packages.filter(p => p.id !== id));
        }
    };

    const handleToggleActive = (id: string) => {
        setPackages(packages.map(p =>
            p.id === id ? { ...p, active: !p.active } : p
        ));
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
                <p className="text-gray-600 mt-1">Manage TV packages and channel bouquets</p>
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search packages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                    </div>
                    <button
                        className={`${industry.bgColor} text-white px-6 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2`}
                    >
                        <Plus className="w-5 h-5" />
                        Add Package
                    </button>
                </div>
            </div>

            {/* Packages Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Package Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Channels
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price (ZMW/month)
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
                        {filteredPackages.map((pkg) => (
                            <tr key={pkg.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-pink-100 text-pink-700">
                                        {pkg.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{pkg.channels} channels</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">K{pkg.price}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleToggleActive(pkg.id)}
                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${pkg.active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {pkg.active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex items-center gap-2">
                                        <button className="text-pink-600 hover:text-pink-800">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(pkg.id)}
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
                    <div className="text-sm text-gray-600 mb-1">Total Packages</div>
                    <div className="text-3xl font-bold text-gray-900">{packages.length}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-sm text-gray-600 mb-1">Active Packages</div>
                    <div className="text-3xl font-bold text-green-600">
                        {packages.filter(p => p.active).length}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-sm text-gray-600 mb-1">Total Channels</div>
                    <div className="text-3xl font-bold text-pink-600">
                        {packages.reduce((sum, p) => sum + p.channels, 0)}
                    </div>
                </div>
            </div>
        </div>
    );
}
