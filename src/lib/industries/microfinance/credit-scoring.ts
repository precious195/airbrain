// src/lib/industries/microfinance/credit-scoring.ts

/**
 * Microfinance module - Credit scoring and loan predictions
 */

export interface CreditScore {
    customerId: string;
    score: number; // 300-850
    rating: 'poor' | 'fair' | 'good' | 'very_good' | 'excellent';
    factors: {
        paymentHistory: number; // 35%
        creditUtilization: number; // 30%
        creditHistory: number; // 15%
        newCredit: number; // 10%
        creditMix: number; // 10%
    };
    recommendations: string[];
    lastUpdated: string;
}

export interface LoanPrediction {
    eligible: boolean;
    maxLoanAmount: number;
    interestRate: number;
    approvalProbability: number; // 0-100
    recommendedTenure: number; // weeks
    estimatedApprovalTime: string; // hours
    reasons: string[];
}

/**
 * Calculate credit score
 */
export async function calculateCreditScore(customerId: string): Promise<CreditScore> {
    // TODO: Integrate with credit bureau API

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock credit score calculation
    const paymentHistory = Math.floor(Math.random() * 35) + 60; // 60-95
    const creditUtilization = Math.floor(Math.random() * 30) + 60;
    const creditHistory = Math.floor(Math.random() * 15) + 10;
    const newCredit = Math.floor(Math.random() * 10) + 5;
    const creditMix = Math.floor(Math.random() * 10) + 5;

    const totalScore = Math.floor(
        (paymentHistory / 35) * 350 +
        (creditUtilization / 30) * 300 +
        (creditHistory / 15) * 150 +
        (newCredit / 10) * 100 +
        (creditMix / 10) * 100 +
        300
    );

    let rating: CreditScore['rating'];
    const recommendations: string[] = [];

    if (totalScore >= 750) {
        rating = 'excellent';
        recommendations.push('Maintain your excellent payment history');
        recommendations.push('You qualify for premium loan rates');
    } else if (totalScore >= 700) {
        rating = 'very_good';
        recommendations.push('Keep up the good payment habits');
        recommendations.push('Consider longer credit history for better rates');
    } else if (totalScore >= 650) {
        rating = 'good';
        recommendations.push('Pay all bills on time to improve score');
        recommendations.push('Reduce credit utilization below 30%');
    } else if (totalScore >= 600) {
        rating = 'fair';
        recommendations.push('Focus on timely payments');
        recommendations.push('Avoid new credit applications');
        recommendations.push('Pay down existing debts');
    } else {
        rating = 'poor';
        recommendations.push('Urgent: Address missed payments');
        recommendations.push('Work with financial counselor');
        recommendations.push('Consider debt consolidation');
    }

    return {
        customerId,
        score: totalScore,
        rating,
        factors: {
            paymentHistory,
            creditUtilization,
            creditHistory,
            newCredit,
            creditMix,
        },
        recommendations,
        lastUpdated: new Date().toISOString(),
    };
}

/**
 * Predict loan approval and terms
 */
export async function predictLoanApproval(
    customerId: string,
    requestedAmount: number,
    monthlyIncome: number
): Promise<LoanPrediction> {
    // Get credit score
    const creditScore = await calculateCreditScore(customerId);

    // Calculate eligibility
    let eligible = true;
    let maxLoanAmount = 0;
    let interestRate = 0;
    let approvalProbability = 0;
    let recommendedTenure = 12;
    let estimatedApprovalTime = '24 hours';
    const reasons: string[] = [];

    // Score-based calculations
    if (creditScore.score >= 750) {
        maxLoanAmount = Math.min(monthlyIncome * 6, 50000);
        interestRate = 12;
        approvalProbability = 95;
        estimatedApprovalTime = '2 hours';
        reasons.push('Excellent credit score');
        reasons.push('Pre-approved for express processing');
    } else if (creditScore.score >= 700) {
        maxLoanAmount = Math.min(monthlyIncome * 5, 40000);
        interestRate = 15;
        approvalProbability = 85;
        estimatedApprovalTime = '6 hours';
        reasons.push('Very good credit history');
        reasons.push('Fast-track approval available');
    } else if (creditScore.score >= 650) {
        maxLoanAmount = Math.min(monthlyIncome * 4, 30000);
        interestRate = 18;
        approvalProbability = 70;
        estimatedApprovalTime = '12 hours';
        reasons.push('Good credit standing');
        reasons.push('Standard processing time');
    } else if (creditScore.score >= 600) {
        maxLoanAmount = Math.min(monthlyIncome * 3, 20000);
        interestRate = 22;
        approvalProbability = 50;
        estimatedApprovalTime = '24 hours';
        reasons.push('Fair credit score');
        reasons.push('May require additional documentation');
    } else {
        maxLoanAmount = Math.min(monthlyIncome * 2, 10000);
        interestRate = 25;
        approvalProbability = 30;
        estimatedApprovalTime = '48 hours';
        reasons.push('Credit score below optimal range');
        reasons.push('Collateral may be required');
    }

    // Income-based checks
    if (monthlyIncome < 2000) {
        eligible = false;
        reasons.push('Minimum monthly income requirement not met (K2,000)');
    }

    // Debt-to-income ratio (mock - would check actual debts)
    const maxMonthlyPayment = monthlyIncome * 0.4;
    if (requestedAmount > maxLoanAmount) {
        reasons.push(`Requested amount exceeds maximum eligible (K${maxLoanAmount})`);
    }

    // Determine tenure
    if (requestedAmount <= 5000) recommendedTenure = 8;
    else if (requestedAmount <= 15000) recommendedTenure = 12;
    else recommendedTenure = 16;

    return {
        eligible,
        maxLoanAmount,
        interestRate,
        approvalProbability,
        recommendedTenure,
        estimatedApprovalTime,
        reasons,
    };
}

/**
 * Format credit score report
 */
export function formatCreditScore(score: CreditScore): string {
    const ratingEmojis = {
        excellent: '⭐⭐⭐⭐⭐',
        very_good: '⭐⭐⭐⭐',
        good: '⭐⭐⭐',
        fair: '⭐⭐',
        poor: '⭐',
    };

    return `📊 Your Credit Score Report

Score: ${score.score}/850
Rating: ${score.rating.toUpperCase()} ${ratingEmojis[score.rating]}

Score Breakdown:
• Payment History (35%): ${score.factors.paymentHistory}/35
• Credit Utilization (30%): ${score.factors.creditUtilization}/30
• Credit History (15%): ${score.factors.creditHistory}/15
• New Credit (10%): ${score.factors.newCredit}/10
• Credit Mix (10%): ${score.factors.creditMix}/10

💡 Recommendations:
${score.recommendations.map(r => `• ${r}`).join('\n')}

Last Updated: ${new Date(score.lastUpdated).toLocaleDateString()}

${score.score >= 700 ? '✅ You qualify for our best rates!' : score.score >= 650 ? '💡 Improve your score for better rates' : '⚠️ Work on improving your credit to increase approval chances'}`;
}

/**
 * Format loan prediction
 */
export function formatLoanPrediction(prediction: LoanPrediction, requestedAmount: number): string {
    const probabilityEmoji =
        prediction.approvalProbability >= 80 ? '🟢' :
            prediction.approvalProbability >= 60 ? '🟡' :
                prediction.approvalProbability >= 40 ? '🟠' : '🔴';

    return `${probabilityEmoji} Loan Prediction Analysis

Requested Amount: K${requestedAmount.toLocaleString()}
Eligibility: ${prediction.eligible ? '✅ ELIGIBLE' : '❌ NOT ELIGIBLE'}

${prediction.eligible ? `
Maximum Loan: K${prediction.maxLoanAmount.toLocaleString()}
Interest Rate: ${prediction.interestRate}% p.a.
Recommended Tenure: ${prediction.recommendedTenure} weeks
Approval Probability: ${prediction.approvalProbability}%
Estimated Decision: ${prediction.estimatedApprovalTime}

Weekly Payment: K${Math.floor((requestedAmount * (1 + prediction.interestRate / 100)) / prediction.recommendedTenure)}

Approval Factors:
${prediction.reasons.map(r => `• ${r}`).join('\n')}

${prediction.approvalProbability >= 70 ? '✅ High approval chance - Apply now!' : '💡 Consider applying for recommended amount'}
` : `
Reasons:
${prediction.reasons.map(r => `• ${r}`).join('\n')}

Please address the above requirements and try again.`}`;
}
