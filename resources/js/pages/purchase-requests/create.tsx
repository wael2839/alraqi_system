import { Form, Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'طلبات الشراء', href: '/purchase-requests' },
    { title: 'طلب شراء جديد', href: '/purchase-requests/create' },
];

export default function Create({ storeUrl }: { storeUrl: string }) {
    const { errors } = usePage().props as { errors?: Record<string, string> };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="طلب شراء جديد" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Heading
                    variant="small"
                    title="طلب شراء جديد"
                    description="أدخل بيانات الطلب ثم احفظ."
                />

                <Form
                    action={storeUrl}
                    method="post"
                    className="max-w-xl space-y-6"
                    preserveScroll
                >
                    <div className="grid gap-2">
                        <Label htmlFor="material">المادة *</Label>
                        <Input
                            id="material"
                            name="material"
                            type="text"
                            className="w-full"
                            placeholder="مثال: أسمنت"
                            required
                        />
                        <InputError message={errors?.material} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="specifications">المواصفات</Label>
                        <textarea
                            id="specifications"
                            name="specifications"
                            rows={3}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="تفاصيل إضافية"
                        />
                        <InputError message={errors?.specifications} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="estimated_price">السعر التقديري</Label>
                        <Input
                            id="estimated_price"
                            name="estimated_price"
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full"
                            placeholder="0.00"
                        />
                        <InputError message={errors?.estimated_price} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="pickup_location">مكان الاستلام</Label>
                        <Input
                            id="pickup_location"
                            name="pickup_location"
                            type="text"
                            className="w-full"
                            placeholder="اختياري"
                        />
                        <InputError message={errors?.pickup_location} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="request_date">تاريخ الاستلام</Label>
                        <Input
                            id="request_date"
                            name="request_date"
                            type="date"
                            className="w-full"
                        />
                        <InputError message={errors?.request_date} />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit">حفظ الطلب</Button>
                        <Button type="button" variant="outline" asChild>
                            <a href="/purchase-requests">إلغاء</a>
                        </Button>
                    </div>
                </Form>
            </div>
        </AppLayout>
    );
}