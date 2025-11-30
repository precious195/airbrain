// src/lib/admin/multi-language.ts

/**
 * Admin module - Multi-language support
 */

export type SupportedLanguage = 'en' | 'bem' | 'ny';

export interface LanguageConfig {
    code: SupportedLanguage;
    name: string;
    nativeName: string;
    enabled: boolean;
    completeness: number; // 0-100%
    translators: string[];
}

export interface Translation {
    key: string;
    en: string;
    bem?: string;
    ny?: string;
    category: 'ui' | 'response' | 'error' | 'notification';
    context?: string;
    lastUpdated: string;
}

/**
 * Get supported languages
 */
export function getSupportedLanguages(): LanguageConfig[] {
    return [
        {
            code: 'en',
            name: 'English',
            nativeName: 'English',
            enabled: true,
            completeness: 100,
            translators: ['system'],
        },
        {
            code: 'bem',
            name: 'Bemba',
            nativeName: 'Icibemba',
            enabled: true,
            completeness: 85,
            translators: ['translator1@company.com', 'translator2@company.com'],
        },
        {
            code: 'ny',
            name: 'Nyanja',
            nativeName: 'Chinyanja',
            enabled: true,
            completeness: 78,
            translators: ['translator3@company.com'],
        },
    ];
}

/**
 * Get all translations
 */
export async function getTranslations(category?: string): Promise<Translation[]> {
    // TODO: Query from Firebase

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Sample translations
    return [
        // Greetings
        {
            key: 'greeting.welcome',
            en: 'Welcome! How can I help you today?',
            bem: 'Mwapoleni! Nshili fye nkwafwilisha shani lelo?',
            ny: 'Muli bwanji! Kodi ndingakuthandizeni bwanji lero?',
            category: 'response',
            lastUpdated: '2024-11-20',
        },
        {
            key: 'greeting.goodbye',
            en: 'Thank you for contacting us. Have a great day!',
            bem: 'Natotela ukutulondola. Mwalifye nabwino!',
            ny: 'Zikomo kuti mwatilumikizana. Mukhale bwino!',
            category: 'response',
            lastUpdated: '2024-11-20',
        },

        // Banking
        {
            key: 'banking.balance',
            en: 'Your account balance is K{amount}',
            bem: 'Ndalama za account yenu ni K{amount}',
            ny: 'Ndalama za account yanu ndi K{amount}',
            category: 'response',
            context: 'Used for balance inquiries',
            lastUpdated: '2024-11-20',
        },
        {
            key: 'banking.insufficient_funds',
            en: 'Insufficient funds. Your balance is K{balance}',
            bem: 'Ndalama sha ishapo. Balance yenu ni K{balance}',
            ny: 'Ndalama sizikwana. Balance yanu ndi K{balance}',
            category: 'error',
            lastUpdated: '2024-11-20',
        },

        // Mobile
        {
            key: 'mobile.bundle_purchased',
            en: 'Bundle purchased successfully! {bundleName} for K{amount}',
            bem: 'Bundle yalishigwako nabwino! {bundleName} ya K{amount}',
            ny: 'Bundle yagulika bwino! {bundleName} ya K{amount}',
            category: 'notification',
            lastUpdated: '2024-11-20',
        },

        // Errors
        {
            key: 'error.generic',
            en: 'Something went wrong. Please try again.',
            bem: 'Fintu fyalekafye ukushita. Eya ichapo.',
            ny: 'Chinachake chalakwika. Yesaninso.',
            category: 'error',
            lastUpdated: '2024-11-20',
        },

        // UI Elements
        {
            key: 'ui.button.submit',
            en: 'Submit',
            bem: 'Tumina',
            ny: 'Tumizani',
            category: 'ui',
            lastUpdated: '2024-11-20',
        },
        {
            key: 'ui.button.cancel',
            en: 'Cancel',
            bem: 'Lepekako',
            ny: 'Lekani',
            category: 'ui',
            lastUpdated: '2024-11-20',
        },
    ];
}

/**
 * Get translation by key
 */
export async function getTranslation(
    key: string,
    language: SupportedLanguage = 'en',
    variables?: Record<string, string>
): Promise<string> {
    // TODO: Query from Firebase

    const translations = await getTranslations();
    const translation = translations.find(t => t.key === key);

    if (!translation) {
        return key; // Return key if translation not found
    }

    let text = translation[language] || translation.en; // Fallback to English

    // Replace variables
    if (variables) {
        Object.entries(variables).forEach(([varKey, value]) => {
            text = text.replace(`{${varKey}}`, value);
        });
    }

    return text;
}

/**
 * Add or update translation
 */
export async function saveTranslation(
    translation: Translation
): Promise<{ success: boolean; message: string }> {
    // TODO: Save to Firebase

    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        success: true,
        message: `Translation "${translation.key}" saved successfully`,
    };
}

/**
 * Detect language from text
 */
export function detectLanguage(text: string): SupportedLanguage {
    // Simple language detection based on common words/patterns
    const bembaIndicators = ['muli', 'bwanji', 'natotela', 'twaful', 'ndalama', 'account', 'icibemba'];
    const nyanjaIndicators = ['muli', 'bwanji', 'zikomo', 'chinyanja', 'ndalama'];

    const lowerText = text.toLowerCase();

    const bembaScore = bembaIndicators.filter(word => lowerText.includes(word)).length;
    const nyanjaScore = nyanjaIndicators.filter(word => lowerText.includes(word)).length;

    if (bembaScore > nyanjaScore && bembaScore > 0) {
        return 'bem';
    } else if (nyanjaScore > 0) {
        return 'ny';
    }

    return 'en'; // Default to English
}

/**
 * Get missing translations
 */
export async function getMissingTranslations(
    targetLanguage: SupportedLanguage
): Promise<Array<{ key: string; en: string; category: string }>> {
    const translations = await getTranslations();

    return translations
        .filter(t => !t[targetLanguage] || t[targetLanguage] === '')
        .map(t => ({
            key: t.key,
            en: t.en,
            category: t.category,
        }));
}

/**
 * Import translations from JSON
 */
export async function importTranslations(
    jsonContent: string,
    language: SupportedLanguage
): Promise<{ success: boolean; imported: number; errors: string[] }> {
    const errors: string[] = [];
    let imported = 0;

    try {
        const data = JSON.parse(jsonContent);

        for (const [key, value] of Object.entries(data)) {
            if (typeof value !== 'string') {
                errors.push(`${key}: Invalid value type`);
                continue;
            }

            // Create/update translation
            imported++;
        }

        return {
            success: true,
            imported,
            errors,
        };
    } catch (error) {
        return {
            success: false,
            imported: 0,
            errors: ['Failed to parse JSON file'],
        };
    }
}

/**
 * Export translations to JSON
 */
export async function exportTranslations(language: SupportedLanguage): Promise<string> {
    const translations = await getTranslations();
    const exported: Record<string, string> = {};

    translations.forEach(t => {
        if (t[language]) {
            exported[t.key] = t[language]!;
        }
    });

    return JSON.stringify(exported, null, 2);
}

/**
 * Get translation statistics
 */
export async function getTranslationStatistics(): Promise<{
    totalKeys: number;
    byLanguage: Record<SupportedLanguage, { complete: number; missing: number; percentage: number }>;
    byCategory: Record<string, { total: number; complete: Record<SupportedLanguage, number> }>;
    recentUpdates: Array<{ key: string; language: SupportedLanguage; updatedAt: string }>;
}> {
    // TODO: Calculate from Firebase data

    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        totalKeys: 247,
        byLanguage: {
            en: { complete: 247, missing: 0, percentage: 100 },
            bem: { complete: 210, missing: 37, percentage: 85 },
            ny: { complete: 193, missing: 54, percentage: 78 },
        },
        byCategory: {
            ui: { total: 67, complete: { en: 67, bem: 62, ny: 54 } },
            response: { total: 123, complete: { en: 123, bem: 103, ny: 98 } },
            error: { total: 34, complete: { en: 34, bem: 28, ny: 25 } },
            notification: { total: 23, complete: { en: 23, bem: 17, ny: 16 } },
        },
        recentUpdates: [
            { key: 'banking.balance', language: 'bem', updatedAt: '2024-11-20' },
            { key: 'mobile.bundle_purchased', language: 'ny', updatedAt: '2024-11-19' },
        ],
    };
}
