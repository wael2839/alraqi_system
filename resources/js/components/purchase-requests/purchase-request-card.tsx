import { Link } from '@inertiajs/react';
import { Calendar, Eye, Tag, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { PurchaseRequestListItem } from './types';

function formatRequestDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ar-EG');
}

const STATUS_STYLES = {
    processing: 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400',
    rejected: 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-500',
    completed: 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400',
} as const;

function getStatusBadgeVariantAndClass(status: string | null): {
    variant: 'outline' ;
    className?: string;
} {
    if (!status) return { variant: 'outline' };
    const normalized = status.toLowerCase().trim();
    const isRejected =
        normalized === 'rejected' || normalized === 'مرفوض' || normalized.includes('مرفوض');
    const isCompleted =
        normalized === 'approved' || normalized === 'مكتمل' || normalized.includes('مكتمل');
    if (isRejected) return { variant: 'outline', className: STATUS_STYLES.rejected };
    if (isCompleted) return { variant: 'outline', className: STATUS_STYLES.completed };
    return { variant: 'outline', className: STATUS_STYLES.processing };
}

type PurchaseRequestCardProps = {
    request: PurchaseRequestListItem;
    onRequestClick?: (id: number) => void;
};

export function PurchaseRequestCard({ request, onRequestClick }: PurchaseRequestCardProps) {
    const detailUrl = `/purchase-requests/${request.id}`;
    const statusStyle = getStatusBadgeVariantAndClass(request.status ?? null);

    const content = (
        <Card className="cursor-pointer border-primary/30 transition-all hover:bg-primary/5 hover:shadow-md group relative overflow-hidden">
                <div className="absolute end-0 top-0 bottom-0 w-1.5 bg-primary transition-all group-hover:w-2" />
                <CardContent className="flex flex-col  py-4 pe-6 ps-6 md:flex-row md:items-center">
                    <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="secondary" className="font-bold tracking-wider text-primary bg-primary/10 border-primary/30">
                                REQ-{String(request.id).padStart(4, '0')}
                            </Badge>
                            <h3 className="font-bold text-primary">{request.material}</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2">
                                <User size={16} />
                                {request.requester?.name ?? '—'}
                            </span>
                            <span className="flex items-center gap-2">
                                <Tag size={16} />
                                {request.requester?.department?.name_ar ?? '—'}
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar size={16} />
                                {formatRequestDate(request.request_date)}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-row  md:w-1/3 md:items-center md:justify-between gap-4 pe-4 mt-4 md:mt-0">
                        <div className="flex flex-row md:flex-col gap-2 items-center md:items-center w-[60%]">
                            <span className="text-xs font-bold uppercase text-muted-foreground">
                                المرحلة الحالية
                            </span>
                            <span className="text-sm font-semibold text-chart-3">
                                {request.current_step?.step_name ?? '—'}
                            </span>
                        </div>
                        <div className="flex items-center  gap-2 justify-end">
                            <Badge
                                className={cn('pb-1 px-2 rounded-full inline-flex items-center justify-center', statusStyle.className)}
                                variant={statusStyle.variant}
                            >
                               <p className="text-center"> {request.status ?? '—'}</p>
                            </Badge>
                            <span className="rounded-xl p-2 text-primary">
                                <Eye size={20} />
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
    );

    if (onRequestClick) {
        return (
            <div
                role="button"
                tabIndex={0}
                onClick={() => onRequestClick(request.id)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onRequestClick(request.id)}
                className="block outline-none"
            >
                {content}
            </div>
        );
    }

    return <Link href={detailUrl} className="block">{content}</Link>;
}
