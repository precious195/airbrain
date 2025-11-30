# AI Customer Service System - Quick Start Guide

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd C:\Users\00\.gemini\antigravity\scratch\ai-customer-service
npm install
```

### 2. Configure Environment Variables

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Add your credentials:

```env
# Firebase (Get from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com

# Gemini AI (Get from Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key

# Twilio (Optional - for WhatsApp/SMS)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
TWILIO_SMS_NUMBER=+1234567890
```

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Realtime Database**
4. Enable **Authentication** (Email/Phone)
5. Copy your config to `.env.local`
6. Deploy security rules:

```bash
firebase deploy --only database
```

### 4. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Add to `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

## 📱 Testing the System

### Test Web Chat
1. Go to http://localhost:3000/demo
2. Select an industry
3. Start chatting with the AI

### Test WhatsApp (requires Twilio setup)
1. Configure Twilio webhook: `https://your-domain.com/api/webhooks/whatsapp`
2. Send a WhatsApp message to your Twilio number
3. AI will respond automatically

### Test SMS (requires Twilio setup)
1. Configure Twilio SMS webhook: `https://your-domain.com/api/webhooks/sms`
2. Send an SMS to your Twilio number
3. Receive AI-powered response

### Access Admin Dashboard
Visit: http://localhost:3000/dashboard

## 🔑 Key Features Available

✅ Real-time web chat with streaming AI responses  
✅ WhatsApp integration via Twilio  
✅ SMS integration via Twilio  
✅ Mobile operators module (bundles, balance)  
✅ Intent detection with auto-escalation  
✅ Admin dashboard with live conversations  
✅ Firebase Realtime Database integration  
✅ Gemini AI (Flash & Pro models)  
✅ Function calling for actions  

## 📝 Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Admin dashboard
│   ├── api/                  # API routes
│   ├── demo/                 # Demo page
│   └── page.tsx              # Landing page
├── components/
│   └── chat/                 # Chat widget
├── lib/
│   ├── ai/                   # Gemini AI integration
│   ├── firebase/             # Firebase config
│   └── industries/           # Industry modules
├── types/                    # TypeScript types
└── hooks/                    # React hooks
```

## 🎯 Next Steps

1. **Expand Industry Modules**: Add banking, insurance, microfinance
2. **Add Authentication**: Implement Firebase Auth for admin dashboard
3. **Build Analytics**: Create comprehensive analytics dashboard
4. **Deploy**: Deploy to Vercel for production use
5. **Add Voice**: Integrate Twilio Voice for voice agent

## 📚 Documentation

- [Implementation Plan](../implementation_plan.md)
- [Walkthrough](../walkthrough.md)
- [Firebase Docs](https://firebase.google.com/docs)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Next.js Docs](https://nextjs.org/docs)

## 💡 Tips

- Start with the demo page to test AI responses
- Monitor conversations in the admin dashboard
- Check Firebase console for real-time data
- Use Gemini Flash for fast responses, Pro for complex queries
- Configure Twilio sandbox for testing WhatsApp

---

**Questions?** Check the documentation or Firebase logs for debugging.
