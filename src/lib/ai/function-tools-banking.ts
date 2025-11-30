// src/lib/ai/function-tools-banking.ts

/**
 * Gemini function calling definitions for banking operations
 */

import { getAccountBalance, formatAccountBalance } from '@/lib/industries/banking/accounts';
import { generateStatement, getStatementSummary, formatMiniStatement } from '@/lib/industries/banking/statements';
import { requestPINReset } from '@/lib/industries/banking/security';
import { checkKYCStatus, formatKYCStatus } from '@/lib/industries/banking/security';
import { raiseTicket, formatTicketDetails, getQuickSolutions } from '@/lib/industries/banking/tickets';
import type { BankingIssueType } from '@/lib/industries/banking/tickets';

export const bankingFunctionDeclarations = [
    {
        name: 'check_account_balance',
        description: 'Check customer account balance and details',
        parameters: {
            type: 'object',
            properties: {
                accountNumber: {
                    type: 'string',
                    description: 'Customer account number',
                },
                customerId: {
                    type: 'string',
                    description: 'Customer ID',
                },
            },
            required: ['accountNumber', 'customerId'],
        },
    },
    {
        name: 'generate_bank_statement',
        description: 'Generate account statement for specified period',
        parameters: {
            type: 'object',
            properties: {
                accountNumber: {
                    type: 'string',
                    description: 'Customer account number',
                },
                periodType: {
                    type: 'string',
                    enum: ['last_30_days', 'last_90_days', 'custom'],
                    description: 'Statement period type',
                },
                format: {
                    type: 'string',
                    enum: ['summary', 'mini', 'full'],
                    description: 'Statement format',
                },
            },
            required: ['accountNumber', 'periodType'],
        },
    },
    {
        name: 'request_pin_reset',
        description: 'Initiate PIN reset process for customer',
        parameters: {
            type: 'object',
            properties: {
                accountNumber: {
                    type: 'string',
                    description: 'Customer account number',
                },
                phoneNumber: {
                    type: 'string',
                    description: 'Registered phone number',
                },
                verificationType: {
                    type: 'string',
                    enum: ['otp', 'branch', 'call_center'],
                    description: 'Verification method',
                },
            },
            required: ['accountNumber', 'phoneNumber'],
        },
    },
    {
        name: 'check_kyc_status',
        description: 'Check customer KYC verification status',
        parameters: {
            type: 'object',
            properties: {
                accountNumber: {
                    type: 'string',
                    description: 'Customer account number',
                },
                customerId: {
                    type: 'string',
                    description: 'Customer ID',
                },
            },
            required: ['accountNumber', 'customerId'],
        },
    },
    {
        name: 'raise_banking_ticket',
        description: 'Create a support ticket for banking issues',
        parameters: {
            type: 'object',
            properties: {
                accountNumber: {
                    type: 'string',
                    description: 'Customer account number',
                },
                issueType: {
                    type: 'string',
                    enum: [
                        'card_issue',
                        'transaction_dispute',
                        'account_access',
                        'loan_inquiry',
                        'charges_complaint',
                        'branch_service',
                        'atm_issue',
                        'online_banking',
                        'other',
                    ],
                    description: 'Type of banking issue',
                },
                subject: {
                    type: 'string',
                    description: 'Brief subject of the issue',
                },
                description: {
                    type: 'string',
                    description: 'Detailed description of the issue',
                },
            },
            required: ['accountNumber', 'issueType', 'subject', 'description'],
        },
    },
    {
        name: 'get_quick_solution',
        description: 'Get quick solutions for common banking issues',
        parameters: {
            type: 'object',
            properties: {
                issueType: {
                    type: 'string',
                    enum: [
                        'card_issue',
                        'transaction_dispute',
                        'account_access',
                        'loan_inquiry',
                        'charges_complaint',
                        'branch_service',
                        'atm_issue',
                        'online_banking',
                        'other',
                    ],
                    description: 'Type of banking issue',
                },
            },
            required: ['issueType'],
        },
    },
];

/**
 * Execute banking function calls from Gemini
 */
export async function executeBankingFunction(
    functionName: string,
    args: Record<string, any>
): Promise<string> {
    try {
        switch (functionName) {
            case 'check_account_balance': {
                const { accountNumber, customerId } = args;
                const account = await getAccountBalance(accountNumber, customerId);
                return formatAccountBalance(account);
            }

            case 'generate_bank_statement': {
                const { accountNumber, periodType, format = 'summary' } = args;
                const statement = await generateStatement(accountNumber, periodType);

                if (format === 'mini') {
                    return formatMiniStatement(statement);
                } else if (format === 'summary') {
                    return getStatementSummary(statement);
                }

                return `Statement generated for ${statement.statementPeriod.from} to ${statement.statementPeriod.to}. Would you like me to send the full statement to your email?`;
            }

            case 'request_pin_reset': {
                const { accountNumber, phoneNumber, verificationType = 'otp' } = args;
                const result = await requestPINReset(accountNumber, phoneNumber, verificationType);
                return result.message;
            }

            case 'check_kyc_status': {
                const { accountNumber, customerId } = args;
                const kyc = await checkKYCStatus(accountNumber, customerId);
                return formatKYCStatus(kyc);
            }

            case 'raise_banking_ticket': {
                const { accountNumber, issueType, subject, description } = args;
                const result = await raiseTicket(accountNumber, issueType as BankingIssueType, subject, description);
                return result.message;
            }

            case 'get_quick_solution': {
                const { issueType } = args;
                return getQuickSolutions(issueType as BankingIssueType);
            }

            default:
                return `Unknown banking function: ${functionName}`;
        }
    } catch (error) {
        console.error('Banking function execution error:', error);
        return 'Sorry, I encountered an error processing your banking request. Please try again or contact customer service.';
    }
}
