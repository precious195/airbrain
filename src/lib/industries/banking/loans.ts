// src/lib/industries/banking/loans.ts

/**
 * Banking module - Loan management
 */

export interface Loan {
    id: string;
    accountNumber: string;
    type: 'personal' | 'mortgage' | 'business' | 'vehicle';
    amount: number;
    interestRate: number;
    tenure: number; // months
    monthlyPayment: number;
    outstandingBalance: number;
    nextPaymentDate: string;
    status: 'active' | 'paid' | 'overdue' | 'defaulted';
    disbursedDate: string;
}

/**
 * Get loan details
 */
export async function getLoanDetails(
    accountNumber: string,
    loanId: string
): Promise<Loan | null> {
    // TODO: Integrate with banking API

    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        id: loanId,
        accountNumber,
        type: 'personal',
        amount: 50000,
        interestRate: 18.5,
        tenure: 24,
        monthlyPayment: 2500,
        outstandingBalance: 35000,
        nextPaymentDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        disbursedDate: '2024-01-15',
    };
}

/**
 * Calculate loan eligibility
 */
export function calculateLoanEligibility(
    monthlyIncome: number,
    existingLoanPayment: number = 0
): { eligible: boolean; maxLoanAmount: number; reason?: string } {
    const disposableIncome = monthlyIncome - existingLoanPayment;
    const maxMonthlyPayment = disposableIncome * 0.4; // 40% of disposable income

    if (monthlyIncome < 3000) {
        return {
            eligible: false,
            maxLoanAmount: 0,
            reason: 'Minimum monthly income of K3,000 required',
        };
    }

    if (maxMonthlyPayment < 500) {
        return {
            eligible: false,
            maxLoanAmount: 0,
            reason: 'Insufficient disposable income for loan repayment',
        };
    }

    // Assuming 24 months tenure and 18% annual interest
    const interestRate = 0.18 / 12; // monthly rate
    const months = 24;
    const maxLoanAmount = Math.floor(
        (maxMonthlyPayment * (Math.pow(1 + interestRate, months) - 1)) /
        (interestRate * Math.pow(1 + interestRate, months))
    );

    return {
        eligible: true,
        maxLoanAmount,
    };
}

/**
 * Format loan information
 */
export function formatLoanInfo(loan: Loan): string {
    return `Loan Details:

Type: ${loan.type.toUpperCase()}
Original Amount: K${loan.amount.toLocaleString()}
Outstanding: K${loan.outstandingBalance.toLocaleString()}
Monthly Payment: K${loan.monthlyPayment.toLocaleString()}
Interest Rate: ${loan.interestRate}% p.a.
Next Payment: ${loan.nextPaymentDate}
Status: ${loan.status.toUpperCase()}`;
}

/**
 * Apply for loan
 */
export async function applyForLoan(
    accountNumber: string,
    loanType: 'personal' | 'business' | 'vehicle',
    amount: number,
    purpose: string
): Promise<{ success: boolean; message: string; applicationId?: string }> {
    // TODO: Integrate with banking system

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (amount < 1000) {
        return {
            success: false,
            message: 'Minimum loan amount is K1,000',
        };
    }

    if (amount > 200000) {
        return {
            success: false,
            message: 'Loan amount exceeds maximum limit. Please visit branch.',
        };
    }

    const applicationId = `LOAN${Date.now()}`;

    return {
        success: true,
        message: `Loan application submitted successfully. Application ID: ${applicationId}. Our team will review and contact you within 2 business days.`,
        applicationId,
    };
}
