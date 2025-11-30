// src/app/(dashboard)/layout.tsx
import Link from 'next/link';
import { LayoutDashboard, MessageSquare, Ticket, Settings, BarChart } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg">
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary-600">
                        <MessageSquare className="w-6 h-6" />
                        AI Customer Service
                    </Link>
                </div>

                <nav className="px-4 space-y-2">
                    <NavLink href="/dashboard" icon={<LayoutDashboard />}>
                        Dashboard
                    </NavLink>
                    <NavLink href="/dashboard/conversations" icon={<MessageSquare />}>
                        Conversations
                    </NavLink>
                    <NavLink href="/dashboard/tickets" icon={<Ticket />}>
                        Tickets
                    </NavLink>
                    <NavLink href="/dashboard/analytics" icon={<BarChart />}>
                        Analytics
                    </NavLink>
                    <NavLink href="/dashboard/settings" icon={<Settings />}>
                        Settings
                    </NavLink>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}

function NavLink({
    href,
    icon,
    children,
}: {
    href: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
        >
            <span className="w-5 h-5">{icon}</span>
            <span className="font-medium">{children}</span>
        </Link>
    );
}
