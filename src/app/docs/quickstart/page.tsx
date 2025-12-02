import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function QuickStartPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Quick Start Guide</h1>
                <p className="text-lg text-gray-600">
                    Follow this guide to set up your AI customer service agent in minutes.
                </p>
            </div>

            <div className="space-y-8">
                {/* Step 1 */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            1
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900">Create your account</h2>
                            <p className="text-gray-600">
                                Sign up for an AirBrain account. You'll need to provide your company name and select your industry.
                            </p>
                            <Link href="/signup" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline">
                                Go to Signup <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            2
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900">Connect WhatsApp</h2>
                            <p className="text-gray-600">
                                Navigate to <strong>Settings {'>'} WhatsApp</strong> in your dashboard. You'll need:
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-gray-600">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    Meta Business Account
                                </li>
                                <li className="flex items-center gap-2 text-gray-600">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    Phone Number ID
                                </li>
                                <li className="flex items-center gap-2 text-gray-600">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    System User Access Token
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            3
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900">Add Knowledge</h2>
                            <p className="text-gray-600">
                                Go to the <strong>Knowledge Base</strong> section. Add your most common FAQs and product details.
                                The AI will immediately start using this information to answer customer queries.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-xl p-6 mt-8">
                <h3 className="font-semibold text-green-900 mb-2">🎉 You're all set!</h3>
                <p className="text-green-800">
                    Your AI agent is now active and ready to handle customer conversations on WhatsApp.
                </p>
            </div>
        </div>
    );
}
