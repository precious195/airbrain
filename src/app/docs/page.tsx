import Link from 'next/link';
import { ArrowRight, Book, Zap, Shield, MessageSquare } from 'lucide-react';

export default function DocsPage() {
    return (
        <div className="space-y-12">
            {/* Hero */}
            <div className="border-b border-gray-200 pb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">AirBrain Documentation</h1>
                <p className="text-xl text-gray-600 max-w-2xl">
                    Learn how to integrate, configure, and scale your AI customer service with AirBrain.
                </p>
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-2 gap-6">
                <Link href="/docs/quickstart" className="block p-6 border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group">
                    <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                        <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        Quick Start Guide
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h2>
                    <p className="text-gray-600">Get your AI agent up and running in less than 5 minutes.</p>
                </Link>

                <Link href="/docs/architecture" className="block p-6 border border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-md transition-all group">
                    <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                        <Book className="w-6 h-6 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        Platform Concepts
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h2>
                    <p className="text-gray-600">Understand how AirBrain processes messages and manages data.</p>
                </Link>
            </div>

            {/* Features */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Core Features</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 bg-gray-50 rounded-xl">
                        <MessageSquare className="w-8 h-8 text-gray-700 mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">AI Conversations</h3>
                        <p className="text-sm text-gray-600 mb-4">Powered by Gemini 1.5 Pro for human-like interactions.</p>
                        <Link href="/docs/conversations" className="text-blue-600 text-sm font-medium hover:underline">Learn more →</Link>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-xl">
                        <Shield className="w-8 h-8 text-gray-700 mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">Enterprise Security</h3>
                        <p className="text-sm text-gray-600 mb-4">Bank-grade encryption and data isolation per company.</p>
                        <Link href="/docs/security" className="text-blue-600 text-sm font-medium hover:underline">Learn more →</Link>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-xl">
                        <Zap className="w-8 h-8 text-gray-700 mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">System Integration</h3>
                        <p className="text-sm text-gray-600 mb-4">Connect to your backend via API or Browser Automation.</p>
                        <Link href="/docs/integrations" className="text-blue-600 text-sm font-medium hover:underline">Learn more →</Link>
                    </div>
                </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 rounded-xl p-8 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-blue-900 mb-2">Need help?</h2>
                    <p className="text-blue-700">Our support team is available 24/7 to assist you.</p>
                </div>
                <Link href="/contact" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors border border-blue-200">
                    Contact Support
                </Link>
            </div>
        </div>
    );
}
