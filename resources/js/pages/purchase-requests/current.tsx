import { PurchaseRequestsLayout } from '@/components/purchase-requests/purchase-requests-layout';
import type { PurchaseRequestListItem } from '@/components/purchase-requests/types';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'الطلبات الحالية', href: '/purchase-requests/current' },
];

export default function Current({
    purchaseRequests,
}: {
    purchaseRequests: PurchaseRequestListItem[];
}) {
    return (
        <PurchaseRequestsLayout
            title="الطلبات الحالية"
            description="طلبات تتطلب موافقتك حسب صلاحياتك وقسمك."
            breadcrumbs={breadcrumbs}
            purchaseRequests={purchaseRequests}
            emptyMessage="لا توجد طلبات حالية تتطلب موافقتك."
        />
    );
}
