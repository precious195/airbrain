import { chromium, Browser, Page, ElementHandle } from 'playwright';

export interface DiscoveredFeature {
    id: string;
    featureName: string;
    type: 'page' | 'button' | 'link' | 'form' | 'menu' | 'action';
    actionType: 'navigate' | 'click' | 'form_submit' | 'modal' | 'api_call';
    selector: string;
    xpath?: string;
    url?: string;
    pageUrl: string;
    text: string;
    attributes: Record<string, any>;
    parentMenu?: string;
    formFields?: FormField[];
    status: 'discovered' | 'verified' | 'failed';
}

export interface FormField {
    name: string;
    type: string;
    required: boolean;
    selector: string;
    placeholder?: string;
}

export interface ScanConfig {
    url: string;
    username: string;
    password: string;
    loginSelectors: {
        usernameField: string;
        passwordField: string;
        loginButton: string;
        otpField?: string;
    };
    maxDepth?: number;
    maxPagesToScan?: number;
    excludePatterns?: string[];
}

export interface ScanResult {
    features: DiscoveredFeature[];
    pagesCrawled: number;
    totalFeatures: number;
    scanDuration: number;
    errors: string[];
}

/**
 * Smart Browser Scanner - Automatically discovers external system features
 */
export class SystemScanner {
    private browser: Browser | null = null;
    private page: Page | null = null;
    private visitedUrls: Set<string> = new Set();
    private discoveredFeatures: DiscoveredFeature[] = [];
    private errors: string[] = [];

    /**
     * Main scan method
     */
    async scan(config: ScanConfig): Promise<ScanResult> {
        const startTime = Date.now();

        try {
            console.log('🚀 Starting system scan...');

            // Launch browser
            await this.launchBrowser();

            // Login
            await this.login(config);
            console.log('✅ Login successful');

            // Start crawling
            await this.crawlSystem(config);
            console.log(`📊 Crawled ${this.visitedUrls.size} pages`);

            // Close browser
            await this.closeBrowser();

            const scanDuration = Date.now() - startTime;

            return {
                features: this.discoveredFeatures,
                pagesCrawled: this.visitedUrls.size,
                totalFeatures: this.discoveredFeatures.length,
                scanDuration,
                errors: this.errors
            };
        } catch (error) {
            this.errors.push(`Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            await this.closeBrowser();
            throw error;
        }
    }

    /**
     * Launch headless browser
     */
    private async launchBrowser(): Promise<void> {
        this.browser = await chromium.launch({
            headless: false, // Visible for debugging
            slowMo: 1000, // Slow down operations by 1000ms to see what's happening
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const context = await this.browser.newContext({
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        });

        this.page = await context.newPage();
    }

    /**
     * Login to external system with extended timeouts for slow-loading sites
     */
    private async login(config: ScanConfig): Promise<void> {
        if (!this.page) throw new Error('Browser not initialized');

        const EXTENDED_TIMEOUT = 60000; // 60 seconds for slow sites

        try {
            console.log('📍 Navigating to login page...');
            // Navigate with extended timeout
            await this.page.goto(config.url, {
                waitUntil: 'domcontentloaded', // Changed from networkidle for faster initial load
                timeout: EXTENDED_TIMEOUT
            });

            console.log('⏳ Waiting for page to fully load...');
            // Wait for network to be idle (JavaScript to finish loading)
            try {
                await this.page.waitForLoadState('networkidle', { timeout: 30000 });
            } catch (e) {
                console.log('⚠️ Network idle timeout, continuing anyway...');
            }

            console.log('🔍 Looking for username field...');
            // Wait for username field to be visible (handles dynamic content)
            await this.page.waitForSelector(config.loginSelectors.usernameField, {
                state: 'visible',
                timeout: EXTENDED_TIMEOUT
            });

            console.log('✍️  Filling username...');
            await this.page.fill(config.loginSelectors.usernameField, config.username, {
                timeout: 30000
            });

            console.log('🔍 Looking for password field...');
            // Wait for password field
            await this.page.waitForSelector(config.loginSelectors.passwordField, {
                state: 'visible',
                timeout: EXTENDED_TIMEOUT
            });

            console.log('🔒 Filling password...');
            await this.page.fill(config.loginSelectors.passwordField, config.password, {
                timeout: 30000
            });

            console.log('🔍 Looking for login button...');
            // Wait for login button
            await this.page.waitForSelector(config.loginSelectors.loginButton, {
                state: 'visible',
                timeout: EXTENDED_TIMEOUT
            });

            console.log('🚀 Clicking login button...');
            await this.page.click(config.loginSelectors.loginButton, {
                timeout: 30000
            });

            console.log('⏳ Waiting for login to complete...');
            // Wait for navigation with extended timeout
            await this.page.waitForLoadState('networkidle', { timeout: EXTENDED_TIMEOUT });

            // Additional wait for any post-login redirects
            await this.page.waitForTimeout(5000);

            console.log('✅ Login completed successfully!');

            // Check for OTP if configured
            if (config.loginSelectors.otpField) {
                const otpVisible = await this.page.isVisible(config.loginSelectors.otpField);
                if (otpVisible) {
                    throw new Error('OTP_REQUIRED: Two-factor authentication detected. Please disable 2FA for the scanning account.');
                }
            }
        } catch (error) {
            console.error('❌ Login failed:', error);

            // Provide helpful error message
            if (error instanceof Error) {
                if (error.message.includes('Timeout')) {
                    throw new Error(
                        `Login timeout: Could not find "${error.message.includes('username') ? 'username' : error.message.includes('password') ? 'password' : 'login button'}" field. ` +
                        `The page may be using different selectors or loading very slowly. ` +
                        `Try inspecting the page elements and updating the selectors in Advanced Login Selectors.`
                    );
                }
            }
            throw error;
        }
    }

    /**
     * Crawl the system and discover features
     */
    private async crawlSystem(config: ScanConfig): Promise<void> {
        if (!this.page) throw new Error('Browser not initialized');

        const maxDepth = config.maxDepth || 3;
        const maxPages = config.maxPagesToScan || 50;

        // Start with current page
        const startUrl = this.page.url();
        await this.scanPage(startUrl, 0, maxDepth, maxPages, config);
    }

    /**
     * Scan a single page
     */
    private async scanPage(
        url: string,
        depth: number,
        maxDepth: number,
        maxPages: number,
        config: ScanConfig
    ): Promise<void> {
        if (!this.page) return;
        if (this.visitedUrls.has(url)) return;
        if (this.visitedUrls.size >= maxPages) return;
        if (depth > maxDepth) return;

        // Skip excluded patterns
        if (config.excludePatterns?.some(pattern => url.includes(pattern))) {
            return;
        }

        try {
            console.log(`📄 Scanning: ${url} (depth: ${depth})`);
            this.visitedUrls.add(url);

            await this.page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

            // Discover features on this page
            await this.discoverPageFeatures(url);

            // Find links to crawl
            if (depth < maxDepth) {
                const links = await this.findNavigationLinks();

                for (const link of links) {
                    if (this.visitedUrls.size >= maxPages) break;
                    await this.scanPage(link, depth + 1, maxDepth, maxPages, config);
                }
            }
        } catch (error) {
            this.errors.push(`Error scanning ${url}: ${error instanceof Error ? error.message : 'Unknown'}`);
        }
    }

    /**
     * Discover all features on current page
     */
    private async discoverPageFeatures(pageUrl: string): Promise<void> {
        if (!this.page) return;

        try {
            // Extract page title
            const pageTitle = await this.page.title();

            // Discover navigation links
            await this.discoverLinks(pageUrl, pageTitle);

            // Discover buttons
            await this.discoverButtons(pageUrl);

            // Discover forms
            await this.discoverForms(pageUrl);

            // Discover menu items
            await this.discoverMenus(pageUrl);

        } catch (error) {
            this.errors.push(`Error discovering features on ${pageUrl}: ${error}`);
        }
    }

    /**
     * Discover all links
     */
    private async discoverLinks(pageUrl: string, pageTitle: string): Promise<void> {
        if (!this.page) return;

        const links = await this.page.$$('a[href]');

        for (const link of links) {
            try {
                const href = await link.getAttribute('href');
                const text = await link.textContent();
                const selector = await this.generateSelector(link);

                if (href && text?.trim()) {
                    this.addFeature({
                        featureName: text.trim(),
                        type: 'link',
                        actionType: 'navigate',
                        selector,
                        url: new URL(href, pageUrl).href,
                        pageUrl,
                        text: text.trim(),
                        attributes: { href }
                    });
                }
            } catch (error) {
                // Skip invalid links
            }
        }
    }

    /**
     * Discover all buttons
     */
    private async discoverButtons(pageUrl: string): Promise<void> {
        if (!this.page) return;

        const buttons = await this.page.$$('button, input[type="button"], input[type="submit"], [role="button"]');

        for (const button of buttons) {
            try {
                const text = await button.textContent() || await button.getAttribute('value') || await button.getAttribute('aria-label');
                const selector = await this.generateSelector(button);
                const id = await button.getAttribute('id');
                const className = await button.getAttribute('class');

                if (text?.trim()) {
                    this.addFeature({
                        featureName: text.trim(),
                        type: 'button',
                        actionType: 'click',
                        selector,
                        pageUrl,
                        text: text.trim(),
                        attributes: { id, class: className }
                    });
                }
            } catch (error) {
                // Skip
            }
        }
    }

    /**
     * Discover all forms
     */
    private async discoverForms(pageUrl: string): Promise<void> {
        if (!this.page) return;

        const forms = await this.page.$$('form');

        for (const form of forms) {
            try {
                const action = await form.getAttribute('action');
                const method = await form.getAttribute('method') || 'POST';
                const formName = await form.getAttribute('name') || await form.getAttribute('id') || 'Unnamed Form';

                // Extract form fields
                const fields = await this.extractFormFields(form);

                this.addFeature({
                    featureName: formName,
                    type: 'form',
                    actionType: 'form_submit',
                    selector: await this.generateSelector(form),
                    url: action ? new URL(action, pageUrl).href : undefined,
                    pageUrl,
                    text: formName,
                    attributes: { method },
                    formFields: fields
                });
            } catch (error) {
                // Skip
            }
        }
    }

    /**
     * Discover menu items
     */
    private async discoverMenus(pageUrl: string): Promise<void> {
        if (!this.page) return;

        // Common menu selectors
        const menuSelectors = [
            'nav',
            '[role="navigation"]',
            '.sidebar',
            '.menu',
            '.nav-menu',
            'aside'
        ];

        for (const selector of menuSelectors) {
            try {
                const menus = await this.page.$$(selector);

                for (const menu of menus) {
                    const menuItems = await menu.$$('a, button, [role="menuitem"]');
                    const menuName = await menu.getAttribute('aria-label') || 'Menu';

                    for (const item of menuItems) {
                        const text = await item.textContent();
                        const itemSelector = await this.generateSelector(item);

                        if (text?.trim()) {
                            this.addFeature({
                                featureName: text.trim(),
                                type: 'menu',
                                actionType: 'click',
                                selector: itemSelector,
                                pageUrl,
                                text: text.trim(),
                                parentMenu: menuName,
                                attributes: {}
                            });
                        }
                    }
                }
            } catch (error) {
                // Skip
            }
        }
    }

    /**
     * Extract form fields
     */
    private async extractFormFields(form: ElementHandle): Promise<FormField[]> {
        const fields: FormField[] = [];

        const inputs = await form.$$('input, select, textarea');

        for (const input of inputs) {
            try {
                const name = await input.getAttribute('name') || await input.getAttribute('id') || '';
                const type = await input.getAttribute('type') || 'text';
                const required = await input.getAttribute('required') !== null;
                const placeholder = await input.getAttribute('placeholder');
                const selector = await this.generateSelector(input);

                if (name) {
                    fields.push({ name, type, required, selector, placeholder: placeholder || undefined });
                }
            } catch (error) {
                // Skip
            }
        }

        return fields;
    }

    /**
     * Generate unique CSS selector for element
     */
    private async generateSelector(element: ElementHandle): Promise<string> {
        try {
            // Try ID first
            const id = await element.getAttribute('id');
            if (id) return `#${id}`;

            // Try combination of tag + classes
            const tag = await element.evaluate(el => el.tagName.toLowerCase());
            const classes = await element.getAttribute('class');

            if (classes) {
                const classList = classes.trim().split(/\s+/).slice(0, 2).join('.');
                return `${tag}.${classList}`;
            }

            return tag;
        } catch (error) {
            return 'unknown';
        }
    }

    /**
     * Find navigation links on page
     */
    private async findNavigationLinks(): Promise<string[]> {
        if (!this.page) return [];

        const links = await this.page.$$eval('a[href]', (elements) =>
            elements.map(el => (el as HTMLAnchorElement).href)
        );

        const currentDomain = new URL(this.page.url()).origin;

        // Only return same-domain links
        return links
            .filter(link => link.startsWith(currentDomain))
            .filter(link => !link.includes('#'))
            .filter(link => !link.includes('logout'))
            .filter(link => !link.includes('signout'));
    }

    /**
     * Add discovered feature
     */
    private addFeature(feature: Omit<DiscoveredFeature, 'id' | 'status'>): void {
        this.discoveredFeatures.push({
            ...feature,
            id: `feature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'discovered'
        });
    }

    /**
     * Close browser
     */
    private async closeBrowser(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }
}
