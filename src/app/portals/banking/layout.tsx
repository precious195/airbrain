import PortalLayout from '@/components/portals/PortalLayout';

export default function BankingPortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <PortalLayout industry="banking">{children}</PortalLayout>;
}
