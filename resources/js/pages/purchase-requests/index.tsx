import { PurchaseRequestsLayout } from '@/components/purchase-requests/purchase-requests-layout';
import type { PurchaseRequestListItem } from '@/components/purchase-requests/types';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'طلباتي', href: '/purchase-requests' },
];

export default function Index({
    purchaseRequests,
    status,
    storeUrl,
}: {
    purchaseRequests: PurchaseRequestListItem[];
    status?: string;
    storeUrl: string;
}) {
    return (
        <PurchaseRequestsLayout
            title="طلباتي"
            breadcrumbs={breadcrumbs}
            purchaseRequests={purchaseRequests}
            emptyMessage='لا توجد طلبات. اضغط "طلب شراء جديد" للبدء.'
            status={status}
            showCreateButton
            storeUrl={storeUrl}
        />
    );
}
