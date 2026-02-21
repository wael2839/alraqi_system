// Components
import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="التحقق من البريد الإلكتروني"
            description="يرجى التحقق من بريدك الإلكتروني بالنقر على الرابط الذي أرسلناه إليك."
        >
            <Head title="التحقق من البريد الإلكتروني" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    تم إرسال رابط تحقق جديد إلى البريد الإلكتروني الذي قدمته عند التسجيل.
                </div>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} variant="secondary">
                            {processing && <Spinner />}
                            إعادة إرسال رسالة التحقق
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm"
                        >
                            تسجيل الخروج
                        </TextLink>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
