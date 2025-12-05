'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { useState, useEffect } from 'react';
import {
    Settings,
    Shield,
    Mail,
    Bell,
    Database,
    Cloud,
    Key,
    Save,
    Loader2,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';

interface SystemSettings {
    general: {
        platformName: string;
        supportEmail: string;
        maxCompanies: number;
        maintenanceMode: boolean;
    };
    security: {
        sessionTimeout: number;
        maxLoginAttempts: number;
        requireMFA: boolean;
        passwordMinLength: number;
    };
    notifications: {
        emailEnabled: boolean;
        slackEnabled: boolean;
        slackWebhook: string;
        alertThreshold: number;
    };
    limits: {
        maxUsersPerCompany: number;
        maxConversationsPerDay: number;
        maxAPICallsPerMinute: number;
        storagePerCompanyGB: number;
    };
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [saved, setSaved] = useState(false);

    const [settings, setSettings] = useState<SystemSettings>({
        general: {
            platformName: 'AI Customer Service Platform',
            supportEmail: 'support@example.com',
            maxCompanies: 100,
            maintenanceMode: false
        },
        security: {
            sessionTimeout: 60,
            maxLoginAttempts: 5,
            requireMFA: false,
            passwordMinLength: 8
        },
        notifications: {
            emailEnabled: true,
            slackEnabled: false,
            slackWebhook: '',
            alertThreshold: 100
        },
        limits: {
            maxUsersPerCompany: 50,
            maxConversationsPerDay: 10000,
            maxAPICallsPerMinute: 1000,
            storagePerCompanyGB: 10
        }
    });

    const handleSave = async () => {
        setSaving(true);
        // Simulate save
        await new Promise(r => setTimeout(r, 1000));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'limits', label: 'Limits & Quotas', icon: Database }
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
                        <p className="text-muted-foreground mt-1">Configure platform-wide settings and policies</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : saved ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Settings Content */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Settings className="w-5 h-5 text-blue-500" />
                                General Settings
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Platform Name</label>
                                    <input
                                        type="text"
                                        value={settings.general.platformName}
                                        onChange={e => setSettings({
                                            ...settings,
                                            general: { ...settings.general, platformName: e.target.value }
                                        })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Support Email</label>
                                    <input
                                        type="email"
                                        value={settings.general.supportEmail}
                                        onChange={e => setSettings({
                                            ...settings,
                                            general: { ...settings.general, supportEmail: e.target.value }
                                        })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Max Companies</label>
                                    <input
                                        type="number"
                                        value={settings.general.maxCompanies}
                                        onChange={e => setSettings({
                                            ...settings,
                                            general: { ...settings.general, maxCompanies: parseInt(e.target.value) }
                                        })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="maintenance"
                                        checked={settings.general.maintenanceMode}
                                        onChange={e => setSettings({
                                            ...settings,
                                            general: { ...settings.general, maintenanceMode: e.target.checked }
                                        })}
                                        className="w-5 h-5 rounded"
                                    />
                                    <label htmlFor="maintenance" className="font-medium">
                                        Maintenance Mode
                                        <p className="text-sm text-muted-foreground font-normal">Disable access for non-admin users</p>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Shield className="w-5 h-5 text-green-500" />
                                Security Settings
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                                    <input
                                        type="number"
                                        value={settings.security.sessionTimeout}
                                        onChange={e => setSettings({
                                            ...settings,
                                            security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                                        })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Max Login Attempts</label>
                                    <input
                                        type="number"
                                        value={settings.security.maxLoginAttempts}
                                        onChange={e => setSettings({
                                            ...settings,
                                            security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                                        })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Min Password Length</label>
                                    <input
                                        type="number"
                                        value={settings.security.passwordMinLength}
                                        onChange={e => setSettings({
                                            ...settings,
                                            security: { ...settings.security, passwordMinLength: parseInt(e.target.value) }
                                        })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="mfa"
                                        checked={settings.security.requireMFA}
                                        onChange={e => setSettings({
                                            ...settings,
                                            security: { ...settings.security, requireMFA: e.target.checked }
                                        })}
                                        className="w-5 h-5 rounded"
                                    />
                                    <label htmlFor="mfa" className="font-medium">
                                        Require MFA
                                        <p className="text-sm text-muted-foreground font-normal">Force multi-factor authentication for all users</p>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Bell className="w-5 h-5 text-orange-500" />
                                Notification Settings
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="email"
                                        checked={settings.notifications.emailEnabled}
                                        onChange={e => setSettings({
                                            ...settings,
                                            notifications: { ...settings.notifications, emailEnabled: e.target.checked }
                                        })}
                                        className="w-5 h-5 rounded"
                                    />
                                    <label htmlFor="email" className="font-medium">Enable Email Notifications</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="slack"
                                        checked={settings.notifications.slackEnabled}
                                        onChange={e => setSettings({
                                            ...settings,
                                            notifications: { ...settings.notifications, slackEnabled: e.target.checked }
                                        })}
                                        className="w-5 h-5 rounded"
                                    />
                                    <label htmlFor="slack" className="font-medium">Enable Slack Notifications</label>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-2">Slack Webhook URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://hooks.slack.com/..."
                                        value={settings.notifications.slackWebhook}
                                        onChange={e => setSettings({
                                            ...settings,
                                            notifications: { ...settings.notifications, slackWebhook: e.target.value }
                                        })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'limits' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Database className="w-5 h-5 text-purple-500" />
                                Limits & Quotas
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Max Users per Company</label>
                                    <input
                                        type="number"
                                        value={settings.limits.maxUsersPerCompany}
                                        onChange={e => setSettings({
                                            ...settings,
                                            limits: { ...settings.limits, maxUsersPerCompany: parseInt(e.target.value) }
                                        })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Max Conversations/Day</label>
                                    <input
                                        type="number"
                                        value={settings.limits.maxConversationsPerDay}
                                        onChange={e => setSettings({
                                            ...settings,
                                            limits: { ...settings.limits, maxConversationsPerDay: parseInt(e.target.value) }
                                        })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Max API Calls/Minute</label>
                                    <input
                                        type="number"
                                        value={settings.limits.maxAPICallsPerMinute}
                                        onChange={e => setSettings({
                                            ...settings,
                                            limits: { ...settings.limits, maxAPICallsPerMinute: parseInt(e.target.value) }
                                        })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Storage per Company (GB)</label>
                                    <input
                                        type="number"
                                        value={settings.limits.storagePerCompanyGB}
                                        onChange={e => setSettings({
                                            ...settings,
                                            limits: { ...settings.limits, storagePerCompanyGB: parseInt(e.target.value) }
                                        })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
