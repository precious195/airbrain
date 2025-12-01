// src/lib/industries/microfinance/loan-chatbot.ts

/**
 * Microfinance module - Conversational loan application chatbot
 */

export interface LoanApplicationSession {
    sessionId: string;
    customerId?: string;
    currentStep: number;
    totalSteps: number;
    status: 'in_progress' | 'completed' | 'abandoned';
    data: {
        personalInfo?: {
            fullName?: string;
            nationalId?: string;
            dateOfBirth?: string;
            phoneNumber?: string;
            email?: string;
        };
        employmentInfo?: {
            employmentStatus?: 'employed' | 'self_employed' | 'unemployed';
            employer?: string;
            monthlyIncome?: number;
            yearsEmployed?: number;
        };
        loanDetails?: {
            loanAmount?: number;
            loanPurpose?: string;
            tenure?: number;
        };
        bankDetails?: {
            bankName?: string;
            accountNumber?: string;
        };
    };
    createdAt: string;
    updatedAt: string;
}

export interface ChatbotResponse {
    message: string;
    options?: string[];
    inputType?: 'text' | 'number' | 'date' | 'choice';
    validationRules?: string[];
    progress: number; // 0-100
}

/**
 * Initialize loan application session
 */
export async function initializeLoanApplication(customerId: string): Promise<LoanApplicationSession> {
    // TODO: Create session in database

    return {
        sessionId: `SESSION${Date.now()}`,
        customerId,
        currentStep: 0,
        totalSteps: 12,
        status: 'in_progress',
        data: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

/**
 * Process chatbot interaction
 */
export async function processLoanApplicationStep(
    session: LoanApplicationSession,
    userInput: string
): Promise<{ session: LoanApplicationSession; response: ChatbotResponse }> {
    // Update session
    session.updatedAt = new Date().toISOString();

    let response: ChatbotResponse;

    switch (session.currentStep) {
        case 0: // Welcome
            session.currentStep = 1;
            response = {
                message: `Welcome to Quick Loan Application! 🎉\n\nI'll help you apply for a loan in just a few minutes.\n\nLet's start with your personal information.\n\nWhat is your full name?`,
                inputType: 'text',
                progress: 8,
            };
            break;

        case 1: // Full Name
            if (!session.data.personalInfo) session.data.personalInfo = {};
            session.data.personalInfo.fullName = userInput;
            session.currentStep = 2;
            response = {
                message: `Thank you, ${userInput}!\n\nNow, please provide your National ID number (e.g., 123456/78/1):`,
                inputType: 'text',
                validationRules: ['Format: XXXXXX/XX/X'],
                progress: 16,
            };
            break;

        case 2: // National ID
            session.data.personalInfo!.nationalId = userInput;
            session.currentStep = 3;
            response = {
                message: `Great! What is your phone number?`,
                inputType: 'text',
                validationRules: ['Format: +260XXXXXXXXX or 09XXXXXXXX'],
                progress: 25,
            };
            break;

        case 3: // Phone Number
            session.data.personalInfo!.phoneNumber = userInput;
            session.currentStep = 4;
            response = {
                message: `Perfect! Now let's talk about your employment.\n\nWhat is your employment status?`,
                options: ['Employed', 'Self-Employed', 'Unemployed'],
                inputType: 'choice',
                progress: 33,
            };
            break;

        case 4: // Employment Status
            if (!session.data.employmentInfo) session.data.employmentInfo = {};
            session.data.employmentInfo.employmentStatus = userInput.toLowerCase().replace('-', '_') as any;
            session.currentStep = 5;

            if (userInput.toLowerCase() === 'unemployed') {
                response = {
                    message: `I'm sorry, but we require proof of income to process loan applications.\n\nWould you like to:\n1. Provide alternative income source\n2. Exit application`,
                    options: ['Alternative Income', 'Exit'],
                    inputType: 'choice',
                    progress: 40,
                };
            } else {
                response = {
                    message: `What is your ${userInput === 'Employed' ? 'employer name' : 'business name'}?`,
                    inputType: 'text',
                    progress: 41,
                };
            }
            break;

        case 5: // Employer/Business Name
            session.data.employmentInfo!.employer = userInput;
            session.currentStep = 6;
            response = {
                message: `What is your monthly income (in Kwacha)?`,
                inputType: 'number',
                validationRules: ['Minimum: K2,000'],
                progress: 50,
            };
            break;

        case 6: // Monthly Income
            const income = parseFloat(userInput);
            session.data.employmentInfo!.monthlyIncome = income;
            session.currentStep = 7;

            if (income < 2000) {
                response = {
                    message: `Unfortunately, the minimum monthly income requirement is K2,000.\n\nYou may reapply when your income increases.\n\nThank you for your interest!`,
                    progress: 58,
                };
                session.status = 'completed';
            } else {
                response = {
                    message: `Excellent! How long have you been with your current ${session.data.employmentInfo!.employmentStatus === 'employed' ? 'employer' : 'business'} (in years)?`,
                    inputType: 'number',
                    progress: 58,
                };
            }
            break;

        case 7: // Years Employed
            session.data.employmentInfo!.yearsEmployed = parseFloat(userInput);
            session.currentStep = 8;
            response = {
                message: `Now for the loan details!\n\nHow much would you like to borrow (K500 - K50,000)?`,
                inputType: 'number',
                validationRules: ['Min: K500', 'Max: K50,000'],
                progress: 66,
            };
            break;

        case 8: // Loan Amount
            if (!session.data.loanDetails) session.data.loanDetails = {};
            session.data.loanDetails.loanAmount = parseFloat(userInput);
            session.currentStep = 9;
            response = {
                message: `What is the purpose of this loan?`,
                options: ['Business', 'Education', 'Emergency', 'Home Improvement', 'Other'],
                inputType: 'choice',
                progress: 75,
            };
            break;

        case 9: // Loan Purpose
            session.data.loanDetails!.loanPurpose = userInput;
            session.currentStep = 10;
            response = {
                message: `How many weeks would you like to repay? (8, 12, or 16 weeks)`,
                options: ['8 weeks', '12 weeks', '16 weeks'],
                inputType: 'choice',
                progress: 83,
            };
            break;

        case 10: // Loan Tenure
            session.data.loanDetails!.tenure = parseInt(userInput);
            session.currentStep = 11;
            response = {
                message: `Almost done! For disbursement, which bank do you use?`,
                options: ['Zanaco', 'Stanbic', 'FNB', 'Atlas Mara', 'Other'],
                inputType: 'choice',
                progress: 91,
            };
            break;

        case 11: // Bank Name
            if (!session.data.bankDetails) session.data.bankDetails = {};
            session.data.bankDetails.bankName = userInput;
            session.currentStep = 12;
            response = {
                message: `Finally, what is your account number?`,
                inputType: 'text',
                progress: 95,
            };
            break;

        case 12: // Account Number
            session.data.bankDetails!.accountNumber = userInput;
            session.status = 'completed';
            response = {
                message: `🎉 Application Complete!\n\nThank you for applying! Here's what happens next:\n\n1. ✅ Application submitted\n2. 📱 SMS confirmation sent\n3. 🔍 Credit check (2 hours)\n4. 📞 Call from loan officer (4 hours)\n5. 💰 Disbursement (within 24 hours if approved)\n\nApplication ID: ${session.sessionId}\n\nYou can check status anytime by replying 'loan status'`,
                progress: 100,
            };
            break;

        default:
            response = {
                message: 'Application session error. Please start again.',
                progress: 0,
            };
    }

    return { session, response };
}

/**
 * Pre-qualify customer based on basic info
 */
export async function preQualifyCustomer(
    monthlyIncome: number,
    employmentStatus: 'employed' | 'self_employed' | 'unemployed',
    yearsEmployed: number
): Promise<{
    qualified: boolean;
    maxLoan: number;
    reason: string;
    nextSteps: string[];
}> {
    const qualified = monthlyIncome >= 2000 && employmentStatus !== 'unemployed' && yearsEmployed >= 0.5;

    let maxLoan = 0;
    let reason = '';
    const nextSteps: string[] = [];

    if (!qualified) {
        if (monthlyIncome < 2000) {
            reason = 'Monthly income below minimum requirement (K2,000)';
        } else if (employmentStatus === 'unemployed') {
            reason = 'Proof of employment or income required';
        } else if (yearsEmployed < 0.5) {
            reason = 'Minimum 6 months employment history required';
        }
        nextSteps.push('Reapply when requirements are met');
    } else {
        // Calculate max loan based on income
        maxLoan = Math.min(monthlyIncome * 3, 50000);
        reason = `Pre-qualified for up to K${maxLoan}`;
        nextSteps.push('Complete full application');
        nextSteps.push('Provide required documents');
        nextSteps.push('Credit check will be performed');
    }

    return { qualified, maxLoan, reason, nextSteps };
}

/**
 * Format application summary
 */
export function formatApplicationSummary(session: LoanApplicationSession): string {
    const data = session.data;

    return `📋 Loan Application Summary

Personal Information:
• Name: ${data.personalInfo?.fullName}
• National ID: ${data.personalInfo?.nationalId}
• Phone: ${data.personalInfo?.phoneNumber}

Employment:
• Status: ${data.employmentInfo?.employmentStatus?.replace('_', ' ').toUpperCase()}
• Employer: ${data.employmentInfo?.employer}
• Monthly Income: K${data.employmentInfo?.monthlyIncome}
• Years Employed: ${data.employmentInfo?.yearsEmployed}

Loan Details:
• Amount: K${data.loanDetails?.loanAmount}
• Purpose: ${data.loanDetails?.loanPurpose}
• Tenure: ${data.loanDetails?.tenure} weeks

Bank Details:
• Bank: ${data.bankDetails?.bankName}
• Account: ${data.bankDetails?.accountNumber}

Status: ${session.status.toUpperCase()}
Application ID: ${session.sessionId}`;
}
