// Mobile Telecom Knowledge Base
export const mobileKnowledgeBase = {
    industry: 'mobile' as const,

    // Common bundles
    bundles: [
        { name: 'Daily 1GB', code: '*123*1#', price: 10, data: '1GB', validity: '24 hours' },
        { name: 'Weekly 5GB', code: '*123*2#', price: 50, data: '5GB', validity: '7 days' },
        { name: '30-Day Unlimited', code: '*123*3#', price: 300, data: 'Unlimited', validity: '30 days' },
        { name: 'Social Bundle', code: '*123*4#', price: 20, data: '500MB', validity: '7 days' },
    ],

    // USSD codes
    ussdCodes: {
        checkBalance: '*124#',
        buyBundle: '*123#',
        customerCare: '*100#',
        portNumber: '*777#',
    },

    // Common issues and solutions
    commonIssues: {
        bundle_activation_failed: {
            solution: 'To activate a bundle:\n1. Dial *123# and select your preferred bundle\n2. Ensure you have sufficient airtime\n3. Wait for confirmation SMS\n\nIf issue persists, your bundle will be activated within 5 minutes.',
            escalate: false
        },
        no_network: {
            solution: 'Please try these steps:\n1. Turn off airplane mode\n2. Restart your phone\n3. Check if SIM card is properly inserted\n4. Move to an area with better coverage\n\nIf problem continues, we will create a ticket for our technical team.',
            escalate: true
        },
        data_balance: {
            solution: 'To check your data balance, simply dial *124#. You will receive an SMS with your remaining data, validity, and airtime balance.',
            escalate: false
        },
        slow_internet: {
            solution: 'For better internet speed:\n1. Ensure you have active data bundle\n2. Check signal strength (3 bars or more)\n3. Clear browser cache\n4. Try switching between 3G/4G networks\n\nSpeed depends on network congestion.',
            escalate: false
        },
        port_number: {
            solution: 'To port your number to us:\n1. Dial *777# to get your PAC code from current provider\n2. Visit our nearest shop with ID and PAC code\n3. Processing takes 24-48 hours\n\nKeep your old SIM active during porting.',
            escalate: false
        }
    },

    // Intent handlers
    intents: {
        check_balance: {
            response: 'To check your balance, dial *124# from your phone. You will receive an instant SMS with your:\n• Airtime balance\n• Data balance\n• Bundle expiry date',
            action: 'info_provided'
        },
        buy_bundle: {
            response: 'Great! Here are our popular bundles:\n\n📱 Daily 1GB - K10 (*123*1#)\n📱 Weekly 5GB - K50 (*123*2#)\n📱 30-Day Unlimited - K300 (*123*3#)\n📱 Social Bundle - K20 (*123*4#)\n\nDial the code shown to activate instantly!',
            action: 'info_provided'
        },
        report_network_issue: {
            response: 'I understand you\'re experiencing network issues. I\'ll create a technical ticket for our team to investigate.\n\nTicket Reference: {ticketId}\n\nOur technical team will contact you within 24 hours. In the meantime, try:\n• Restarting your phone\n• Checking airplane mode is off',
            action: 'create_ticket'
        },
        top_up_airtime: {
            response: 'You can top up airtime:\n\n💳 Mobile Money: *999#\n🏪 Retail shops: Available nationwide\n💻 Online: www.mobile.com/topup\n🏦 Bank transfer: Check our app\n\nWhich method would you prefer?',
            action: 'info_provided'
        }
    },

    // Greeting messages
    greetings: {
        welcome: 'Hello! 👋 Welcome to {companyName} support. I\'m your AI assistant. How can I help you today?',
        offline: 'Thank you for contacting us. Our support team is currently offline (business hours: Mon-Fri 8AM-5PM). We will respond to your message as soon as possible.',
        escalated: 'Thank you for your patience. I\'ve escalated your issue to a human agent who will assist you shortly. Reference: {ticketId}'
    }
};

export type MobileKnowledgeBase = typeof mobileKnowledgeBase;
