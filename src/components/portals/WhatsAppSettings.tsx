'use client';

import { useState } from 'react';
import { MessageCircle, Save, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useIndustry } from './PortalLayout';

export default function WhatsAppSettings() {
    const industry = useIndustry();
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [autoResponse, setAutoResponse] = useState(true);
    const [escalationThreshold, setEscalationThreshold] = useState(70);

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${industry.bgColor} bg-opacity-10`}>
                    <MessageCircle className={`w-6 h-6 ${industry.color}`} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">WhatsApp Integration</h2>
                    <p className="text-sm text-gray-500">Configure your WhatsApp Business API connection</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                        <div className="font-medium text-gray-900">Enable WhatsApp Support</div>
                        <div className="text-sm text-gray-500">Allow customers to contact via WhatsApp</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                        />
                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-opacity-20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:${industry.bgColor}`}></div>
                    </label>
                </div>

                {enabled && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    WhatsApp Business Phone Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+260 97 123 4567"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Business Account ID
                                </label>
                                <input
                                    type="text"
                                    placeholder="123456789"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                API Access Token
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="EAAG..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500 font-mono text-sm"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                                    Never share this token
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-6 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Automation</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-gray-900">AI Auto-Response</div>
                                        <div className="text-sm text-gray-500">Automatically respond to customer messages using knowledge base</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={autoResponse}
                                            onChange={(e) => setAutoResponse(e.target.checked)}
                                        />
                                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-opacity-20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:${industry.bgColor}`}></div>
                                    </label>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-medium text-gray-700">Escalation Threshold</label>
                                        <span className={`text-sm font-bold ${industry.color}`}>{escalationThreshold}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="50"
                                        max="95"
                                        value={escalationThreshold}
                                        onChange={(e) => setEscalationThreshold(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-current"
                                        style={{ color: 'currentColor' }}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Escalate to human agent if AI confidence is below {escalationThreshold}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                            <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">
                                Test Connection
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className={`${industry.bgColor} text-white px-6 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2 disabled:opacity-70`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : saved ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Saved!
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Configuration
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
