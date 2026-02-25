import { Head, usePage } from '@inertiajs/react';
import { ClipboardList, LayoutDashboard, ShoppingCart } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'لوحة التحكم',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const { auth } = usePage().props as { auth: { user?: { name?: string | null } } };
    const userName = auth.user?.name ?? 'مستخدم';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="لوحة التحكم" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <header className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">لوحة التحكم</h1>
                    <p className="text-muted-foreground text-sm">
                        مرحباً، {userName}. نظرة عامة على نشاطك.
                    </p>
                </header>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card className="overflow-hidden transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                ملخص الطلبات
                            </CardTitle>
                            <ShoppingCart className="size-4 shrink-0 opacity-60" />
                        </CardHeader>
                        <CardContent>
                            <div className="relative h-24 overflow-hidden rounded-lg border border-dashed">
                                <PlaceholderPattern className="absolute inset-0 size-full opacity-40" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                الطلبات الحالية
                            </CardTitle>
                            <ClipboardList className="size-4 shrink-0 opacity-60" />
                        </CardHeader>
                        <CardContent>
                            <div className="relative h-24 overflow-hidden rounded-lg border border-dashed">
                                <PlaceholderPattern className="absolute inset-0 size-full opacity-40" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden transition-shadow hover:shadow-md sm:col-span-2 lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                نظرة عامة
                            </CardTitle>
                            <LayoutDashboard className="size-4 shrink-0 opacity-60" />
                        </CardHeader>
                        <CardContent>
                            <div className="relative h-24 overflow-hidden rounded-lg border border-dashed">
                                <PlaceholderPattern className="absolute inset-0 size-full opacity-40" />
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <Card className="overflow-hidden transition-shadow hover:shadow-md">
                        <CardHeader className="space-y-0 pb-2">
                            <CardTitle className="text-base">النشاط الأخير</CardTitle>
                            <p className="text-muted-foreground text-sm">
                                أحدث التحديثات والطلبات
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="relative min-h-[200px] overflow-hidden rounded-lg border border-dashed">
                                <PlaceholderPattern className="absolute inset-0 size-full opacity-30" />
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </AppLayout>
    );
}
