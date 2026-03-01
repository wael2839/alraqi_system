import { Head, usePage } from '@inertiajs/react';
import { CheckCircle, ClipboardList, Clock, ShoppingCart, UserCheck, Users, XCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'لوحة التحكم',
        href: dashboard().url,
    },
];

type Stats = {
    totalRequests: number;
    completedRequests: number;
    rejectedRequests: number;
    pendingRequests: number;
    totalEmployees: number;
    inactiveEmployees: number;
};

export default function Dashboard() {
    const { auth, stats } = usePage().props as {
        auth: { user?: { name?: string | null } };
        stats: Stats;
    };
    const userName = auth.user?.name ?? 'مستخدم';

    const statCards = [
        {
            title: 'إجمالي الطلبات',
            value: stats.totalRequests,
            icon: ShoppingCart,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        },
        {
            title: 'الطلبات المكتملة',
            value: stats.completedRequests,
            icon: CheckCircle,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
        },
        {
            title: 'الطلبات المرفوضة',
            value: stats.rejectedRequests,
            icon: XCircle,
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-100 dark:bg-red-900/30',
        },
        {
            title: 'قيد المعالجة',
            value: stats.pendingRequests,
            icon: Clock,
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        },
        {
            title: 'الموظفون النشطون',
            value: stats.totalEmployees,
            icon: UserCheck,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        },
        {
            title: 'الموظفون غير المفعلين',
            value: stats.inactiveEmployees,
            icon: Users,
            color: 'text-gray-600 dark:text-gray-400',
            bgColor: 'bg-gray-100 dark:bg-gray-800/50',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="لوحة التحكم" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <header className="space-y-1">
                    <h1 className="text-xl font-bold tracking-tight">لوحة التحكم</h1>
                    <p className="text-muted-foreground text-sm">
                        مرحباً، {userName}. إليك نظرة عامة على النظام.
                    </p>
                </header>

                <section className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {statCards.map((stat) => (
                        <Card key={stat.title} className="overflow-hidden border shadow-sm transition-all hover:shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
                                <CardTitle className="text-xs font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className={`rounded-lg p-1.5 ${stat.bgColor}`}>
                                    <stat.icon className={`size-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 pt-1">
                                <div className={`text-2xl font-bold tracking-tight ${stat.color}`}>
                                    {stat.value.toLocaleString('ar-EG')}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <section className="grid gap-3 lg:grid-cols-2 flex-1">
                    <Card className="overflow-hidden border shadow-sm h-auto">
                        <CardHeader className="p-3 pb-2 ">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <div className="rounded-md bg-blue-100 dark:bg-blue-900/30 p-1.5">
                                    <ClipboardList className="size-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                ملخص الطلبات
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium">نسبة الإكمال</span>
                                        <span className="font-bold text-green-600 dark:text-green-400">
                                            {stats.totalRequests > 0
                                                ? Math.round((stats.completedRequests / stats.totalRequests) * 100)
                                                : 0}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-l from-green-400 to-green-600 transition-all duration-500"
                                            style={{
                                                width: `${stats.totalRequests > 0 ? (stats.completedRequests / stats.totalRequests) * 100 : 0}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium">نسبة الرفض</span>
                                        <span className="font-bold text-red-600 dark:text-red-400">
                                            {stats.totalRequests > 0
                                                ? Math.round((stats.rejectedRequests / stats.totalRequests) * 100)
                                                : 0}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-l from-red-400 to-red-600 transition-all duration-500"
                                            style={{
                                                width: `${stats.totalRequests > 0 ? (stats.rejectedRequests / stats.totalRequests) * 100 : 0}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium">قيد المعالجة</span>
                                        <span className="font-bold text-amber-600 dark:text-amber-400">
                                            {stats.totalRequests > 0
                                                ? Math.round((stats.pendingRequests / stats.totalRequests) * 100)
                                                : 0}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-l from-amber-400 to-amber-600 transition-all duration-500"
                                            style={{
                                                width: `${stats.totalRequests > 0 ? (stats.pendingRequests / stats.totalRequests) * 100 : 0}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border shadow-sm h-auto">
                        <CardHeader className="p-3 pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <div className="rounded-md bg-emerald-100 dark:bg-emerald-900/30 p-1.5">
                                    <Users className="size-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                ملخص الموظفين
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium">نسبة التفعيل</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                            {(stats.totalEmployees + stats.inactiveEmployees) > 0
                                                ? Math.round((stats.totalEmployees / (stats.totalEmployees + stats.inactiveEmployees)) * 100)
                                                : 0}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-l from-emerald-400 to-emerald-600 transition-all duration-500"
                                            style={{
                                                width: `${(stats.totalEmployees + stats.inactiveEmployees) > 0 ? (stats.totalEmployees / (stats.totalEmployees + stats.inactiveEmployees)) * 100 : 0}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 text-center">
                                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                            {stats.totalEmployees.toLocaleString('ar-EG')}
                                        </p>
                                        <p className="text-xs text-muted-foreground">موظف نشط</p>
                                    </div>
                                    <div className="rounded-lg bg-gray-100 dark:bg-gray-800/50 p-3 text-center">
                                        <p className="text-xl font-bold text-gray-600 dark:text-gray-400">
                                            {stats.inactiveEmployees.toLocaleString('ar-EG')}
                                        </p>
                                        <p className="text-xs text-muted-foreground">غير مفعل</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </AppLayout>
    );
}
