'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Book, Code, Settings, MessageSquare, Shield, Zap, Sparkles } from 'lucide-react';

export default function DocsSidebar() {
    const pathname = usePathname();

    const sections = [
        {
            title: 'Getting Started',
            items: [
                { href: '/docs', label: 'Introduction', icon: Sparkles },
                { href: '/docs/quickstart', label: 'Quick Start Guide', icon: Zap },
                { href: '/docs/architecture', label: 'Platform Architecture', icon: Code },
            ]
        },
        {
            title: 'Core Features',
            items: [
                { href: '/docs/conversations', label: 'AI Conversations', icon: MessageSquare },
                { href: '/docs/knowledge-base', label: 'Knowledge Base', icon: Book },
                { href: '/docs/integrations', label: 'System Integrations', icon: Settings },
            ]
        },
        {
            title: 'Security & Privacy',
            items: [
                { href: '/docs/security', label: 'Data Security', icon: Shield },
                { href: '/docs/compliance', label: 'Compliance', icon: Shield },
            ]
        }
    ];

    return (
        <aside className="w-72 h-screen sticky top-0 overflow-y-auto hidden md:block p-4">
            <div className="glass-card h-full flex flex-col rounded-2xl overflow-hidden border-border/50">
                <div className="p-6 border-b border-border/50 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Book className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg gradient-text">AirBrain Docs</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-8 overflow-y-auto custom-scrollbar">
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                                {section.title}
                            </h3>
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${isActive
                                                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 font-medium border border-blue-500/20'
                                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-muted-foreground'}`} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>
        </aside>
    );
}
