'use client';

import { useState, useEffect } from 'react';
import { useCompany } from './PortalLayout';
import { ref, get, set } from 'firebase/database';
import { database } from '@/lib/firebase/client';
import { SystemIntegration, AutomationStep } from '@/types/database';
import { externalSystemService } from '@/lib/integrations/external-system-service';
import { CheckCircle, XCircle, Loader2, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function SystemIntegrationSettings() {
    const company = useCompany();
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [showBrowserConfig, setShowBrowserConfig] = useState(false);
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
        timeout: 10000,
        browserAutomation: {
            enabled: false,
            loginUrl: '',
            selectors: {
                usernameField: '#username',
                passwordField: '#password',
                loginButton: '#login-btn'
            },
            actions: [],
            sessionTimeout: 30,
            headless: true
        }
    });

    useEffect(() => {
        loadConfig();
    }, [company.id]);

    const loadConfig = async () => {
        try {
            const snapshot = await get(ref(database, `companies/${company.id}/systemIntegration`));
            if (snapshot.exists()) {
                const loadedConfig = snapshot.val();
                // Ensure browserAutomation exists
                if (!loadedConfig.browserAutomation) {
                    loadedConfig.browserAutomation = {
                        enabled: false,
                        loginUrl: '',
                        selectors: {
                            usernameField: '#username',
                            passwordField: '#password',
                            loginButton: '#login-btn'
                        },
                        actions: [],
                        sessionTimeout: 30,
                        headless: true
                    };
                }
                setConfig(loadedConfig);
            }
        } catch (error) {
            console.error('Failed to load config:', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
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

    const addAutomationAction = () => {
        if (!config.browserAutomation) return;

        setConfig({
            ...config,
            browserAutomation: {
                ...config.browserAutomation,
                actions: [
                    ...(config.browserAutomation.actions || []),
                    {
                        name: '',
                        description: '',
                        steps: [],
                        enabled: true
                    }
                ]
            }
        });
    };

    const removeAutomationAction = (index: number) => {
        if (!config.browserAutomation) return;

        const newActions = [...(config.browserAutomation.actions || [])];
        newActions.splice(index, 1);
        setConfig({
            ...config,
            browserAutomation: {
                ...config.browserAutomation,
                actions: newActions
            }
        });
    };

    const addStepToAction = (actionIndex: number) => {
        if (!config.browserAutomation) return;

        const newActions = [...(config.browserAutomation.actions || [])];
        newActions[actionIndex].steps.push({
            type: 'click',
            selector: '',
            timeout: 5000
        });

        setConfig({
            ...config,
            browserAutomation: {
                ...config.browserAutomation,
                actions: newActions
            }
        });
    };

    const removeStepFromAction = (actionIndex: number, stepIndex: number) => {
        if (!config.browserAutomation) return;

        const newActions = [...(config.browserAutomation.actions || [])];
        newActions[actionIndex].steps.splice(stepIndex, 1);

        setConfig({
            ...config,
            browserAutomation: {
                ...config.browserAutomation,
                actions: newActions
            }
        });
    };

    const updateAction = (actionIndex: number, field: string, value: any) => {
        if (!config.browserAutomation) return;

        const newActions = [...(config.browserAutomation.actions || [])];
        newActions[actionIndex] = { ...newActions[actionIndex], [field]: value };

        setConfig({
            ...config,
            browserAutomation: {
                ...config.browserAutomation,
                actions: newActions
            }
        });
    };

    const updateStep = (actionIndex: number, stepIndex: number, field: string, value: any) => {
        if (!config.browserAutomation) return;

        const newActions = [...(config.browserAutomation.actions || [])];
        newActions[actionIndex].steps[stepIndex] = {
            ...newActions[actionIndex].steps[stepIndex],
            [field]: value
        };

        setConfig({
            ...config,
            browserAutomation: {
                ...config.browserAutomation,
                actions: newActions
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
                        <option value="api">API Integration</option>
                        <option value="browser">Browser Automation</option>
                        <option value="hybrid">Hybrid (API + Browser)</option>
                    </select>
                </div>

                {/* API Configuration */}
                {(config.integrationType === 'api' || config.integrationType === 'hybrid') && (
                    <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-900">API Configuration</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">System URL</label>
                            <input
                                type="url"
                                placeholder="https://api.yourcompany.com"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={config.systemUrl}
                                onChange={e => setConfig({ ...config, systemUrl: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                    </div>
                )}

                {/* Browser Automation Configuration */}
                {(config.integrationType === 'browser' || config.integrationType === 'hybrid') && config.browserAutomation && (
                    <div className="space-y-4 mb-6 p-4 border-2 border-blue-100 rounded-lg bg-blue-50/50">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Browser Automation Configuration</h3>
                            <button
                                onClick={() => setShowBrowserConfig(!showBrowserConfig)}
                                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                {showBrowserConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                {showBrowserConfig ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        {showBrowserConfig && (
                            <div className="space-y-4 mt-4">
                                {/* Login URL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Login URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://portal.yourcompany.com/login"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        value={config.browserAutomation.loginUrl}
                                        onChange={e => setConfig({
                                            ...config,
                                            browserAutomation: {
                                                ...config.browserAutomation!,
                                                loginUrl: e.target.value
                                            }
                                        })}
                                    />
                                </div>

                                {/* Selectors */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Username Selector</label>
                                        <input
                                            type="text"
                                            placeholder="#username"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                                            value={config.browserAutomation.selectors.usernameField}
                                            onChange={e => setConfig({
                                                ...config,
                                                browserAutomation: {
                                                    ...config.browserAutomation!,
                                                    selectors: {
                                                        ...config.browserAutomation!.selectors,
                                                        usernameField: e.target.value
                                                    }
                                                }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Password Selector</label>
                                        <input
                                            type="text"
                                            placeholder="#password"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                                            value={config.browserAutomation.selectors.passwordField}
                                            onChange={e => setConfig({
                                                ...config,
                                                browserAutomation: {
                                                    ...config.browserAutomation!,
                                                    selectors: {
                                                        ...config.browserAutomation!.selectors,
                                                        passwordField: e.target.value
                                                    }
                                                }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Login Button Selector</label>
                                        <input
                                            type="text"
                                            placeholder="#login-btn"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                                            value={config.browserAutomation.selectors.loginButton}
                                            onChange={e => setConfig({
                                                ...config,
                                                browserAutomation: {
                                                    ...config.browserAutomation!,
                                                    selectors: {
                                                        ...config.browserAutomation!.selectors,
                                                        loginButton: e.target.value
                                                    }
                                                }
                                            })}
                                        />
                                    </div>
                                </div>

                                {/* Session Settings */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                                        <input
                                            type="number"
                                            min="5"
                                            max="120"
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                            value={config.browserAutomation.sessionTimeout}
                                            onChange={e => setConfig({
                                                ...config,
                                                browserAutomation: {
                                                    ...config.browserAutomation!,
                                                    sessionTimeout: parseInt(e.target.value)
                                                }
                                            })}
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 pt-8">
                                        <input
                                            type="checkbox"
                                            id="headless"
                                            checked={config.browserAutomation.headless}
                                            onChange={e => setConfig({
                                                ...config,
                                                browserAutomation: {
                                                    ...config.browserAutomation!,
                                                    headless: e.target.checked
                                                }
                                            })}
                                            className="w-5 h-5 text-blue-600 rounded"
                                        />
                                        <label htmlFor="headless" className="text-sm font-medium text-gray-900">
                                            Run in Headless Mode
                                        </label>
                                    </div>
                                </div>

                                {/* Automation Actions */}
                                <div className="mt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-semibold text-gray-900">Automation Actions</h4>
                                        <button
                                            onClick={addAutomationAction}
                                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Action
                                        </button>
                                    </div>

                                    {config.browserAutomation.actions.map((action, actionIndex) => (
                                        <div key={actionIndex} className="mb-4 p-4 bg-white border border-gray-200 rounded-lg">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1 grid grid-cols-2 gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Action name (e.g., Check Balance)"
                                                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                        value={action.name}
                                                        onChange={e => updateAction(actionIndex, 'name', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Description"
                                                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                        value={action.description}
                                                        onChange={e => updateAction(actionIndex, 'description', e.target.value)}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => removeAutomationAction(actionIndex)}
                                                    className="ml-2 text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Steps */}
                                            <div className="ml-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-medium text-gray-600">Steps</span>
                                                    <button
                                                        onClick={() => addStepToAction(actionIndex)}
                                                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                        Add Step
                                                    </button>
                                                </div>

                                                {action.steps.map((step, stepIndex) => (
                                                    <div key={stepIndex} className="flex gap-2 mb-2 items-center">
                                                        <select
                                                            className="px-2 py-1 border rounded text-xs"
                                                            value={step.type}
                                                            onChange={e => updateStep(actionIndex, stepIndex, 'type', e.target.value)}
                                                        >
                                                            <option value="navigate">Navigate</option>
                                                            <option value="click">Click</option>
                                                            <option value="type">Type</option>
                                                            <option value="wait">Wait</option>
                                                            <option value="extract">Extract</option>
                                                            <option value="screenshot">Screenshot</option>
                                                        </select>
                                                        <input
                                                            type="text"
                                                            placeholder="Selector (e.g., #balance)"
                                                            className="flex-1 px-2 py-1 border rounded text-xs"
                                                            value={step.selector || ''}
                                                            onChange={e => updateStep(actionIndex, stepIndex, 'selector', e.target.value)}
                                                        />
                                                        {step.type === 'type' && (
                                                            <input
                                                                type="text"
                                                                placeholder="Value"
                                                                className="w-32 px-2 py-1 border rounded text-xs"
                                                                value={step.value || ''}
                                                                onChange={e => updateStep(actionIndex, stepIndex, 'value', e.target.value)}
                                                            />
                                                        )}
                                                        <button
                                                            onClick={() => removeStepFromAction(actionIndex, stepIndex)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                            {testResult.success ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                            {testResult.message}
                        </div>
                    )}
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
