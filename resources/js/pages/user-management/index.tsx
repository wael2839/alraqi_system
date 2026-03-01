import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Search, UserCog, Building2, Shield } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

type Department = {
    id: number;
    name: string;
    name_ar: string;
};

type User = {
    id: number;
    name: string;
    email: string;
    dep_id: number | null;
    department: Department | null;
    team_role: string | null;
    is_active: boolean;
    created_at: string;
};

type PaginatedUsers = {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type Filters = {
    search?: string;
    department?: string;
    status?: string;
};

type Props = {
    users: PaginatedUsers;
    departments: Department[];
    filters: Filters;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'إدارة المستخدمين', href: '/user-management' },
];

export default function UserManagementIndex({ users, departments, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newDepartment, setNewDepartment] = useState<string>('');
    const [newRole, setNewRole] = useState<string>('');
    const { flash } = usePage().props as { flash?: { success?: string } };

    const handleSearch = () => {
        router.get('/user-management', {
            search: search || undefined,
            department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleToggleActive = (user: User) => {
        router.patch(`/user-management/${user.id}/toggle-active`, {}, {
            preserveScroll: true,
        });
    };

    const generalManagementDept = departments.find(d => d.name === 'General_Manager');

    const openEditDialog = (user: User) => {
        setEditingUser(user);
        setNewDepartment(user.dep_id?.toString() || '');
        setNewRole(user.team_role || 'employee');
    };

    const handleDepartmentChange = (value: string) => {
        setNewDepartment(value);
        if (value !== String(generalManagementDept?.id) && newRole === 'general_manager') {
            setNewRole('employee');
        }
    };

    const handleUpdateUser = () => {
        if (!editingUser) return;

        if (newDepartment && newDepartment !== editingUser.dep_id?.toString()) {
            router.patch(`/user-management/${editingUser.id}/department`, {
                dep_id: newDepartment,
            }, {
                preserveScroll: true,
            });
        }

        if (newRole !== editingUser.team_role) {
            router.patch(`/user-management/${editingUser.id}/role`, {
                team_role: newRole || null,
            }, {
                preserveScroll: true,
            });
        }

        setEditingUser(null);
    };

    const roleLabels: Record<string, string> = {
        general_manager: 'المدير العام',
        department_manager: 'مدير قسم',
        employee: 'موظف',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="إدارة المستخدمين" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
                    <Badge variant="outline" className="text-sm">
                        إجمالي المستخدمين: {users.total}
                    </Badge>
                </div>

                {flash?.success && (
                    <div className="rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {flash.success}
                    </div>
                )}

                <Card className='py-4'>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="size-5" />
                            البحث والتصفية
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <Label htmlFor="search">البحث</Label>
                                <Input
                                    id="search"
                                    placeholder="ابحث بالاسم أو البريد..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <div className="w-48">
                                <Label>القسم</Label>
                                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="جميع الأقسام" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">جميع الأقسام</SelectItem>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={String(dept.id)}>
                                                {dept.name_ar || dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-40">
                                <Label>الحالة</Label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="الكل" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">الكل</SelectItem>
                                        <SelectItem value="active">مفعل</SelectItem>
                                        <SelectItem value="inactive">غير مفعل</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleSearch}>
                                <Search className="me-2 size-4" />
                                بحث
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16 text-center">ID</TableHead>
                                    <TableHead className="text-center">الاسم</TableHead>
                                    <TableHead className="text-center">البريد الإلكتروني</TableHead>
                                    <TableHead className='text-center'>القسم</TableHead>
                                    <TableHead className='text-center'>الدور</TableHead>
                                    <TableHead className="text-center">مفعل</TableHead>
                                    <TableHead className="text-center">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            لا يوجد مستخدمون
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-mono text-muted-foreground text-center">
                                                #{user.id}
                                            </TableCell>
                                            <TableCell className="font-medium text-center">{user.name}</TableCell>
                                            <TableCell className="text-center">{user.email}</TableCell>
                                            <TableCell className="text-center">
                                                {user.department ? (
                                                    <Badge variant="outline" className="text-center">
                                                        <Building2 className="me-1 size-3 text-center" />
                                                        {user.department.name_ar || user.department.name}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {user.team_role ? (
                                                    <Badge variant={user.team_role === 'general_manager' ? 'default' : 'secondary'}>
                                                        <Shield className="me-1 size-3" />
                                                        {roleLabels[user.team_role] || user.team_role}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">موظف</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Switch
                                                    checked={user.is_active}
                                                    onCheckedChange={() => handleToggleActive(user)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEditDialog(user)}
                                                >
                                                    <UserCog className="me-1 size-4" />
                                                    تعديل
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {users.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {users.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
                    </DialogHeader>
                    {editingUser && (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">الاسم</Label>
                                <p className="font-medium">{editingUser.name}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">البريد الإلكتروني</Label>
                                <p className="font-medium">{editingUser.email}</p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-department">القسم</Label>
                                <Select value={newDepartment} onValueChange={handleDepartmentChange}>
                                    <SelectTrigger id="edit-department">
                                        <SelectValue placeholder="اختر القسم" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={String(dept.id)}>
                                                {dept.name_ar || dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-role">الدور</Label>
                                <Select value={newRole} onValueChange={setNewRole}>
                                    <SelectTrigger id="edit-role">
                                        <SelectValue placeholder="اختر الدور" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="employee">موظف</SelectItem>
                                        <SelectItem value="department_manager">مدير قسم</SelectItem>
                                        {newDepartment === String(generalManagementDept?.id) && (
                                            <SelectItem value="general_manager">المدير العام</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {newDepartment !== String(generalManagementDept?.id) && editingUser?.team_role === 'general_manager' && (
                                    <p className="text-sm text-amber-600">
                                        سيتم تغيير الدور إلى "موظف" لأن المدير العام يجب أن ينتمي لقسم الإدارة العامة.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingUser(null)}>
                            إلغاء
                        </Button>
                        <Button onClick={handleUpdateUser}>
                            حفظ التغييرات
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
