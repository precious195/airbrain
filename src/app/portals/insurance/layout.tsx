import PortalLayout from '@/components/portals/PortalLayout';

export default function InsurancePortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <PortalLayout industry="insurance">{children}</PortalLayout>;
}
