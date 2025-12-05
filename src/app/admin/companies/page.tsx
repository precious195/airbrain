'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { useState, useEffect } from 'react';
import {
    Building2,
    Search,
    Plus,
    Trash2,
    Edit,
    Users,
    AlertCircle,
    Loader2
} from 'lucide-react';
import CompanyModal from '@/components/admin/CompanyModal';
import { adminService, CompanyWithUserCount } from '@/lib/admin/admin-service';

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<CompanyWithUserCount[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [industryFilter, setIndustryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllCompanies();
            setCompanies(data);
        } catch (error) {
            console.error('Error loading companies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCompany = async (data: any) => {
        // The modal handles submission; just refresh the list
        await loadCompanies();
        setIsModalOpen(false);
    };

    const handleSuspendCompany = async (companyId: string) => {
        if (!confirm('Are you sure you want to suspend this company?')) return;

        setActionLoading(companyId);
        try {
            const company = companies.find(c => c.id === companyId);
            const newStatus = company?.status === 'suspended' ? 'active' : 'suspended';
            await adminService.updateCompanyStatus(companyId, newStatus as 'active' | 'suspended');
            await loadCompanies();
        } catch (error) {
            console.error('Error updating company:', error);
            alert('Failed to update company status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteCompany = async (companyId: string) => {
        if (!confirm('Are you sure you want to DELETE this company? This action cannot be undone.')) return;

        setActionLoading(companyId);
        try {
            await adminService.deleteCompany(companyId);
            await loadCompanies();
        } catch (error) {
            console.error('Error deleting company:', error);
            alert('Failed to delete company');
        } finally {
            setActionLoading(null);
        }
    };

    const getIndustryLabel = (industry: string) => {
        const labels: Record<string, string> = {
            mobile: 'Mobile Telecom',
            banking: 'Banking',
            insurance: 'Insurance',
            microfinance: 'Microfinance',
            television: 'Television'
        };
        return labels[industry] || industry;
    };

    const formatDate = (timestamp: number) => {
        if (!timestamp) return 'Unknown';
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredCompanies = companies.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.industry.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesIndustry = industryFilter === 'all' || c.industry === industryFilter;
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchesSearch && matchesIndustry && matchesStatus;
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Companies</h1>
                        <p className="text-muted-foreground mt-1">Manage tenant companies and subscriptions</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Company
                    </button>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search companies..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent outline-none"
                            value={industryFilter}
                            onChange={(e) => setIndustryFilter(e.target.value)}
                        >
                            <option value="all">All Industries</option>
                            <option value="mobile">Mobile</option>
                            <option value="banking">Banking</option>
                            <option value="insurance">Insurance</option>
                            <option value="microfinance">Microfinance</option>
                            <option value="television">Television</option>
                        </select>
                        <select
                            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent outline-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>

                {/* Companies Table */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : filteredCompanies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Building2 className="w-12 h-12 mb-4 opacity-30" />
                            <p className="font-medium">No companies found</p>
                            <p className="text-sm mt-1">
                                {companies.length === 0
                                    ? "Click 'Add Company' to create the first company."
                                    : "Try adjusting your search or filters."
                                }
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-sm text-slate-500">Company</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-slate-500">Industry</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-slate-500">Status</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-slate-500">Plan</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-slate-500">Users</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredCompanies.map((company) => (
                                    <tr key={company.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground">{company.name}</div>
                                                    <div className="text-xs text-muted-foreground">{formatDate(company.createdAt)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="capitalize px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-sm">
                                                {getIndustryLabel(company.industry)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${company.status === 'active' || !company.status
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {company.status || 'active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="uppercase text-xs font-bold tracking-wider text-slate-500">
                                                {company.settings?.plan || 'free'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-slate-500">
                                                <Users className="w-4 h-4" />
                                                {company.userCount}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {actionLoading === company.id ? (
                                                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleSuspendCompany(company.id)}
                                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-yellow-500 transition"
                                                            title={company.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                                                        >
                                                            <AlertCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCompany(company.id)}
                                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <CompanyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateCompany}
            />
        </AdminLayout>
    );
}
