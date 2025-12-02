'use client';

import { ReactNode, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    Database,
    BarChart3,
    Settings,
    ArrowLeft,
    Book
} from 'lucide-react';

// Industry type and context
export type IndustryType = 'mobile' | 'banking' | 'insurance' | 'microfinance' | 'television';

interface IndustryConfig {
    id: IndustryType;
    name: string;
    color: string;
    bgColor: string;
}

const industryConfigs: Record<IndustryType, IndustryConfig> = {
    mobile: {
        id: 'mobile',
        name: 'Mobile Telecom',
        color: 'text-blue-600',
        bgColor: 'bg-blue-600'
    },
    banking: {
        id: 'banking',
        name: 'Banking',
        color: 'text-green-600',
        bgColor: 'bg-green-600'
    },
    insurance: {
        id: 'insurance',
        name: 'Insurance',
        color: 'text-purple-600',
        bgColor: 'bg-purple-600'
    },
    microfinance: {
        id: 'microfinance',
        name: 'Microfinance',
        color: 'text-orange-600',
        bgColor: 'bg-orange-600'
    },
    television: {
        id: 'television',
        name: 'Television',
        color: 'text-pink-600',
        bgColor: 'bg-pink-600'
    }
};

const IndustryContext = createContext<IndustryConfig | null>(null);

export function useIndustry() {
    const context = useContext(IndustryContext);
    if (!context) {
        throw new Error('useIndustry must be used within PortalLayout');
    }
    return context;
}

interface PortalLayoutProps {
    children: ReactNode;
    industry: IndustryType;
}

export default function PortalLayout({ children, industry }: PortalLayoutProps) {
    const config = industryConfigs[industry];
    const pathname = usePathname();

    const navItems = [
        { href: `/portals/${industry}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
        { href: `/portals/${industry}/customers`, label: 'Customers', icon: Users },
        { href: `/portals/${industry}/conversations`, label: 'Conversations', icon: MessageSquare },
        { href: `/portals/${industry}/data`, label: 'Data Management', icon: Database },
        { href: `/portals/${industry}/knowledge`, label: 'Knowledge Base', icon: Book },
        { href: `/portals/${industry}/analytics`, label: 'Analytics', icon: BarChart3 },
        { href: `/portals/${industry}/settings`, label: 'Settings', icon: Settings },
    ];

    return (
        <IndustryContext.Provider value={config}>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-lg flex flex-col">
                    {/* Portal Header */}
                    <div className={`${config.bgColor} p-6 text-white`}>
                        <Link href="/portals" className="flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 transition">
                            <ArrowLeft className="w-4 h-4" />
                            All Portals
                        </Link>
                        <h2 className="text-xl font-bold">{config.name}</h2>
                        <p className="text-white/90 text-sm mt-1">Industry Portal</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? `${config.bgColor} text-white`
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="text-xs text-gray-500 text-center">
                            AI Customer Service
                            <br />
                            <span className="font-semibold">v1.0.0</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </IndustryContext.Provider>
    );
}
