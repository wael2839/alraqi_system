import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { PurchaseRequestCreateDialog } from './purchase-request-create-dialog';
import { PurchaseRequestDetailDialog } from './purchase-request-detail-dialog';
import { PurchaseRequestList } from './purchase-request-list';
import type { PurchaseRequestListItem } from './types';

type PurchaseRequestsLayoutProps = {
    title: string;
    breadcrumbs: BreadcrumbItem[];
    purchaseRequests: PurchaseRequestListItem[];
    emptyMessage: string;
    status?: string;
    description?: string;
    showCreateButton?: boolean;
    storeUrl?: string;
};

export function PurchaseRequestsLayout({
    title,
    breadcrumbs,
    purchaseRequests,
    emptyMessage,
    status,
    description,
    showCreateButton = false,
    storeUrl,
}: PurchaseRequestsLayoutProps) {
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <PurchaseRequestDetailDialog
                requestId={selectedRequestId}
                open={selectedRequestId !== null}
                onOpenChange={(open) => !open && setSelectedRequestId(null)}
            />
            {showCreateButton && storeUrl && (
                <PurchaseRequestCreateDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                    storeUrl={storeUrl}
                />
            )}

            <div className="flex h-full flex-1 flex-col gap-4 ">
                {status && (
                    <p className="rounded-lg bg-primary/10 p-3 text-sm text-primary">
                        {status}
                    </p>
                )}

                <div className="flex flex-wrap px-4 pt-4 items-center justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-semibold">{title}</h1>
                        {description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                    {showCreateButton && storeUrl && (
                        <Button onClick={() => setCreateDialogOpen(true)}>
                            <Plus className="me-2 size-4" />
                            طلب شراء جديد
                        </Button>
                    )}
                </div>

                <PurchaseRequestList
                    requests={purchaseRequests}
                    emptyMessage={emptyMessage}
                    onRequestClick={setSelectedRequestId}
                />
            </div>
        </AppLayout>
    );
}
