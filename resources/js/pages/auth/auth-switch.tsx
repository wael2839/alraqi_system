import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { store as loginStore } from '@/routes/login';
import { store as registerStore } from '@/routes/register';
import { request } from '@/routes/password';
import TextLink from '@/components/text-link';

type Props = {
    status?: string;
    canResetPassword: boolean;
    mode?: 'login' | 'register';
};

export default function AuthSwitch({
    status,
    canResetPassword,
    mode = 'login',
}: Props) {
    const [isRegister, setIsRegister] = useState(mode === 'register');

    return (
        <>
            <Head title={isRegister ? 'إنشاء حساب' : 'تسجيل الدخول'} />
            <div className="flex min-h-svh items-center justify-center bg-background p-4 md:p-8">
                <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-border shadow-xl">
                    <div className="relative flex">
                        {/* Login Form Panel */}
                        <div
                            className={cn(
                                'w-full flex-shrink-0 bg-background p-8 transition-all duration-500 ease-in-out md:w-1/2',
                                isRegister
                                    ? 'pointer-events-none absolute inset-0 opacity-0 md:pointer-events-auto md:relative md:opacity-100'
                                    : 'relative opacity-100'
                            )}
                        >
                            <div className="flex h-full flex-col justify-center">
                                <div className="mb-8 text-center md:hidden">
                                    <AppLogoIcon className="mx-auto size-16" />
                                </div>
                                <h2 className="mb-2 text-2xl font-bold">تسجيل الدخول</h2>
                                <p className="mb-6 text-sm text-muted-foreground">
                                    أدخل بريدك الإلكتروني وكلمة المرور للدخول
                                </p>

                                <Form
                                    {...loginStore.form()}
                                    resetOnSuccess={['password']}
                                    className="space-y-4"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="grid gap-2">
                                                <Label htmlFor="login-email">البريد الإلكتروني</Label>
                                                <Input
                                                    id="login-email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoComplete="email"
                                                    placeholder="example@email.com"
                                                />
                                                <InputError message={errors.email} />
                                            </div>

                                            <div className="grid gap-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="login-password">كلمة المرور</Label>
                                                    {canResetPassword && (
                                                        <TextLink href={request()} className="text-xs">
                                                            نسيت كلمة المرور؟
                                                        </TextLink>
                                                    )}
                                                </div>
                                                <Input
                                                    id="login-password"
                                                    type="password"
                                                    name="password"
                                                    required
                                                    autoComplete="current-password"
                                                    placeholder="كلمة المرور"
                                                />
                                                <InputError message={errors.password} />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Checkbox id="remember" name="remember" />
                                                <Label htmlFor="remember" className="text-sm">
                                                    تذكرني
                                                </Label>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full"
                                                disabled={processing}
                                            >
                                                {processing && <Spinner className="me-2" />}
                                                تسجيل الدخول
                                            </Button>
                                        </>
                                    )}
                                </Form>

                                {status && (
                                    <p className="mt-4 text-center text-sm text-green-600">
                                        {status}
                                    </p>
                                )}

                                <p className="mt-6 text-center text-sm text-muted-foreground md:hidden">
                                    ليس لديك حساب؟{' '}
                                    <button
                                        type="button"
                                        onClick={() => setIsRegister(true)}
                                        className="font-medium text-primary hover:underline"
                                    >
                                        إنشاء حساب
                                    </button>
                                </p>
                            </div>
                        </div>

                        {/* Register Form Panel */}
                        <div
                            className={cn(
                                'w-full flex-shrink-0 bg-background p-8 transition-all duration-500 ease-in-out md:w-1/2',
                                isRegister
                                    ? 'relative opacity-100'
                                    : 'pointer-events-none absolute inset-0 opacity-0 md:pointer-events-auto md:relative md:opacity-100'
                            )}
                        >
                            <div className="flex h-full flex-col justify-center">
                                <div className="mb-8 text-center md:hidden">
                                    <AppLogoIcon className="mx-auto size-16" />
                                </div>
                                <h2 className="mb-2 text-2xl font-bold">إنشاء حساب جديد</h2>
                                <p className="mb-6  text-sm text-muted-foreground">
                                    <p className="text-sm pt-2 text-red-500" >ملاحظة : لن يتم تنشيط الحساب إلا بعد التحقق منه من قبل الإدارة</p>
                                </p>

                                <Form
                                    {...registerStore.form()}
                                    resetOnSuccess={['password', 'password_confirmation']}
                                    className="space-y-4"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="grid gap-2">
                                                <Label htmlFor="register-name">الاسم</Label>
                                                <Input
                                                    id="register-name"
                                                    type="text"
                                                    name="name"
                                                    required
                                                    autoComplete="name"
                                                    placeholder="الاسم الكامل"
                                                />
                                                <InputError message={errors.name} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="register-email">البريد الإلكتروني</Label>
                                                <Input
                                                    id="register-email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoComplete="email"
                                                    placeholder="example@email.com"
                                                />
                                                <InputError message={errors.email} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="register-password">كلمة المرور</Label>
                                                <Input
                                                    id="register-password"
                                                    type="password"
                                                    name="password"
                                                    required
                                                    autoComplete="new-password"
                                                    placeholder="كلمة المرور"
                                                />
                                                <InputError message={errors.password} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="register-password-confirm">
                                                    تأكيد كلمة المرور
                                                </Label>
                                                <Input
                                                    id="register-password-confirm"
                                                    type="password"
                                                    name="password_confirmation"
                                                    required
                                                    autoComplete="new-password"
                                                    placeholder="تأكيد كلمة المرور"
                                                />
                                                <InputError message={errors.password_confirmation} />
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full"
                                                disabled={processing}
                                            >
                                                {processing && <Spinner className="me-2" />}
                                                إنشاء الحساب
                                            </Button>
                                        </>
                                    )}
                                </Form>

                                <p className="mt-6 text-center text-sm text-muted-foreground md:hidden">
                                    لديك حساب بالفعل؟{' '}
                                    <button
                                        type="button"
                                        onClick={() => setIsRegister(false)}
                                        className="font-medium text-primary hover:underline"
                                    >
                                        تسجيل الدخول
                                    </button>
                                </p>
                            </div>
                        </div>

                        {/* Sliding Overlay Panel (Desktop only) */}
                        <div
                            className={cn(
                                'absolute inset-y-0 z-20 hidden w-1/2 transition-all duration-500 ease-in-out md:block',
                                isRegister ? 'right-0' : 'right-1/2'
                            )}
                        >
                            <div className="flex h-full flex-col items-center justify-center bg-primary p-8 text-primary-foreground">
                                <AppLogoIcon className="mb-6 size-20 brightness-0 invert" />
                                <h3 className="mb-4 text-2xl font-bold">
                                    {isRegister ? 'مرحباً بعودتك!' : 'أهلاً بك!'}
                                </h3>
                                <p className="mb-8 text-center text-sm opacity-90">
                                    {isRegister
                                        ? 'إذا كان لديك حساب بالفعل، سجل دخولك للمتابعة'
                                        : 'سجل الآن للحصول على حساب جديد والوصول لجميع الخدمات'}
                                </p>
                                <Button
                                    variant="outline"
                                    className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                                    onClick={() => setIsRegister(!isRegister)}
                                >
                                    {isRegister ? 'تسجيل الدخول' : 'إنشاء حساب'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
