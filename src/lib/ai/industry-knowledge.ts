/**
 * Industry Knowledge Packs
 * 
 * Pre-built knowledge for each supported industry.
 * Provides deep domain expertise for AI responses.
 */

export type IndustryType = 'mobile' | 'banking' | 'insurance' | 'microfinance' | 'television';

export interface IndustryKnowledge {
    industry: IndustryType;
    displayName: string;
    description: string;
    commonTerms: Record<string, string>;
    commonQueries: string[];
    productCategories: string[];
    commonActions: IndustryAction[];
    troubleshooting: TroubleshootingGuide[];
    faqs: FAQ[];
    systemPromptContext: string;
}

export interface IndustryAction {
    name: string;
    description: string;
    keywords: string[];
    requiredInfo: string[];
    steps: string[];
}

export interface TroubleshootingGuide {
    issue: string;
    keywords: string[];
    solutions: string[];
}

export interface FAQ {
    question: string;
    answer: string;
    keywords: string[];
}

// Mobile/Telecom Industry Knowledge
const mobileKnowledge: IndustryKnowledge = {
    industry: 'mobile',
    displayName: 'Mobile Telecom',
    description: 'Mobile network operator services including voice, data, SMS, and mobile money',

    commonTerms: {
        'data bundle': 'Internet data package with specific size (MB/GB) and validity period',
        'airtime': 'Prepaid credit for making calls and sending SMS',
        'top-up': 'Adding credit to prepaid account',
        'USSD': 'Unstructured Supplementary Service Data - menu-based mobile services',
        'roaming': 'Using mobile services outside home network coverage',
        'SIM swap': 'Transferring phone number to a new SIM card',
        'mobile money': 'Digital wallet for financial transactions via mobile phone',
        'bundle validity': 'Time period during which purchased bundle can be used',
        'data rollover': 'Unused data carried over to next billing period',
        'FUP': 'Fair Usage Policy - speed reduction after heavy usage'
    },

    commonQueries: [
        'Check my balance',
        'Buy data bundle',
        'How much data do I have left?',
        'My internet is slow',
        'Buy airtime',
        'Transfer airtime',
        'Check my number',
        'Activate roaming',
        'Stop promotional messages',
        'Get PUK code'
    ],

    productCategories: [
        'data_bundle', 'voice_package', 'sms_bundle', 'combo_pack',
        'roaming_pack', 'night_bundle', 'social_media_bundle', 'device'
    ],

    commonActions: [
        {
            name: 'Check Balance',
            description: 'View current airtime and data balance',
            keywords: ['balance', 'credit', 'how much', 'remaining'],
            requiredInfo: ['phone_number'],
            steps: ['Dial *123#', 'Select option 1', 'View balance on screen']
        },
        {
            name: 'Buy Data Bundle',
            description: 'Purchase internet data package',
            keywords: ['data', 'bundle', 'internet', 'buy', 'purchase', 'GB', 'MB'],
            requiredInfo: ['phone_number', 'bundle_type'],
            steps: ['Dial *123#', 'Select Data Bundles', 'Choose package', 'Confirm purchase']
        },
        {
            name: 'Top Up',
            description: 'Add credit to prepaid account',
            keywords: ['top-up', 'recharge', 'add credit', 'airtime'],
            requiredInfo: ['phone_number', 'amount'],
            steps: ['Dial *136*voucher_pin#', 'Or use mobile app', 'Or visit agent']
        }
    ],

    troubleshooting: [
        {
            issue: 'No network signal',
            keywords: ['no signal', 'no network', 'no service', 'cant call'],
            solutions: [
                'Switch phone off and on again',
                'Check if SIM is inserted correctly',
                'Check if airplane mode is off',
                'Try moving to a different location',
                'Contact support if problem persists'
            ]
        },
        {
            issue: 'Slow internet',
            keywords: ['slow', 'internet slow', 'data slow', 'loading'],
            solutions: [
                'Check if data bundle is still active',
                'Check signal strength (move to better coverage)',
                'Clear browser cache',
                'Restart phone',
                'Check if FUP limit reached'
            ]
        }
    ],

    faqs: [
        {
            question: 'How do I check my balance?',
            answer: 'You can check your balance by dialing *123# or opening the mobile app and viewing your account summary.',
            keywords: ['balance', 'check', 'airtime', 'credit']
        },
        {
            question: 'What happens when my bundle expires?',
            answer: 'When your bundle expires, unused data is lost unless you have data rollover enabled. Standard rates will apply for any data usage.',
            keywords: ['expire', 'bundle', 'validity', 'lost']
        }
    ],

    systemPromptContext: `You are a helpful mobile telecom customer service AI. You help customers with:
- Data bundles and packages
- Airtime balance and top-up
- Network issues
- SIM card problems
- Mobile money transactions
- Roaming and international services

Be friendly, clear, and provide step-by-step instructions when needed. Always verify customer identity before accessing account information.`
};

// Banking Industry Knowledge
const bankingKnowledge: IndustryKnowledge = {
    industry: 'banking',
    displayName: 'Banking & Financial Services',
    description: 'Retail and commercial banking services including accounts, loans, and transactions',

    commonTerms: {
        'SWIFT': 'International bank transfer system code',
        'IBAN': 'International Bank Account Number',
        'overdraft': 'Negative balance facility on current account',
        'APR': 'Annual Percentage Rate - true cost of borrowing',
        'collateral': 'Asset pledged as security for a loan',
        'dormant account': 'Account with no activity for extended period',
        'standing order': 'Regular automatic payment of fixed amount',
        'direct debit': 'Authorization for third party to collect payments',
        'KYC': 'Know Your Customer - identity verification process',
        'AML': 'Anti-Money Laundering compliance'
    },

    commonQueries: [
        'Check my account balance',
        'Transfer money',
        'Apply for a loan',
        'Block my card',
        'Request statement',
        'Update my details',
        'Open new account',
        'Check loan status',
        'Report fraud',
        'ATM locations'
    ],

    productCategories: [
        'savings_account', 'current_account', 'fixed_deposit', 'personal_loan',
        'mortgage', 'credit_card', 'debit_card', 'investment', 'insurance'
    ],

    commonActions: [
        {
            name: 'Check Balance',
            description: 'View account balance and recent transactions',
            keywords: ['balance', 'account', 'money', 'how much'],
            requiredInfo: ['account_number', 'customer_id'],
            steps: ['Login to mobile banking', 'Select account', 'View balance']
        },
        {
            name: 'Fund Transfer',
            description: 'Transfer money to another account',
            keywords: ['transfer', 'send money', 'pay', 'wire'],
            requiredInfo: ['source_account', 'destination_account', 'amount'],
            steps: ['Login to banking app', 'Select Transfers', 'Enter details', 'Confirm with OTP']
        }
    ],

    troubleshooting: [
        {
            issue: 'Card blocked',
            keywords: ['card blocked', 'card not working', 'declined'],
            solutions: [
                'Call the 24/7 card hotline',
                'Visit nearest branch with ID',
                'Use mobile app to temporarily unblock',
                'Request replacement card if damaged'
            ]
        }
    ],

    faqs: [
        {
            question: 'How do I reset my PIN?',
            answer: 'Visit any ATM with your card and ID, or contact customer service to receive a temporary PIN via SMS.',
            keywords: ['pin', 'reset', 'forgot', 'change']
        }
    ],

    systemPromptContext: `You are a professional banking customer service AI. You help customers with:
- Account inquiries and balances
- Transfers and payments
- Loan applications and status
- Card services (block, unblock, replace)
- Statement requests
- Fraud reporting

Always prioritize security. Never share sensitive information. Verify customer identity through proper channels. Escalate suspicious activities immediately.`
};

// Insurance Industry Knowledge
const insuranceKnowledge: IndustryKnowledge = {
    industry: 'insurance',
    displayName: 'Insurance Services',
    description: 'Life, health, motor, and property insurance services',

    commonTerms: {
        'premium': 'Regular payment to maintain insurance coverage',
        'deductible': 'Amount customer pays before insurance kicks in',
        'claim': 'Request for payment under insurance policy',
        'beneficiary': 'Person who receives insurance payout',
        'underwriting': 'Risk assessment process for insurance',
        'rider': 'Additional coverage added to base policy',
        'sum assured': 'Maximum amount payable under policy',
        'waiting period': 'Time before certain benefits become available',
        'exclusion': 'Conditions not covered by the policy',
        'renewal': 'Extending policy for another term'
    },

    commonQueries: [
        'File a claim',
        'Check policy status',
        'Download policy document',
        'Pay premium',
        'Change beneficiary',
        'Get quote',
        'Add coverage',
        'Claim status',
        'Cancel policy',
        'Update contact'
    ],

    productCategories: [
        'life_insurance', 'health_insurance', 'motor_insurance',
        'home_insurance', 'travel_insurance', 'business_insurance'
    ],

    commonActions: [
        {
            name: 'File Claim',
            description: 'Submit an insurance claim',
            keywords: ['claim', 'file', 'submit', 'accident', 'damage'],
            requiredInfo: ['policy_number', 'incident_date', 'incident_details'],
            steps: ['Gather documentation', 'Fill claim form', 'Submit with evidence', 'Await assessment']
        }
    ],

    troubleshooting: [
        {
            issue: 'Claim rejected',
            keywords: ['rejected', 'denied', 'refused', 'not approved'],
            solutions: [
                'Review rejection reason',
                'Check policy coverage and exclusions',
                'Gather additional documentation',
                'File appeal within 30 days'
            ]
        }
    ],

    faqs: [
        {
            question: 'How long does claim processing take?',
            answer: 'Simple claims are processed within 7-14 days. Complex claims may take up to 30 days depending on investigation required.',
            keywords: ['claim', 'processing', 'time', 'how long']
        }
    ],

    systemPromptContext: `You are a helpful insurance customer service AI. You help customers with:
- Policy information and documents
- Premium payments
- Claim filing and status
- Coverage questions
- Beneficiary updates
- Quotes for new coverage

Be empathetic when handling claims. Explain policy terms clearly. Guide customers through the claims process step by step.`
};

// Microfinance Industry Knowledge
const microfinanceKnowledge: IndustryKnowledge = {
    industry: 'microfinance',
    displayName: 'Microfinance Services',
    description: 'Small loans and financial services for individuals and small businesses',

    commonTerms: {
        'group lending': 'Loans given to groups with joint liability',
        'repayment schedule': 'Plan for loan repayment instalments',
        'grace period': 'Time before loan repayment starts',
        'interest rate': 'Cost of borrowing expressed as percentage',
        'disbursement': 'Release of loan funds to borrower',
        'default': 'Failure to repay loan as agreed',
        'collateral': 'Asset pledged as loan security',
        'guarantor': 'Person who agrees to pay if borrower cannot',
        'loan cycle': 'Progressive lending with increased amounts',
        'flat rate': 'Interest calculated on original loan amount'
    },

    commonQueries: [
        'Apply for loan',
        'Check loan balance',
        'Repayment schedule',
        'Next payment date',
        'Increase loan limit',
        'Clear loan statement',
        'Group registration',
        'Interest rate',
        'Early repayment',
        'Loan status'
    ],

    productCategories: [
        'personal_loan', 'business_loan', 'group_loan', 'emergency_loan',
        'agriculture_loan', 'education_loan', 'savings_account'
    ],

    commonActions: [
        {
            name: 'Apply for Loan',
            description: 'Submit loan application',
            keywords: ['loan', 'apply', 'borrow', 'need money'],
            requiredInfo: ['name', 'id_number', 'phone', 'amount', 'purpose'],
            steps: ['Fill application form', 'Submit documents', 'Credit check', 'Approval', 'Disbursement']
        },
        {
            name: 'Check Balance',
            description: 'View outstanding loan balance',
            keywords: ['balance', 'owe', 'remaining', 'outstanding'],
            requiredInfo: ['loan_number', 'phone'],
            steps: ['Dial USSD code', 'Select loan balance', 'View amount']
        }
    ],

    troubleshooting: [
        {
            issue: 'Cannot repay on time',
            keywords: ['late', 'cannot pay', 'difficulty', 'delay'],
            solutions: [
                'Contact us immediately before due date',
                'Discuss restructuring options',
                'Set up partial payment plan',
                'Avoid penalties by communicating early'
            ]
        }
    ],

    faqs: [
        {
            question: 'What happens if I pay late?',
            answer: 'Late payments incur a penalty fee and affect your credit score. Contact us before the due date if you anticipate difficulty paying.',
            keywords: ['late', 'penalty', 'delay', 'miss payment']
        }
    ],

    systemPromptContext: `You are a supportive microfinance customer service AI. You help customers with:
- Loan applications and eligibility
- Repayment schedules and balances
- Payment methods
- Account management
- Financial education

Be understanding of financial difficulties. Encourage early communication about repayment issues. Guide customers to appropriate solutions.`
};

// Television/Pay TV Industry Knowledge
const televisionKnowledge: IndustryKnowledge = {
    industry: 'television',
    displayName: 'Television & Streaming',
    description: 'Pay TV, satellite, and streaming services',

    commonTerms: {
        'decoder': 'Device that receives and decodes TV signals',
        'smartcard': 'Card that authorizes viewing on decoder',
        'bouquet': 'Package of TV channels',
        'scrambled': 'Encrypted channel requiring subscription',
        'PVR': 'Personal Video Recorder for recording shows',
        'HD': 'High Definition video quality',
        'STB': 'Set-Top Box (decoder)',
        'LNB': 'Low Noise Block - satellite dish component',
        'EPG': 'Electronic Program Guide',
        'VOD': 'Video On Demand'
    },

    commonQueries: [
        'Pay subscription',
        'Check subscription status',
        'Upgrade package',
        'No signal',
        'Channels not showing',
        'Reset decoder',
        'Add extra view',
        'Clear E16/E30 error',
        'Change package',
        'Reconnect'
    ],

    productCategories: [
        'tv_package', 'premium_channel', 'sports_addon', 'movies_addon',
        'streaming_bundle', 'decoder', 'installation'
    ],

    commonActions: [
        {
            name: 'Pay Subscription',
            description: 'Pay for TV subscription',
            keywords: ['pay', 'subscribe', 'renew', 'dues'],
            requiredInfo: ['smartcard_number', 'package', 'amount'],
            steps: ['Select payment method', 'Enter smartcard number', 'Choose package', 'Confirm payment']
        },
        {
            name: 'Reset Decoder',
            description: 'Clear errors and refresh decoder',
            keywords: ['reset', 'error', 'not working', 'E16', 'E30'],
            requiredInfo: ['smartcard_number'],
            steps: ['Power off decoder', 'Wait 30 seconds', 'Power on', 'Wait for refresh signal']
        }
    ],

    troubleshooting: [
        {
            issue: 'E16/E30 Error',
            keywords: ['E16', 'E30', 'error', 'scrambled', 'no signal'],
            solutions: [
                'Check if subscription is paid and active',
                'Reset decoder: unplug, wait 30 secs, plug back',
                'Request signal refresh from customer service',
                'Check dish alignment if outdoor installation'
            ]
        },
        {
            issue: 'No signal',
            keywords: ['no signal', 'black screen', 'no picture'],
            solutions: [
                'Check all cable connections',
                'Verify dish is not obstructed',
                'Reset decoder',
                'Check for scheduled maintenance',
                'Contact technician for dish realignment'
            ]
        }
    ],

    faqs: [
        {
            question: 'How do I upgrade my package?',
            answer: 'You can upgrade by dialing *123#, using our mobile app, or visiting any authorized dealer. The new package activates immediately upon payment.',
            keywords: ['upgrade', 'change', 'package', 'better']
        }
    ],

    systemPromptContext: `You are a helpful TV service customer service AI. You help customers with:
- Subscription payments and status
- Package selection and upgrades
- Technical troubleshooting (errors, no signal)
- Decoder setup and configuration
- Add-on services

Provide clear technical instructions. Use simple language. Guide customers through troubleshooting steps patiently.`
};

// Knowledge Registry
export const industryKnowledgeRegistry: Record<IndustryType, IndustryKnowledge> = {
    mobile: mobileKnowledge,
    banking: bankingKnowledge,
    insurance: insuranceKnowledge,
    microfinance: microfinanceKnowledge,
    television: televisionKnowledge
};

/**
 * Get industry knowledge for a specific industry
 */
export function getIndustryKnowledge(industry: IndustryType): IndustryKnowledge {
    return industryKnowledgeRegistry[industry];
}

/**
 * Get system prompt context for an industry
 */
export function getSystemPromptContext(industry: IndustryType): string {
    return industryKnowledgeRegistry[industry].systemPromptContext;
}

/**
 * Find relevant FAQs for a query
 */
export function findRelevantFAQs(industry: IndustryType, query: string): FAQ[] {
    const knowledge = industryKnowledgeRegistry[industry];
    const queryLower = query.toLowerCase();

    return knowledge.faqs.filter(faq =>
        faq.keywords.some(keyword => queryLower.includes(keyword))
    );
}

/**
 * Find relevant actions for a query
 */
export function findRelevantActions(industry: IndustryType, query: string): IndustryAction[] {
    const knowledge = industryKnowledgeRegistry[industry];
    const queryLower = query.toLowerCase();

    return knowledge.commonActions.filter(action =>
        action.keywords.some(keyword => queryLower.includes(keyword))
    );
}

/**
 * Find troubleshooting guides for an issue
 */
export function findTroubleshootingGuides(industry: IndustryType, query: string): TroubleshootingGuide[] {
    const knowledge = industryKnowledgeRegistry[industry];
    const queryLower = query.toLowerCase();

    return knowledge.troubleshooting.filter(guide =>
        guide.keywords.some(keyword => queryLower.includes(keyword))
    );
}

/**
 * Get term definition
 */
export function getTermDefinition(industry: IndustryType, term: string): string | undefined {
    const knowledge = industryKnowledgeRegistry[industry];
    const termLower = term.toLowerCase();

    for (const [key, value] of Object.entries(knowledge.commonTerms)) {
        if (key.toLowerCase() === termLower) {
            return value;
        }
    }
    return undefined;
}
