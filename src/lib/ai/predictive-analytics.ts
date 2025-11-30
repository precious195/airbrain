// src/lib/ai/predictive-analytics.ts

/**
 * Predictive Analytics Engine
 * Predicts churn, loan default, insurance risk, and product recommendations.
 */

export interface PredictionRequest {
    customerId: string;
    customerData: Record<string, any>;
    history: Record<string, any>;
}

export interface ChurnPrediction {
    churnProbability: number; // 0-100%
    riskLevel: 'low' | 'medium' | 'high';
    factors: string[];
    retentionStrategy: string;
}

export interface DefaultPrediction {
    defaultProbability: number; // 0-100%
    creditScoreEstimate: number;
    maxLoanAmount: number;
}

export interface ProductRecommendation {
    productId: string;
    productName: string;
    matchScore: number; // 0-100
    reason: string;
    category: 'banking' | 'insurance' | 'loan' | 'investment';
}

export class PredictiveAnalyticsEngine {

    /**
     * 1. Predict Customer Churn
     */
    async predictChurn(request: PredictionRequest): Promise<ChurnPrediction> {
        let probability = 10; // Base churn rate
        const factors: string[] = [];

        // Factor 1: Low Activity
        if (request.history.lastLoginDaysAgo > 30) {
            probability += 30;
            factors.push('Inactive for >30 days');
        }

        // Factor 2: Negative Sentiment
        if (request.history.avgSentiment < -0.2) {
            probability += 25;
            factors.push('Negative interaction history');
        }

        // Factor 3: Declining Balance (Banking)
        if (request.history.balanceTrend === 'declining') {
            probability += 20;
            factors.push('Declining account balance');
        }

        // Factor 4: Competitor Mention
        if (request.history.competitorMentions > 0) {
            probability += 15;
            factors.push('Mentioned competitor services');
        }

        probability = Math.min(probability, 100);

        let riskLevel: ChurnPrediction['riskLevel'] = 'low';
        let strategy = 'Maintain standard engagement';

        if (probability > 70) {
            riskLevel = 'high';
            strategy = 'Immediate outreach + Special Offer';
        } else if (probability > 40) {
            riskLevel = 'medium';
            strategy = 'Send satisfaction survey + Loyalty reminder';
        }

        return {
            churnProbability: probability,
            riskLevel,
            factors,
            retentionStrategy: strategy,
        };
    }

    /**
     * 2. Predict Loan Default
     */
    async predictLoanDefault(request: PredictionRequest): Promise<DefaultPrediction> {
        // Simplified credit scoring model
        let score = 650; // Base score

        // Income stability
        if (request.customerData.employmentStatus === 'employed') score += 50;
        else if (request.customerData.employmentStatus === 'self_employed') score += 20;
        else score -= 30;

        // Payment history
        if (request.history.missedPayments === 0) score += 80;
        else score -= (request.history.missedPayments * 40);

        // Debt-to-Income
        const dti = request.customerData.debtToIncomeRatio || 0.3;
        if (dti < 0.3) score += 40;
        else if (dti > 0.5) score -= 50;

        // Calculate probability from score (inverse relationship)
        // Score 300 -> 100% default, Score 850 -> 0% default
        const probability = Math.max(0, Math.min(100, (850 - score) / 5.5));

        // Max loan amount based on score
        let maxLoan = 0;
        if (score > 700) maxLoan = 50000;
        else if (score > 600) maxLoan = 10000;
        else if (score > 500) maxLoan = 2000;

        return {
            defaultProbability: Math.round(probability),
            creditScoreEstimate: score,
            maxLoanAmount: maxLoan,
        };
    }

    /**
     * 3. Recommend Best Products
     */
    async recommendProducts(request: PredictionRequest): Promise<ProductRecommendation[]> {
        const recommendations: ProductRecommendation[] = [];
        const data = request.customerData;
        const history = request.history;

        // Logic 1: High Balance -> Investment
        if (data.balance > 20000) {
            recommendations.push({
                productId: 'inv_fixed_deposit',
                productName: 'High Yield Fixed Deposit',
                matchScore: 90,
                reason: 'You have a healthy balance that could earn high interest.',
                category: 'investment',
            });
        }

        // Logic 2: Frequent Traveler -> Travel Insurance
        if (history.internationalTransactions > 2) {
            recommendations.push({
                productId: 'ins_travel_gold',
                productName: 'Gold Travel Insurance',
                matchScore: 85,
                reason: 'Based on your frequent international activity.',
                category: 'insurance',
            });
        }

        // Logic 3: Small Business Owner -> SME Loan
        if (data.accountType === 'business' || data.employmentStatus === 'self_employed') {
            recommendations.push({
                productId: 'loan_sme_growth',
                productName: 'SME Growth Loan',
                matchScore: 80,
                reason: 'To help expand your business operations.',
                category: 'loan',
            });
        }

        // Logic 4: Young Professional -> Credit Card
        if (data.age > 22 && data.age < 35 && data.income > 5000) {
            recommendations.push({
                productId: 'card_rewards_plat',
                productName: 'Platinum Rewards Card',
                matchScore: 75,
                reason: 'Build credit and earn rewards on your spending.',
                category: 'banking',
            });
        }

        return recommendations.sort((a, b) => b.matchScore - a.matchScore);
    }
}

export const predictiveAnalytics = new PredictiveAnalyticsEngine();
