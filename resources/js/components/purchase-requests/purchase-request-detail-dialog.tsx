import { router } from '@inertiajs/react';
import {
    Calendar,
    Check,
    CircleDollarSign,
    FileDown,
    FileText,
    MapPin,
    Package,
    Tag,
    User,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ApprovalHistoryItem, PurchaseRequestDetail, WorkflowStepItem } from './types';
import { WorkflowStepper } from './workflow-stepper';
import { CommitteeSection } from './committee-section';
import { WinningOfferCard } from './winning-offer-card';

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
        data: {
            request: PurchaseRequestDetail;
            workflowSteps: WorkflowStepItem[];
            approvalHistory: ApprovalHistoryItem[];
            canApprove: boolean;
        } | null;
        error: string | null;
    }>({ loading: false, data: null, error: null });
    const requestIdRef = useRef<number | null>(null);

    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectComment, setRejectComment] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const handleApprove = () => {
        if (!state.data) return;
        setActionLoading(true);
        setActionError(null);

        router.post(
            `/purchase-requests/${state.data.request.id}/approve`,
            {},
            {
                onSuccess: () => {
                    onOpenChange(false);
                },
                onError: (errors) => {
                    setActionError(Object.values(errors)[0] as string || 'حدث خطأ أثناء الموافقة');
                },
                onFinish: () => {
                    setActionLoading(false);
                },
            },
        );
    };

    const handleReject = () => {
        if (!state.data || !rejectComment.trim()) return;
        setActionLoading(true);
        setActionError(null);

        router.post(
            `/purchase-requests/${state.data.request.id}/reject`,
            { comment: rejectComment },
            {
                onSuccess: () => {
                    setShowRejectDialog(false);
                    onOpenChange(false);
                },
                onError: (errors) => {
                    setActionError(errors.comment || Object.values(errors)[0] as string || 'حدث خطأ أثناء الرفض');
                },
                onFinish: () => {
                    setActionLoading(false);
                },
            },
        );
    };

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
                    data: {
                        request: json.request,
                        workflowSteps: json.workflowSteps ?? [],
                        approvalHistory: json.approvalHistory ?? [],
                        canApprove: json.canApprove ?? false,
                    },
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
                                    approvalHistory={state.data.approvalHistory}
                                    status={state.data.request.status}
                                />
                            </CardContent>
                        </Card>

                        <CommitteeSection
                            requestId={state.data.request.id}
                            currentStepDepartment={state.data.request.current_step?.step_department ?? null}
                            currentStepName={state.data.request.current_step?.step_name ?? null}
                        />

                        <WinningOfferCard
                            requestId={state.data.request.id}
                            winningOfferId={state.data.request.winning_offer_id ?? null}
                            committeeStatus={state.data.request.committee_status ?? null}
                        />

                        {state.data.canApprove && (
                            <Card className="border-primary/30 bg-primary/5 py-4">
                                <CardHeader>
                                    <CardTitle className="text-base">اتخاذ إجراء</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {actionError && (
                                        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                            {actionError}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            onClick={handleApprove}
                                            disabled={actionLoading}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            {actionLoading ? (
                                                <Spinner className="me-2 size-4" />
                                            ) : (
                                                <Check className="me-2 size-4" />
                                            )}
                                            موافقة
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setRejectComment('');
                                                setActionError(null);
                                                setShowRejectDialog(true);
                                            }}
                                            disabled={actionLoading}
                                            variant="destructive"
                                        >
                                            <X className="me-2 size-4" />
                                            رفض
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </DialogContent>

            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>رفض الطلب</DialogTitle>
                        <DialogDescription>
                            يرجى إدخال سبب رفض هذا الطلب
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {actionError && (
                            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                {actionError}
                            </p>
                        )}
                        <Textarea
                            placeholder="أدخل سبب الرفض..."
                            value={rejectComment}
                            onChange={(e) => setRejectComment(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setShowRejectDialog(false)}
                            disabled={actionLoading}
                        >
                            إلغاء
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={actionLoading || !rejectComment.trim()}
                        >
                            {actionLoading ? (
                                <Spinner className="me-2 size-4" />
                            ) : (
                                <X className="me-2 size-4" />
                            )}
                            تأكيد الرفض
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}
