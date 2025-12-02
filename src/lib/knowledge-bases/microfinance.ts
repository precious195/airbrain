// Microfinance Knowledge Base
export const microfinanceKnowledgeBase = {
    industry: 'microfinance' as const,

    // Loan products
    loanProducts: [
        { name: 'Business Loan', minAmount: 1000, maxAmount: 50000, rate: 12, term: '12 months', requirements: ['Business plan', 'Collateral'] },
        { name: 'Personal Loan', minAmount: 500, maxAmount: 10000, rate: 15, term: '6 months', requirements: ['Valid ID', 'Proof of income'] },
        { name: 'Agriculture Loan', minAmount: 2000, maxAmount: 30000, rate: 10, term: '18 months', requirements: ['Land title', 'Farming plan'] },
        { name: 'Education Loan', minAmount: 1000, maxAmount: 20000, rate: 8, term: '24 months', requirements: ['Admission letter', 'Guarantor'] },
    ],

    // USSD codes
    ussdCodes: {
        loanBalance: '*333#',
        payLoan: '*333*1#',
        applyLoan: '*333*2#',
        loanStatement: '*333*3#',
    },

    // Common issues and solutions
    commonIssues: {
        loan_application: {
            solution: '📋 Loan Application Process:\n\n1️⃣ Choose loan type:\n• Business (K1,000-50,000)\n• Personal (K500-10,000)\n• Agriculture (K2,000-30,000)\n• Education (K1,000-20,000)\n\n2️⃣ Requirements:\n• Valid National ID\n• Proof of income\n• Collateral (for large amounts)\n\n3️⃣ Apply:\n📱 Dial *333*2#\n💻 www.mfi.com/apply\n🏢 Visit branch\n\nProcessing: 3-5 days',
            escalate: false
        },
        check_loan_status: {
            solution: 'Check loan application status:\n\n📱 Dial *333*4#\n💻 Login: www.mfi.com\n📞 Call: +260 211 XXX XXX\n\nPlease provide your application reference number for detailed status.',
            escalate: false
        },
        loan_balance: {
            solution: 'Check your loan balance:\n\n📱 Quickest: Dial *333#\n📧 Email: Get monthly statements\n📱 Mobile app: Real-time balance\n\nShows:\n✅ Outstanding balance\n✅ Next payment date\n✅ Payment amount',
            escalate: false
        },
        make_repayment: {
            solution: '💰 Repayment Options:\n\n📱 Mobile Money: *333*1#\n🏦 Bank Transfer:\n   Acc: 9876543210\n   Bank: XYZ Bank\n💵 Cash: Any branch\n📲 Standing order\n\nUse loan number as reference!',
            escalate: false
        }
    },

    // Intent handlers
    intents: {
        check_loan_status: {
            response: 'I can help you check your loan status. Please provide:\n\n1️⃣ Your loan/application number\nOR\n2️⃣ Your registered phone number\n\nI\'ll retrieve your loan information.',
            action: 'await_loan_number'
        },
        apply_for_loan: {
            response: 'Great! Let\'s start your loan application.\n\nWhich loan type?\n1️⃣ Business Loan (12% p.a.)\n2️⃣ Personal Loan (15% p.a.)\n3️⃣ Agriculture Loan (10% p.a.)\n4️⃣ Education Loan (8% p.a.)\n\nReply with number or type.',
            action: 'await_loan_type'
        },
        payment_inquiry: {
            response: 'To check payment history, dial *333*3# or provide your loan number and I\'ll retrieve:\n\n✅ Payment history\n✅ Next due date\n✅ Remaining balance\n✅ Penalty (if any)',
            action: 'await_loan_number'
        }
    },

    // Greeting messages
    greetings: {
        welcome: 'Hello! 👋 Welcome to {companyName}. I can help with loan applications, repayments, and balance inquiries. How may I assist you?',
        offline: 'Thank you for contacting us. Office hours: Mon-Fri 8AM-5PM, Sat 8AM-12PM. For urgent matters, call +260 211 XXX XXX',
        escalated: 'I\'ve escalated to our loan officer. Reference: {ticketId}. You\'ll receive a call within 24 hours.'
    }
};

export type MicrofinanceKnowledgeBase = typeof microfinanceKnowledgeBase;
