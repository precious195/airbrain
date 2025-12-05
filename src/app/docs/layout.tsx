import DocsSidebar from '@/components/docs/DocsSidebar';

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 gradient-mesh -z-10" />
            <div className="noise" />

            <DocsSidebar />

            <main className="flex-1 max-w-5xl mx-auto px-8 py-12 relative z-10">
                <div className="animate-slide-up">
                    {children}
                </div>
            </main>
        </div>
    );
}
