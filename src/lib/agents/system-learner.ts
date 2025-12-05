/**
 * System Learner
 * 
 * AI-powered module that discovers and learns how to interact with unknown systems.
 * Uses Gemini 3 Pro to analyze web pages and generate automation scripts.
 */

import { geminiProvider } from '../ai/gemini-provider';

export interface DiscoveredField {
    name: string;
    selector: string;
    type: 'input' | 'button' | 'select' | 'textarea' | 'link' | 'text';
    purpose: string;        // AI-inferred purpose
    required?: boolean;
    placeholder?: string;
}

export interface DiscoveredForm {
    id: string;
    name: string;
    action?: string;
    method?: string;
    fields: DiscoveredField[];
    submitButton?: DiscoveredField;
}

export interface DiscoveredAction {
    name: string;
    description: string;
    type: 'navigation' | 'form' | 'button' | 'api';
    steps: {
        type: string;
        target: string;
        value?: string;
        description: string;
    }[];
}

export interface SystemKnowledge {
    url: string;
    title: string;
    description: string;
    analyzedAt: number;
    isLoginPage: boolean;
    forms: DiscoveredForm[];
    navigation: DiscoveredField[];
    dataDisplays: DiscoveredField[];
    suggestedActions: DiscoveredAction[];
    rawHtmlSample: string;
}

export class SystemLearner {
    private page: any = null;

    /**
     * Analyze a web page and learn its structure
     */
    async analyzePage(page: any): Promise<SystemKnowledge> {
        this.page = page;
        const url = page.url();
        const title = await page.title();

        console.log(`🧠 Learning system: ${title} (${url})`);

        // Extract page structure
        const pageStructure = await this.extractPageStructure();

        // Use AI to understand the page
        const aiAnalysis = await this.aiAnalyzePage(pageStructure, url, title);

        return {
            url,
            title,
            description: aiAnalysis.description,
            analyzedAt: Date.now(),
            isLoginPage: aiAnalysis.isLoginPage,
            forms: aiAnalysis.forms,
            navigation: aiAnalysis.navigation,
            dataDisplays: aiAnalysis.dataDisplays,
            suggestedActions: aiAnalysis.suggestedActions,
            rawHtmlSample: pageStructure.substring(0, 5000)
        };
    }

    /**
     * Extract the structure of a page (forms, buttons, links, etc.)
     */
    private async extractPageStructure(): Promise<string> {
        return await this.page.evaluate(() => {
            const structure: any = {
                forms: [],
                buttons: [],
                links: [],
                inputs: [],
                tables: [],
                headings: []
            };

            // Extract forms
            document.querySelectorAll('form').forEach((form, i) => {
                const formData: any = {
                    id: form.id || `form_${i}`,
                    action: form.action,
                    method: form.method,
                    fields: []
                };

                form.querySelectorAll('input, select, textarea').forEach((field: any) => {
                    formData.fields.push({
                        type: field.type || field.tagName.toLowerCase(),
                        name: field.name,
                        id: field.id,
                        placeholder: field.placeholder,
                        required: field.required
                    });
                });

                structure.forms.push(formData);
            });

            // Extract buttons
            document.querySelectorAll('button, input[type="submit"], input[type="button"]').forEach((btn: any) => {
                structure.buttons.push({
                    type: btn.type || 'button',
                    text: btn.textContent?.trim() || btn.value,
                    id: btn.id,
                    class: btn.className
                });
            });

            // Extract navigation links
            document.querySelectorAll('nav a, .nav a, .menu a, header a').forEach((link: any) => {
                structure.links.push({
                    text: link.textContent?.trim(),
                    href: link.href,
                    id: link.id
                });
            });

            // Extract standalone inputs (not in forms)
            document.querySelectorAll('input:not(form input)').forEach((input: any) => {
                structure.inputs.push({
                    type: input.type,
                    name: input.name,
                    id: input.id,
                    placeholder: input.placeholder
                });
            });

            // Extract tables
            document.querySelectorAll('table').forEach((table, i) => {
                const headers: string[] = [];
                table.querySelectorAll('th').forEach((th: any) => {
                    headers.push(th.textContent?.trim() || '');
                });
                structure.tables.push({
                    id: table.id || `table_${i}`,
                    headers,
                    rowCount: table.querySelectorAll('tr').length
                });
            });

            // Extract headings for context
            document.querySelectorAll('h1, h2, h3').forEach((h: any) => {
                structure.headings.push(h.textContent?.trim());
            });

            return JSON.stringify(structure, null, 2);
        });
    }

    /**
     * Use AI to analyze and understand the page
     */
    private async aiAnalyzePage(pageStructure: string, url: string, title: string): Promise<{
        description: string;
        isLoginPage: boolean;
        forms: DiscoveredForm[];
        navigation: DiscoveredField[];
        dataDisplays: DiscoveredField[];
        suggestedActions: DiscoveredAction[];
    }> {
        const prompt = `You are an expert at analyzing web application interfaces. Analyze this page structure and provide automation insights.

PAGE URL: ${url}
PAGE TITLE: ${title}

PAGE STRUCTURE:
${pageStructure}

Analyze this page and return a JSON response with:
1. description: Brief description of what this page is for
2. isLoginPage: true/false - is this a login/authentication page?
3. forms: Array of forms with their fields and purposes
4. navigation: Array of navigation links/buttons
5. dataDisplays: Array of data display elements (tables, lists, etc.)
6. suggestedActions: Array of useful automation actions

For each form field, identify:
- name, selector, type, purpose, required

For suggestedActions, provide step-by-step automation:
{
  "name": "Check Customer Balance",
  "description": "Search for a customer and view their balance",
  "type": "form",
  "steps": [
    {"type": "type", "target": "#customer-id", "value": "{customerId}", "description": "Enter customer ID"},
    {"type": "click", "target": "#search-btn", "description": "Click search"},
    {"type": "extract", "target": ".balance", "description": "Get balance value"}
  ]
}

Return ONLY valid JSON.`;

        try {
            const response = await geminiProvider.generateResponse(prompt, true);
            const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(cleanedResponse);
        } catch (error) {
            console.error('AI analysis failed:', error);
            return {
                description: title,
                isLoginPage: pageStructure.includes('"type":"password"'),
                forms: [],
                navigation: [],
                dataDisplays: [],
                suggestedActions: []
            };
        }
    }

    /**
     * Generate a login flow for a system
     */
    async generateLoginFlow(url: string, page: any): Promise<{
        usernameField: string;
        passwordField: string;
        submitButton: string;
        additionalSteps?: { type: string; target: string; value?: string }[];
    }> {
        this.page = page;

        // Navigate to login page if not already there
        if (page.url() !== url) {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        }

        const structure = await this.extractPageStructure();

        const prompt = `Analyze this login page and identify the login form fields.

PAGE STRUCTURE:
${structure}

Return a JSON object with:
- usernameField: CSS selector for username/email input
- passwordField: CSS selector for password input
- submitButton: CSS selector for login/submit button
- additionalSteps: Array of any additional steps needed (like clicking a tab, accepting cookies, etc.)

Return ONLY valid JSON.`;

        try {
            const response = await geminiProvider.generateResponse(prompt, true);
            const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(cleanedResponse);
        } catch (error) {
            // Fallback to common patterns
            return {
                usernameField: 'input[type="email"], input[type="text"][name*="user"], #username, #email',
                passwordField: 'input[type="password"]',
                submitButton: 'button[type="submit"], input[type="submit"], .login-btn'
            };
        }
    }

    /**
     * Suggest how to accomplish a goal on the current page
     */
    async suggestActionsForGoal(goal: string, page: any): Promise<{
        possible: boolean;
        confidence: number;
        actions: DiscoveredAction[];
        explanation: string;
    }> {
        this.page = page;
        const url = page.url();
        const title = await page.title();
        const structure = await this.extractPageStructure();

        const prompt = `Given this goal and page, determine if it's achievable and how.

GOAL: ${goal}
PAGE: ${title} (${url})

PAGE STRUCTURE:
${structure}

Return a JSON response with:
- possible: true/false - can this goal be achieved on this page?
- confidence: 0-100 - how confident are you?
- explanation: Brief explanation of your assessment
- actions: Array of actions to accomplish the goal (if possible)

Each action should have:
- name: action name
- description: what it does
- type: navigation | form | button | api
- steps: array of {type, target, value, description}

Return ONLY valid JSON.`;

        try {
            const response = await geminiProvider.generateResponse(prompt, true);
            const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(cleanedResponse);
        } catch (error) {
            return {
                possible: false,
                confidence: 0,
                actions: [],
                explanation: 'Could not analyze the page'
            };
        }
    }
}

export const systemLearner = new SystemLearner();
