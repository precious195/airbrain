import PortalLayout from '@/components/portals/PortalLayout';

export default function MobilePortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <PortalLayout industry="mobile">{children}</PortalLayout>;
}
