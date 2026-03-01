import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Trophy,
    Building2,
    CircleDollarSign,
    Clock,
    CreditCard,
    CheckCircle,
    XCircle,
    FileText,
    Loader2,
    Eye,
} from 'lucide-react';

type WinningOfferData = {
    id: number;
    vendor_name: string;
    offer_amount: string | number;
    delivery_period: string | null;
    payment_method: string | null;
    meets_specifications: boolean;
    notes: string | null;
};

type Props = {
    requestId: number;
    winningOfferId: number | null;
    committeeStatus: string | null;
};

export function WinningOfferCard({ requestId, winningOfferId, committeeStatus }: Props) {
    const [open, setOpen] = useState(false);
    const [offer, setOffer] = useState<WinningOfferData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const shouldShow = committeeStatus === 'completed' && winningOfferId;

    useEffect(() => {
        if (open && !offer && shouldShow) {
            setLoading(true);
            fetch(`/purchase-requests/${requestId}/committee`, {
                headers: { Accept: 'application/json' },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.winning_offer) {
                        const fullOffer = data.offers?.find(
                            (o: WinningOfferData) => o.id === data.winning_offer.id
                        );
                        setOffer(fullOffer || data.winning_offer);
                    }
                    setLoading(false);
                })
                .catch(() => {
                    setError('حدث خطأ في تحميل بيانات العرض');
                    setLoading(false);
                });
        }
    }, [open, offer, requestId, shouldShow]);

    if (!shouldShow) {
        return null;
    }

    return (
        <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <Trophy className="h-5 w-5" />
                        العرض الفائز
                    </span>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Eye className="ml-2 h-4 w-4" />
                                عرض التفاصيل
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                    <Trophy className="h-5 w-5" />
                                    تفاصيل العرض الفائز
                                </DialogTitle>
                            </DialogHeader>

                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span className="mr-2">جاري التحميل...</span>
                                </div>
                            ) : error ? (
                                <p className="py-4 text-center text-red-600">{error}</p>
                            ) : offer ? (
                                <div className="space-y-4 py-4">
                                    <div className="flex items-start gap-3">
                                        <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">
                                                المورد
                                            </p>
                                            <p className="font-semibold text-lg">{offer.vendor_name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <CircleDollarSign className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">
                                                إجمالي السعر
                                            </p>
                                            <p className="font-semibold text-lg text-green-600">
                                                {Number(offer.offer_amount).toLocaleString('ar-SA')} 
                                            </p>
                                        </div>
                                    </div>

                                    {offer.delivery_period && (
                                        <div className="flex items-start gap-3">
                                            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    مدة التوريد
                                                </p>
                                                <p className="font-medium">{offer.delivery_period}</p>
                                            </div>
                                        </div>
                                    )}

                                    {offer.payment_method && (
                                        <div className="flex items-start gap-3">
                                            <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    طريقة الدفع
                                                </p>
                                                <p className="font-medium">{offer.payment_method}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        {offer.meets_specifications ? (
                                            <>
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                <span className="font-medium text-green-600">
                                                    مطابق للمواصفات الفنية
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-5 w-5 text-red-600" />
                                                <span className="font-medium text-red-600">
                                                    غير مطابق للمواصفات الفنية
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {offer.notes && (
                                        <div className="flex items-start gap-3">
                                            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    ملاحظات
                                                </p>
                                                <p className="text-sm">{offer.notes}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-muted-foreground">
                                    لا توجد بيانات
                                </p>
                            )}
                        </DialogContent>
                    </Dialog>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">المورد الفائز</span>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                        تم الاختيار
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
