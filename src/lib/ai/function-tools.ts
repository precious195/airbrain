// src/lib/ai/function-tools.ts
import { getBundlesByOperator, purchaseBundle, formatBundleList } from '@/lib/industries/mobile/bundles';
import { checkBalance, formatBalanceInfo } from '@/lib/industries/mobile/balance';
import { bankingFunctionDeclarations, executeBankingFunction } from './function-tools-banking';

/**
 * Gemini function calling definitions for industry-specific actions
 */

export const mobileFunctionDeclarations = [
    {
        name: 'check_balance',
        description: 'Check customer airtime and data balance',
        parameters: {
            type: 'object',
            properties: {
                phoneNumber: {
                    type: 'string',
                    description: 'Customer phone number',
                },
                operator: {
                    type: 'string',
                    enum: ['airtel', 'mtn', 'zamtel'],
                    description: 'Mobile operator',
                },
            },
            required: ['phoneNumber', 'operator'],
        },
    },
    {
        name: 'show_bundles',
        description: 'Show available data/voice bundles for an operator',
        parameters: {
            type: 'object',
            properties: {
                operator: {
                    type: 'string',
                    enum: ['airtel', 'mtn', 'zamtel'],
                    description: 'Mobile operator',
                },
            },
            required: ['operator'],
        },
    },
    {
        name: 'purchase_bundle',
        description: 'Purchase a data or voice bundle',
        parameters: {
            type: 'object',
            properties: {
                phoneNumber: {
                    type: 'string',
                    description: 'Customer phone number',
                },
                bundleId: {
                    type: 'string',
                    description: 'Bundle ID to purchase',
                },
            },
            required: ['phoneNumber', 'bundleId'],
        },
    },
];

// Export all function declarations
export const allFunctionDeclarations = [
    ...mobileFunctionDeclarations,
    ...bankingFunctionDeclarations,
];

/**
 * Execute function calls from Gemini
 */
export async function executeFunctionCall(
    functionName: string,
    args: Record<string, any>
): Promise<string> {
    try {
        // Mobile operator functions
        if (['check_balance', 'show_bundles', 'purchase_bundle'].includes(functionName)) {
            switch (functionName) {
                case 'check_balance': {
                    const { phoneNumber, operator } = args;
                    const balance = await checkBalance(phoneNumber, operator);
                    return formatBalanceInfo(balance);
                }

                case 'show_bundles': {
                    const { operator } = args;
                    const bundles = getBundlesByOperator(operator);
                    return formatBundleList(bundles);
                }

                case 'purchase_bundle': {
                    const { phoneNumber, bundleId } = args;
                    const customerId = `customer_${phoneNumber.replace(/[^0-9]/g, '')}`;
                    const result = await purchaseBundle(customerId, phoneNumber, bundleId);
                    return result.message;
                }
            }
        }

        // Banking functions
        if (bankingFunctionDeclarations.some(f => f.name === functionName)) {
            return await executeBankingFunction(functionName, args);
        }

        return `Unknown function: ${functionName}`;
    } catch (error) {
        console.error('Function execution error:', error);
        return 'Sorry, I encountered an error executing that action. Please try again.';
    }
}
