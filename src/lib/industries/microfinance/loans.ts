// src/lib/industries/microfinance/loans.ts

/**
 * Microfinance module - Loan management
 */

export interface MicroLoan {
    id: string;
    customerId: string;
    amount: number;
    interestRate: number;
    processingFee: number;
    tenure: number; // weeks
    weeklyPayment: number;
    totalRepayable: number;
    amountPaid: number;
    outstandingBalance: number;
    status: 'pending' | 'active' | 'paid' | 'overdue' | 'defaulted';
    disbursedDate?: string;
    nextPaymentDate?: string;
    dueDate?: string;
    creditScore: number;
}

/**
 * Check loan eligibility
 */
export async function checkLoanEligibility(
    customerId: string,
    phoneNumber: string
): Promise<{
    eligible: boolean;
    maxLoanAmount: number;
    creditScore: number;
    reason?: string;
}> {
    // TODO: Integrate with credit bureau and internal scoring

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock credit scoring
    const creditScore = Math.floor(Math.random() * 300) + 500; // 500-800

    if (creditScore < 550) {
        return {
            eligible: false,
            maxLoanAmount: 0,
            creditScore,
            reason: 'Credit score too low. Please improve payment history.',
        };
    }

    // Calculate max loan based on credit score
    const maxLoanAmount = creditScore < 650 ? 5000 : creditScore < 750 ? 15000 : 30000;

    return {
        eligible: true,
        maxLoanAmount,
        creditScore,
    };
}

/**
 * Calculate loan repayment
 */
export function calculateLoanRepayment(
    principal: number,
    weeks: number = 12,
    interestRate: number = 15, // percentage
    processingFeePercent: number = 5
): {
    principal: number;
    interest: number;
    processingFee: number;
    totalRepayable: number;
    weeklyPayment: number;
} {
    const processingFee = (principal * processingFeePercent) / 100;
    const interest = (principal * interestRate) / 100;
    const totalRepayable = principal + interest + processingFee;
    const weeklyPayment = totalRepayable / weeks;

    return {
        principal,
        interest,
        processingFee,
        totalRepayable,
        weeklyPayment: parseFloat(weeklyPayment.toFixed(2)),
    };
}

/**
 * Apply for microloan
 */
export async function applyForMicroLoan(
    customerId: string,
    phoneNumber: string,
    amount: number,
    purpose: string,
    tenure: number = 12 // weeks
): Promise<{
    success: boolean;
    message: string;
    loanId?: string;
    repaymentDetails?: ReturnType<typeof calculateLoanRepayment>;
}> {
    // Check eligibility
    const eligibility = await checkLoanEligibility(customerId, phoneNumber);

    if (!eligibility.eligible) {
        return {
            success: false,
            message: eligibility.reason || 'Not eligible for loan',
        };
    }

    if (amount > eligibility.maxLoanAmount) {
        return {
            success: false,
            message: `Maximum eligible loan amount is K${eligibility.maxLoanAmount}`,
        };
    }

    if (amount < 500) {
        return {
            success: false,
            message: 'Minimum loan amount is K500',
        };
    }

    // Calculate repayment
    const repaymentDetails = calculateLoanRepayment(amount, tenure);

    // TODO: Create loan in database
    const loanId = `ML${Date.now()}`;

    return {
        success: true,
        message: `Loan approved! K${amount} will be disbursed to your account within 24 hours.`,
        loanId,
        repaymentDetails,
    };
}

/**
 * Get loan status
 */
export async function getLoanStatus(loanId: string): Promise<MicroLoan | null> {
    // TODO: Query database

    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        id: loanId,
        customerId: 'CUST123',
        amount: 10000,
        interestRate: 15,
        processingFee: 500,
        tenure: 12,
        weeklyPayment: 917,
        totalRepayable: 11000,
        amountPaid: 3668,
        outstandingBalance: 7332,
        status: 'active',
        disbursedDate: '2024-11-01',
        nextPaymentDate: '2024-12-06',
        dueDate: '2025-01-24',
        creditScore: 680,
    };
}

/**
 * Record loan payment
 */
export async function recordLoanPayment(
    loanId: string,
    amount: number,
    paymentMethod: 'mobile_money' | 'bank_transfer' | 'cash'
): Promise<{ success: boolean; message: string; newBalance?: number }> {
    // TODO: Process payment

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const loan = await getLoanStatus(loanId);
    if (!loan) {
        return { success: false, message: 'Loan not found' };
    }

    const newBalance = loan.outstandingBalance - amount;

    return {
        success: true,
        message: `Payment of K${amount} received. Outstanding balance: K${newBalance}`,
        newBalance,
    };
}

/**
 * Format loan details
 */
export function formatLoanDetails(loan: MicroLoan): string {
    return `Your Loan Details:

Loan ID: ${loan.id}
Amount Borrowed: K${loan.amount}
Total Repayable: K${loan.totalRepayable}
Weekly Payment: K${loan.weeklyPayment}

Amount Paid: K${loan.amountPaid}
Outstanding: K${loan.outstandingBalance}
Next Payment: ${loan.nextPaymentDate || 'N/A'}

Status: ${loan.status.toUpperCase()}
Credit Score: ${loan.creditScore}`;
}
