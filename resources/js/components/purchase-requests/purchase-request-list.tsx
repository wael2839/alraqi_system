import type { PurchaseRequestListItem } from './types';
import { PurchaseRequestCard } from './purchase-request-card';

type PurchaseRequestListProps = {
    requests: PurchaseRequestListItem[];
    emptyMessage: string;
    onRequestClick?: (id: number) => void;
};

export function PurchaseRequestList({
    requests,
    emptyMessage,
    onRequestClick,
}: PurchaseRequestListProps) {
    if (requests.length === 0) {
        return (
            <p className="p-6 text-center text-muted-foreground">
                {emptyMessage}
            </p>
        );
    }

    return (
        <div className="space-y-3 px-4 overflow-hidden">
            {requests.map((request) => (
                <PurchaseRequestCard
                    key={request.id}
                    request={request}
                    onRequestClick={onRequestClick}
                />
            ))}
        </div>
    );
}
