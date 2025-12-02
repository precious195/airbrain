// Banking Knowledge Base
export const bankingKnowledgeBase = {
    industry: 'banking' as const,

    // Account types
    accountTypes: [
        { name: 'Savings Account', minBalance: 100, monthlyFee: 5, features: ['Passbook', 'ATM card', 'Mobile banking'] },
        { name: 'Current Account', minBalance: 500, monthlyFee: 10, features: ['Checkbook', 'Overdraft', 'Business banking'] },
        { name: 'Fixed Deposit', minBalance: 1000, monthlyFee: 0, features: ['High interest', 'Term deposit', 'No withdrawals'] },
    ],

    // USSD codes
    ussdCodes: {
        checkBalance: '*303#',
        miniStatement: '*303*1#',
        transfer: '*303*2#',
        loanBalance: '*303*3#',
    },

    // Common issues and solutions
    commonIssues: {
        forgot_pin: {
            solution: 'For PIN reset:\n\n🏦 Visit nearest branch with:\n• Valid ID\n• Account number\n\n📞 OR call 24/7 helpline: +260 211 XXX XXX\n\nFor security, PIN cannot be reset online or via WhatsApp.',
            escalate: true
        },
        card_blocked: {
            solution: 'Your card can be unblocked:\n\n📱 Mobile App: Login > Cards > Unblock\n📞 Call Center: +260 211 XXX XXX (24/7)\n🏦 Visit Branch: With ID\n\nIf card was lost/stolen, a replacement will be issued.',
            escalate: false
        },
        check_balance: {
            solution: 'Check your balance:\n\n📱 Dial *303#\n💻 Mobile/Internet banking\n🏧 ATM withdrawal (shows balance)\n📞 Call +260 211 XXX XXX\n\nWhich method would you prefer?',
            escalate: false
        },
        failed_transaction: {
            solution: 'For failed transactions:\n\n✅ Amount will be reversed within 24-72 hours\n✅ Check with recipient if amount was received\n✅ Keep transaction reference: {reference}\n\nWould you like me to create a dispute ticket?',
            escalate: true
        },
        loan_application: {
            solution: 'To apply for a loan:\n\n📋 Requirements:\n• Salary account (3+ months)\n• Valid ID\n• Recent payslip\n\n💻 Apply online: www.bank.com/loans\n🏦 Visit branch\n📱 Mobile app: Menu > Loans\n\nProcessing: 3-5 business days',
            escalate: false
        }
    },

    // Intent handlers
    intents: {
        balance_inquiry: {
            response: 'To check your account balance:\n\n📱 Quickest: Dial *303#\n💻 Internet Banking: www.bank.com\n📲 Mobile App: Available on Play Store/App Store\n\nYour balance will be displayed instantly!',
            action: 'info_provided'
        },
        mini_statement: {
            response: 'Get your last 5 transactions:\n\n📱 Dial *303*1#\n💻 Login to internet banking\n📲 Check mobile app\n\nWould you like me to email your full statement?',
            action: 'info_provided'
        },
        report_fraud: {
            response: '🚨 FRAUD ALERT RECEIVED\n\nImmediate actions:\n1. Blocking your card NOW\n2. Creating fraud case: {caseId}\n3. Alerting fraud team\n\n📞 Fraud Hotline: +260 211 XXX XXX\n\nDo NOT share your PIN or OTP with anyone!',
            action: 'create_fraud_alert'
        },
        branch_locator: {
            response: 'To find nearest branch:\n\n📍 Share your location OR\n📝 Tell me your area/town\n\n💻 Visit: www.bank.com/branches\n📱 App: Menu > Locations\n\nWhich location are you in?',
            action: 'await_location'
        }
    },

    // Greeting messages
    greetings: {
        welcome: 'Hello! 👋 Welcome to {companyName}. I\'m your AI banking assistant. How may I help you with your banking needs today?',
        offline: 'Thank you for contacting {companyName}. Our support team is currently offline. For urgent matters, please call our 24/7 hotline: +260 211 XXX XXX',
        escalated: 'I\'ve connected you with our customer service team. Reference number: {ticketId}. A representative will assist you shortly.'
    }
};

export type BankingKnowledgeBase = typeof bankingKnowledgeBase;
