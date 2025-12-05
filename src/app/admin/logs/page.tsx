'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { useState, useEffect } from 'react';
import {
    ScrollText,
    Search,
    Filter,
    Download,
    Eye,
    Shield,
    User,
    Building2,
    Settings,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Loader2,
    Calendar
} from 'lucide-react';

interface AuditLog {
    id: string;
    timestamp: number;
    userId: string;
    userName: string;
    companyId?: string;
    companyName?: string;
    action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'access' | 'export';
    resource: string;
    resourceId?: string;
    details?: string;
    ipAddress?: string;
    status: 'success' | 'failed' | 'warning';
}

const mockLogs: AuditLog[] = [
    {
        id: '1',
        timestamp: Date.now() - 1000 * 60 * 5,
        userId: 'user1',
        userName: 'Admin User',
        action: 'login',
        resource: 'session',
        ipAddress: '192.168.1.1',
        status: 'success'
    },
    {
        id: '2',
        timestamp: Date.now() - 1000 * 60 * 15,
        userId: 'user2',
        userName: 'John Doe',
        companyId: 'comp1',
        companyName: 'TechCorp',
        action: 'create',
        resource: 'conversation',
        resourceId: 'conv-12345',
        status: 'success'
    },
    {
        id: '3',
        timestamp: Date.now() - 1000 * 60 * 30,
        userId: 'user1',
        userName: 'Admin User',
        action: 'update',
        resource: 'settings',
        details: 'Updated security policies',
        status: 'success'
    },
    {
        id: '4',
        timestamp: Date.now() - 1000 * 60 * 60,
        userId: 'user3',
        userName: 'Jane Smith',
        action: 'login',
        resource: 'session',
        ipAddress: '10.0.0.1',
        status: 'failed',
        details: 'Invalid password'
    },
    {
        id: '5',
        timestamp: Date.now() - 1000 * 60 * 120,
        userId: 'user1',
        userName: 'Admin User',
        action: 'delete',
        resource: 'company',
        resourceId: 'comp-old',
        details: 'Removed inactive company',
        status: 'warning'
    }
];

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>(mockLogs);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const getTimeAgo = (timestamp: number) => {
        const minutes = Math.floor((Date.now() - timestamp) / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'login':
            case 'logout': return <User className="w-4 h-4" />;
            case 'create': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'update': return <Settings className="w-4 h-4 text-blue-500" />;
            case 'delete': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'access': return <Eye className="w-4 h-4" />;
            case 'export': return <Download className="w-4 h-4" />;
            default: return <ScrollText className="w-4 h-4" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Success</span>;
            case 'failed':
                return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Failed</span>;
            case 'warning':
                return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Warning</span>;
            default:
                return null;
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (log.details || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAction = actionFilter === 'all' || log.action === actionFilter;
        const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
        return matchesSearch && matchesAction && matchesStatus;
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
                        <p className="text-muted-foreground mt-1">Monitor all platform activities and security events</p>
                    </div>
                    <button className="btn-secondary flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export Logs
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                    >
                        <option value="all">All Actions</option>
                        <option value="login">Login</option>
                        <option value="logout">Logout</option>
                        <option value="create">Create</option>
                        <option value="update">Update</option>
                        <option value="delete">Delete</option>
                        <option value="access">Access</option>
                        <option value="export">Export</option>
                    </select>
                    <select
                        className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="warning">Warning</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <Calendar className="w-4 h-4" />
                        Date Range
                    </button>
                </div>

                {/* Logs Table */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-sm text-slate-500">Time</th>
                                <th className="px-6 py-4 font-semibold text-sm text-slate-500">User</th>
                                <th className="px-6 py-4 font-semibold text-sm text-slate-500">Action</th>
                                <th className="px-6 py-4 font-semibold text-sm text-slate-500">Resource</th>
                                <th className="px-6 py-4 font-semibold text-sm text-slate-500">Status</th>
                                <th className="px-6 py-4 font-semibold text-sm text-slate-500">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredLogs.map((log) => (
                                <tr
                                    key={log.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                                    onClick={() => setSelectedLog(log)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-foreground">{getTimeAgo(log.timestamp)}</div>
                                        <div className="text-xs text-muted-foreground">{formatTime(log.timestamp)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{log.userName}</div>
                                        {log.companyName && (
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Building2 className="w-3 h-3" />
                                                {log.companyName}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 capitalize">
                                            {getActionIcon(log.action)}
                                            {log.action}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="capitalize">{log.resource}</span>
                                        {log.resourceId && (
                                            <span className="text-xs text-muted-foreground ml-2">#{log.resourceId}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(log.status)}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-[200px] truncate">
                                        {log.details || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredLogs.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <ScrollText className="w-12 h-12 mb-4 opacity-30" />
                            <p className="font-medium">No logs found</p>
                            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>

                {/* Log Detail Modal */}
                {selectedLog && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedLog(null)}>
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
                            <h3 className="text-xl font-bold mb-4">Log Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Timestamp</span>
                                    <span className="font-medium">{formatTime(selectedLog.timestamp)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">User</span>
                                    <span className="font-medium">{selectedLog.userName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Action</span>
                                    <span className="font-medium capitalize">{selectedLog.action}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Resource</span>
                                    <span className="font-medium capitalize">{selectedLog.resource}</span>
                                </div>
                                {selectedLog.ipAddress && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">IP Address</span>
                                        <span className="font-mono text-sm">{selectedLog.ipAddress}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    {getStatusBadge(selectedLog.status)}
                                </div>
                                {selectedLog.details && (
                                    <div>
                                        <span className="text-muted-foreground block mb-1">Details</span>
                                        <p className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-sm">{selectedLog.details}</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="mt-6 w-full btn-secondary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
