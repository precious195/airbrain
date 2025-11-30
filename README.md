# AI Customer Service System

Enterprise-grade AI-powered customer service platform supporting multiple industries (Mobile Operators, Banking, Microfinance, Insurance, TV/Subscription services).

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Backend**: Firebase Cloud Functions
- **Database**: Firebase Realtime Database
- **AI**: Google Gemini API (1.5 Pro & Flash)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel / Firebase Hosting

## Getting Started

### Prerequisites

- Node.js 18+ 
- Firebase Account
- Google Cloud Account (for Gemini API)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Firebase and Gemini API credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create `.env.local` with:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Google Gemini AI
GEMINI_API_KEY=

# Twilio (WhatsApp/SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
TWILIO_SMS_NUMBER=
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Admin dashboard routes
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── chat/             # Chat widget components
│   └── dashboard/        # Dashboard components
├── lib/                   # Core libraries
│   ├── ai/               # Gemini AI integration
│   ├── firebase/         # Firebase setup
│   ├── channels/         # Communication channels
│   ├── industries/       # Industry-specific modules
│   └── ticketing/        # Ticket management
├── types/                 # TypeScript types
└── hooks/                # Custom React hooks

functions/                 # Firebase Cloud Functions
├── src/
│   ├── ai/               # AI processing functions
│   ├── channels/         # Channel processors
│   └── industries/       # Industry integrations
```

## Features

### Phase 1 - MVP (Mobile Operators)
- ✅ WhatsApp & SMS integration
- ✅ AI-powered conversation (Gemini)
- ✅ Bundle purchases
- ✅ Balance inquiries
- ✅ Basic ticket management
- ✅ Admin dashboard

### All Industry Modules
- ✅ **Mobile Operators** - Bundles, balance, SIM registration
- ✅ **Banking** - Accounts, transactions, loans, transfers
- ✅ **Microfinance** - Loan applications, eligibility, repayment tracking
- ✅ **Insurance** - Quotes, policies, claims management
- ✅ **Television** - Subscriptions, packages, decoder troubleshooting

### Upcoming Enhancements
- Banking module
- Microfinance module
- Insurance module
- TV/Subscription module
- Voice agent capabilities
- Advanced analytics

## License

Proprietary - All rights reserved
