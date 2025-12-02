// Insurance Knowledge Base
export const insuranceKnowledgeBase = {
    industry: 'insurance' as const,

    // Policy types
    policyTypes: [
        { name: 'Life Insurance', coverage: 50000, premium: 150, term: '20 years' },
        { name: 'Health Insurance', coverage: 100000, premium: 200, term: '1 year' },
        { name: 'Auto Insurance', coverage: 80000, premium: 350, term: '1 year' },
        { name: 'Property Insurance', coverage: 150000, premium: 250, term: '1 year' },
    ],

    // Common issues and solutions
    commonIssues: {
        file_claim: {
            solution: '📋 To file a claim:\n\n1️⃣ Gather documents:\n• Policy number\n• Incident report\n• Photos (if applicable)\n• Medical reports (health claims)\n\n2️⃣ Submit via:\n📧 claims@insurance.com\n📱 Mobile app\n🏢 Visit nearest office\n\nProcessing time: 7-14 business days',
            escalate: false
        },
        claim_status: {
            solution: 'To check claim status, I need your claim reference number (format: CLM-XXXXX).\n\nOnce provided, I can show you:\n✅ Current status\n✅ Processing stage\n✅ Expected completion date\n\nPlease share your claim number.',
            escalate: false
        },
        policy_renewal: {
            solution: '🔄 Policy Renewal:\n\n📅 Renewal reminders sent 30 days before expiry\n💳 Payment methods:\n• Mobile money\n• Bank transfer\n• Cash at office\n\n📱 Renew via app or call +260 211 XXX XXX\n\nProvide policy number to check renewal date.',
            escalate: false
        },
        quote_request: {
            solution: '💰 Get a quote:\n\nTell me:\n1. Insurance type (Life/Health/Auto/Property)\n2. Coverage amount needed\n3. Your age (Life/Health)\n4. Vehicle value (Auto)\n\nI\'ll calculate an estimated premium instantly!',
            escalate: false
        }
    },

    // Intent handlers
    intents: {
        claim_status: {
            response: 'I can help you check your claim status. Please provide your claim reference number (e.g., CLM-12345).',
            action: 'await_claim_number'
        },
        file_new_claim: {
            response: 'I\'ll help you file a claim.\n\nFirst, which type:\n1️⃣ Health/Medical\n2️⃣ Auto/Vehicle\n3️⃣ Property\n4️⃣ Life Insurance\n\nReply with the number or type.',
            action: 'await_claim_type'
        },
        quote_request: {
            response: 'I\'d be happy to provide a quote!\n\nWhich insurance are you interested in?\n🏥 Health\n🚗 Auto\n🏠 Property\n👤 Life\n\nPlease specify and I\'ll guide you through.',
            action: 'await_insurance_type'
        },
        make_payment: {
            response: 'Payment methods:\n\n💳 Mobile Money: *999#\n🏦 Bank Transfer:\n   Account: 1234567890\n   Bank: ABC Bank\n📱 Mobile App: Download from stores\n🏢 Office: Cash/Card accepted\n\nUse policy number as reference!',
            action: 'info_provided'
        }
    },

    // Greeting messages
    greetings: {
        welcome: 'Hello! 👋 Welcome to {companyName} Insurance. I\'m here to help with claims, quotes, and policy information. How can I assist you?',
        offline: 'Thank you for contacting {companyName}. Our office hours are Mon-Fri 8AM-5PM. For urgent claims, call our 24/7 hotline: +260 211 XXX XXX',
        escalated: 'I\'ve escalated your case to our claims specialist. Reference: {ticketId}. You\'ll be contacted within 1 business day.'
    }
};

export type InsuranceKnowledgeBase = typeof insuranceKnowledgeBase;
