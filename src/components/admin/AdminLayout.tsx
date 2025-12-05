'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import {
    LayoutDashboard,
    Building2,
    Users,
    Settings,
    LogOut,
    ShieldAlert,
    Activity,
    ScrollText,
    Key,
    FlaskConical
} from 'lucide-react';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/companies', label: 'Companies', icon: Building2 },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/test-mode', label: 'AI Test Mode', icon: FlaskConical },
        { href: '/admin/logs', label: 'Audit Logs', icon: ScrollText },
        { href: '/admin/api-keys', label: 'API Keys', icon: Key },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
    ];

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
        <div className="min-h-screen bg-background flex">
            {/* Background Effects */}
            <div className="fixed inset-0 gradient-mesh -z-10 opacity-30" />

            {/* Sidebar */}
            <aside className="w-72 glass-card m-4 mr-0 flex flex-col rounded-2xl overflow-hidden border-slate-700/50 bg-slate-900/90 text-slate-100">
                {/* Admin Header */}
                <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-700/50">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                            <ShieldAlert className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Platform Admin</h2>
                            <div className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-xs text-slate-400 font-mono">SYSTEM ONLINE</span>
                            </div>
                        </div>
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
                                    ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 border border-red-500/20 shadow-lg shadow-red-500/5'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User & Theme Section */}
                <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
                    <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-slate-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">Super Admin</p>
                            <p className="text-xs text-slate-500 truncate">root@platform.com</p>
                        </div>
                        <ThemeToggle />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-red-500/20"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Secure Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4">
                <div className="glass-card rounded-2xl p-8 min-h-full border-slate-200/50 dark:border-slate-700/50">
                    {children}
                </div>
            </main>
        </div>
    );
}
