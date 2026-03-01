import { useState, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Users, UserCheck, Loader2, AlertCircle, Search, Filter } from 'lucide-react';
import { AvailableUser } from './types';

type Props = {
    requestId: number;
    onSuccess?: () => void;
};

type SelectedMember = {
    user_id: number;
    user_role: 'رئيس' | 'عضو';
};

export function CommitteeSelection({ requestId, onSuccess }: Props) {
    const [open, setOpen] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);
    const [headId, setHeadId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState<string>('all');

    useEffect(() => {
        if (open && availableUsers.length === 0) {
            setLoading(true);
            fetch(`/purchase-requests/${requestId}/committee/available-members`, {
                headers: { Accept: 'application/json' },
            })
                .then((res) => res.json())
                .then((data) => {
                    setAvailableUsers(data.users || []);
                    setLoading(false);
                })
                .catch(() => {
                    setError('حدث خطأ في تحميل المستخدمين');
                    setLoading(false);
                });
        }
    }, [open, requestId, availableUsers.length]);

    const departments = useMemo(() => {
        const depts = new Set<string>();
        availableUsers.forEach((user) => {
            if (user.department) {
                depts.add(user.department);
            }
        });
        return Array.from(depts).sort();
    }, [availableUsers]);

    const filteredUsers = useMemo(() => {
        return availableUsers.filter((user) => {
            const matchesSearch =
                searchQuery === '' ||
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.id.toString().includes(searchQuery);

            const matchesDepartment =
                departmentFilter === 'all' || user.department === departmentFilter;

            return matchesSearch && matchesDepartment;
        });
    }, [availableUsers, searchQuery, departmentFilter]);

    const toggleMember = (userId: number) => {
        setSelectedMembers((prev) => {
            const exists = prev.find((m) => m.user_id === userId);
            if (exists) {
                if (headId === userId) {
                    setHeadId(null);
                }
                return prev.filter((m) => m.user_id !== userId);
            }
            return [...prev, { user_id: userId, user_role: 'عضو' }];
        });
    };

    const selectHead = (userId: number) => {
        setHeadId(userId);
        setSelectedMembers((prev) =>
            prev.map((m) => ({
                ...m,
                user_role: m.user_id === userId ? 'رئيس' : 'عضو',
            }))
        );
    };

    const handleSubmit = () => {
        if (selectedMembers.length < 3) {
            setError('يجب اختيار 3 أعضاء على الأقل');
            return;
        }
        if (!headId) {
            setError('يجب تحديد رئيس اللجنة');
            return;
        }

        setSubmitting(true);
        setError(null);

        const members = selectedMembers.map((m) => ({
            user_id: m.user_id,
            user_role: m.user_id === headId ? 'رئيس' : 'عضو',
        }));

        router.post(
            `/purchase-requests/${requestId}/committee/members`,
            { members },
            {
                onSuccess: () => {
                    setSubmitting(false);
                    setOpen(false);
                    setSelectedMembers([]);
                    setHeadId(null);
                    setSearchQuery('');
                    setDepartmentFilter('all');
                    onSuccess?.();
                },
                onError: (errors) => {
                    setSubmitting(false);
                    setError(Object.values(errors).flat().join(', '));
                },
            }
        );
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setSearchQuery('');
            setDepartmentFilter('all');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="w-full">
                    <Users className="ml-2 h-4 w-4" />
                    اختيار أعضاء اللجنة
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        اختيار أعضاء اللجنة
                    </DialogTitle>
                    <DialogDescription>
                        اختر 3 أعضاء على الأقل وحدد رئيس اللجنة
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="mr-2">جاري تحميل المستخدمين...</span>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        {error && (
                            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="text-muted-foreground pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    placeholder="بحث بالاسم أو رقم المستخدم..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pr-9"
                                />
                            </div>
                            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                <SelectTrigger className="w-full sm:w-48">
                                    <Filter className="ml-2 h-4 w-4" />
                                    <SelectValue placeholder="جميع الأقسام" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع الأقسام</SelectItem>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="text-muted-foreground text-xs">
                            عرض {filteredUsers.length} من {availableUsers.length} مستخدم
                        </div>

                        <div className="max-h-72 space-y-2 overflow-y-auto rounded-md border p-2">
                            {filteredUsers.length === 0 ? (
                                <p className="text-muted-foreground py-8 text-center text-sm">
                                    لا توجد نتائج مطابقة
                                </p>
                            ) : (
                                filteredUsers.map((user) => {
                                    const isSelected = selectedMembers.some((m) => m.user_id === user.id);
                                    return (
                                        <div
                                            key={user.id}
                                            className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                                                isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    id={`user-${user.id}`}
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleMember(user.id)}
                                                />
                                                <Label htmlFor={`user-${user.id}`} className="cursor-pointer">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{user.name}</span>
                                                        <span className="text-muted-foreground text-xs">
                                                            #{user.id}
                                                        </span>
                                                    </div>
                                                    <div className="text-muted-foreground text-xs">
                                                        {user.department}
                                                    </div>
                                                </Label>
                                            </div>

                                            {isSelected && (
                                                <RadioGroup
                                                    value={headId === user.id ? 'head' : 'member'}
                                                    onValueChange={(val) => {
                                                        if (val === 'head') selectHead(user.id);
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem value="head" id={`head-${user.id}`} />
                                                        <Label htmlFor={`head-${user.id}`} className="text-xs">
                                                            رئيس
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="flex items-center justify-between border-t pt-3">
                            <div className="text-muted-foreground text-sm">
                                تم اختيار {selectedMembers.length} عضو
                                {headId && (
                                    <span className="mr-2 text-green-600">
                                        <UserCheck className="mr-1 inline h-4 w-4" />
                                        تم تحديد الرئيس
                                    </span>
                                )}
                            </div>
                            {selectedMembers.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedMembers([]);
                                        setHeadId(null);
                                    }}
                                    className="text-destructive hover:text-destructive"
                                >
                                    إلغاء التحديد
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        إلغاء
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || selectedMembers.length < 3 || !headId}
                    >
                        {submitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                        حفظ اللجنة
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
