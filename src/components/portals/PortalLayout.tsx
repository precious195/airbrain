'use client';

import { ReactNode, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import OTPNotification from '@/components/otp/OTPNotification';
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    Database,
    BarChart3,
    Settings,
    ArrowLeft,
    Book,
    Plug,
    LogOut,
    UserCircle
} from 'lucide-react';

// Industry type and context
export type IndustryType = 'mobile' | 'banking' | 'insurance' | 'microfinance' | 'television';

interface IndustryConfig {
    id: IndustryType;
    name: string;
    color: string;
    bgColor: string;
    gradient: string;
    lightGradient: string;
}

const industryConfigs: Record<IndustryType, IndustryConfig> = {
    mobile: {
        id: 'mobile',
        name: 'Mobile Telecom',
        color: 'text-blue-500',
        bgColor: 'bg-blue-600',
        gradient: 'from-blue-600 via-blue-500 to-cyan-500',
        lightGradient: 'from-blue-500/20 to-cyan-500/20'
    },
    banking: {
        id: 'banking',
        name: 'Banking',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-600',
        gradient: 'from-emerald-600 via-green-500 to-teal-500',
        lightGradient: 'from-emerald-500/20 to-teal-500/20'
    },
    insurance: {
        id: 'insurance',
        name: 'Insurance',
        color: 'text-purple-500',
        bgColor: 'bg-purple-600',
        gradient: 'from-purple-600 via-violet-500 to-indigo-500',
        lightGradient: 'from-purple-500/20 to-indigo-500/20'
    },
    microfinance: {
        id: 'microfinance',
        name: 'Microfinance',
        color: 'text-orange-500',
        bgColor: 'bg-orange-600',
        gradient: 'from-orange-600 via-amber-500 to-yellow-500',
        lightGradient: 'from-orange-500/20 to-yellow-500/20'
    },
    television: {
        id: 'television',
        name: 'Television',
        color: 'text-pink-500',
        bgColor: 'bg-pink-600',
        gradient: 'from-pink-600 via-rose-500 to-red-500',
        lightGradient: 'from-pink-500/20 to-rose-500/20'
    }
};

const IndustryContext = createContext<IndustryConfig | null>(null);

export interface CompanyContextType {
    id: string;
    name: string;
    industry: IndustryType;
}

const CompanyContext = createContext<CompanyContextType | null>(null);

export function useIndustry() {
    const context = useContext(IndustryContext);
    if (!context) {
        throw new Error('useIndustry must be used within PortalLayout');
    }
    return context;
}

export function useCompany() {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error('useCompany must be used within PortalLayout');
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
    const router = useRouter();

    const navItems = [
        { href: `/portals/${industry}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
        { href: `/portals/${industry}/customers`, label: 'Customers', icon: Users },
        { href: `/portals/${industry}/conversations`, label: 'Conversations', icon: MessageSquare },
        { href: `/portals/${industry}/data`, label: 'Data Management', icon: Database },
        { href: `/portals/${industry}/knowledge`, label: 'Knowledge Base', icon: Book },
        { href: `/portals/${industry}/integration`, label: 'System Integration', icon: Plug },
        { href: `/portals/${industry}/analytics`, label: 'Analytics', icon: BarChart3 },
        { href: `/portals/${industry}/settings`, label: 'Settings', icon: Settings },
    ];

    const defaultCompany: CompanyContextType = {
        id: 'comp_default',
        name: `${config.name} Demo Company`,
        industry: industry
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <IndustryContext.Provider value={config}>
            <CompanyContext.Provider value={defaultCompany}>
                <div className="min-h-screen bg-background flex">
                    {/* Background Effects */}
                    <div className="fixed inset-0 gradient-mesh -z-10 opacity-50" />

                    {/* Sidebar */}
                    <aside className="w-72 glass-card m-4 mr-0 flex flex-col rounded-2xl overflow-hidden">
                        {/* Portal Header with Gradient */}
                        <div className={`relative p-6 bg-gradient-to-br ${config.gradient}`}>
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

                            <div className="relative z-10">
                                <Link
                                    href="/login"
                                    className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition group"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    Switch Portal
                                </Link>
                                <h2 className="text-2xl font-bold text-white">{config.name}</h2>
                                <p className="text-white/80 text-sm mt-1">{defaultCompany.name}</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                            ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg`
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User & Theme Section */}
                        <div className="p-4 border-t border-border/50">
                            <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-muted/50">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                                    <UserCircle className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">Admin User</p>
                                    <p className="text-xs text-muted-foreground truncate">admin@{industry}.com</p>
                                </div>
                                <ThemeToggle />
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-border/50">
                            <div className="text-xs text-muted-foreground text-center">
                                AI Customer Service
                                <br />
                                <span className="font-semibold">v1.0.0</span>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 overflow-auto p-4">
                        <div className="glass-card rounded-2xl p-8 min-h-full">
                            {children}
                        </div>
                    </main>
                </div>

                {/* OTP Notification Popup */}
                <OTPNotification companyId={defaultCompany.id} />
            </CompanyContext.Provider>
        </IndustryContext.Provider>
    );
}
