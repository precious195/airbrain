'use client';

import { useState, useEffect } from 'react';
import { useCompany } from './PortalLayout';
import { ref, get, set } from 'firebase/database';
import { database } from '@/lib/firebase/client';
import { SystemIntegration } from '@/types/database';
import { externalSystemService } from '@/lib/integrations/external-system-service';
import { CheckCircle, XCircle, Loader2, Plus, Trash2 } from 'lucide-react';

export default function SystemIntegrationSettings() {
    const company = useCompany();
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [config, setConfig] = useState<SystemIntegration>({
        enabled: false,
        integrationType: 'api',
        systemUrl: '',
        username: '',
        password: '',
        authType: 'basic',
        rules: {
            canViewBalance: false,
            canViewTransactions: false,
            canViewCustomerInfo: false,
            canUpdateRecords: false,
            canProcessPayments: false,
            canCreateTickets: false,
            customOperations: []
        },
        timeout: 10000
    });

    useEffect(() => {
        loadConfig();
    }, [company.id]);

    const loadConfig = async () => {
        try {
            const snapshot = await get(ref(database, `companies/${company.id}/systemIntegration`));
            if (snapshot.exists()) {
                setConfig(snapshot.val());
            }
        } catch (error) {
            console.error('Failed to load config:', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Encrypt password before saving
            const configToSave = {
                ...config,
                password: config.password ? externalSystemService.encryptCredentials(config.password) : '',
                apiKey: config.apiKey ? externalSystemService.encryptCredentials(config.apiKey) : undefined
            };

            await set(ref(database, `companies/${company.id}/systemIntegration`), configToSave);
            alert('Configuration saved successfully!');
        } catch (error) {
            console.error('Failed to save config:', error);
            alert('Failed to save configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const result = await externalSystemService.testConnection(config);
            setTestResult(result);
        } catch (error: any) {
            setTestResult({ success: false, message: error.message });
        } finally {
            setTesting(false);
        }
    };

    const addCustomOperation = () => {
        setConfig({
            ...config,
            rules: {
                ...config.rules,
                customOperations: [
                    ...(config.rules.customOperations || []),
                    {
                        name: '',
                        endpoint: '',
                        method: 'GET',
                        description: '',
                        enabled: true
                    }
                ]
            }
        });
    };

    const removeCustomOperation = (index: number) => {
        const newOps = [...(config.rules.customOperations || [])];
        newOps.splice(index, 1);
        setConfig({
            ...config,
            rules: {
                ...config.rules,
                customOperations: newOps
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">System Integration Configuration</h2>
                <p className="text-gray-600 mb-6">
                    Connect your external system to enable AI-powered customer service with real-time data access.
                </p>

                {/* Enable Integration Toggle */}
                <div className="mb-6 flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="enabled"
                        checked={config.enabled}
                        onChange={e => setConfig({ ...config, enabled: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded"
                    />
                    <label htmlFor="enabled" className="text-sm font-medium text-gray-900">
                        Enable System Integration
                    </label>
                </div>

                {/* Integration Type */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Integration Type</label>
                    <select
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={config.integrationType}
                        onChange={e => setConfig({ ...config, integrationType: e.target.value as any })}
                    >
                        <option value="api">API Integration (REST/GraphQL)</option>
                        <option value="browser">Browser Automation (UI-based)</option>
                        <option value="hybrid">Hybrid (API + Browser)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        {config.integrationType === 'api' && 'Connect via API endpoints'}
                        {config.integrationType === 'browser' && 'Automate browser interactions with your web system'}
                        {config.integrationType === 'hybrid' && 'Use API when available, fall back to browser automation'}
                    </p>
                </div>

                {/* API Integration Section */}
                {(config.integrationType === 'api' || config.integrationType === 'hybrid') && (
                    <div className="mb-6 p-4 border-2 border-blue-100 rounded-lg bg-blue-50/30">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span>API Configuration</span>
                        </h3>

                        {/* System URL */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">System API URL</label>
                            <input
                                type="url"
                                placeholder="https://api.yourcompany.com"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={config.systemUrl}
                                onChange={e => setConfig({ ...config, systemUrl: e.target.value })}
                            />
                        </div>

                        {/* Authentication Type */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Authentication Type</label>
                            <select
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={config.authType}
                                onChange={e => setConfig({ ...config, authType: e.target.value as any })}
                            >
                                <option value="basic">Basic Auth (Username/Password)</option>
                                <option value="bearer">Bearer Token</option>
                                <option value="apiKey">API Key</option>
                            </select>
                        </div>

                        {/* Credentials */}
                        {config.authType === 'basic' && (
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={config.username}
                                        onChange={e => setConfig({ ...config, username: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={config.password}
                                        onChange={e => setConfig({ ...config, password: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {(config.authType === 'bearer' || config.authType === 'apiKey') && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {config.authType === 'bearer' ? 'Bearer Token' : 'API Key'}
                                </label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={config.apiKey || ''}
                                    onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                                />
                            </div>
                        )}

                        {/* Test Connection */}
                        <div className="mb-6">
                            <button
                                onClick={handleTestConnection}
                                disabled={!config.systemUrl || testing}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {testing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Testing...
                                    </>
                                ) : (
                                    'Test Connection'
                                )}
                            </button>

                            {testResult && (
                                <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                    {testResult.success ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        <XCircle className="w-5 h-5" />
                                    )}
                                    {testResult.message}
                                </div>
                            )}
                        </div>

                        {/* Operation Rules */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Operation Permissions</h3>
                            <p className="text-sm text-gray-600 mb-4">Define what operations the AI can perform on your system</p>

                            <div className="space-y-2">
                                {[
                                    { key: 'canViewBalance', label: 'View Account Balance' },
                                    { key: 'canViewTransactions', label: 'View Transaction History' },
                                    { key: 'canViewCustomerInfo', label: 'View Customer Information' },
                                    { key: 'canUpdateRecords', label: 'Update Customer Records' },
                                    { key: 'canProcessPayments', label: 'Process Payments' },
                                    { key: 'canCreateTickets', label: 'Create Support Tickets' }
                                ].map(({ key, label }) => (
                                    <label key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <input
                                            type="checkbox"
                                            checked={config.rules[key as keyof typeof config.rules] as boolean}
                                            onChange={e => setConfig({
                                                ...config,
                                                rules: { ...config.rules, [key]: e.target.checked }
                                            })}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm font-medium text-gray-700">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Custom Operations */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">Custom Operations</h3>
                                <button
                                    onClick={addCustomOperation}
                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Operation
                                </button>
                            </div>

                            {config.rules.customOperations?.map((op, index) => (
                                <div key={index} className="mb-3 p-4 border rounded-lg bg-gray-50">
                                    <div className="grid grid-cols-2 gap-3 mb-2">
                                        <input
                                            type="text"
                                            placeholder="Operation Name"
                                            className="px-3 py-2 border rounded-lg text-sm"
                                            value={op.name}
                                            onChange={e => {
                                                const newOps = [...(config.rules.customOperations || [])];
                                                newOps[index].name = e.target.value;
                                                setConfig({ ...config, rules: { ...config.rules, customOperations: newOps } });
                                            }}
                                        />
                                        <select
                                            className="px-3 py-2 border rounded-lg text-sm"
                                            value={op.method}
                                            onChange={e => {
                                                const newOps = [...(config.rules.customOperations || [])];
                                                newOps[index].method = e.target.value as any;
                                                setConfig({ ...config, rules: { ...config.rules, customOperations: newOps } });
                                            }}
                                        >
                                            <option value="GET">GET</option>
                                            <option value="POST">POST</option>
                                            <option value="PUT">PUT</option>
                                            <option value="DELETE">DELETE</option>
                                        </select>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="/api/endpoint"
                                        className="w-full px-3 py-2 border rounded-lg text-sm mb-2"
                                        value={op.endpoint}
                                        onChange={e => {
                                            const newOps = [...(config.rules.customOperations || [])];
                                            newOps[index].endpoint = e.target.value;
                                            setConfig({ ...config, rules: { ...config.rules, customOperations: newOps } });
                                        }}
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Description"
                                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                            value={op.description}
                                            onChange={e => {
                                                const newOps = [...(config.rules.customOperations || [])];
                                                newOps[index].description = e.target.value;
                                                setConfig({ ...config, rules: { ...config.rules, customOperations: newOps } });
                                            }}
                                        />
                                        <button
                                            onClick={() => removeCustomOperation(index)}
                                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                        >
                            {loading ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
        </div>
            );
}
