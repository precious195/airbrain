'use client';

import { useIndustry, useCompany } from '@/components/portals/PortalLayout';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { dataService } from '@/lib/data/data-service';

interface AccountType {
    id: string;
    name: string;
    type: 'savings' | 'checking' | 'loan';
    interestRate: number;
    minBalance: number;
    active: boolean;
}

export default function BankingDataManagement() {
    const industry = useIndustry();
    const company = useCompany();
    const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadAccountTypes();
    }, [company.id]);

    const loadAccountTypes = async () => {
        try {
            setLoading(true);
            const data = await dataService.getAll<AccountType>(company.id, 'accountTypes');
            setAccountTypes(data);
        } catch (error) {
            console.error('Error loading account types:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAccountTypes = accountTypes.filter(acc =>
        acc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this account type?')) {
            await dataService.delete(company.id, 'accountTypes', id);
            loadAccountTypes();
        }
    };

    const handleToggleActive = async (id: string) => {
        const acc = accountTypes.find(a => a.id === id);
        if (acc) {
            await dataService.update(company.id, 'accountTypes', id, { active: !acc.active });
            loadAccountTypes();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading account types...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Account Types Management</h1>
                <p className="text-gray-600 mt-1">Manage account types, interest rates, and requirements</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search account types..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button className={`${industry.bgColor} text-white px-6 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2`}>
                        <Plus className="w-5 h-5" />
                        Add Account Type
                    </button>
                </div>
            </div>

            {filteredAccountTypes.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest Rate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Balance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAccountTypes.map((acc) => (
                                <tr key={acc.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4"><div className="font-medium text-gray-900">{acc.name}</div></td>
                                    <td className="px-6 py-4"><div className="text-gray-900 capitalize">{acc.type}</div></td>
                                    <td className="px-6 py-4"><div className="text-gray-900">{acc.interestRate}%</div></td>
                                    <td className="px-6 py-4"><div className="text-gray-900">K{acc.minBalance}</div></td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleToggleActive(acc.id)} className={`px-2 py-1 text-xs font-semibold rounded-full ${acc.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {acc.active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button className="text-blue-600 hover:text-blue-800"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(acc.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No account types configured</h3>
                    <p className="text-gray-500">Create your first account type to get started</p>
                </div>
            )}
        </div>
    );
}
