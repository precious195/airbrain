'use client';

import Link from 'next/link';
import { MessageSquare, Zap, Shield, TrendingUp, Globe, Cpu, ArrowRight, Sparkles, Phone, Mail, Facebook } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useEffect, useState } from 'react';

export default function HomePage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-background overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 gradient-mesh -z-10" />
            <div className="noise" />

            {/* Floating Orbs */}
            <div className="fixed top-20 left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-float opacity-50 dark:opacity-30" />
            <div className="fixed top-40 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-delayed opacity-50 dark:opacity-20" />
            <div className="fixed bottom-20 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-float opacity-40 dark:opacity-20" />

            {/* Navigation */}
            <nav className="relative z-50">
                <div className="container mx-auto px-6 py-6">
                    <div className="glass-card px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">AI Customer Service</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <Link href="/login" className="btn-secondary">
                                <span>Login</span>
                            </Link>
                            <Link href="/demo" className="btn-primary">
                                <span>Try Demo</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 container mx-auto px-6 pt-20 pb-32">
                <div className="max-w-5xl mx-auto text-center perspective-1000">
                    <div className={`${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">Powered by Google Gemini AI</span>
                        </div>
                    </div>

                    <h1 className={`text-5xl md:text-7xl font-bold mb-8 leading-tight ${mounted ? 'animate-slide-up stagger-1' : 'opacity-0'}`}>
                        Automate 80%+ of<br />
                        Customer Support with<br />
                        <span className="gradient-text">Intelligent AI</span>
                    </h1>

                    <p className={`text-xl text-muted-foreground mb-12 max-w-2xl mx-auto ${mounted ? 'animate-slide-up stagger-2' : 'opacity-0'}`}>
                        Enterprise-grade AI customer service for Mobile Operators, Banks,
                        Microfinance, Insurance & TV providers across Africa.
                    </p>

                    <div className={`flex gap-4 justify-center ${mounted ? 'animate-slide-up stagger-3' : 'opacity-0'}`}>
                        <Link href="/signup" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
                            <span>Get Started Free</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/docs" className="btn-secondary text-lg px-8 py-4">
                            <span>Documentation</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid - 3D Cards */}
            <section className="relative z-10 container mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">
                        Why Choose <span className="gradient-text">Our Platform</span>
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Built for scale, designed for Africa
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Zap className="w-8 h-8" />}
                        title="Lightning Fast"
                        description="Gemini Flash for instant responses. Handle 1000+ concurrent conversations."
                        gradient="from-yellow-500 to-orange-500"
                        delay="stagger-1"
                    />
                    <FeatureCard
                        icon={<Globe className="w-8 h-8" />}
                        title="100+ Languages"
                        description="Native support for English, Bemba, Nyanja, and 100+ more languages."
                        gradient="from-blue-500 to-cyan-500"
                        delay="stagger-2"
                    />
                    <FeatureCard
                        icon={<Shield className="w-8 h-8" />}
                        title="Enterprise Security"
                        description="Firebase authentication, encrypted data, PCI-DSS compliant."
                        gradient="from-green-500 to-emerald-500"
                        delay="stagger-3"
                    />
                    <FeatureCard
                        icon={<Cpu className="w-8 h-8" />}
                        title="AI-Powered"
                        description="Google Gemini 1.5 Pro with 2M token context for complex queries."
                        gradient="from-purple-500 to-pink-500"
                        delay="stagger-4"
                    />
                    <FeatureCard
                        icon={<TrendingUp className="w-8 h-8" />}
                        title="80% Cost Reduction"
                        description="Automated responses reduce customer service costs by 60-80%."
                        gradient="from-indigo-500 to-purple-500"
                        delay="stagger-5"
                    />
                    <FeatureCard
                        icon={<MessageSquare className="w-8 h-8" />}
                        title="Omnichannel"
                        description="WhatsApp, SMS, Web Chat, Voice, Email - all in one platform."
                        gradient="from-pink-500 to-rose-500"
                        delay="stagger-6"
                    />
                </div>
            </section>

            {/* Channel Integration Section */}
            <section className="relative z-10 container mx-auto px-6 py-20">
                <div className="glass-card p-12 perspective-1000">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">
                            One Platform, <span className="gradient-text">Every Channel</span>
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Connect with your customers wherever they are
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <ChannelCard icon="whatsapp" name="WhatsApp" color="bg-green-500" />
                        <ChannelCard icon="facebook" name="Facebook" color="bg-blue-600" />
                        <ChannelCard icon="email" name="Email" color="bg-purple-500" />
                        <ChannelCard icon="phone" name="Voice AI" color="bg-orange-500" />
                    </div>
                </div>
            </section>

            {/* Industry Support - Floating 3D Cards */}
            <section className="relative z-10 container mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">
                        Built for <span className="gradient-text">Multiple Industries</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <IndustryCard name="Mobile Operators" emoji="📱" gradient="from-blue-600 to-blue-400" />
                    <IndustryCard name="Banking" emoji="🏦" gradient="from-green-600 to-green-400" />
                    <IndustryCard name="Microfinance" emoji="💰" gradient="from-orange-600 to-orange-400" />
                    <IndustryCard name="Insurance" emoji="🛡️" gradient="from-purple-600 to-purple-400" />
                    <IndustryCard name="TV/Streaming" emoji="📺" gradient="from-pink-600 to-pink-400" />
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative z-10 container mx-auto px-6 py-20">
                <div className="grid md:grid-cols-4 gap-8">
                    <StatCard number="80%" label="Automation Rate" delay={0} />
                    <StatCard number="<2s" label="Avg Response Time" delay={1} />
                    <StatCard number="99.9%" label="Uptime SLA" delay={2} />
                    <StatCard number="10K+" label="Conversations/Day" delay={3} />
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 container mx-auto px-6 py-20">
                <div className="animated-border">
                    <div className="p-12 md:p-16 text-center">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Ready to Transform Your<br />
                            <span className="gradient-text">Customer Service?</span>
                        </h2>
                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                            Join leading businesses using AI to deliver exceptional customer experiences.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Link href="/signup" className="btn-primary text-lg px-10 py-4">
                                <span>Start Free Trial</span>
                            </Link>
                            <Link href="/contact" className="btn-secondary text-lg px-10 py-4">
                                <span>Contact Sales</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-border/50">
                <div className="container mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold">AI Customer Service</span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            © 2025 AI Customer Service System. Powered by Google Gemini & Firebase.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description, gradient, delay }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    gradient: string;
    delay: string;
}) {
    return (
        <div className={`card-3d glass-card p-8 group animate-slide-up ${delay}`}>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}

function ChannelCard({ icon, name, color }: { icon: string; name: string; color: string }) {
    const Icon = icon === 'whatsapp' ? MessageSquare :
        icon === 'facebook' ? Facebook :
            icon === 'email' ? Mail : Phone;

    return (
        <div className="card-3d glass p-6 text-center group">
            <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-8 h-8 text-white" />
            </div>
            <div className="font-semibold">{name}</div>
        </div>
    );
}

function IndustryCard({ name, emoji, gradient }: { name: string; emoji: string; gradient: string }) {
    return (
        <div className="card-3d glass-card p-6 text-center group animate-float">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-4 text-4xl group-hover:scale-110 transition-transform duration-300`}>
                {emoji}
            </div>
            <div className="font-semibold text-sm">{name}</div>
        </div>
    );
}

function StatCard({ number, label, delay }: { number: string; label: string; delay: number }) {
    return (
        <div className="glass-card p-8 text-center animate-tilt" style={{ animationDelay: `${delay * 0.2}s` }}>
            <div className="text-5xl font-bold gradient-text mb-3">{number}</div>
            <div className="text-muted-foreground">{label}</div>
        </div>
    );
}
