'use client';

import { useIndustry, useCompany } from '@/components/portals/PortalLayout';
import { useState, useEffect } from 'react';
import { Save, Key, Bell, Globe, Loader2, CheckCircle, Users, MessageCircle } from 'lucide-react';
import { ref, get, set } from 'firebase/database';
import { database } from '@/lib/firebase/client';
import Link from 'next/link';

interface SettingsData {
    companyName: string;
    supportEmail: string;
    supportPhone: string;
    enableNotifications: boolean;
    enableAI: boolean;
    autoResolve: boolean;
    language: string;
    timezone: string;
}

export default function PortalSettings() {
    const industry = useIndustry();
    const company = useCompany();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [settings, setSettings] = useState<SettingsData>({
        companyName: '',
        supportEmail: '',
        supportPhone: '',
        enableNotifications: true,
        enableAI: true,
        autoResolve: false,
        language: 'en',
        timezone: 'Africa/Lusaka',
    });

    useEffect(() => {
        loadSettings();
    }, [company.id]);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const settingsRef = ref(database, `companies/${company.id}/settings`);
            const snapshot = await get(settingsRef);

            if (snapshot.exists()) {
                setSettings({ ...settings, ...snapshot.val() });
            } else {
                setSettings(prev => ({ ...prev, companyName: company.name }));
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const settingsRef = ref(database, `companies/${company.id}/settings`);
            await set(settingsRef, {
                ...settings,
                updatedAt: Date.now()
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-1">Configure your {industry.name} portal preferences</p>
                </div>
                {saved && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                        Settings saved successfully!
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {/* Quick Links */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            href={`/portals/${industry.id}/settings/team`}
                            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
                        >
                            <Users className={`w-6 h-6 ${industry.color}`} />
                            <div>
                                <div className="font-medium text-gray-900">Team Management</div>
                                <div className="text-sm text-gray-500">Manage team members & roles</div>
                            </div>
                        </Link>
                        <Link
                            href={`/portals/${industry.id}/settings/channels`}
                            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition"
                        >
                            <MessageCircle className="w-6 h-6 text-green-600" />
                            <div>
                                <div className="font-medium text-gray-900">Communication Channels</div>
                                <div className="text-sm text-gray-500">WhatsApp, Facebook, Email, Voice</div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* General Settings */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Globe className={`w-6 h-6 ${industry.color}`} />
                        <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company Name
                            </label>
                            <input
                                type="text"
                                value={settings.companyName}
                                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Support Email
                            </label>
                            <input
                                type="email"
                                value={settings.supportEmail}
                                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="support@company.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Support Phone
                            </label>
                            <input
                                type="tel"
                                value={settings.supportPhone}
                                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="+260 XXX XXX XXX"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Timezone
                            </label>
                            <select
                                value={settings.timezone}
                                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Africa/Lusaka">Africa/Lusaka (CAT)</option>
                                <option value="UTC">UTC</option>
                                <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                                <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                                <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Language
                            </label>
                            <select
                                value={settings.language}
                                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="en">English</option>
                                <option value="fr">French</option>
                                <option value="pt">Portuguese</option>
                                <option value="sw">Swahili</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* AI & Automation */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Bell className={`w-6 h-6 ${industry.color}`} />
                        <h2 className="text-xl font-bold text-gray-900">AI & Automation</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <div className="font-medium text-gray-900">Enable Notifications</div>
                                <div className="text-sm text-gray-500">Receive alerts for new conversations</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.enableNotifications}
                                    onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <div className="font-medium text-gray-900">Enable AI Responses</div>
                                <div className="text-sm text-gray-500">Use AI for automated customer responses</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.enableAI}
                                    onChange={(e) => setSettings({ ...settings, enableAI: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <div className="font-medium text-gray-900">Auto-Resolve Tickets</div>
                                <div className="text-sm text-gray-500">Automatically resolve completed conversations</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.autoResolve}
                                    onChange={(e) => setSettings({ ...settings, autoResolve: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* API Keys */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Key className={`w-6 h-6 ${industry.color}`} />
                        <h2 className="text-xl font-bold text-gray-900">API Configuration</h2>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-4">
                            API keys are managed securely. Contact your administrator to regenerate keys.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                value="••••••••••••••••••••••••"
                                readOnly
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white"
                            />
                            <button className={`${industry.bgColor} text-white px-6 py-2 rounded-lg hover:opacity-90 transition`}>
                                View Key
                            </button>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`${industry.bgColor} text-white px-8 py-3 rounded-lg hover:opacity-90 transition flex items-center gap-2 font-medium disabled:opacity-50`}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
