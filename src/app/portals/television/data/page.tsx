// Generic template for data management - can be customized per industry
'use client';

import { useIndustry, useCompany } from '@/components/portals/PortalLayout';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { dataService } from '@/lib/data/data-service';

export default function DataManagementPage() {
    const industry = useIndustry();
    const company = useCompany();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Collection name based on industry
    const getCollectionName = () => {
        switch (industry.id) {
            case 'insurance': return 'policies';
            case 'microfinance': return 'loanProducts';
            case 'television': return 'packages';
            default: return 'products';
        }
    };

    useEffect(() => {
        loadData();
    }, [company.id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await dataService.getAll(company.id, getCollectionName());
            setItems(data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            await dataService.delete(company.id, getCollectionName(), id);
            loadData();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading data...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
                <p className="text-gray-600 mt-1">Manage your {industry.id} products and services</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button className={`${industry.bgColor} text-white px-6 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2`}>
                        <Plus className="w-5 h-5" />
                        Add New
                    </button>
                </div>
            </div>

            {items.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6">
                        <div className="grid gap-4">
                            {items.map((item) => (
                                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{item.name || 'Unnamed Item'}</h3>
                                            <p className="text-sm text-gray-500 mt-1">ID: {item.id}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="text-blue-600 hover:text-blue-800"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No items configured</h3>
                    <p className="text-gray-500">Create your first item to get started</p>
                </div>
            )}
        </div>
    );
}
