'use client';

import { useIndustry } from '@/components/portals/PortalLayout';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

interface LoanProduct {
    id: string;
    name: string;
    minAmount: number;
    maxAmount: number;
    interestRate: number;
    term: string;
    active: boolean;
}

export default function MicrofinanceDataManagement() {
    const industry = useIndustry();
    const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([
        { id: '1', name: 'Business Loan', minAmount: 1000, maxAmount: 50000, interestRate: 12, term: '12 months', active: true },
        { id: '2', name: 'Personal Loan', minAmount: 500, maxAmount: 10000, interestRate: 15, term: '6 months', active: true },
        { id: '3', name: 'Agriculture Loan', minAmount: 2000, maxAmount: 30000, interestRate: 10, term: '18 months', active: true },
        { id: '4', name: 'Education Loan', minAmount: 1000, maxAmount: 20000, interestRate: 8, term: '24 months', active: true },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = loanProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this loan product?')) {
            setLoanProducts(loanProducts.filter(p => p.id !== id));
        }
    };

    const handleToggleActive = (id: string) => {
        setLoanProducts(loanProducts.map(p =>
            p.id === id ? { ...p, active: !p.active } : p
        ));
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
                <p className="text-gray-600 mt-1">Manage loan products and eligibility criteria</p>
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search loan products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <button
                        className={`${industry.bgColor} text-white px-6 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2`}
                    >
                        <Plus className="w-5 h-5" />
                        Add Loan Product
                    </button>
                </div>
            </div>

            {/* Loan Products Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount Range (ZMW)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Interest Rate (%)
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
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        K{product.minAmount.toLocaleString()} - K{product.maxAmount.toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{product.interestRate}%</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{product.term}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleToggleActive(product.id)}
                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${product.active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {product.active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex items-center gap-2">
                                        <button className="text-orange-600 hover:text-orange-800">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
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
                    <div className="text-sm text-gray-600 mb-1">Total Products</div>
                    <div className="text-3xl font-bold text-gray-900">{loanProducts.length}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-sm text-gray-600 mb-1">Active Products</div>
                    <div className="text-3xl font-bold text-green-600">
                        {loanProducts.filter(p => p.active).length}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-sm text-gray-600 mb-1">Avg Interest Rate</div>
                    <div className="text-3xl font-bold text-orange-600">
                        {(loanProducts.reduce((sum, p) => sum + p.interestRate, 0) / loanProducts.length).toFixed(1)}%
                    </div>
                </div>
            </div>
        </div>
    );
}
