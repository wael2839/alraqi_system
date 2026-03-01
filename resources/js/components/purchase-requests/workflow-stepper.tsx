import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApprovalHistoryItem, WorkflowStepItem } from './types';

type WorkflowStepperProps = {
    steps: WorkflowStepItem[];
    currentStepId: number | null;
    approvalHistory?: ApprovalHistoryItem[];
    status?: string | null;
};

function formatDateTime(dateString: string): { date: string; time: string } {
    const d = new Date(dateString);
    return {
        date: d.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }),
        time: d.toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
        }),
    };
}

export function WorkflowStepper({ steps, currentStepId, approvalHistory = [], status }: WorkflowStepperProps) {
    const currentIndex = currentStepId
        ? steps.findIndex((s) => s.id === currentStepId)
        : -1;

    const isRejected = status?.includes('مرفوض') || status === 'rejected';
    const isCompleted = status?.includes('مكتمل') || status === 'completed';

    return (
        <div className="space-y-0">
            {steps.map((step, index) => {
                const approval = approvalHistory[index];
                const isDone = approval?.action_taken === 'approved';
                const isStepRejected = approval?.action_taken === 'rejected';
                const isCurrent = currentStepId !== null && step.id === currentStepId;
                const isPending = !approval && !isCurrent;

                return (
                    <div key={step.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    'flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                                    isDone && 'border-green-500 bg-green-500 text-white',
                                    isStepRejected && 'border-destructive bg-destructive text-white',
                                    isCurrent && !isStepRejected &&
                                        'border-primary bg-primary text-primary-foreground ring-4 ring-primary/20',
                                    isPending && 'border-muted-foreground/30 bg-muted/50 text-muted-foreground',
                                )}
                            >
                                {isDone ? (
                                    <Check className="size-5" />
                                ) : isStepRejected ? (
                                    <X className="size-5" />
                                ) : (
                                    index + 1
                                )}
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        'my-1 h-full w-0.5 rounded-full transition-colors',
                                        isDone ? 'bg-green-500' : isStepRejected ? 'bg-destructive' : 'bg-muted',
                                    )}
                                />
                            )}
                        </div>
                        <div className="flex-1 pb-6">
                            <p
                                className={cn(
                                    'font-semibold',
                                    isDone && 'text-green-600 dark:text-green-400',
                                    isStepRejected && 'text-destructive',
                                    isCurrent && !isStepRejected && 'text-primary',
                                    isPending && 'text-muted-foreground',
                                )}
                            >
                                {step.step_name}
                            </p>
                            {approval ? (
                                <div className="mt-1 space-y-0.5">
                                    <p className={cn(
                                        'text-sm',
                                        isDone ? 'text-green-600 dark:text-green-400' : 'text-destructive',
                                    )}>
                                        {isDone ? 'تمت الموافقة' : 'تم الرفض'} من قبل{' '}
                                        <span className="font-medium">
                                            {typeof approval.action_by === 'object'
                                                ? approval.action_by?.name
                                                : 'مستخدم'}
                                        </span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        بتاريخ {formatDateTime(approval.created_at).date} الساعة{' '}
                                        {formatDateTime(approval.created_at).time}
                                    </p>
                                    {approval.comment && (
                                        <p className="mt-1 text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
                                            السبب: {approval.comment}
                                        </p>
                                    )}
                                </div>
                            ) : isCurrent ? (
                                <p className="text-xs text-primary mt-0.5">
                                    في انتظار الموافقة
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    لم تصل بعد
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
            {isCompleted && currentStepId === null && !isRejected && (
                <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-green-500 bg-green-500 text-white">
                            <Check className="size-5" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-green-600 dark:text-green-400">
                            مكتمل
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                            تمت الموافقة على الطلب بالكامل
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
