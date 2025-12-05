/**
 * Product Detection API Endpoint
 * 
 * Scans external system pages to detect and extract product/service information.
 */

import { NextRequest } from 'next/server';
import { chromium } from 'playwright';
import { productDetector, DetectedProduct } from '@/lib/scanner/product-detector';
import { ref, push, set } from 'firebase/database';
import { database } from '@/lib/firebase/client';

interface DetectProductsRequest {
    url: string;
    companyId: string;
    industry: string;
    username?: string;
    password?: string;
    loginSelectors?: {
        usernameField: string;
        passwordField: string;
        loginButton: string;
    };
    saveToDatabase?: boolean;
}

export async function POST(request: NextRequest) {
    let browser = null;

    try {
        const body: DetectProductsRequest = await request.json();
        const { url, companyId, industry, saveToDatabase = true } = body;

        if (!url) {
            return Response.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log(`🔍 Detecting products for ${industry} at: ${url}`);

        // Set industry for pattern matching
        productDetector.setIndustry(industry);

        // Launch browser
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        });

        const page = await context.newPage();

        // Navigate to URL
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

        // Optional: Login if credentials provided
        if (body.username && body.password && body.loginSelectors) {
            try {
                await page.fill(body.loginSelectors.usernameField, body.username);
                await page.fill(body.loginSelectors.passwordField, body.password);
                await page.click(body.loginSelectors.loginButton);
                await page.waitForLoadState('networkidle', { timeout: 30000 });
            } catch (loginError) {
                console.log('Login failed or not required:', loginError);
            }
        }

        // Detect products on current page
        const products = await productDetector.detectProducts(page, url);

        // Find and scan additional product pages
        const productPageLinks = await findProductPageLinks(page);

        for (const link of productPageLinks.slice(0, 5)) { // Limit to 5 additional pages
            try {
                await page.goto(link, { waitUntil: 'networkidle', timeout: 20000 });
                const moreProducts = await productDetector.detectProducts(page, link);
                products.push(...moreProducts);
            } catch (err) {
                console.log(`Failed to scan ${link}`);
            }
        }

        // Close browser
        await browser.close();

        // Remove duplicates by name
        const uniqueProducts = removeDuplicates(products);

        // Save to database if requested
        if (saveToDatabase && uniqueProducts.length > 0) {
            await saveProductsToDatabase(companyId, industry, uniqueProducts);
        }

        console.log(`✅ Detected ${uniqueProducts.length} unique products`);

        return Response.json({
            success: true,
            products: uniqueProducts,
            totalDetected: uniqueProducts.length,
            savedToDatabase: saveToDatabase
        });

    } catch (error: any) {
        console.error('Product detection error:', error);

        if (browser) {
            await browser.close();
        }

        return Response.json({
            error: 'Product detection failed',
            details: error.message
        }, { status: 500 });
    }
}

/**
 * Find links to product/service pages
 */
async function findProductPageLinks(page: any): Promise<string[]> {
    return await page.evaluate(() => {
        const keywords = ['products', 'services', 'packages', 'plans', 'bundles', 'offers', 'pricing', 'tariffs'];
        const links: string[] = [];

        const allLinks = document.querySelectorAll('a[href]');
        allLinks.forEach(link => {
            const href = (link as HTMLAnchorElement).href;
            const text = link.textContent?.toLowerCase() || '';

            if (keywords.some(kw => href.toLowerCase().includes(kw) || text.includes(kw))) {
                if (href.startsWith(window.location.origin) && !links.includes(href)) {
                    links.push(href);
                }
            }
        });

        return links;
    });
}

/**
 * Remove duplicate products by name
 */
function removeDuplicates(products: DetectedProduct[]): DetectedProduct[] {
    const seen = new Set<string>();
    return products.filter(product => {
        const key = product.name.toLowerCase().trim();
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

/**
 * Save products to Firebase database
 */
async function saveProductsToDatabase(
    companyId: string,
    industry: string,
    products: DetectedProduct[]
): Promise<void> {
    try {
        const productsRef = ref(database, `companies/${companyId}/detectedProducts`);

        for (const product of products) {
            const productRef = push(productsRef);
            await set(productRef, {
                ...product,
                industry,
                detectedAt: Date.now(),
                status: 'pending_review', // Needs user approval before import
                imported: false
            });
        }

        console.log(`💾 Saved ${products.length} products to database`);
    } catch (error) {
        console.error('Failed to save products:', error);
    }
}
