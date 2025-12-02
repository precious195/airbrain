// Television Knowledge Base
export const televisionKnowledgeBase = {
    industry: 'television' as const,

    // Packages
    packages: [
        { name: 'Premium HD', channels: 150, price: 250, features: ['HD channels', 'Sports', 'Movies', 'News'] },
        { name: 'Sports Package', channels: 45, price: 200, features: ['Live sports', 'Analysis', 'Replays'] },
        { name: 'Family Bundle', channels: 80, price: 150, features: ['Kids', 'Entertainment', 'Education'] },
        { name: 'Basic Package', channels: 50, price: 80, features: ['Local channels', 'News', 'Music'] },
    ],

    // USSD codes
    ussdCodes: {
        checkSubscription: '*444#',
        paySubscription: '*444*1#',
        upgradePackage: '*444*2#',
        customerCare: '*444*9#',
    },

    // Common issues and solutions
    commonIssues: {
        no_signal: {
            solution: '📡 No Signal Troubleshooting:\n\n1️⃣ Check decoder:\n• Power cable connected?\n• Decoder on?\n• All cables tight?\n\n2️⃣ Check dish:\n• Any physical damage?\n• Clear view of sky?\n• Weather conditions?\n\n3️⃣ Reset decoder:\n• Unplug for 30 seconds\n• Plug back in\n• Wait for initialization\n\n4️⃣ Check subscription: *444#\n\nStill not working? I\'ll create a technical ticket.',
            escalate: true
        },
        payment_not_reflecting: {
            solution: '💳 Payment Processing:\n\n⏱️ Payments reflect within:\n• Mobile Money: 30 minutes\n• Bank transfer: 2-4 hours\n• Cash: Instant\n\n ✅ To speed up:\n1. Have payment reference ready\n2. Provide smartcard number\n3. I\'ll manually verify\n\nPlease share your payment reference.',
            escalate: false
        },
        package_upgrade: {
            solution: '⬆️ Package Upgrade:\n\n📱 Quick: Dial *444*2#\n💻 Online: www.tv.com/upgrade\n📲 Mobile app\n🏢 Visit office\n\nCurrent packages:\n🌟 Premium HD - K250\n⚽ Sports - K200\n👨‍👩‍👧 Family - K150\n📺 Basic - K80\n\nUpgrades are instant after payment!',
            escalate: false
        },
        forgot_password: {
            solution: '🔐 Reset your password:\n\n1️⃣ Visit www.tv.com/reset\n2️⃣ Enter smartcard number\n3️⃣ Get reset link via email/SMS\n4️⃣ Create new password\n\nOR call +260 211 XXX XXX for assistance',
            escalate: false
        }
    },

    // Intent handlers
    intents: {
        check_subscription: {
            response: 'Check your subscription status:\n\n📱 Fastest: Dial *444#\n💻 Online: www.tv.com (login required)\n📲 Mobile app\n\nProvide smartcard number for detailed info:\n✅ Active package\n✅ Expiry date\n✅ Payment history',
            action: 'info_provided'
        },
        report_technical: {
            response: 'I\'ll help with your technical issue.\n\nWhat\'s the problem?\n1️⃣ No signal\n2️⃣ Poor picture quality\n3️⃣ Some channels not showing\n4️⃣ Decoder not responding\n5️⃣ Other\n\nPlease describe or choose number.',
            action: 'await_issue_type'
        },
        make_payment: {
            response: '💰 Payment Methods:\n\n📱 Mobile Money:\n• MTN: *444*1#\n• Airtel: *444*1#\n• Zamtel: *444*1#\n\n🏦 Bank Transfer:\n   Acc: 5555666677\n   Bank: DEF Bank\n\n💵 Cash: Any authorized dealer\n📲 Mobile app\n\nUse smartcard number as reference!',
            action: 'info_provided'
        },
        channel_list: {
            response: 'View channel lists:\n\n💻 Full list: www.tv.com/channels\n📱 Mobile app: Menu > Channels\n📺 Decoder: Press "Guide" button\n\nWhich package are you interested in?\n🌟 Premium (150 channels)\n⚽ Sports (45 channels)\n👨‍👩‍👧 Family (80 channels)\n📺 Basic (50 channels)',
            action: 'info_provided'
        }
    },

    // Greeting messages
    greetings: {
        welcome: 'Hello! 👋 Welcome to {companyName}. I can help with subscriptions, technical issues, and package information. How may I assist you?',
        offline: 'Thank you for contacting {companyName}. Our support hours are Mon-Fri 8AM-8PM, Sat-Sun 9AM-5PM. For urgent technical issues, call +260 211 XXX XXX',
        escalated: 'I\'ve created a ticket for our technical team. Reference: {ticketId}. A technician will contact you within 24 hours.'
    }
};

export type TelevisionKnowledgeBase = typeof televisionKnowledgeBase;
