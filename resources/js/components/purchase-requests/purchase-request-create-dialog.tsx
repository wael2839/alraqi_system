import { useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

type CreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    storeUrl: string;
};

export function PurchaseRequestCreateDialog({
    open,
    onOpenChange,
    storeUrl,
}: CreateDialogProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        material: '',
        specifications: '',
        estimated_price: '',
        pickup_location: '',
        request_date: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(storeUrl, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    }

    function handleClose(open: boolean) {
        if (!open) {
            reset();
        }
        onOpenChange(open);
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-lg"
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>طلب شراء جديد</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="material">المادة *</Label>
                        <Input
                            id="material"
                            type="text"
                            value={data.material}
                            onChange={(e) => setData('material', e.target.value)}
                            placeholder="مثال: أسمنت"
                            required
                        />
                        <InputError message={errors.material} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="specifications">المواصفات</Label>
                        <textarea
                            id="specifications"
                            rows={3}
                            value={data.specifications}
                            onChange={(e) => setData('specifications', e.target.value)}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="تفاصيل إضافية"
                        />
                        <InputError message={errors.specifications} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="estimated_price">السعر التقديري</Label>
                        <Input
                            id="estimated_price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.estimated_price}
                            onChange={(e) => setData('estimated_price', e.target.value)}
                            placeholder="0.00"
                        />
                        <InputError message={errors.estimated_price} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="pickup_location">مكان الاستلام</Label>
                        <Input
                            id="pickup_location"
                            type="text"
                            value={data.pickup_location}
                            onChange={(e) => setData('pickup_location', e.target.value)}
                            placeholder="اختياري"
                        />
                        <InputError message={errors.pickup_location} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="request_date">تاريخ الاستلام</Label>
                        <Input
                            id="request_date"
                            type="date"
                            value={data.request_date}
                            onChange={(e) => setData('request_date', e.target.value)}
                        />
                        <InputError message={errors.request_date} />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'جاري الحفظ...' : 'حفظ الطلب'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleClose(false)}
                            disabled={processing}
                        >
                            إلغاء
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
