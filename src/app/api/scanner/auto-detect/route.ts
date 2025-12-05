/**
 * Auto-Detect API Endpoint
 * 
 * Scans a login page and automatically detects form selectors using AI.
 */

import { NextRequest } from 'next/server';
import { chromium } from 'playwright';
import { geminiProvider } from '@/lib/ai/gemini-provider';

interface DetectedSelectors {
    usernameField: string;
    passwordField: string;
    loginButton: string;
    otherFields?: { name: string; selector: string; type: string }[];
}

export async function POST(request: NextRequest) {
    let browser = null;

    try {
        const { url } = await request.json();

        if (!url) {
            return Response.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log(`🔍 Auto-detecting selectors for: ${url}`);

        // Launch browser with settings to bypass common bot detection
        browser = await chromium.launch({
            headless: true,
            args: [
                '--disable-http2',  // Disable HTTP/2 to avoid protocol errors
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });

        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080 },
            ignoreHTTPSErrors: true,
            extraHTTPHeaders: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        });

        const page = await context.newPage();

        // Try multiple wait strategies
        let pageLoaded = false;
        const waitStrategies = ['domcontentloaded', 'load', 'commit'] as const;

        for (const strategy of waitStrategies) {
            try {
                console.log(`  Trying wait strategy: ${strategy}`);
                await page.goto(url, {
                    waitUntil: strategy,
                    timeout: 20000
                });
                pageLoaded = true;
                break;
            } catch (navError: any) {
                console.log(`  Strategy ${strategy} failed: ${navError.message.split('\n')[0]}`);
                if (strategy === waitStrategies[waitStrategies.length - 1]) {
                    throw new Error(`Could not load page. The site may be blocking automated access or have connectivity issues.`);
                }
            }
        }

        if (!pageLoaded) {
            throw new Error('Failed to load the page with any strategy');
        }

        // Wait a bit for any JavaScript to settle
        await page.waitForTimeout(2000);

        // Extract page HTML for analysis
        const pageContent = await page.evaluate(() => {
            // Get all form elements and inputs
            const forms = document.querySelectorAll('form');
            const inputs = document.querySelectorAll('input');
            const buttons = document.querySelectorAll('button, input[type="submit"], a[role="button"]');

            const formData: any[] = [];

            // Analyze forms
            forms.forEach((form, idx) => {
                const formInputs = form.querySelectorAll('input');
                const formButtons = form.querySelectorAll('button, input[type="submit"]');

                formData.push({
                    formIndex: idx,
                    id: form.id || null,
                    className: form.className || null,
                    action: form.action || null,
                    inputs: Array.from(formInputs).map((input: any) => ({
                        type: input.type,
                        id: input.id || null,
                        name: input.name || null,
                        className: input.className || null,
                        placeholder: input.placeholder || null,
                        'aria-label': input.getAttribute('aria-label'),
                        autocomplete: input.autocomplete || null
                    })),
                    buttons: Array.from(formButtons).map((btn: any) => ({
                        type: btn.type || btn.tagName.toLowerCase(),
                        id: btn.id || null,
                        className: btn.className || null,
                        text: btn.textContent?.trim() || null,
                        'aria-label': btn.getAttribute('aria-label')
                    }))
                });
            });

            // Also get standalone inputs/buttons not in forms
            const standaloneInputs = Array.from(inputs)
                .filter(input => !input.closest('form'))
                .map((input: any) => ({
                    type: input.type,
                    id: input.id || null,
                    name: input.name || null,
                    className: input.className || null,
                    placeholder: input.placeholder || null,
                    'aria-label': input.getAttribute('aria-label'),
                    autocomplete: input.autocomplete || null
                }));

            const standaloneButtons = Array.from(buttons)
                .filter(btn => !btn.closest('form'))
                .map((btn: any) => ({
                    type: btn.type || btn.tagName.toLowerCase(),
                    id: btn.id || null,
                    className: btn.className || null,
                    text: btn.textContent?.trim() || null,
                    'aria-label': btn.getAttribute('aria-label')
                }));

            return {
                forms: formData,
                standaloneInputs,
                standaloneButtons,
                title: document.title
            };
        });

        console.log('📄 Page analysis complete, using AI to detect selectors...');

        // Use AI to analyze and determine the best selectors
        const prompt = `Analyze this login page structure and determine the CSS selectors for the login form elements.

Page Title: ${pageContent.title}
URL: ${url}

Forms Found:
${JSON.stringify(pageContent.forms, null, 2)}

Standalone Inputs (not in forms):
${JSON.stringify(pageContent.standaloneInputs, null, 2)}

Standalone Buttons:
${JSON.stringify(pageContent.standaloneButtons, null, 2)}

Based on this structure, determine the most reliable CSS selectors for:
1. Username/Email input field
2. Password input field
3. Login/Submit button

Consider these priorities for selector reliability:
1. Use ID selectors (#id) when available
2. Use name attribute selectors (input[name="..."]) as second choice
3. Use type attribute selectors (input[type="email"], input[type="password"]) as fallback
4. For buttons, prefer type="submit" or text-based selectors

Return ONLY a valid JSON object in this exact format:
{
    "usernameField": "selector_here",
    "passwordField": "selector_here",
    "loginButton": "selector_here",
    "confidence": "high|medium|low",
    "notes": "brief explanation"
}`;

        let detectedSelectors: DetectedSelectors;
        let confidence = 'low';
        let notes = '';

        try {
            const aiResponse = await geminiProvider.generateResponse(prompt, true);
            const cleaned = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
            const parsed = JSON.parse(cleaned);

            detectedSelectors = {
                usernameField: parsed.usernameField || 'input[type="email"], input[type="text"]',
                passwordField: parsed.passwordField || 'input[type="password"]',
                loginButton: parsed.loginButton || 'button[type="submit"]'
            };
            confidence = parsed.confidence || 'medium';
            notes = parsed.notes || '';

        } catch (aiError) {
            console.log('AI analysis failed, using heuristic detection...');

            // Fallback: Use heuristic detection
            detectedSelectors = await heuristicDetection(page);
            confidence = 'medium';
            notes = 'Detected using heuristic analysis';
        }

        // Validate the selectors actually exist on the page
        const validation = await page.evaluate((selectors: DetectedSelectors) => {
            return {
                usernameExists: !!document.querySelector(selectors.usernameField),
                passwordExists: !!document.querySelector(selectors.passwordField),
                loginButtonExists: !!document.querySelector(selectors.loginButton)
            };
        }, detectedSelectors);

        // Close browser
        await browser.close();

        console.log('✅ Auto-detection complete');

        return Response.json({
            success: true,
            selectors: detectedSelectors,
            validation,
            confidence,
            notes
        });

    } catch (error: any) {
        console.error('Auto-detect error:', error.message);

        if (browser) {
            try {
                await browser.close();
            } catch { }
        }

        // Provide user-friendly error messages
        let userMessage = 'Auto-detection failed';

        if (error.message.includes('net::ERR_')) {
            userMessage = 'Could not connect to the page. The site may be blocking automated access or have connectivity issues.';
        } else if (error.message.includes('timeout')) {
            userMessage = 'The page took too long to load. Try again or enter selectors manually.';
        } else if (error.message.includes('Could not load page')) {
            userMessage = error.message;
        }

        return Response.json({
            error: userMessage,
            details: error.message
        }, { status: 500 });
    }
}

/**
 * Heuristic detection as fallback when AI fails
 */
async function heuristicDetection(page: any): Promise<DetectedSelectors> {
    return await page.evaluate(() => {
        let usernameField = '';
        let passwordField = '';
        let loginButton = '';

        // Find password field first (most reliable indicator of login form)
        const passwordInput = document.querySelector('input[type="password"]');
        if (passwordInput) {
            const id = passwordInput.id;
            const name = (passwordInput as HTMLInputElement).name;

            if (id) {
                passwordField = `#${id}`;
            } else if (name) {
                passwordField = `input[name="${name}"]`;
            } else {
                passwordField = 'input[type="password"]';
            }
        }

        // Find username field (usually before password field)
        const usernamePatterns = [
            'input[type="email"]',
            'input[name="email"]',
            'input[name="username"]',
            'input[name="user"]',
            'input[name="login"]',
            'input[autocomplete="username"]',
            'input[autocomplete="email"]',
            'input#email',
            'input#username',
            'input#user'
        ];

        for (const pattern of usernamePatterns) {
            const elem = document.querySelector(pattern);
            if (elem) {
                const id = elem.id;
                const name = (elem as HTMLInputElement).name;

                if (id) {
                    usernameField = `#${id}`;
                } else if (name) {
                    usernameField = `input[name="${name}"]`;
                } else {
                    usernameField = pattern;
                }
                break;
            }
        }

        // If still not found, look for text input before password
        if (!usernameField && passwordInput) {
            const form = passwordInput.closest('form');
            if (form) {
                const inputs = form.querySelectorAll('input[type="text"], input[type="email"]');
                for (const input of inputs) {
                    const rect1 = input.getBoundingClientRect();
                    const rect2 = passwordInput.getBoundingClientRect();
                    if (rect1.top < rect2.top) {
                        const id = input.id;
                        const name = (input as HTMLInputElement).name;
                        if (id) {
                            usernameField = `#${id}`;
                        } else if (name) {
                            usernameField = `input[name="${name}"]`;
                        } else {
                            usernameField = 'input[type="text"]';
                        }
                        break;
                    }
                }
            }
        }

        // Find login button
        // First try to find submit button in the same form as password
        if (passwordInput) {
            const form = passwordInput.closest('form');
            if (form) {
                const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
                if (submitBtn) {
                    const id = submitBtn.id;
                    if (id) {
                        loginButton = `#${id}`;
                    } else {
                        loginButton = 'button[type="submit"]';
                    }
                }
            }
        }

        // Fallback button search
        if (!loginButton) {
            const allButtons = document.querySelectorAll('button, input[type="submit"]');
            for (const btn of allButtons) {
                const text = btn.textContent?.toLowerCase() || '';
                if (text.includes('login') || text.includes('sign in') || text.includes('log in') || text.includes('submit')) {
                    const id = btn.id;
                    if (id) {
                        loginButton = `#${id}`;
                    } else {
                        const className = btn.className.split(' ')[0];
                        if (className) {
                            loginButton = `button.${className}`;
                        } else {
                            loginButton = 'button[type="submit"]';
                        }
                    }
                    break;
                }
            }
        }

        return {
            usernameField: usernameField || 'input[type="email"]',
            passwordField: passwordField || 'input[type="password"]',
            loginButton: loginButton || 'button[type="submit"]'
        };
    });
}
