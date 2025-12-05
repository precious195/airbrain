/**
 * Universal System Agent
 * 
 * An AI-powered agent that can interact with any external system like a human.
 * Supports API calls, browser automation, and hybrid approaches.
 */

import { geminiProvider } from '../ai/gemini-provider';

// Agent action types
export type ActionType =
    | 'navigate'
    | 'authenticate'
    | 'click'
    | 'type'
    | 'extract'
    | 'wait'
    | 'screenshot'
    | 'api_call'
    | 'execute_script'
    | 'upload_file'
    | 'download_file'
    | 'send_keys';

export interface AgentAction {
    id: string;
    type: ActionType;
    description: string;
    target?: string;          // Selector, URL, or API endpoint
    value?: string;           // Value to input or send
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: any;
    extractAs?: string;       // Variable name to store extracted data
    waitFor?: string;         // Condition to wait for
    timeout?: number;
    retryCount?: number;
    onError?: 'continue' | 'abort' | 'retry';
}

export interface AgentTask {
    id: string;
    goal: string;             // Natural language description of the goal
    systemUrl: string;        // Target system URL
    systemType: 'api' | 'browser' | 'hybrid';
    credentials?: {
        type: 'basic' | 'oauth' | 'apiKey' | 'form';
        username?: string;
        password?: string;
        apiKey?: string;
        tokenUrl?: string;
    };
    actions: AgentAction[];
    context: Record<string, any>;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: any;
    error?: string;
}

export interface SystemProfile {
    url: string;
    name?: string;
    loginPage?: string;
    loginSelectors?: {
        usernameField: string;
        passwordField: string;
        submitButton: string;
    };
    navigation?: {
        name: string;
        selector: string;
        url?: string;
    }[];
    dataFields?: {
        name: string;
        selector: string;
        type: 'text' | 'number' | 'date' | 'currency';
    }[];
    apiEndpoints?: {
        name: string;
        path: string;
        method: string;
        description: string;
    }[];
}

export class UniversalAgent {
    private companyId: string;
    private browser: any = null;
    private page: any = null;
    private isLoggedIn: boolean = false;
    private extractedData: Record<string, any> = {};
    private systemProfile: SystemProfile | null = null;

    constructor(companyId: string) {
        this.companyId = companyId;
    }

    /**
     * Execute a high-level task described in natural language
     */
    async executeTask(goal: string, systemUrl: string, credentials?: any): Promise<any> {
        console.log(`🤖 Universal Agent: Starting task - "${goal}"`);

        try {
            // Step 1: Analyze the goal and plan actions
            const plan = await this.planActions(goal, systemUrl, credentials);

            // Step 2: Initialize the appropriate mode (browser/api/hybrid)
            await this.initialize(plan.systemType, systemUrl);

            // Step 3: Authenticate if needed
            if (credentials && plan.requiresAuth) {
                await this.authenticate(credentials, plan.loginFlow);
            }

            // Step 4: Execute each action in the plan
            for (const action of plan.actions) {
                console.log(`  → Executing: ${action.description}`);
                await this.executeAction(action);
            }

            // Step 5: Return collected results
            const result = {
                success: true,
                goal,
                data: this.extractedData,
                actionsExecuted: plan.actions.length
            };

            console.log(`✅ Universal Agent: Task completed successfully`);
            return result;

        } catch (error: any) {
            console.error(`❌ Universal Agent: Task failed - ${error.message}`);
            throw error;
        } finally {
            await this.cleanup();
        }
    }

    /**
     * Use AI to plan actions for a given goal
     */
    async planActions(goal: string, systemUrl: string, credentials?: any): Promise<{
        systemType: 'api' | 'browser' | 'hybrid';
        requiresAuth: boolean;
        loginFlow?: AgentAction[];
        actions: AgentAction[];
    }> {
        const prompt = `You are a system automation expert. Plan the steps to accomplish this goal:

GOAL: ${goal}
SYSTEM URL: ${systemUrl}
HAS CREDENTIALS: ${credentials ? 'Yes' : 'No'}

Analyze the goal and return a JSON plan with:
1. systemType: "api" (for REST API), "browser" (for web UI), or "hybrid"
2. requiresAuth: true/false
3. actions: Array of steps to accomplish the goal

Each action should have:
- id: unique identifier
- type: one of [navigate, authenticate, click, type, extract, wait, api_call]
- description: what this step does
- target: selector or URL
- value: value to input (if applicable)
- extractAs: variable name to store extracted data

Example response:
{
  "systemType": "browser",
  "requiresAuth": true,
  "actions": [
    {"id": "1", "type": "navigate", "description": "Go to customer search", "target": "/customers/search"},
    {"id": "2", "type": "type", "description": "Enter customer ID", "target": "#customer-id", "value": "{customerId}"},
    {"id": "3", "type": "click", "description": "Click search button", "target": "#search-btn"},
    {"id": "4", "type": "extract", "description": "Get customer balance", "target": ".balance-value", "extractAs": "balance"}
  ]
}

Return ONLY valid JSON, no additional text.`;

        try {
            const response = await geminiProvider.generateResponse(prompt, true);
            const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(cleanedResponse);
        } catch (error) {
            console.error('AI planning failed, using default plan');
            // Return a basic exploration plan if AI fails
            return {
                systemType: 'browser',
                requiresAuth: !!credentials,
                actions: [
                    { id: '1', type: 'navigate', description: 'Navigate to system', target: systemUrl }
                ]
            };
        }
    }

    /**
     * Initialize browser or API client
     */
    private async initialize(systemType: 'api' | 'browser' | 'hybrid', url: string): Promise<void> {
        if (systemType === 'api') {
            // API mode doesn't need browser
            return;
        }

        try {
            const playwright = require('playwright');
            this.browser = await playwright.chromium.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const context = await this.browser.newContext({
                viewport: { width: 1280, height: 720 },
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            });
            this.page = await context.newPage();

            // Navigate to the initial URL
            await this.page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            console.log(`  📂 Browser initialized at: ${url}`);
        } catch (error: any) {
            throw new Error(`Failed to initialize browser: ${error.message}`);
        }
    }

    /**
     * Authenticate with the system
     */
    private async authenticate(credentials: any, loginFlow?: AgentAction[]): Promise<void> {
        if (this.isLoggedIn) return;

        console.log('  🔐 Authenticating...');

        if (loginFlow && loginFlow.length > 0) {
            // Execute predefined login flow
            for (const action of loginFlow) {
                await this.executeAction(action);
            }
        } else {
            // Try common login patterns
            const loginSelectors = [
                { username: '#username', password: '#password', submit: 'button[type="submit"]' },
                { username: 'input[name="email"]', password: 'input[name="password"]', submit: 'button[type="submit"]' },
                { username: '#email', password: '#password', submit: '.login-btn' },
            ];

            for (const selectors of loginSelectors) {
                try {
                    await this.page.fill(selectors.username, credentials.username, { timeout: 5000 });
                    await this.page.fill(selectors.password, credentials.password, { timeout: 5000 });
                    await this.page.click(selectors.submit, { timeout: 5000 });
                    await this.page.waitForLoadState('networkidle', { timeout: 15000 });
                    this.isLoggedIn = true;
                    console.log('  ✅ Login successful');
                    return;
                } catch {
                    continue;
                }
            }
            throw new Error('Could not find login form');
        }
    }

    /**
     * Execute a single action
     */
    async executeAction(action: AgentAction): Promise<any> {
        const timeout = action.timeout || 10000;
        let result: any = null;

        try {
            switch (action.type) {
                case 'navigate':
                    if (action.target) {
                        const url = action.target.startsWith('http')
                            ? action.target
                            : new URL(action.target, this.page.url()).href;
                        await this.page.goto(url, { waitUntil: 'networkidle', timeout });
                    }
                    break;

                case 'click':
                    if (action.target) {
                        await this.page.click(action.target, { timeout });
                    }
                    break;

                case 'type':
                    if (action.target && action.value) {
                        // Replace placeholders with extracted data
                        let value = action.value;
                        for (const [key, val] of Object.entries(this.extractedData)) {
                            value = value.replace(`{${key}}`, String(val));
                        }
                        await this.page.fill(action.target, value, { timeout });
                    }
                    break;

                case 'extract':
                    if (action.target) {
                        const element = await this.page.$(action.target);
                        if (element) {
                            const text = await element.textContent();
                            result = text?.trim() || '';
                            if (action.extractAs) {
                                this.extractedData[action.extractAs] = result;
                            }
                        }
                    }
                    break;

                case 'wait':
                    if (action.waitFor) {
                        await this.page.waitForSelector(action.waitFor, { timeout });
                    } else {
                        await this.page.waitForTimeout(timeout);
                    }
                    break;

                case 'screenshot':
                    const path = `screenshots/agent_${this.companyId}_${Date.now()}.png`;
                    await this.page.screenshot({ path, fullPage: false });
                    result = path;
                    break;

                case 'api_call':
                    result = await this.executeApiCall(action);
                    if (action.extractAs) {
                        this.extractedData[action.extractAs] = result;
                    }
                    break;

                case 'send_keys':
                    if (action.value) {
                        await this.page.keyboard.press(action.value);
                    }
                    break;

                case 'execute_script':
                    if (action.value) {
                        result = await this.page.evaluate(action.value);
                        if (action.extractAs) {
                            this.extractedData[action.extractAs] = result;
                        }
                    }
                    break;

                default:
                    console.warn(`Unknown action type: ${action.type}`);
            }

            return result;

        } catch (error: any) {
            console.error(`Action failed: ${action.description} - ${error.message}`);

            if (action.onError === 'continue') {
                return null;
            } else if (action.onError === 'retry' && (action.retryCount || 0) > 0) {
                action.retryCount = (action.retryCount || 1) - 1;
                await new Promise(r => setTimeout(r, 1000));
                return this.executeAction(action);
            }
            throw error;
        }
    }

    /**
     * Execute an API call
     */
    private async executeApiCall(action: AgentAction): Promise<any> {
        const url = action.target!;
        const method = action.method || 'GET';
        const headers = action.headers || { 'Content-Type': 'application/json' };

        const response = await fetch(url, {
            method,
            headers,
            body: action.body ? JSON.stringify(action.body) : undefined
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Learn about an unknown system
     */
    async analyzeSystem(url: string): Promise<SystemProfile> {
        console.log(`🔍 Analyzing system: ${url}`);

        await this.initialize('browser', url);

        const profile: SystemProfile = { url };

        try {
            // Detect page title
            profile.name = await this.page.title();

            // Look for login form
            const loginIndicators = await this.page.$$('input[type="password"]');
            if (loginIndicators.length > 0) {
                profile.loginPage = url;

                // Try to find username and submit button
                const usernameField = await this.page.$('input[type="email"], input[type="text"][name*="user"], input[name*="email"], #username, #email');
                const submitBtn = await this.page.$('button[type="submit"], input[type="submit"], .login-btn, .submit-btn');

                if (usernameField && submitBtn) {
                    profile.loginSelectors = {
                        usernameField: await this.getSelector(usernameField),
                        passwordField: 'input[type="password"]',
                        submitButton: await this.getSelector(submitBtn)
                    };
                }
            }

            // Find navigation links
            const navLinks = await this.page.$$('nav a, .nav a, .menu a, .sidebar a');
            profile.navigation = [];
            for (const link of navLinks.slice(0, 10)) {
                const text = await link.textContent();
                const href = await link.getAttribute('href');
                if (text && href) {
                    profile.navigation.push({
                        name: text.trim(),
                        selector: await this.getSelector(link),
                        url: href
                    });
                }
            }

            console.log(`✅ System analysis complete: ${profile.name}`);
            this.systemProfile = profile;
            return profile;

        } finally {
            await this.cleanup();
        }
    }

    /**
     * Get a unique selector for an element
     */
    private async getSelector(element: any): Promise<string> {
        try {
            const id = await element.getAttribute('id');
            if (id) return `#${id}`;

            const name = await element.getAttribute('name');
            if (name) return `[name="${name}"]`;

            const className = await element.getAttribute('class');
            if (className) {
                const firstClass = className.split(' ')[0];
                return `.${firstClass}`;
            }

            return 'unknown';
        } catch {
            return 'unknown';
        }
    }

    /**
     * Clean up resources
     */
    private async cleanup(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
        this.isLoggedIn = false;
    }

    /**
     * Get extracted data
     */
    getExtractedData(): Record<string, any> {
        return { ...this.extractedData };
    }
}

/**
 * Factory function to create a universal agent
 */
export function createUniversalAgent(companyId: string): UniversalAgent {
    return new UniversalAgent(companyId);
}
