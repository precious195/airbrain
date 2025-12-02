import { Page } from 'playwright';
import { SystemIntegration, AutomationStep, BrowserAutomationConfig } from '@/types/database';
import { browserSessionManager } from './browser-session-manager';
import { externalSystemService } from './external-system-service';

export class AutomationWorker {
    private companyId: string;
    private config: BrowserAutomationConfig;
    private credentials: { username: string; password: string };

    constructor(companyId: string, config: BrowserAutomationConfig, credentials: { username: string; password: string }) {
        this.companyId = companyId;
        this.config = config;
        this.credentials = credentials;
    }

    /**
     * Log into the company's system
     */
    async login(): Promise<void> {
        const session = await browserSessionManager.getSession(this.companyId);

        if (session.isLoggedIn) {
            console.log('Already logged in');
            return;
        }

        const page = session.page;

        try {
            // Navigate to login page
            await page.goto(this.config.loginUrl, { waitUntil: 'networkidle', timeout: 30000 });

            // Fill username
            await page.fill(this.config.selectors.usernameField, this.credentials.username);

            // Fill password
            await page.fill(this.config.selectors.passwordField,
                externalSystemService.decryptCredentials(this.credentials.password));

            // Click login button
            await page.click(this.config.selectors.loginButton);

            // Wait for navigation to complete
            await page.waitForLoadState('networkidle', { timeout: 15000 });

            session.isLoggedIn = true;
            console.log('Login successful');
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error('Failed to log in to company system');
        }
    }

    /**
     * Execute a predefined automation action
     */
    async executeAction(actionName: string, params?: Record<string, any>): Promise<any> {
        const action = this.config.actions.find(a => a.name === actionName && a.enabled);

        if (!action) {
            throw new Error(`Action '${actionName}' not found or not enabled`);
        }

        // Ensure we're logged in
        await this.login();

        const session = await browserSessionManager.getSession(this.companyId);
        const page = session.page;

        const results: Record<string, any> = {};

        try {
            for (const step of action.steps) {
                await this.executeStep(page, step, params, results);
            }

            return results;
        } catch (error) {
            console.error(`Failed to execute action '${actionName}':`, error);
            throw error;
        }
    }

    /**
     * Execute a single automation step
     */
    private async executeStep(
        page: Page,
        step: AutomationStep,
        params?: Record<string, any>,
        results?: Record<string, any>
    ): Promise<void> {
        const timeout = step.timeout || 10000;

        switch (step.type) {
            case 'navigate':
                if (step.value) {
                    await page.goto(step.value, { waitUntil: 'networkidle', timeout });
                }
                break;

            case 'click':
                if (step.selector) {
                    await page.click(step.selector, { timeout });
                }
                break;

            case 'type':
                if (step.selector && step.value) {
                    // Replace parameters in value (e.g., {customerPhone})
                    let value = step.value;
                    if (params) {
                        for (const [key, val] of Object.entries(params)) {
                            value = value.replace(`{${key}}`, String(val));
                        }
                    }
                    await page.fill(step.selector, value);
                }
                break;

            case 'wait':
                await page.waitForTimeout(timeout);
                break;

            case 'extract':
                if (step.selector && step.extractAs && results) {
                    const element = await page.$(step.selector);
                    if (element) {
                        const text = await element.textContent();
                        results[step.extractAs] = text?.trim() || '';
                    }
                }
                break;

            case 'screenshot':
                const screenshotPath = `screenshots/${this.companyId}_${Date.now()}.png`;
                await page.screenshot({ path: screenshotPath, fullPage: false });
                console.log(`Screenshot saved: ${screenshotPath}`);
                break;

            default:
                console.warn(`Unknown step type: ${step.type}`);
        }
    }

    /**
     * Close the browser session
     */
    async close(): Promise<void> {
        await browserSessionManager.closeSession(this.companyId);
    }
}

/**
 * Factory function to create automation worker
 */
export async function createAutomationWorker(
    companyId: string,
    systemIntegration: SystemIntegration
): Promise<AutomationWorker> {
    if (!systemIntegration.browserAutomation) {
        throw new Error('Browser automation not configured');
    }

    return new AutomationWorker(
        companyId,
        systemIntegration.browserAutomation,
        {
            username: systemIntegration.username,
            password: systemIntegration.password
        }
    );
}
