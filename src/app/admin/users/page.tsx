'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Shield,
    Building2,
    CheckCircle,
    XCircle,
    Key,
    Loader2
} from 'lucide-react';
import { adminService } from '@/lib/admin/admin-service';
import { User } from '@/types/database';

interface UserWithCompanyName extends User {
    companyName?: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserWithCompanyName[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const [allUsers, allCompanies] = await Promise.all([
                adminService.getAllUsers(),
                adminService.getAllCompanies()
            ]);

            // Create a map of companyId -> companyName
            const companyMap: Record<string, string> = {};
            allCompanies.forEach(c => {
                companyMap[c.id] = c.name;
            });

            // Add company names to users
            const usersWithCompanyNames = allUsers.map(u => ({
                ...u,
                companyName: u.companyId ? companyMap[u.companyId] || 'Unknown' : 'System'
            }));

            setUsers(usersWithCompanyNames);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: 'platform_admin' | 'company_admin' | 'agent') => {
        const roleLabel = newRole === 'platform_admin' ? 'Platform Admin' : newRole === 'company_admin' ? 'Company Admin' : 'Agent';
        if (!confirm(`Are you sure you want to change this user's role to ${roleLabel}?`)) return;

        setActionLoading(userId);
        try {
            await adminService.updateUserRole(userId, newRole);
            await loadUsers();
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Failed to update user role');
        } finally {
            setActionLoading(null);
        }
    };

    const getTimeAgo = (timestamp: number) => {
        if (!timestamp) return 'Never';
        const minutes = Math.floor((Date.now() - timestamp) / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch =
            (u.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.companyName || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'platform_admin':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">Platform Admin</span>;
            case 'company_admin':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">Company Admin</span>;
            case 'admin':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">Admin</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Agent</span>;
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                    <p className="text-muted-foreground mt-1">Manage user access and roles across the platform</p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent outline-none"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="platform_admin">Platform Admin</option>
                            <option value="company_admin">Company Admin</option>
                            <option value="admin">Admin</option>
                            <option value="agent">Agent</option>
                        </select>
                        <select
                            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent outline-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Users className="w-12 h-12 mb-4 opacity-30" />
                            <p className="font-medium">No users found</p>
                            <p className="text-sm mt-1">
                                {users.length === 0
                                    ? "No users have registered yet."
                                    : "Try adjusting your search or filters."
                                }
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-sm text-slate-500">User</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-slate-500">Role</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-slate-500">Company</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-slate-500">Status</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-slate-500">Created</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                                    <Users className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground">{user.displayName || 'Unnamed User'}</div>
                                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <Building2 className="w-4 h-4" />
                                                {user.companyName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {user.status === 'active' ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-slate-400" />
                                                )}
                                                <span className="text-sm capitalize">{user.status || 'active'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {getTimeAgo(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {actionLoading === user.id ? (
                                                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                                                ) : (
                                                    <>
                                                        <button
                                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-500 transition"
                                                            title="Reset Password (Not Implemented)"
                                                        >
                                                            <Key className="w-4 h-4" />
                                                        </button>
                                                        <select
                                                            className="p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent outline-none hover:border-purple-500 transition"
                                                            value={user.role}
                                                            onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                                                        >
                                                            <option value="agent">Agent</option>
                                                            <option value="company_admin">Company Admin</option>
                                                            <option value="platform_admin">Platform Admin</option>
                                                        </select>
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
        </AdminLayout>
    );
}
