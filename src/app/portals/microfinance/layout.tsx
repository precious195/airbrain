import PortalLayout from '@/components/portals/PortalLayout';

export default function MicrofinancePortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <PortalLayout industry="microfinance">{children}</PortalLayout>;
}
