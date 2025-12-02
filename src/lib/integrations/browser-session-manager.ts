// Conditional import - playwright may not be installed
let chromium: any, Browser: any, Page: any, BrowserContext: any;
try {
    const playwright = require('playwright');
    chromium = playwright.chromium;
    Browser = playwright.Browser;
    Page = playwright.Page;
    BrowserContext = playwright.BrowserContext;
} catch (e) {
    console.warn('Playwright not installed. Browser automation will be disabled.');
}

import { SystemIntegration, AutomationStep } from '@/types/database';
import { externalSystemService } from './external-system-service';

interface BrowserSession {
    browser: any;
    context: any;
    page: any;
    companyId: string;
    lastActivity: number;
    isLoggedIn: boolean;
}

class BrowserSessionManager {
    private sessions: Map<string, BrowserSession> = new Map();
    private readonly SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor() {
        // Start cleanup interval
        this.startCleanup();
    }

    private startCleanup() {
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [companyId, session] of Array.from(this.sessions.entries())) {
                if (now - session.lastActivity > this.SESSION_TIMEOUT) {
                    console.log(`Cleaning up expired session for company: ${companyId}`);
                    this.closeSession(companyId);
                }
            }
        }, 60 * 1000); // Check every minute
    }

    async getSession(companyId: string): Promise<BrowserSession> {
        const existing = this.sessions.get(companyId);

        if (existing) {
            existing.lastActivity = Date.now();
            return existing;
        }

        // Create new session
        const browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        });

        const page = await context.newPage();

        const session: BrowserSession = {
            browser,
            context,
            page,
            companyId,
            lastActivity: Date.now(),
            isLoggedIn: false
        };

        this.sessions.set(companyId, session);
        return session;
    }

    async closeSession(companyId: string) {
        const session = this.sessions.get(companyId);
        if (session) {
            await session.browser.close();
            this.sessions.delete(companyId);
        }
    }

    async closeAll() {
        for (const companyId of Array.from(this.sessions.keys())) {
            await this.closeSession(companyId);
        }
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }

    getActiveSessionCount(): number {
        return this.sessions.size;
    }
}

// Singleton instance
export const browserSessionManager = new BrowserSessionManager();
