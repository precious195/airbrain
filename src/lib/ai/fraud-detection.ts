// src/lib/ai/fraud-detection.ts

/**
 * AI Fraud Detection System
 * Flags suspicious loan requests, insurance claims, and money transfers.
 */

export interface FraudCheckRequest {
    type: 'loan' | 'insurance_claim' | 'money_transfer';
    data: Record<string, any>;
    customerHistory?: Record<string, any>;
}

export interface FraudScore {
    score: number; // 0 (Safe) to 100 (High Risk)
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    flags: string[];
    recommendation: 'approve' | 'review' | 'reject';
    timestamp: string;
}

export class FraudDetectionSystem {

    /**
     * Main entry point for fraud checks
     */
    async checkFraud(request: FraudCheckRequest): Promise<FraudScore> {
        switch (request.type) {
            case 'loan':
                return this.detectLoanFraud(request.data, request.customerHistory);
            case 'insurance_claim':
                return this.detectInsuranceFraud(request.data, request.customerHistory);
            case 'money_transfer':
                return this.detectTransferFraud(request.data, request.customerHistory);
            default:
                throw new Error(`Unknown fraud check type: ${request.type}`);
        }
    }

    /**
     * 1. Loan Fraud Detection
     */
    private async detectLoanFraud(data: any, history: any): Promise<FraudScore> {
        const flags: string[] = [];
        let score = 0;

        // Rule 1: Income vs Loan Amount
        const income = data.monthlyIncome || 0;
        const loanAmount = data.amount || 0;
        if (loanAmount > income * 6) {
            score += 30;
            flags.push('Loan amount exceeds 6x monthly income');
        }

        // Rule 2: Employment Duration
        if (data.employmentDurationMonths < 3) {
            score += 20;
            flags.push('Employment duration < 3 months');
        }

        // Rule 3: Credit Score (Mock)
        const creditScore = history?.creditScore || 600;
        if (creditScore < 400) {
            score += 40;
            flags.push('Very low credit score');
        }

        // Rule 4: Recent Loan Defaults
        if (history?.defaultsCount > 0) {
            score += 50;
            flags.push('History of loan defaults');
        }

        // AI Analysis (Mock - would call ML model)
        // const aiScore = await mlModel.predict(data);
        // score = (score + aiScore) / 2;

        return this.calculateRiskLevel(score, flags);
    }

    /**
     * 2. Insurance Claim Fraud Detection
     */
    private async detectInsuranceFraud(data: any, history: any): Promise<FraudScore> {
        const flags: string[] = [];
        let score = 0;

        // Rule 1: Claim shortly after policy start
        const policyStartDate = new Date(data.policyStartDate).getTime();
        const claimDate = new Date(data.claimDate).getTime();
        const daysDiff = (claimDate - policyStartDate) / (1000 * 3600 * 24);

        if (daysDiff < 15) {
            score += 60;
            flags.push('Claim filed within 15 days of policy start');
        }

        // Rule 2: High Claim Amount
        if (data.amount > 50000) { // K50,000 threshold
            score += 20;
            flags.push('High value claim');
        }

        // Rule 3: Frequency of Claims
        if (history?.claimsLastYear > 3) {
            score += 40;
            flags.push('Frequent claimant (>3 claims/year)');
        }

        // Rule 4: Suspicious Description (Simple keyword check)
        const description = (data.description || '').toLowerCase();
        if (description.includes('lost') && description.includes('cash')) {
            score += 30;
            flags.push('Suspicious claim type: Lost cash');
        }

        return this.calculateRiskLevel(score, flags);
    }

    /**
     * 3. Money Transfer Fraud Detection
     */
    private async detectTransferFraud(data: any, history: any): Promise<FraudScore> {
        const flags: string[] = [];
        let score = 0;

        // Rule 1: Large Amount for Account Type
        if (data.amount > 10000 && history?.accountType === 'basic') {
            score += 40;
            flags.push('Amount exceeds basic account limits');
        }

        // Rule 2: Unusual Location (Mock)
        if (data.location && history?.usualLocation && data.location !== history.usualLocation) {
            score += 30;
            flags.push('Transaction from unusual location');
        }

        // Rule 3: Rapid Successive Transfers
        if (history?.recentTransfersCount > 5) { // e.g., >5 in 1 hour
            score += 50;
            flags.push('High frequency of recent transfers');
        }

        // Rule 4: New Beneficiary
        if (data.isNewBeneficiary) {
            score += 10;
            flags.push('Transfer to new beneficiary');
        }

        return this.calculateRiskLevel(score, flags);
    }

    private calculateRiskLevel(score: number, flags: string[]): FraudScore {
        let riskLevel: FraudScore['riskLevel'] = 'low';
        let recommendation: FraudScore['recommendation'] = 'approve';

        if (score >= 80) {
            riskLevel = 'critical';
            recommendation = 'reject';
        } else if (score >= 50) {
            riskLevel = 'high';
            recommendation = 'review';
        } else if (score >= 20) {
            riskLevel = 'medium';
            recommendation = 'review';
        }

        return {
            score,
            riskLevel,
            flags,
            recommendation,
            timestamp: new Date().toISOString(),
        };
    }
}

export const fraudDetection = new FraudDetectionSystem();
