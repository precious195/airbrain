'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { useState } from 'react';
import {
    Key,
    Plus,
    Copy,
    Eye,
    EyeOff,
    Trash2,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2,
    RefreshCw
} from 'lucide-react';

interface APIKey {
    id: string;
    name: string;
    key: string;
    prefix: string;
    companyId?: string;
    companyName?: string;
    permissions: string[];
    createdAt: number;
    lastUsed?: number;
    expiresAt?: number;
    status: 'active' | 'expired' | 'revoked';
    usageCount: number;
}

const mockKeys: APIKey[] = [
    {
        id: '1',
        name: 'Production API Key',
        key: 'mock_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        prefix: 'mock_live_',
        permissions: ['read', 'write', 'admin'],
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
        lastUsed: Date.now() - 1000 * 60 * 15,
        status: 'active',
        usageCount: 15234
    },
    {
        id: '2',
        name: 'Development Key',
        key: 'mock_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        prefix: 'mock_test_',
        permissions: ['read', 'write'],
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
        lastUsed: Date.now() - 1000 * 60 * 60 * 2,
        status: 'active',
        usageCount: 892
    },
    {
        id: '3',
        name: 'TechCorp Integration',
        key: 'mock_live_YYYYYYYYYYYYYYYYYYYYYYYYYYYY',
        prefix: 'mock_live_',
        companyId: 'comp1',
        companyName: 'TechCorp',
        permissions: ['read'],
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
        lastUsed: Date.now() - 1000 * 60 * 60 * 24,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 60,
        status: 'active',
        usageCount: 4521
    },
    {
        id: '4',
        name: 'Old Integration Key',
        key: 'mock_live_ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
        prefix: 'mock_live_',
        permissions: ['read'],
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
        expiresAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
        status: 'expired',
        usageCount: 0
    }
];

export default function APIKeysPage() {
    const [keys, setKeys] = useState<APIKey[]>(mockKeys);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [newKeyData, setNewKeyData] = useState({
        name: '',
        permissions: ['read'],
        expiresIn: '90'
    });

    const toggleKeyVisibility = (keyId: string) => {
        const newVisible = new Set(visibleKeys);
        if (newVisible.has(keyId)) {
            newVisible.delete(keyId);
        } else {
            newVisible.add(keyId);
        }
        setVisibleKeys(newVisible);
    };

    const copyToClipboard = async (key: string, keyId: string) => {
        await navigator.clipboard.writeText(key);
        setCopiedKey(keyId);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTimeAgo = (timestamp: number | undefined) => {
        if (!timestamp) return 'Never';
        const minutes = Math.floor((Date.now() - timestamp) / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const handleCreateKey = () => {
        const newKey: APIKey = {
            id: `key_${Date.now()}`,
            name: newKeyData.name,
            key: `mock_live_${Math.random().toString(36).substring(2, 34).toUpperCase()}`,
            prefix: 'mock_live_',
            permissions: newKeyData.permissions,
            createdAt: Date.now(),
            expiresAt: newKeyData.expiresIn ? Date.now() + parseInt(newKeyData.expiresIn) * 24 * 60 * 60 * 1000 : undefined,
            status: 'active',
            usageCount: 0
        };
        setKeys([newKey, ...keys]);
        setShowCreateModal(false);
        setNewKeyData({ name: '', permissions: ['read'], expiresIn: '90' });
    };

    const handleRevokeKey = (keyId: string) => {
        if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;
        setKeys(keys.map(k => k.id === keyId ? { ...k, status: 'revoked' as const } : k));
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">API Keys</h1>
                        <p className="text-muted-foreground mt-1">Manage API keys for platform integrations</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Generate New Key
                    </button>
                </div>

                {/* API Keys List */}
                <div className="space-y-4">
                    {keys.map((apiKey) => (
                        <div
                            key={apiKey.id}
                            className={`bg-white dark:bg-slate-900 rounded-xl border ${apiKey.status === 'active'
                                ? 'border-slate-200 dark:border-slate-700'
                                : 'border-red-200 dark:border-red-900/50 opacity-60'
                                } p-6`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <Key className={`w-5 h-5 ${apiKey.status === 'active' ? 'text-blue-500' : 'text-slate-400'}`} />
                                        <h3 className="font-semibold text-lg">{apiKey.name}</h3>
                                        {apiKey.status === 'active' ? (
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>
                                        ) : apiKey.status === 'expired' ? (
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Expired</span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Revoked</span>
                                        )}
                                    </div>

                                    {/* Key Display */}
                                    <div className="mt-3 flex items-center gap-2">
                                        <code className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono text-sm flex-1">
                                            {visibleKeys.has(apiKey.id)
                                                ? apiKey.key
                                                : `${apiKey.prefix}${'•'.repeat(32)}`
                                            }
                                        </code>
                                        <button
                                            onClick={() => toggleKeyVisibility(apiKey.id)}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                            title={visibleKeys.has(apiKey.id) ? 'Hide' : 'Show'}
                                        >
                                            {visibleKeys.has(apiKey.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                            title="Copy"
                                        >
                                            {copiedKey === apiKey.id ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Metadata */}
                                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            Created: {formatDate(apiKey.createdAt)}
                                        </div>
                                        <div>Last used: {getTimeAgo(apiKey.lastUsed)}</div>
                                        <div>Usage: {apiKey.usageCount.toLocaleString()} calls</div>
                                        {apiKey.expiresAt && (
                                            <div className={apiKey.expiresAt < Date.now() ? 'text-red-500' : ''}>
                                                Expires: {formatDate(apiKey.expiresAt)}
                                            </div>
                                        )}
                                        {apiKey.companyName && (
                                            <div className="flex items-center gap-1">
                                                Company: {apiKey.companyName}
                                            </div>
                                        )}
                                    </div>

                                    {/* Permissions */}
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Permissions:</span>
                                        {apiKey.permissions.map(perm => (
                                            <span key={perm} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs capitalize">
                                                {perm}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                {apiKey.status === 'active' && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleRevokeKey(apiKey.id)}
                                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-500"
                                            title="Revoke Key"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {keys.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <Key className="w-12 h-12 mb-4 opacity-30" />
                        <p className="font-medium">No API keys</p>
                        <p className="text-sm mt-1">Generate a key to start using the API.</p>
                    </div>
                )}

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
                            <h3 className="text-xl font-bold mb-4">Generate New API Key</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Key Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Production Integration"
                                        value={newKeyData.name}
                                        onChange={e => setNewKeyData({ ...newKeyData, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Permissions</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['read', 'write', 'admin'].map(perm => (
                                            <label key={perm} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newKeyData.permissions.includes(perm)}
                                                    onChange={e => {
                                                        if (e.target.checked) {
                                                            setNewKeyData({ ...newKeyData, permissions: [...newKeyData.permissions, perm] });
                                                        } else {
                                                            setNewKeyData({ ...newKeyData, permissions: newKeyData.permissions.filter(p => p !== perm) });
                                                        }
                                                    }}
                                                    className="rounded"
                                                />
                                                <span className="capitalize">{perm}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Expires In</label>
                                    <select
                                        value={newKeyData.expiresIn}
                                        onChange={e => setNewKeyData({ ...newKeyData, expiresIn: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                                    >
                                        <option value="30">30 days</option>
                                        <option value="90">90 days</option>
                                        <option value="180">6 months</option>
                                        <option value="365">1 year</option>
                                        <option value="">Never</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowCreateModal(false)} className="flex-1 btn-secondary">
                                    Cancel
                                </button>
                                <button onClick={handleCreateKey} disabled={!newKeyData.name} className="flex-1 btn-primary">
                                    Generate Key
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
