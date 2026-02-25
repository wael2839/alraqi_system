import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowStepItem } from './types';

type WorkflowStepperProps = {
    steps: WorkflowStepItem[];
    currentStepId: number | null;
};

export function WorkflowStepper({ steps, currentStepId }: WorkflowStepperProps) {
    const currentIndex = currentStepId
        ? steps.findIndex((s) => s.id === currentStepId)
        : -1;

    return (
        <div className="space-y-0">
            {steps.map((step, index) => {
                const isDone = currentIndex >= 0 && index < currentIndex;
                const isCurrent = currentStepId !== null && step.id === currentStepId;
                const isPending = currentIndex >= 0 && index > currentIndex;

                return (
                    <div key={step.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    'flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                                    isDone && 'border-primary bg-primary text-primary-foreground',
                                    isCurrent &&
                                        'border-primary bg-primary text-primary-foreground ring-4 ring-primary/20',
                                    isPending && 'border-muted-foreground/30 bg-muted/50 text-muted-foreground',
                                )}
                            >
                                {isDone ? <Check className="size-5" /> : index + 1}
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        'mt-1 h-8 w-0.5 rounded-full transition-colors',
                                        isDone ? 'bg-primary' : 'bg-muted',
                                    )}
                                />
                            )}
                        </div>
                        <div className="flex-1 pb-6">
                            <p
                                className={cn(
                                    'font-semibold',
                                    isCurrent && 'text-primary',
                                    isPending && 'text-muted-foreground',
                                )}
                            >
                                {step.step_name}
                            </p>
                            {step.step_department && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    القسم: {step.step_department}
                                </p>
                            )}
                            {step.required_role && (
                                <p className="text-xs text-muted-foreground">
                                    الصلاحية: {step.required_role}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
