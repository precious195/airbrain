'use client';

import { useIndustry, useCompany } from '@/components/portals/PortalLayout';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { dataService } from '@/lib/data/data-service';

interface Bundle {
    id: string;
    name: string;
    dataAmount: string;
    validity: string;
    price: number;
    active: boolean;
}

export default function MobileDataManagement() {
    const industry = useIndustry();
    const company = useCompany();
    const [bundles, setBundles] = useState<Bundle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadBundles();
    }, [company.id]);

    const loadBundles = async () => {
        try {
            setLoading(true);
            const data = await dataService.getAll<Bundle>(company.id, 'bundles');
            setBundles(data);
        } catch (error) {
            console.error('Error loading bundles:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBundles = bundles.filter(bundle =>
        bundle.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this bundle?')) {
            await dataService.delete(company.id, 'bundles', id);
            loadBundles();
        }
    };

    const handleToggleActive = async (id: string) => {
        const bundle = bundles.find(b => b.id === id);
        if (bundle) {
            await dataService.update(company.id, 'bundles', id, { active: !bundle.active });
            loadBundles();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading bundles...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
                <p className="text-gray-600 mt-1">Manage bundles, promotions, and network configurations</p>
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search bundles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        className={`${industry.bgColor} text-white px-6 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2`}
                    >
                        <Plus className="w-5 h-5" />
                        Add Bundle
                    </button>
                </div>
            </div>

            {/* Bundles Table */}
            {filteredBundles.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bundle Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Data Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Validity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price (ZMW)
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
                            {filteredBundles.map((bundle) => (
                                <tr key={bundle.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{bundle.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{bundle.dataAmount}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{bundle.validity}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">K{bundle.price}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggleActive(bundle.id)}
                                            className={`px-2 py-1 text-xs font-semibold rounded-full ${bundle.active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {bundle.active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center gap-2">
                                            <button className="text-blue-600 hover:text-blue-800">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(bundle.id)}
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
            ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bundles configured</h3>
                    <p className="text-gray-500">Create your first data bundle to get started</p>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-sm text-gray-600 mb-1">Total Bundles</div>
                    <div className="text-3xl font-bold text-gray-900">{bundles.length}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-sm text-gray-600 mb-1">Active Bundles</div>
                    <div className="text-3xl font-bold text-green-600">
                        {bundles.filter(b => b.active).length}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-sm text-gray-600 mb-1">Average Price</div>
                    <div className="text-3xl font-bold text-blue-600">
                        K{bundles.length > 0 ? Math.round(bundles.reduce((sum, b) => sum + b.price, 0) / bundles.length) : 0}
                    </div>
                </div>
            </div>
        </div>
    );
}
