'use client';

import { useIndustry } from '@/components/portals/PortalLayout';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

interface AccountType {
    id: string;
    name: string;
    minimumBalance: number;
    monthlyFee: number;
    interestRate: number;
    active: boolean;
}

export default function BankingDataManagement() {
    const industry = useIndustry();
    const [accountTypes, setAccountTypes] = useState<AccountType[]>([
        { id: '1', name: 'Savings Account', minimumBalance: 100, monthlyFee: 5, interestRate: 2.5, active: true },
        { id: '2', name: 'Current Account', minimumBalance: 500, monthlyFee: 10, interestRate: 0, active: true },
        { id: '3', name: 'Fixed Deposit', minimumBalance: 1000, monthlyFee: 0, interestRate: 8.0, active: true },
        { id: '4', name: 'Youth Savings', minimumBalance: 0, monthlyFee: 0, interestRate: 3.0, active: true },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    const filteredAccountTypes = accountTypes.filter(account =>
        account.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this account type?')) {
            setAccountTypes(accountTypes.filter(a => a.id !== id));
        }
    };

    const handleToggleActive = (id: string) => {
        setAccountTypes(accountTypes.map(a =>
            a.id === id ? { ...a, active: !a.active } : a
        ));
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
                <p className="text-gray-600 mt-1">Manage account types, fees, and interest rates</p>
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search account types..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <button
                        className={`${industry.bgColor} text-white px-6 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2`}
                    >
                        <Plus className="w-5 h-5" />
                        Add Account Type
                    </button>
                </div>
            </div>

            {/* Account Types Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Account Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Min Balance (ZMW)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Monthly Fee (ZMW)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Interest Rate (%)
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
                        {filteredAccountTypes.map((account) => (
                            <tr key={account.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{account.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">K{account.minimumBalance.toLocaleString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">K{account.monthlyFee}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{account.interestRate}%</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleToggleActive(account.id)}
                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${account.active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {account.active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex items-center gap-2">
                                        <button className="text-green-600 hover:text-green-800">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(account.id)}
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
                    <div className="text-sm text-gray-600 mb-1">Total Account Types</div>
                    <div className="text-3xl font-bold text-gray-900">{accountTypes.length}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-sm text-gray-600 mb-1">Active Types</div>
                    <div className="text-3xl font-bold text-green-600">
                        {accountTypes.filter(a => a.active).length}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-sm text-gray-600 mb-1">Avg Interest Rate</div>
                    <div className="text-3xl font-bold text-green-600">
                        {(accountTypes.reduce((sum, a) => sum + a.interestRate, 0) / accountTypes.length).toFixed(1)}%
                    </div>
                </div>
            </div>
        </div>
    );
}
