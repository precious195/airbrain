import PortalLayout from '@/components/portals/PortalLayout';

export default function TelevisionPortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <PortalLayout industry="television">{children}</PortalLayout>;
}
