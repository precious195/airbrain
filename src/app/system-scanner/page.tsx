'use client';

import { useState } from 'react';
import { Play, CheckCircle, XCircle, Loader2, Download, Eye } from 'lucide-react';

interface DiscoveredFeature {
    id: string;
    featureName: string;
    type: string;
    actionType: string;
    selector: string;
    url?: string;
    pageUrl: string;
    status: string;
}

interface ScanResult {
    features: DiscoveredFeature[];
    pagesCrawled: number;
    totalFeatures: number;
    scanDuration: number;
    errors: string[];
}

export default function SystemScannerPage() {
    const [scanning, setScanning] = useState(false);
    const [scanConfig, setScanConfig] = useState({
        url: '',
        username: '',
        password: '',
        usernameField: '#username',
        passwordField: '#password',
        loginButton: '#login-btn',
        maxDepth: 2,
        maxPages: 30
    });

    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [selectedFeature, setSelectedFeature] = useState<DiscoveredFeature | null>(null);

    const handleScan = async () => {
        setScanning(true);

        try {
            const response = await fetch('/api/scanner/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: scanConfig.url,
                    username: scanConfig.username,
                    password: scanConfig.password,
                    loginSelectors: {
                        usernameField: scanConfig.usernameField,
                        passwordField: scanConfig.passwordField,
                        loginButton: scanConfig.loginButton
                    },
                    maxDepth: scanConfig.maxDepth,
                    maxPagesToScan: scanConfig.maxPages
                })
            });

            const result = await response.json();
            setScanResult(result);
        } catch (error) {
            console.error('Scan failed:', error);
        } finally {
            setScanning(false);
        }
    };

    const generateActions = async () => {
        if (!scanResult) return;

        const response = await fetch('/api/scanner/generate-actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ features: scanResult.features })
        });

        const { actions } = await response.json();
        alert(`Generated ${actions.length} actions!`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart System Scanner</h1>
                    <p className="text-gray-600 mb-6">
                        Automatically discover all features in your external system
                    </p>

                    {/* Configuration Form */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                External System URL *
                            </label>
                            <input
                                type="url"
                                value={scanConfig.url}
                                onChange={(e) => setScanConfig({ ...scanConfig, url: e.target.value })}
                                placeholder="https://clientsystem.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username *
                            </label>
                            <input
                                type="text"
                                value={scanConfig.username}
                                onChange={(e) => setScanConfig({ ...scanConfig, username: e.target.value })}
                                placeholder="admin"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password *
                            </label>
                            <input
                                type="password"
                                value={scanConfig.password}
                                onChange={(e) => setScanConfig({ ...scanConfig, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Pages to Scan
                            </label>
                            <input
                                type="number"
                                value={scanConfig.maxPages}
                                onChange={(e) => setScanConfig({ ...scanConfig, maxPages: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Advanced Settings */}
                    <details className="mb-6">
                        <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                            🔧 Advanced Login Selectors
                        </summary>
                        <div className="grid md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Username Field Selector</label>
                                <input
                                    type="text"
                                    value={scanConfig.usernameField}
                                    onChange={(e) => setScanConfig({ ...scanConfig, usernameField: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Password Field Selector</label>
                                <input
                                    type="text"
                                    value={scanConfig.passwordField}
                                    onChange={(e) => setScanConfig({ ...scanConfig, passwordField: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Login Button Selector</label>
                                <input
                                    type="text"
                                    value={scanConfig.loginButton}
                                    onChange={(e) => setScanConfig({ ...scanConfig, loginButton: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </details>

                    {/* Scan Button */}
                    <button
                        onClick={handleScan}
                        disabled={scanning || !scanConfig.url || !scanConfig.username || !scanConfig.password}
                        className="btn-primary py-3 px-8 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {scanning ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Scanning System...
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5" />
                                Run Scan
                            </>
                        )}
                    </button>
                </div>

                {/* Scan Results */}
                {scanResult && (
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">📋 Discovered Features</h2>
                                <p className="text-gray-600">
                                    Found {scanResult.totalFeatures} features across {scanResult.pagesCrawled} pages in {(scanResult.scanDuration / 1000).toFixed(1)}s
                                </p>
                            </div>
                            <button
                                onClick={generateActions}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Generate Actions
                            </button>
                        </div>

                        {/* Features Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Feature
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Action
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Selector
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            URL
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(scanResult.features || []).map((feature) => (
                                        <tr key={feature.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {feature.featureName}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {feature.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {feature.actionType}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                                                {feature.selector}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {feature.url ? (
                                                    <a
                                                        href={feature.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {new URL(feature.url).pathname}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {feature.status === 'discovered' ? (
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-600" />
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <button
                                                    onClick={() => setSelectedFeature(feature)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Errors */}
                        {scanResult.errors && scanResult.errors.length > 0 && (
                            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                <h3 className="font-semibold text-red-800 mb-2">⚠️ Scan Errors</h3>
                                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                    {scanResult.errors.map((error, i) => (
                                        <li key={i}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Feature Detail Modal */}
                {selectedFeature && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Feature Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="font-semibold text-gray-700">Name:</span>
                                    <span className="ml-2 text-gray-900">{selectedFeature.featureName}</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Type:</span>
                                    <span className="ml-2 text-gray-900">{selectedFeature.type}</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Selector:</span>
                                    <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">{selectedFeature.selector}</code>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Page URL:</span>
                                    <span className="ml-2 text-blue-600">{selectedFeature.pageUrl}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedFeature(null)}
                                className="mt-6 btn-primary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
