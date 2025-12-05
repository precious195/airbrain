/**
 * Product Detector Module
 * 
 * AI-powered detection of products, services, and packages from external system pages.
 * Extracts structured data for import into Data Management.
 */

import { Page } from 'playwright';
import { geminiProvider } from '@/lib/ai/gemini-provider';

export interface DetectedProduct {
    id: string;
    name: string;
    type: 'product' | 'service' | 'package' | 'plan' | 'bundle';
    category: string;
    price?: number;
    currency?: string;
    duration?: string;
    features: string[];
    description?: string;
    sourceUrl: string;
    sourceSelector?: string;
    confidence: number;
    rawText?: string;
}

export interface ProductDetectionResult {
    products: DetectedProduct[];
    totalDetected: number;
    pagesScanned: number;
    industry?: string;
}

// Industry-specific product patterns
const INDUSTRY_PATTERNS: Record<string, { keywords: string[]; categories: string[] }> = {
    mobile: {
        keywords: ['data', 'bundle', 'minutes', 'sms', 'voice', 'mb', 'gb', 'airtime', 'top-up', 'recharge'],
        categories: ['data_bundle', 'voice_package', 'sms_bundle', 'combo_pack', 'device']
    },
    banking: {
        keywords: ['account', 'loan', 'card', 'deposit', 'savings', 'interest', 'mortgage', 'credit', 'debit'],
        categories: ['savings_account', 'current_account', 'loan', 'credit_card', 'fixed_deposit', 'investment']
    },
    insurance: {
        keywords: ['policy', 'coverage', 'premium', 'claim', 'benefit', 'protection', 'life', 'health', 'motor'],
        categories: ['life_insurance', 'health_insurance', 'motor_insurance', 'home_insurance', 'travel_insurance']
    },
    microfinance: {
        keywords: ['loan', 'savings', 'group', 'chama', 'interest', 'collateral', 'repayment', 'credit'],
        categories: ['personal_loan', 'business_loan', 'group_loan', 'savings_account', 'emergency_loan']
    },
    television: {
        keywords: ['package', 'channel', 'subscription', 'decoder', 'premium', 'sports', 'movies', 'hd'],
        categories: ['tv_package', 'premium_channel', 'add_on', 'decoder', 'streaming']
    }
};

// Price patterns for different currencies
const PRICE_PATTERNS = [
    /(?:KES|KSH|Ksh\.?)\s*[\d,]+(?:\.\d{2})?/gi,
    /(?:USD|\$)\s*[\d,]+(?:\.\d{2})?/gi,
    /(?:EUR|€)\s*[\d,]+(?:\.\d{2})?/gi,
    /(?:GBP|£)\s*[\d,]+(?:\.\d{2})?/gi,
    /[\d,]+(?:\.\d{2})?\s*(?:per|\/)\s*(?:day|week|month|year)/gi
];

// Duration patterns
const DURATION_PATTERNS = [
    /(\d+)\s*(?:day|days)/gi,
    /(\d+)\s*(?:week|weeks)/gi,
    /(\d+)\s*(?:month|months)/gi,
    /(\d+)\s*(?:year|years)/gi,
    /(?:daily|weekly|monthly|yearly|annual)/gi
];

export class ProductDetector {
    private industry: string = 'general';

    setIndustry(industry: string): void {
        this.industry = industry.toLowerCase();
    }

    /**
     * Detect products on a page
     */
    async detectProducts(page: Page, sourceUrl: string): Promise<DetectedProduct[]> {
        console.log(`🔍 Detecting products on: ${sourceUrl}`);

        try {
            // Extract page content
            const pageData = await this.extractPageContent(page);

            // Check if page likely contains products
            if (!this.isProductPage(pageData)) {
                console.log('  No product patterns detected on this page');
                return [];
            }

            console.log('  Found product patterns, analyzing with AI...');

            // Use AI to extract structured product data
            const products = await this.analyzeWithAI(pageData, sourceUrl);

            console.log(`  ✅ Detected ${products.length} products`);
            return products;

        } catch (error) {
            console.error('Product detection error:', error);
            return [];
        }
    }

    /**
     * Extract relevant content from page
     */
    private async extractPageContent(page: Page): Promise<{
        title: string;
        text: string;
        productCards: string[];
        prices: string[];
        lists: string[];
    }> {
        return await page.evaluate(() => {
            const title = document.title;
            const text = document.body.innerText;

            // Find product card-like elements
            const cardSelectors = [
                '.product', '.package', '.plan', '.bundle', '.service',
                '[class*="product"]', '[class*="package"]', '[class*="plan"]',
                '.card', '.pricing', '.offer', '.item'
            ];

            const productCards: string[] = [];
            for (const selector of cardSelectors) {
                const cards = document.querySelectorAll(selector);
                cards.forEach(card => {
                    const cardText = card.textContent?.trim();
                    if (cardText && cardText.length > 20 && cardText.length < 2000) {
                        productCards.push(cardText);
                    }
                });
            }

            // Find prices
            const priceElements = document.querySelectorAll('[class*="price"], .amount, .cost');
            const prices: string[] = [];
            priceElements.forEach(el => {
                const text = el.textContent?.trim();
                if (text) prices.push(text);
            });

            // Find feature lists
            const lists: string[] = [];
            const listElements = document.querySelectorAll('ul, ol');
            listElements.forEach(list => {
                const items = list.querySelectorAll('li');
                if (items.length >= 2 && items.length <= 15) {
                    const listText = Array.from(items).map(li => li.textContent?.trim()).join(', ');
                    if (listText.length > 20) {
                        lists.push(listText);
                    }
                }
            });

            return { title, text, productCards, prices, lists };
        });
    }

    /**
     * Check if page likely contains products
     */
    private isProductPage(pageData: { text: string; productCards: string[]; prices: string[] }): boolean {
        const text = pageData.text.toLowerCase();

        // Check for industry-specific keywords
        const patterns = INDUSTRY_PATTERNS[this.industry] || INDUSTRY_PATTERNS.mobile;
        const keywordMatches = patterns.keywords.filter(kw => text.includes(kw)).length;

        // Check for price patterns
        const hasPrice = PRICE_PATTERNS.some(pattern => pattern.test(pageData.text));

        // Check for product cards
        const hasCards = pageData.productCards.length > 0;

        return keywordMatches >= 2 || (hasPrice && hasCards);
    }

    /**
     * Use AI to extract structured product data
     */
    private async analyzeWithAI(
        pageData: { title: string; text: string; productCards: string[]; prices: string[]; lists: string[] },
        sourceUrl: string
    ): Promise<DetectedProduct[]> {
        const industryPatterns = INDUSTRY_PATTERNS[this.industry] || INDUSTRY_PATTERNS.mobile;

        const prompt = `Analyze this page content and extract all products, services, packages, or plans.

Page Title: ${pageData.title}
URL: ${sourceUrl}
Industry: ${this.industry}
Expected Categories: ${industryPatterns.categories.join(', ')}

Product Cards Found:
${pageData.productCards.slice(0, 10).join('\n---\n')}

Prices Found: ${pageData.prices.slice(0, 20).join(', ')}

Feature Lists: ${pageData.lists.slice(0, 5).join('\n')}

Page Text (truncated):
${pageData.text.substring(0, 3000)}

Extract ALL products/services you can find. For each, provide:
- name: Clear product name
- type: One of: product, service, package, plan, bundle
- category: Best matching category from the expected list
- price: Numeric price if found
- currency: Currency code (KES, USD, etc.)
- duration: Validity period if applicable (e.g., "30 days", "monthly")
- features: Array of key features/benefits
- description: Brief description
- confidence: 0.0-1.0 how confident you are

Return ONLY a valid JSON array:
[
  {
    "name": "Product Name",
    "type": "bundle",
    "category": "data_bundle",
    "price": 500,
    "currency": "KES",
    "duration": "7 days",
    "features": ["5GB data", "Valid 7 days"],
    "description": "Weekly data bundle",
    "confidence": 0.9
  }
]

If no products found, return empty array: []`;

        try {
            const response = await geminiProvider.generateResponse(prompt, true);
            const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();

            // Handle empty response
            if (cleaned === '[]' || !cleaned) {
                return [];
            }

            const parsed = JSON.parse(cleaned);

            if (!Array.isArray(parsed)) {
                return [];
            }

            // Convert to DetectedProduct format
            return parsed.map((item: any, index: number) => ({
                id: `prod_${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
                name: String(item.name || 'Unknown Product'),
                type: item.type || 'product',
                category: item.category || 'general',
                price: typeof item.price === 'number' ? item.price : undefined,
                currency: item.currency || undefined,
                duration: item.duration || undefined,
                features: Array.isArray(item.features) ? item.features : [],
                description: item.description || undefined,
                sourceUrl,
                confidence: typeof item.confidence === 'number' ? item.confidence : 0.5,
                rawText: pageData.productCards[index] || undefined
            }));

        } catch (error) {
            console.error('AI analysis failed:', error);

            // Fallback: Basic pattern-based extraction
            return this.fallbackExtraction(pageData, sourceUrl);
        }
    }

    /**
     * Fallback extraction when AI fails
     */
    private fallbackExtraction(
        pageData: { productCards: string[]; prices: string[] },
        sourceUrl: string
    ): DetectedProduct[] {
        const products: DetectedProduct[] = [];

        for (let i = 0; i < Math.min(pageData.productCards.length, 10); i++) {
            const card = pageData.productCards[i];

            // Try to extract name from first line
            const lines = card.split('\n').filter(l => l.trim());
            const name = lines[0]?.substring(0, 100) || `Product ${i + 1}`;

            // Try to extract price
            let price: number | undefined;
            let currency: string | undefined;
            for (const pattern of PRICE_PATTERNS) {
                const match = card.match(pattern);
                if (match) {
                    const priceStr = match[0].replace(/[^\d.]/g, '');
                    price = parseFloat(priceStr);
                    if (match[0].includes('KES') || match[0].includes('KSH')) currency = 'KES';
                    else if (match[0].includes('USD') || match[0].includes('$')) currency = 'USD';
                    break;
                }
            }

            // Extract duration
            let duration: string | undefined;
            for (const pattern of DURATION_PATTERNS) {
                const match = card.match(pattern);
                if (match) {
                    duration = match[0];
                    break;
                }
            }

            products.push({
                id: `prod_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}`,
                name,
                type: 'product',
                category: 'general',
                price,
                currency,
                duration,
                features: lines.slice(1, 5),
                sourceUrl,
                confidence: 0.4,
                rawText: card
            });
        }

        return products;
    }
}

// Singleton instance
export const productDetector = new ProductDetector();
