import { ref, get, set, update } from 'firebase/database';
import { database } from '../firebase/client';
import { ChannelType } from '@/types/database';

export interface CustomerPreferences {
    language?: string;
    communicationStyle?: 'formal' | 'casual';
    preferredChannel?: ChannelType;
    notificationPreferences?: {
        email?: boolean;
        sms?: boolean;
        whatsapp?: boolean;
    };
}

export interface PreviousIssue {
    category: string;
    resolution: string;
    timestamp: number;
    satisfactionRating?: number;
}

export interface CustomerMemory {
    customerId: string;
    preferences: CustomerPreferences;
    previousIssues: PreviousIssue[];
    frequentQueries: string[];
    satisfactionHistory: number[];
    lastInteraction: number;
    totalInteractions: number;
    averageSentiment?: 'positive' | 'negative' | 'neutral';
}

/**
 * Long-term customer memory service for personalization
 */
export class CustomerMemoryService {
    private companyId: string;

    constructor(companyId: string) {
        this.companyId = companyId;
    }

    /**
     * Get customer memory
     */
    async getMemory(customerId: string): Promise<CustomerMemory | null> {
        const memoryRef = ref(database, `companies/${this.companyId}/customerMemory/${customerId}`);
        const snapshot = await get(memoryRef);

        if (!snapshot.exists()) {
            return null;
        }

        return snapshot.val();
    }

    /**
     * Initialize memory for new customer
     */
    async initializeMemory(customerId: string): Promise<CustomerMemory> {
        const memory: CustomerMemory = {
            customerId,
            preferences: {},
            previousIssues: [],
            frequentQueries: [],
            satisfactionHistory: [],
            lastInteraction: Date.now(),
            totalInteractions: 0
        };

        await set(ref(database, `companies/${this.companyId}/customerMemory/${customerId}`), memory);
        return memory;
    }

    /**
     * Update customer preferences
     */
    async updatePreferences(customerId: string, preferences: Partial<CustomerPreferences>): Promise<void> {
        const memoryRef = ref(database, `companies/${this.companyId}/customerMemory/${customerId}/preferences`);
        await update(memoryRef, preferences);
    }

    /**
     * Add previous issue
     */
    async addIssue(customerId: string, issue: PreviousIssue): Promise<void> {
        let memory = await this.getMemory(customerId);
        if (!memory) {
            memory = await this.initializeMemory(customerId);
        }

        const issues = [...memory.previousIssues, issue];
        // Keep only last 10 issues
        const recentIssues = issues.slice(-10);

        await update(ref(database, `companies/${this.companyId}/customerMemory/${customerId}`), {
            previousIssues: recentIssues
        });
    }

    /**
     * Track frequent query
     */
    async trackQuery(customerId: string, query: string): Promise<void> {
        let memory = await this.getMemory(customerId);
        if (!memory) {
            memory = await this.initializeMemory(customerId);
        }

        const queries = [...memory.frequentQueries, query];
        // Keep only last 20 queries
        const recentQueries = queries.slice(-20);

        await update(ref(database, `companies/${this.companyId}/customerMemory/${customerId}`), {
            frequentQueries: recentQueries
        });
    }

    /**
     * Add satisfaction rating
     */
    async addSatisfaction(customerId: string, rating: number): Promise<void> {
        let memory = await this.getMemory(customerId);
        if (!memory) {
            memory = await this.initializeMemory(customerId);
        }

        const ratings = [...memory.satisfactionHistory, rating];
        // Keep only last 10 ratings
        const recentRatings = ratings.slice(-10);

        await update(ref(database, `companies/${this.companyId}/customerMemory/${customerId}`), {
            satisfactionHistory: recentRatings
        });
    }

    /**
     * Update interaction stats
     */
    async recordInteraction(customerId: string): Promise<void> {
        let memory = await this.getMemory(customerId);
        if (!memory) {
            memory = await this.initializeMemory(customerId);
        }

        await update(ref(database, `companies/${this.companyId}/customerMemory/${customerId}`), {
            lastInteraction: Date.now(),
            totalInteractions: (memory.totalInteractions || 0) + 1
        });
    }

    /**
     * Get personalization context for AI
     */
    async getPersonalizationContext(customerId: string): Promise<string> {
        const memory = await this.getMemory(customerId);

        if (!memory) {
            return '';
        }

        const context: string[] = [];

        // Add interaction history
        if (memory.totalInteractions > 0) {
            context.push(`This customer has interacted ${memory.totalInteractions} times before.`);
        }

        // Add previous issues
        if (memory.previousIssues.length > 0) {
            const recentIssues = memory.previousIssues.slice(-3);
            context.push(`Recent issues: ${recentIssues.map(i => i.category).join(', ')}`);
        }

        // Add preferences
        if (memory.preferences.communicationStyle) {
            context.push(`Preferred communication style: ${memory.preferences.communicationStyle}`);
        }

        // Add satisfaction trend
        if (memory.satisfactionHistory.length > 0) {
            const avgSatisfaction = memory.satisfactionHistory.reduce((a, b) => a + b, 0) / memory.satisfactionHistory.length;
            if (avgSatisfaction < 3) {
                context.push('Customer has had some unsatisfactory experiences - be extra helpful.');
            }
        }

        return context.join(' ');
    }
}
