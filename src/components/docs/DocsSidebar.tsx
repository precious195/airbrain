'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Book, Code, Settings, MessageSquare, Shield, Zap } from 'lucide-react';

export default function DocsSidebar() {
    const pathname = usePathname();

    const sections = [
        {
            title: 'Getting Started',
            items: [
                { href: '/docs', label: 'Introduction', icon: Book },
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
        <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto hidden md:block">
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2 mb-8">
                    <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                        <Book className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-gray-900 text-lg">AirBrain Docs</span>
                </Link>

                <nav className="space-y-8">
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
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
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
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
