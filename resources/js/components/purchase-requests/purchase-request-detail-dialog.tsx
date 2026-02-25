import {
    Calendar,
    CircleDollarSign,
    FileText,
    FileDown,
    MapPin,
    Package,
    Tag,
    User,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { PurchaseRequestDetail, WorkflowStepItem } from './types';
import { WorkflowStepper } from './workflow-stepper';

const STATUS_STYLES = {
    processing: 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400',
    rejected: 'border-destructive/50 bg-destructive/10 text-destructive',
    completed: 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400',
} as const;

function getStatusClass(status: string | null): string {
    if (!status) return '';
    const n = status.toLowerCase().trim();
    if (n === 'rejected' || n.includes('مرفوض')) return STATUS_STYLES.rejected;
    if (n === 'approved' || n.includes('مكتمل')) return STATUS_STYLES.completed;
    return STATUS_STYLES.processing;
}

function formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

type PurchaseRequestDetailDialogProps = {
    requestId: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function PurchaseRequestDetailDialog({
    requestId,
    open,
    onOpenChange,
}: PurchaseRequestDetailDialogProps) {
    const [state, setState] = useState<{
        loading: boolean;
        data: { request: PurchaseRequestDetail; workflowSteps: WorkflowStepItem[] } | null;
        error: string | null;
    }>({ loading: false, data: null, error: null });
    const requestIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!open) {
            requestIdRef.current = null;
            return;
        }
        if (requestId === null) return;
        requestIdRef.current = requestId;
        const id = requestId;
        queueMicrotask(() => setState({ loading: true, data: null, error: null }));
        fetch(`/purchase-requests/${id}`, {
            headers: { Accept: 'application/json' },
            credentials: 'include',
        })
            .then((res) => {
                if (!res.ok) throw new Error(res.status === 403 ? 'غير مصرح' : 'فشل تحميل البيانات');
                return res.json();
            })
            .then((json) => {
                if (requestIdRef.current !== id) return;
                setState({
                    loading: false,
                    data: { request: json.request, workflowSteps: json.workflowSteps ?? [] },
                    error: null,
                });
            })
            .catch((err) => {
                if (requestIdRef.current !== id) return;
                setState({
                    loading: false,
                    data: null,
                    error: err instanceof Error ? err.message : 'خطأ',
                });
            });
    }, [open, requestId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-h-[90vh] max-w-2xl overflow-y-auto sm:max-w-2xl"
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="sr-only">تفاصيل طلب الشراء</DialogTitle>
                </DialogHeader>

                {state.loading && (
                    <div className="flex min-h-[200px] items-center justify-center py-12">
                        <Spinner className="size-8 text-primary" />
                    </div>
                )}

                {state.error && (
                    <p className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
                        {state.error}
                    </p>
                )}

                {!state.loading && !state.error && state.data && (
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="secondary"
                                    className="font-mono font-bold tracking-wider text-primary bg-primary/10 border-primary/30"
                                >
                                    REQ-{String(state.data.request.id).padStart(4, '0')}
                                </Badge>
                                <Badge
                                    className={cn('rounded-full', getStatusClass(state.data.request.status))}
                                    variant="outline"
                                >
                                    {state.data.request.status ?? '—'}
                                </Badge>
                                <Button variant="outline" size="sm" asChild>
                                    <a
                                        href={`/purchase-requests/${state.data.request.id}/pdf`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <FileDown className="me-2 size-4" />
                                        تحميل PDF
                                    </a>
                                </Button>
                            </div>
                            <span className="text-sm text-muted-foreground">
                                المرحلة الحالية:{' '}
                                <span className="font-semibold text-foreground">
                                    {state.data.request.current_step?.step_name ?? '—'}
                                </span>
                            </span>
                        </div>

                        <Card className="py-4">
                            <CardHeader>
                                <CardTitle className="text-base">بيانات الطلب</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div className="flex gap-3">
                                    <Package className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            المادة / الصنف
                                        </p>
                                        <p className="font-medium">{state.data.request.material}</p>
                                    </div>
                                </div>
                                {state.data.request.specifications && (
                                    <div className="flex gap-3 sm:col-span-2">
                                        <FileText className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">
                                                المواصفات
                                            </p>
                                            <p className="text-sm">{state.data.request.specifications}</p>
                                        </div>
                                    </div>
                                )}
                                {state.data.request.estimated_price != null && (
                                    <div className="flex gap-3">
                                        <CircleDollarSign className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">
                                                السعر التقديري
                                            </p>
                                            <p className="font-medium">{state.data.request.estimated_price}</p>
                                        </div>
                                    </div>
                                )}
                                {state.data.request.pickup_location && (
                                    <div className="flex gap-3">
                                        <MapPin className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">
                                                مكان الاستلام
                                            </p>
                                            <p className="text-sm">{state.data.request.pickup_location}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <Calendar className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            تاريخ الطلب
                                        </p>
                                        <p className="font-medium">
                                            {formatDate(state.data.request.request_date)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <User className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            مقدم الطلب
                                        </p>
                                        <p className="font-medium">
                                            {state.data.request.requester?.name ?? '—'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Tag className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            القسم
                                        </p>
                                        <p className="font-medium">
                                            {state.data.request.requester?.department?.name_ar ?? '—'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="py-4">
                            <CardHeader>
                                <CardTitle className="text-base">مسار الموافقة</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <WorkflowStepper
                                    steps={state.data.workflowSteps}
                                    currentStepId={state.data.request.current_step_id}
                                />
                            </CardContent>
                        </Card>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
