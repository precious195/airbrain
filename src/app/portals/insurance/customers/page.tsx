'use client';

import { useIndustry } from '@/components/portals/PortalLayout';
import { useState } from 'react';
import { Search, Filter, Download, User, Phone, Mail, Calendar } from 'lucide-react';

interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    status: 'active' | 'inactive' | 'suspended';
    joinedDate: string;
    totalSpent: number;
    tickets: number;
}

export default function MobileCustomers() {
    const industry = useIndustry();
    const [customers] = useState<Customer[]>([
        { id: 'CUST-001', name: 'John Banda', phone: '+260 97 123 4567', email: 'john@example.com', status: 'active', joinedDate: '2024-01-15', totalSpent: 1250, tickets: 3 },
        { id: 'CUST-002', name: 'Mary Chanda', phone: '+260 96 234 5678', email: 'mary@example.com', status: 'active', joinedDate: '2024-02-20', totalSpent: 890, tickets: 1 },
        { id: 'CUST-003', name: 'Peter Mwale', phone: '+260 95 345 6789', email: 'peter@example.com', status: 'inactive', joinedDate: '2023-11-10', totalSpent: 2100, tickets: 5 },
        { id: 'CUST-004', name: 'Sarah Kabwe', phone: '+260 97 456 7890', email: 'sarah@example.com', status: 'active', joinedDate: '2024-03-05', totalSpent: 650, tickets: 2 },
        { id: 'CUST-005', name: 'David Phiri', phone: '+260 96 567 8901', email: 'david@example.com', status: 'active', joinedDate: '2024-01-28', totalSpent: 1520, tickets: 4 },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
                <p className="text-gray-600 mt-1">Manage and view all customer accounts</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-600 mb-1">Total Customers</div>
                            <div className="text-3xl font-bold text-gray-900">{customers.length}</div>
                        </div>
                        <User className={`w-10 h-10 ${industry.color}`} />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-600 mb-1">Active</div>
                            <div className="text-3xl font-bold text-green-600">
                                {customers.filter(c => c.status === 'active').length}
                            </div>
                        </div>
                        <User className="w-10 h-10 text-green-600" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
                            <div className="text-3xl font-bold text-blue-600">
                                K{customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
                            </div>
                        </div>
                        <Download className="w-10 h-10 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-600 mb-1">Avg Spent</div>
                            <div className="text-3xl font-bold text-purple-600">
                                K{Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length)}
                            </div>
                        </div>
                        <Download className="w-10 h-10 text-purple-600" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, phone, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                    <button className={`${industry.bgColor} text-white px-6 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2`}>
                        <Download className="w-5 h-5" />
                        Export
                    </button>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Joined Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Spent
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tickets
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCustomers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className={`w-10 h-10 rounded-full ${industry.bgColor} flex items-center justify-center text-white font-bold`}>
                                            {customer.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                            <div className="text-sm text-gray-500">{customer.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-sm text-gray-900">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            {customer.phone}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            {customer.email}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${customer.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : customer.status === 'inactive'
                                                ? 'bg-gray-100 text-gray-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                        {customer.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-sm text-gray-900">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {new Date(customer.joinedDate).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        K{customer.totalSpent.toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{customer.tickets}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button className={`${industry.color} hover:underline font-medium`}>
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredCustomers.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No customers found
                    </div>
                )}
            </div>
        </div>
    );
}
