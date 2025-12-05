'use client';

import { useState, useEffect } from 'react';
import { useIndustry, useCompany } from '@/components/portals/PortalLayout';
import { ref, get, set } from 'firebase/database';
import { database } from '@/lib/firebase/client';
import {
    MessageCircle,
    Facebook,
    Mail,
    Phone,
    Save,
    Loader2,
    CheckCircle,
    AlertCircle,
    Settings,
    Eye,
    EyeOff
} from 'lucide-react';

interface ChannelConfig {
    enabled: boolean;
    [key: string]: any;
}

interface ChannelsData {
    whatsapp: {
        enabled: boolean;
        phoneNumberId: string;
        accessToken: string;
        businessAccountId: string;
        webhookVerifyToken: string;
    };
    facebook: {
        enabled: boolean;
        pageId: string;
        accessToken: string;
        appSecret: string;
    };
    email: {
        enabled: boolean;
        smtpHost: string;
        smtpPort: number;
        username: string;
        password: string;
        imapHost: string;
        imapPort: number;
        fromName: string;
        fromEmail: string;
    };
    voice: {
        enabled: boolean;
        provider: 'twilio' | 'vonage' | 'none';
        accountSid: string;
        authToken: string;
        phoneNumber: string;
        voiceType: 'female' | 'male';
    };
}

const defaultChannels: ChannelsData = {
    whatsapp: {
        enabled: false,
        phoneNumberId: '',
        accessToken: '',
        businessAccountId: '',
        webhookVerifyToken: ''
    },
    facebook: {
        enabled: false,
        pageId: '',
        accessToken: '',
        appSecret: ''
    },
    email: {
        enabled: false,
        smtpHost: '',
        smtpPort: 587,
        username: '',
        password: '',
        imapHost: '',
        imapPort: 993,
        fromName: '',
        fromEmail: ''
    },
    voice: {
        enabled: false,
        provider: 'none',
        accountSid: '',
        authToken: '',
        phoneNumber: '',
        voiceType: 'female'
    }
};

export default function ChannelSettings() {
    const industry = useIndustry();
    const company = useCompany();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [channels, setChannels] = useState<ChannelsData>(defaultChannels);
    const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'facebook' | 'email' | 'voice'>('whatsapp');
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

    useEffect(() => {
        loadChannels();
    }, [company.id]);

    const loadChannels = async () => {
        try {
            setLoading(true);
            const channelsRef = ref(database, `companies/${company.id}/channels`);
            const snapshot = await get(channelsRef);

            if (snapshot.exists()) {
                setChannels({ ...defaultChannels, ...snapshot.val() });
            }
        } catch (error) {
            console.error('Error loading channels:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const channelsRef = ref(database, `companies/${company.id}/channels`);
            await set(channelsRef, {
                ...channels,
                updatedAt: Date.now()
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error saving channels:', error);
            alert('Failed to save channel configuration');
        } finally {
            setSaving(false);
        }
    };

    const toggleSecret = (key: string) => {
        setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const channelTabs = [
        { id: 'whatsapp' as const, label: 'WhatsApp', icon: MessageCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
        { id: 'facebook' as const, label: 'Facebook', icon: Facebook, color: 'text-blue-600', bgColor: 'bg-blue-100' },
        { id: 'email' as const, label: 'Email', icon: Mail, color: 'text-purple-600', bgColor: 'bg-purple-100' },
        { id: 'voice' as const, label: 'Voice', icon: Phone, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading channel configuration...</p>
                </div>
            </div>
        );
    }

    const renderSecretInput = (value: string, onChange: (val: string) => void, placeholder: string, secretKey: string) => (
        <div className="relative">
            <input
                type={showSecrets[secretKey] ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="button"
                onClick={() => toggleSecret(secretKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
                {showSecrets[secretKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
    );

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Communication Channels</h1>
                    <p className="text-gray-600 mt-1">Configure AI response channels for your customers</p>
                </div>
                {saved && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                        Configuration saved!
                    </div>
                )}
            </div>

            {/* Channel Status Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {channelTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isEnabled = channels[tab.id].enabled;
                    return (
                        <div
                            key={tab.id}
                            onClick={() => setActiveChannel(tab.id)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition ${activeChannel === tab.id
                                ? `border-${tab.color.replace('text-', '')} bg-gray-50`
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={`${tab.bgColor} p-2 rounded-lg`}>
                                    <Icon className={`w-5 h-5 ${tab.color}`} />
                                </div>
                                <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                            </div>
                            <div className="font-medium text-gray-900">{tab.label}</div>
                            <div className="text-sm text-gray-500">
                                {isEnabled ? 'Active' : 'Inactive'}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Channel Configuration Form */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                {/* WhatsApp Configuration */}
                {activeChannel === 'whatsapp' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <MessageCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">WhatsApp Business API</h2>
                                    <p className="text-sm text-gray-500">Connect your WhatsApp Business account</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={channels.whatsapp.enabled}
                                    onChange={(e) => setChannels({
                                        ...channels,
                                        whatsapp: { ...channels.whatsapp, enabled: e.target.checked }
                                    })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-checked:bg-green-600 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number ID</label>
                                <input
                                    type="text"
                                    value={channels.whatsapp.phoneNumberId}
                                    onChange={(e) => setChannels({
                                        ...channels,
                                        whatsapp: { ...channels.whatsapp, phoneNumberId: e.target.value }
                                    })}
                                    placeholder="Enter Phone Number ID"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Business Account ID</label>
                                <input
                                    type="text"
                                    value={channels.whatsapp.businessAccountId}
                                    onChange={(e) => setChannels({
                                        ...channels,
                                        whatsapp: { ...channels.whatsapp, businessAccountId: e.target.value }
                                    })}
                                    placeholder="Enter Business Account ID"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Access Token</label>
                                {renderSecretInput(
                                    channels.whatsapp.accessToken,
                                    (val) => setChannels({ ...channels, whatsapp: { ...channels.whatsapp, accessToken: val } }),
                                    'Enter Access Token',
                                    'wa-token'
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Webhook Verify Token</label>
                                <input
                                    type="text"
                                    value={channels.whatsapp.webhookVerifyToken}
                                    onChange={(e) => setChannels({
                                        ...channels,
                                        whatsapp: { ...channels.whatsapp, webhookVerifyToken: e.target.value }
                                    })}
                                    placeholder="Enter Verify Token"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-800">
                                <strong>Webhook URL:</strong>{' '}
                                <code className="bg-green-100 px-2 py-1 rounded">
                                    {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/whatsapp
                                </code>
                            </p>
                        </div>
                    </div>
                )}

                {/* Facebook Configuration */}
                {activeChannel === 'facebook' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <Facebook className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Facebook Messenger</h2>
                                    <p className="text-sm text-gray-500">Connect your Facebook Page for Messenger</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={channels.facebook.enabled}
                                    onChange={(e) => setChannels({
                                        ...channels,
                                        facebook: { ...channels.facebook, enabled: e.target.checked }
                                    })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-checked:bg-blue-600 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Page ID</label>
                                <input
                                    type="text"
                                    value={channels.facebook.pageId}
                                    onChange={(e) => setChannels({
                                        ...channels,
                                        facebook: { ...channels.facebook, pageId: e.target.value }
                                    })}
                                    placeholder="Enter Page ID"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">App Secret</label>
                                {renderSecretInput(
                                    channels.facebook.appSecret,
                                    (val) => setChannels({ ...channels, facebook: { ...channels.facebook, appSecret: val } }),
                                    'Enter App Secret',
                                    'fb-secret'
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Page Access Token</label>
                                {renderSecretInput(
                                    channels.facebook.accessToken,
                                    (val) => setChannels({ ...channels, facebook: { ...channels.facebook, accessToken: val } }),
                                    'Enter Page Access Token',
                                    'fb-token'
                                )}
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Webhook URL:</strong>{' '}
                                <code className="bg-blue-100 px-2 py-1 rounded">
                                    {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/facebook
                                </code>
                            </p>
                        </div>
                    </div>
                )}

                {/* Email Configuration */}
                {activeChannel === 'email' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <Mail className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Email Integration</h2>
                                    <p className="text-sm text-gray-500">Configure SMTP/IMAP for email support</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={channels.email.enabled}
                                    onChange={(e) => setChannels({
                                        ...channels,
                                        email: { ...channels.email, enabled: e.target.checked }
                                    })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-checked:bg-purple-600 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                                <input
                                    type="text"
                                    value={channels.email.fromName}
                                    onChange={(e) => setChannels({
                                        ...channels,
                                        email: { ...channels.email, fromName: e.target.value }
                                    })}
                                    placeholder="Support Team"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                                <input
                                    type="email"
                                    value={channels.email.fromEmail}
                                    onChange={(e) => setChannels({
                                        ...channels,
                                        email: { ...channels.email, fromEmail: e.target.value }
                                    })}
                                    placeholder="support@company.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                                <input
                                    type="text"
                                    value={channels.email.smtpHost}
                                    onChange={(e) => setChannels({
                                        ...channels,
                                        email: { ...channels.email, smtpHost: e.target.value }
                                    })}
                                    placeholder="smtp.gmail.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                                <input
                                    type="number"
                                    value={channels.email.smtpPort}
                                    onChange={(e) => setChannels({
                                        ...channels,
                                        email: { ...channels.email, smtpPort: parseInt(e.target.value) }
                                    })}
                                    placeholder="587"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                <input
                                    type="text"
                                    value={channels.email.username}
                                    onChange={(e) => setChannels({
                                        ...channels,
                                        email: { ...channels.email, username: e.target.value }
                                    })}
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                {renderSecretInput(
                                    channels.email.password,
                                    (val) => setChannels({ ...channels, email: { ...channels.email, password: val } }),
                                    'Enter Email Password',
                                    'email-pass'
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Voice Configuration */}
                {activeChannel === 'voice' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-100 p-3 rounded-lg">
                                    <Phone className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Voice Calls</h2>
                                    <p className="text-sm text-gray-500">Configure voice AI for phone support</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={channels.voice.enabled}
                                    onChange={(e) => setChannels({
                                        ...channels,
                                        voice: { ...channels.voice, enabled: e.target.checked }
                                    })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-checked:bg-orange-600 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Voice Provider</label>
                                <select
                                    value={channels.voice.provider}
                                    onChange={(e) => setChannels({
                                        ...channels,
                                        voice: { ...channels.voice, provider: e.target.value as any }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="none">Select Provider</option>
                                    <option value="twilio">Twilio</option>
                                    <option value="vonage">Vonage</option>
                                    <option value="africastalking">Africa's Talking</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={channels.voice.phoneNumber}
                                    onChange={(e) => setChannels({
                                        ...channels,
                                        voice: { ...channels.voice, phoneNumber: e.target.value }
                                    })}
                                    placeholder="+1234567890"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Account SID</label>
                                <input
                                    type="text"
                                    value={channels.voice.accountSid}
                                    onChange={(e) => setChannels({
                                        ...channels,
                                        voice: { ...channels.voice, accountSid: e.target.value }
                                    })}
                                    placeholder="Enter Account SID"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Auth Token</label>
                                {renderSecretInput(
                                    channels.voice.authToken,
                                    (val) => setChannels({ ...channels, voice: { ...channels.voice, authToken: val } }),
                                    'Enter Auth Token',
                                    'voice-token'
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">AI Voice Type</label>
                                <select
                                    value={channels.voice.voiceType}
                                    onChange={(e) => setChannels({
                                        ...channels,
                                        voice: { ...channels.voice, voiceType: e.target.value as any }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="female">Female Voice</option>
                                    <option value="male">Male Voice</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <p className="text-sm text-orange-800">
                                <strong>Voice Webhook:</strong>{' '}
                                <code className="bg-orange-100 px-2 py-1 rounded">
                                    {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/voice
                                </code>
                            </p>
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <div className="mt-8 flex justify-end">
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
                                Save Configuration
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
