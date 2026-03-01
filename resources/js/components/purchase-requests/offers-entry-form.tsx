import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { FileText, Plus, Loader2, AlertCircle, Check, X } from 'lucide-react';
import { PriceOffer } from './types';

type Props = {
    requestId: number;
    existingOffers: PriceOffer[];
    canStartVoting: boolean;
    onSuccess?: () => void;
};

export function OffersEntryForm({ requestId, existingOffers, canStartVoting, onSuccess }: Props) {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [startingVote, setStartingVote] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        vendor_name: '',
        offer_amount: '',
        delivery_period: '',
        payment_method: '',
        meets_specifications: true,
        notes: '',
    });

    const resetForm = () => {
        setFormData({
            vendor_name: '',
            offer_amount: '',
            delivery_period: '',
            payment_method: '',
            meets_specifications: true,
            notes: '',
        });
        setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        router.post(
            `/purchase-requests/${requestId}/committee/offers`,
            {
                ...formData,
                offer_amount: parseFloat(formData.offer_amount),
            },
            {
                onSuccess: () => {
                    setSubmitting(false);
                    setOpen(false);
                    resetForm();
                    onSuccess?.();
                },
                onError: (errors) => {
                    setSubmitting(false);
                    setError(Object.values(errors).flat().join(', '));
                },
            }
        );
    };

    const handleStartVoting = () => {
        setStartingVote(true);
        router.post(`/purchase-requests/${requestId}/committee/start-voting`, {}, {
            onSuccess: () => {
                setStartingVote(false);
                onSuccess?.();
            },
            onError: (errors) => {
                setStartingVote(false);
                setError(Object.values(errors).flat().join(', '));
            },
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        عروض الأسعار ({existingOffers.length})
                    </span>
                    <div className="flex gap-2">
                        {canStartVoting && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleStartVoting}
                                disabled={startingVote}
                            >
                                {startingVote && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                بدء التصويت
                            </Button>
                        )}
                        <Dialog open={open} onOpenChange={(isOpen) => {
                            setOpen(isOpen);
                            if (!isOpen) resetForm();
                        }}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Plus className="ml-1 h-4 w-4" />
                                    إضافة عرض
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Plus className="h-5 w-5" />
                                        إضافة عرض سعر جديد
                                    </DialogTitle>
                                    <DialogDescription>
                                        أدخل بيانات العرض المقدم من المورد
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                    {error && (
                                        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                            <AlertCircle className="h-4 w-4" />
                                            {error}
                                        </div>
                                    )}

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="vendor_name">اسم المورد *</Label>
                                            <Input
                                                id="vendor_name"
                                                value={formData.vendor_name}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, vendor_name: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="offer_amount">السعر الإجمالي *</Label>
                                            <Input
                                                id="offer_amount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.offer_amount}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, offer_amount: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="delivery_period">مدة التسليم</Label>
                                            <Input
                                                id="delivery_period"
                                                value={formData.delivery_period}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, delivery_period: e.target.value })
                                                }
                                                placeholder="مثال: 15 يوم"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="payment_method">طريقة الدفع</Label>
                                            <Input
                                                id="payment_method"
                                                value={formData.payment_method}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, payment_method: e.target.value })
                                                }
                                                placeholder="مثال: نقدي / آجل"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Switch
                                            id="meets_specifications"
                                            checked={formData.meets_specifications}
                                            onCheckedChange={(checked) =>
                                                setFormData({ ...formData, meets_specifications: checked })
                                            }
                                        />
                                        <Label htmlFor="meets_specifications">
                                            مطابق للمواصفات الفنية
                                        </Label>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">ملاحظات</Label>
                                        <Textarea
                                            id="notes"
                                            value={formData.notes}
                                            onChange={(e) =>
                                                setFormData({ ...formData, notes: e.target.value })
                                            }
                                            rows={2}
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setOpen(false)}
                                        >
                                            إلغاء
                                        </Button>
                                        <Button type="submit" disabled={submitting}>
                                            {submitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                            حفظ العرض
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && !open && (
                    <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                {existingOffers.length > 0 ? (
                    <div className="space-y-2">
                        {existingOffers.map((offer) => (
                            <div
                                key={offer.id}
                                className="rounded-lg border p-3"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-medium">{offer.vendor_name}</div>
                                        <div className="text-muted-foreground text-sm">
                                            السعر: {Number(offer.offer_amount).toLocaleString()} ريال
                                        </div>
                                        {offer.delivery_period && (
                                            <div className="text-muted-foreground text-xs">
                                                مدة التسليم: {offer.delivery_period}
                                            </div>
                                        )}
                                        {offer.payment_method && (
                                            <div className="text-muted-foreground text-xs">
                                                طريقة الدفع: {offer.payment_method}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {offer.meets_specifications ? (
                                            <span className="flex items-center gap-1 text-xs text-green-600">
                                                <Check className="h-3 w-3" />
                                                مطابق
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs text-red-600">
                                                <X className="h-3 w-3" />
                                                غير مطابق
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {offer.notes && (
                                    <div className="text-muted-foreground mt-2 text-xs">
                                        ملاحظات: {offer.notes}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground py-4 text-center text-sm">
                        لا توجد عروض حتى الآن
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
