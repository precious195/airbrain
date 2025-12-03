import { DiscoveredFeature, FormField } from './system-scanner';
import { chromium, Browser, Page } from 'playwright';

export interface GeneratedAction {
    id: string;
    name: string;
    description: string;
    category: string;
    featureId: string;
    parameters: ActionParameter[];
    steps: ActionStep[];
    returnType: 'text' | 'json' | 'boolean' | 'void';
    estimatedDuration: number; // ms
}

export interface ActionParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object';
    required: boolean;
    description: string;
    default?: any;
}

export interface ActionStep {
    order: number;
    type: 'navigate' | 'click' | 'type' | 'select' | 'wait' | 'extract' | 'screenshot';
    selector?: string;
    value?: string;
    waitFor?: string;
    extractSelector?: string;
}

export interface ActionExecutionResult {
    success: boolean;
    data?: any;
    error?: string;
    duration: number;
    screenshot?: string;
}

/**
 * Auto-generate executable actions from discovered features
 */
export class ActionGenerator {
    /**
     * Generate actions from discovered features
     */
    generateActions(features: DiscoveredFeature[]): GeneratedAction[] {
        const actions: GeneratedAction[] = [];

        for (const feature of features) {
            const action = this.featureToAction(feature);
            if (action) {
                actions.push(action);
            }
        }

        return actions;
    }

    /**
     * Convert a feature to an executable action
     */
    private featureToAction(feature: DiscoveredFeature): GeneratedAction | null {
        const actionId = `action_${feature.id}`;
        const actionName = this.generateActionName(feature.featureName);

        switch (feature.type) {
            case 'button':
                return this.generateButtonAction(feature, actionId, actionName);

            case 'link':
                return this.generateNavigationAction(feature, actionId, actionName);

            case 'form':
                return this.generateFormAction(feature, actionId, actionName);

            case 'menu':
                return this.generateMenuAction(feature, actionId, actionName);

            default:
                return null;
        }
    }

    /**
     * Generate action name from feature text
     */
    private generateActionName(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .trim()
            .replace(/\s+/g, '_');
    }

    /**
     * Generate button click action
     */
    private generateButtonAction(
        feature: DiscoveredFeature,
        actionId: string,
        actionName: string
    ): GeneratedAction {
        const category = this.categorizeFeature(feature.featureName);

        return {
            id: actionId,
            name: actionName,
            description: `Click "${feature.featureName}" button`,
            category,
            featureId: feature.id,
            parameters: [],
            steps: [
                {
                    order: 1,
                    type: 'navigate',
                    value: feature.pageUrl
                },
                {
                    order: 2,
                    type: 'wait',
                    waitFor: 'networkidle'
                },
                {
                    order: 3,
                    type: 'click',
                    selector: feature.selector
                },
                {
                    order: 4,
                    type: 'wait',
                    waitFor: 'networkidle'
                }
            ],
            returnType: 'text',
            estimatedDuration: 3000
        };
    }

    /**
     * Generate navigation action
     */
    private generateNavigationAction(
        feature: DiscoveredFeature,
        actionId: string,
        actionName: string
    ): GeneratedAction {
        return {
            id: actionId,
            name: actionName,
            description: `Navigate to "${feature.featureName}"`,
            category: 'navigation',
            featureId: feature.id,
            parameters: [],
            steps: [
                {
                    order: 1,
                    type: 'navigate',
                    value: feature.url || feature.pageUrl
                },
                {
                    order: 2,
                    type: 'wait',
                    waitFor: 'networkidle'
                }
            ],
            returnType: 'void',
            estimatedDuration: 2000
        };
    }

    /**
     * Generate form submission action
     */
    private generateFormAction(
        feature: DiscoveredFeature,
        actionId: string,
        actionName: string
    ): GeneratedAction {
        const parameters: ActionParameter[] = [];
        const steps: ActionStep[] = [];

        // Navigate to form page
        steps.push({
            order: 1,
            type: 'navigate',
            value: feature.pageUrl
        });

        steps.push({
            order: 2,
            type: 'wait',
            waitFor: 'networkidle'
        });

        // Generate parameters and fill steps from form fields
        let stepOrder = 3;
        for (const field of feature.formFields || []) {
            parameters.push({
                name: field.name,
                type: this.mapFieldType(field.type),
                required: field.required,
                description: field.placeholder || `Enter ${field.name}`
            });

            steps.push({
                order: stepOrder++,
                type: field.type === 'select' ? 'select' : 'type',
                selector: field.selector,
                value: `\${${field.name}}`
            });
        }

        // Submit form
        steps.push({
            order: stepOrder++,
            type: 'click',
            selector: `${feature.selector} button[type="submit"], ${feature.selector} input[type="submit"]`
        });

        steps.push({
            order: stepOrder++,
            type: 'wait',
            waitFor: 'networkidle'
        });

        return {
            id: actionId,
            name: actionName,
            description: `Submit "${feature.featureName}" form`,
            category: this.categorizeFeature(feature.featureName),
            featureId: feature.id,
            parameters,
            steps,
            returnType: 'json',
            estimatedDuration: 5000
        };
    }

    /**
     * Generate menu navigation action
     */
    private generateMenuAction(
        feature: DiscoveredFeature,
        actionId: string,
        actionName: string
    ): GeneratedAction {
        return {
            id: actionId,
            name: actionName,
            description: `Navigate to "${feature.featureName}" from ${feature.parentMenu || 'menu'}`,
            category: 'navigation',
            featureId: feature.id,
            parameters: [],
            steps: [
                {
                    order: 1,
                    type: 'navigate',
                    value: feature.pageUrl
                },
                {
                    order: 2,
                    type: 'click',
                    selector: feature.selector
                },
                {
                    order: 3,
                    type: 'wait',
                    waitFor: 'networkidle'
                }
            ],
            returnType: 'void',
            estimatedDuration: 2500
        };
    }

    /**
     * Categorize feature based on name
     */
    private categorizeFeature(name: string): string {
        const lower = name.toLowerCase();

        if (lower.includes('balance') || lower.includes('account')) return 'account';
        if (lower.includes('user') || lower.includes('profile')) return 'user_management';
        if (lower.includes('ticket') || lower.includes('support')) return 'support';
        if (lower.includes('payment') || lower.includes('transaction')) return 'transactions';
        if (lower.includes('reset') || lower.includes('password')) return 'security';
        if (lower.includes('create') || lower.includes('add')) return 'creation';
        if (lower.includes('view') || lower.includes('list')) return 'viewing';
        if (lower.includes('update') || lower.includes('edit')) return 'editing';

        return 'general';
    }

    /**
     * Map HTML input type to action parameter type
     */
    private mapFieldType(htmlType: string): 'string' | 'number' | 'boolean' {
        switch (htmlType) {
            case 'number':
            case 'range':
                return 'number';
            case 'checkbox':
                return 'boolean';
            default:
                return 'string';
        }
    }
}

/**
 * Execute generated actions using browser automation
 */
export class ActionExecutor {
    private browser: Browser | null = null;
    private page: Page | null = null;
    private isAuthenticated: boolean = false;

    /**
     * Initialize browser session
     */
    async initialize(loginUrl: string, username: string, password: string, loginSelectors: any): Promise<void> {
        this.browser = await chromium.launch({ headless: true });
        const context = await this.browser.newContext();
        this.page = await context.newPage();

        // Login
        await this.page.goto(loginUrl);
        await this.page.fill(loginSelectors.usernameField, username);
        await this.page.fill(loginSelectors.passwordField, password);
        await this.page.click(loginSelectors.loginButton);
        await this.page.waitForLoadState('networkidle');

        this.isAuthenticated = true;
    }

    /**
     * Execute a generated action
     */
    async execute(action: GeneratedAction, parameters: Record<string, any>): Promise<ActionExecutionResult> {
        if (!this.page || !this.isAuthenticated) {
            return {
                success: false,
                error: 'Browser session not initialized',
                duration: 0
            };
        }

        const startTime = Date.now();

        try {
            for (const step of action.steps) {
                await this.executeStep(step, parameters);
            }

            // Extract result if needed
            let data: any = null;
            if (action.returnType === 'text') {
                data = await this.page.textContent('body');
            } else if (action.returnType === 'json') {
                data = await this.extractFormData();
            }

            const duration = Date.now() - startTime;

            return {
                success: true,
                data,
                duration
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration: Date.now() - startTime
            };
        }
    }

    /**
     * Execute single action step
     */
    private async executeStep(step: ActionStep, parameters: Record<string, any>): Promise<void> {
        if (!this.page) return;

        // Replace parameters in value
        let value = step.value || '';
        for (const [key, val] of Object.entries(parameters)) {
            value = value.replace(`\${${key}}`, String(val));
        }

        switch (step.type) {
            case 'navigate':
                await this.page.goto(value, { waitUntil: 'networkidle' });
                break;

            case 'click':
                if (step.selector) {
                    await this.page.click(step.selector);
                }
                break;

            case 'type':
                if (step.selector) {
                    await this.page.fill(step.selector, value);
                }
                break;

            case 'select':
                if (step.selector) {
                    await this.page.selectOption(step.selector, value);
                }
                break;

            case 'wait':
                if (step.waitFor === 'networkidle') {
                    await this.page.waitForLoadState('networkidle');
                } else if (step.waitFor) {
                    await this.page.waitForTimeout(parseInt(step.waitFor));
                }
                break;

            case 'extract':
                // Handled in execute method
                break;

            case 'screenshot':
                await this.page.screenshot({ path: `screenshot_${Date.now()}.png` });
                break;
        }
    }

    /**
     * Extract data from current page
     */
    private async extractFormData(): Promise<any> {
        if (!this.page) return null;

        return await this.page.evaluate(() => {
            const result: Record<string, any> = {};
            const elements = document.querySelectorAll('[data-result], .result, .output');

            elements.forEach(el => {
                const key = el.getAttribute('data-key') || el.className;
                const value = el.textContent?.trim();
                if (key && value) {
                    result[key] = value;
                }
            });

            return result;
        });
    }

    /**
     * Close browser
     */
    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
            this.isAuthenticated = false;
        }
    }
}
