'use client';

import { useState, useEffect } from 'react';
import { useCompany } from './PortalLayout';
import { ref, get, set } from 'firebase/database';
import { database } from '@/lib/firebase/client';
import { SystemIntegration, AutomationStep } from '@/types/database';
import { externalSystemService } from '@/lib/integrations/external-system-service';
import { CheckCircle, XCircle, Loader2, Plus, Trash2, ChevronDown, ChevronUp, Wand2, Package } from 'lucide-react';

export default function SystemIntegrationSettings() {
    const company = useCompany();
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [autoDetecting, setAutoDetecting] = useState(false);
    const [detectingProducts, setDetectingProducts] = useState(false);
    const [detectedProducts, setDetectedProducts] = useState<any[]>([]);
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
                } else if (!loadedConfig.browserAutomation.actions) {
                    loadedConfig.browserAutomation.actions = [];
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
                apiKey: config.apiKey ? externalSystemService.encryptCredentials(config.apiKey) : ''
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
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            placeholder="https://portal.yourcompany.com/login"
                                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                            value={config.browserAutomation.loginUrl}
                                            onChange={e => setConfig({
                                                ...config,
                                                browserAutomation: {
                                                    ...config.browserAutomation!,
                                                    loginUrl: e.target.value
                                                }
                                            })}
                                        />
                                        <button
                                            onClick={async () => {
                                                if (!config.browserAutomation?.loginUrl) {
                                                    setTestResult({ success: false, message: 'Please enter a Login URL first' });
                                                    return;
                                                }

                                                setAutoDetecting(true);
                                                setTestResult(null);

                                                try {
                                                    const response = await fetch('/api/scanner/auto-detect', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ url: config.browserAutomation.loginUrl })
                                                    });

                                                    const result = await response.json();

                                                    if (!response.ok) {
                                                        throw new Error(result.error || 'Auto-detection failed');
                                                    }

                                                    // Update selectors with detected values
                                                    setConfig(prev => ({
                                                        ...prev,
                                                        browserAutomation: {
                                                            ...prev.browserAutomation!,
                                                            selectors: {
                                                                usernameField: result.selectors.usernameField,
                                                                passwordField: result.selectors.passwordField,
                                                                loginButton: result.selectors.loginButton
                                                            }
                                                        }
                                                    }));

                                                    const validationMessage = [
                                                        result.validation.usernameExists ? '✓ Username' : '✗ Username',
                                                        result.validation.passwordExists ? '✓ Password' : '✗ Password',
                                                        result.validation.loginButtonExists ? '✓ Button' : '✗ Button'
                                                    ].join(', ');

                                                    setTestResult({
                                                        success: true,
                                                        message: `Auto-detected! Confidence: ${result.confidence}. Validation: ${validationMessage}`
                                                    });

                                                } catch (error: any) {
                                                    setTestResult({ success: false, message: error.message });
                                                } finally {
                                                    setAutoDetecting(false);
                                                }
                                            }}
                                            disabled={autoDetecting || !config.browserAutomation?.loginUrl}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                                        >
                                            {autoDetecting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Detecting...
                                                </>
                                            ) : (
                                                <>
                                                    <Wand2 className="w-4 h-4" />
                                                    Auto Detect
                                                </>
                                            )}
                                        </button>
                                    </div>
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
                                            value={config.browserAutomation?.sessionTimeout || 30}
                                            onChange={e => setConfig({
                                                ...config,
                                                browserAutomation: {
                                                    ...config.browserAutomation!,
                                                    sessionTimeout: parseInt(e.target.value) || 30
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

                                    {config.browserAutomation.actions?.map((action, actionIndex) => (
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
                                                <div className="flex items-center gap-2 ml-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">{action.enabled ? 'Enabled' : 'Disabled'}</span>
                                                        <button
                                                            onClick={() => updateAction(actionIndex, 'enabled', !action.enabled)}
                                                            className={`w-10 h-5 rounded-full transition-colors relative ${action.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                                                        >
                                                            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${action.enabled ? 'left-5.5' : 'left-0.5'}`} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeAutomationAction(actionIndex)}
                                                        className="text-red-600 hover:text-red-700 p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
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

                {/* Run Scan Button */}
                <div className="mb-6">
                    <button
                        onClick={async () => {
                            setTesting(true);
                            setTestResult(null);
                            try {
                                if (!config.browserAutomation?.loginUrl) {
                                    throw new Error('Please enter a Login URL');
                                }

                                const response = await fetch('/api/scanner/scan', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        url: config.browserAutomation.loginUrl,
                                        username: config.username, // Using main config username
                                        password: config.password, // Using main config password
                                        loginSelectors: config.browserAutomation.selectors,
                                        maxPagesToScan: 10 // Default limit for quick scan
                                    })
                                });

                                const result = await response.json();

                                if (!response.ok) {
                                    throw new Error(result.error || 'Scan failed');
                                }

                                setTestResult({
                                    success: true,
                                    message: `Scan successful! Found ${result.features?.length || 0} features. Added to Automation Actions.`
                                });

                                // Auto-populate actions from discovered features
                                if (result.features && result.features.length > 0) {
                                    const newActions = result.features.map((feature: any) => {
                                        const steps = [];

                                        // Map feature to steps
                                        if (feature.type === 'form' && feature.formFields) {
                                            // For forms, add steps to fill each field
                                            feature.formFields.forEach((field: any) => {
                                                steps.push({
                                                    type: 'type',
                                                    selector: field.selector,
                                                    value: '', // User needs to fill this
                                                    timeout: 5000
                                                });
                                            });
                                            // Add submit step
                                            steps.push({
                                                type: 'click',
                                                selector: feature.selector,
                                                timeout: 5000
                                            });
                                        } else if (feature.actionType === 'navigate') {
                                            steps.push({
                                                type: 'navigate',
                                                selector: feature.selector, // Might not be needed for navigate but good for reference
                                                value: feature.url,
                                                timeout: 10000
                                            });
                                        } else {
                                            // Default to click for buttons/links
                                            steps.push({
                                                type: 'click',
                                                selector: feature.selector,
                                                timeout: 5000
                                            });
                                        }

                                        return {
                                            name: feature.featureName || 'Unnamed Action',
                                            description: `Auto-generated from ${feature.type}: ${feature.text || ''}`,
                                            steps: steps,
                                            enabled: true // Default to enabled
                                        };
                                    });

                                    // Append new actions to existing ones
                                    setConfig(prev => ({
                                        ...prev,
                                        browserAutomation: {
                                            ...prev.browserAutomation!,
                                            actions: [...(prev.browserAutomation?.actions || []), ...newActions]
                                        }
                                    }));
                                }

                            } catch (error: any) {
                                setTestResult({ success: false, message: error.message });
                            } finally {
                                setTesting(false);
                            }
                        }}
                        disabled={!config.browserAutomation?.loginUrl || testing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {testing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Running Scan...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Run System Scan
                            </>
                        )}
                    </button>

                    {/* Detect Products Button */}
                    <button
                        onClick={async () => {
                            setDetectingProducts(true);
                            setTestResult(null);
                            try {
                                const response = await fetch('/api/scanner/detect-products', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        url: config.browserAutomation?.loginUrl || config.systemUrl,
                                        companyId: company.id,
                                        industry: company.industry,
                                        username: config.username,
                                        password: config.password,
                                        loginSelectors: config.browserAutomation?.selectors,
                                        saveToDatabase: true
                                    })
                                });

                                const result = await response.json();
                                if (response.ok) {
                                    setDetectedProducts(result.products || []);
                                    setTestResult({
                                        success: true,
                                        message: `✅ Detected ${result.totalDetected} products/services! Check Data Management to review.`
                                    });
                                } else {
                                    setTestResult({
                                        success: false,
                                        message: result.error || 'Product detection failed'
                                    });
                                }
                            } catch (error: any) {
                                setTestResult({
                                    success: false,
                                    message: `Detection error: ${error.message}`
                                });
                            } finally {
                                setDetectingProducts(false);
                            }
                        }}
                        disabled={(!config.browserAutomation?.loginUrl && !config.systemUrl) || detectingProducts}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {detectingProducts ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Detecting Products...
                            </>
                        ) : (
                            <>
                                <Package className="w-4 h-4" />
                                Detect Products
                            </>
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
