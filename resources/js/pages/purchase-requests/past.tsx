import { PurchaseRequestsLayout } from '@/components/purchase-requests/purchase-requests-layout';
import type { PurchaseRequestListItem } from '@/components/purchase-requests/types';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'الطلبات السابقة', href: '/purchase-requests/past' },
];

export default function Past({
    purchaseRequests,
}: {
    purchaseRequests: PurchaseRequestListItem[];
}) {
    return (
        <PurchaseRequestsLayout
            title="الطلبات السابقة"
            description="طلبات وافقت عليها أو رفضتها سابقاً."
            breadcrumbs={breadcrumbs}
            purchaseRequests={purchaseRequests}
            emptyMessage="لا توجد طلبات سابقة وافقت عليها أو رفضتها."
        />
    );
}
