// src/app/page.tsx
import Link from 'next/link';
import { MessageSquare, Zap, Shield, TrendingUp, Globe, Cpu } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <nav className="flex justify-between items-center mb-16">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-8 h-8 text-primary-600" />
                        <span className="text-2xl font-bold text-gray-900">AI Customer Service</span>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/login" className="btn-secondary">
                            Login
                        </Link>
                        <Link href="/demo" className="btn-primary">
                            Try Demo
                        </Link>
                    </div>
                </nav>

                <div className="max-w-4xl mx-auto text-center mb-20">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        Automate 80%+ of Customer Support with{' '}
                        <span className="text-primary-600">AI</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Enterprise-grade AI customer service system powered by Google Gemini.
                        Supporting Mobile Operators, Banks, Microfinance, Insurance & TV providers.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/signup" className="btn-primary text-lg px-8 py-3">
                            Get Started
                        </Link>
                        <Link href="/docs" className="btn-secondary text-lg px-8 py-3">
                            Documentation
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    <FeatureCard
                        icon={<Zap className="w-12 h-12 text-primary-600" />}
                        title="Lightning Fast"
                        description="Gemini Flash for instant responses. Handle 1000+ concurrent conversations."
                    />
                    <FeatureCard
                        icon={<Globe className="w-12 h-12 text-primary-600" />}
                        title="100+ Languages"
                        description="Native support for English, Bemba, Nyanja, and 100+ more languages."
                    />
                    <FeatureCard
                        icon={<Shield className="w-12 h-12 text-primary-600" />}
                        title="Enterprise Security"
                        description="Firebase authentication, encrypted data, PCI-DSS compliant."
                    />
                    <FeatureCard
                        icon={<Cpu className="w-12 h-12 text-primary-600" />}
                        title="AI-Powered"
                        description="Google Gemini 1.5 Pro with 2M token context for complex queries."
                    />
                    <FeatureCard
                        icon={<TrendingUp className="w-12 h-12 text-primary-600" />}
                        title="80% Cost Reduction"
                        description="Automated responses reduce customer service costs by 60-80%."
                    />
                    <FeatureCard
                        icon={<MessageSquare className="w-12 h-12 text-primary-600" />}
                        title="Omnichannel"
                        description="WhatsApp, SMS, Web Chat, Voice, Email - all in one platform."
                    />
                </div>

                {/* Industry Support */}
                <div className="bg-white rounded-2xl shadow-xl p-12 mb-20">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Built for Multiple Industries
                    </h2>
                    <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                        <IndustryBadge name="Mobile Operators" emoji="📱" />
                        <IndustryBadge name="Banking" emoji="🏦" />
                        <IndustryBadge name="Microfinance" emoji="💰" />
                        <IndustryBadge name="Insurance" emoji="🛡️" />
                        <IndustryBadge name="TV/Streaming" emoji="📺" />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-8 mb-20">
                    <StatCard number="80%" label="Automation Rate" />
                    <StatCard number="<2s" label="Avg Response Time" />
                    <StatCard number="99.9%" label="Uptime SLA" />
                    <StatCard number="10K+" label="Conversations/Day" />
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-12 text-center text-white">
                    <h2 className="text-4xl font-bold mb-4">
                        Ready to Transform Your Customer Service?
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Join leading businesses using AI to deliver exceptional customer experiences.
                    </p>
                    <Link href="/contact" className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors inline-block">
                        Contact Sales
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-400">
                        © 2025 AI Customer Service System. Powered by Google Gemini & Firebase.
                    </p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="card hover:shadow-lg transition-shadow">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
}

function IndustryBadge({ name, emoji }: { name: string; emoji: string }) {
    return (
        <div className="text-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 transition-colors">
            <div className="text-4xl mb-2">{emoji}</div>
            <div className="font-semibold text-gray-700">{name}</div>
        </div>
    );
}

function StatCard({ number, label }: { number: string; label: string }) {
    return (
        <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">{number}</div>
            <div className="text-gray-600">{label}</div>
        </div>
    );
}
