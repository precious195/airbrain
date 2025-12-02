import DocsSidebar from '@/components/docs/DocsSidebar';

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-white">
            <DocsSidebar />
            <main className="flex-1 max-w-4xl mx-auto px-8 py-12">
                <article className="prose prose-blue max-w-none">
                    {children}
                </article>
            </main>
        </div>
    );
}
