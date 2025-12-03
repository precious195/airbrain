'use client';

import { useIndustry, useCompany } from '@/components/portals/PortalLayout';
import { useState, useEffect } from 'react';
import { Search, Filter, UserPlus } from 'lucide-react';
import { dataService } from '@/lib/data/data-service';

interface Customer {
    id: string;
    phone: string;
    email?: string;
    name: string;
    verified: boolean;
    createdAt: number;
    lastActivity?: number;
}

export default function CustomersPage() {
    const industry = useIndustry();
    const company = useCompany();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadCustomers();
    }, [company.id]);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const data = await dataService.getAll<Customer>(company.id, 'customers');
            setCustomers(data);
        } catch (error) {
            console.error('Error loading customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTimeAgo = (timestamp?: number) => {
        if (!timestamp) return 'Never';
        const days = Math.floor((Date.now() - timestamp) / 86400000);
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading customers...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
                    <p className="text-gray-600 mt-1">Manage your customer base</p>
                </div>
                <button className={`${industry.bgColor} text-white px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2`}>
                    <UserPlus className="w-5 h-5" />
                    Add Customer
                </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name, phone, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="w-5 h-5" />
                    Filters
                </button>
            </div>

            {/* Customers Table */}
            {filteredCustomers.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Last Active</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                                {customer.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{customer.name || 'Unknown'}</div>
                                                <div className="text-sm text-gray-500">ID: {customer.id.slice(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <div className="text-gray-900">{customer.phone}</div>
                                            {customer.email && <div className="text-gray-500">{customer.email}</div>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {customer.verified ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                Unverified
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {getTimeAgo(customer.lastActivity)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <UserPlus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'No customers found' : 'No customers yet'}
                    </h3>
                    <p className="text-gray-500">
                        {searchTerm ? 'Try adjusting your search' : 'Customers from WhatsApp conversations will appear here'}
                    </p>
                </div>
            )}
        </div>
    );
}
