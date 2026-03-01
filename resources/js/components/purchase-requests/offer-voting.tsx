import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Vote, Loader2, AlertCircle, Check, X, Trophy, Users } from 'lucide-react';
import { PriceOffer, CommitteeMember } from './types';

type Props = {
    requestId: number;
    offers: PriceOffer[];
    members: CommitteeMember[];
    canVote: boolean;
    currentUserVote: number | null;
    winningOffer: { id: number; vendor_name: string; offer_amount: string | number } | null;
    onSuccess?: () => void;
};

export function OfferVoting({
    requestId,
    offers,
    members,
    canVote,
    currentUserVote,
    winningOffer,
    onSuccess,
}: Props) {
    const [selectedOffer, setSelectedOffer] = useState<number | null>(currentUserVote);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalMembers = members.length;
    const votedMembers = members.filter((m) => m.has_voted).length;
    const majorityNeeded = Math.floor(totalMembers / 2) + 1;

    const handleVote = () => {
        if (!selectedOffer) {
            setError('يجب اختيار عرض للتصويت');
            return;
        }

        setSubmitting(true);
        setError(null);

        router.post(
            `/purchase-requests/${requestId}/committee/vote`,
            { offer_id: selectedOffer },
            {
                onSuccess: () => {
                    setSubmitting(false);
                    onSuccess?.();
                },
                onError: (errors) => {
                    setSubmitting(false);
                    setError(Object.values(errors).flat().join(', '));
                },
            }
        );
    };

    if (winningOffer) {
        return (
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <Trophy className="h-5 w-5" />
                        تم اعتماد العرض الفائز
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
                        <div className="text-lg font-bold">{winningOffer.vendor_name}</div>
                        <div className="text-muted-foreground">
                            السعر: {Number(winningOffer.offer_amount).toLocaleString()} ريال
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Vote className="h-5 w-5" />
                        التصويت على العروض
                    </span>
                    <Badge variant="outline">
                        <Users className="ml-1 h-3 w-3" />
                        {votedMembers}/{totalMembers} صوتوا
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                <p className="text-muted-foreground text-sm">
                    يحتاج العرض إلى {majorityNeeded} صوت على الأقل للفوز (أكثر من نصف الأعضاء)
                </p>

                <div className="space-y-3">
                    {offers.map((offer) => {
                        const isSelected = selectedOffer === offer.id;
                        const isUserVote = currentUserVote === offer.id;
                        const votePercentage = totalMembers > 0 ? (offer.votes_count / totalMembers) * 100 : 0;

                        return (
                            <div
                                key={offer.id}
                                className={`relative cursor-pointer rounded-lg border p-4 transition-all ${
                                    isSelected
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary'
                                        : 'border-border hover:border-primary/50'
                                } ${!canVote && !isUserVote ? 'cursor-default' : ''}`}
                                onClick={() => canVote && setSelectedOffer(offer.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{offer.vendor_name}</span>
                                            {isUserVote && (
                                                <Badge variant="secondary" className="text-xs">
                                                    تصويتك
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-muted-foreground mt-1 text-sm">
                                            السعر: {Number(offer.offer_amount).toLocaleString()} ريال
                                        </div>
                                        <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                            {offer.delivery_period && (
                                                <span className="text-muted-foreground">
                                                    التسليم: {offer.delivery_period}
                                                </span>
                                            )}
                                            {offer.payment_method && (
                                                <span className="text-muted-foreground">
                                                    الدفع: {offer.payment_method}
                                                </span>
                                            )}
                                            {offer.meets_specifications ? (
                                                <span className="flex items-center gap-1 text-green-600">
                                                    <Check className="h-3 w-3" />
                                                    مطابق للمواصفات
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-600">
                                                    <X className="h-3 w-3" />
                                                    غير مطابق
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-2xl font-bold">{offer.votes_count}</div>
                                        <div className="text-muted-foreground text-xs">صوت</div>
                                    </div>
                                </div>

                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div
                                        className={`h-full transition-all ${
                                            offer.votes_count >= majorityNeeded
                                                ? 'bg-green-500'
                                                : 'bg-primary'
                                        }`}
                                        style={{ width: `${votePercentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {canVote && (
                    <div className="flex justify-end border-t pt-4">
                        <Button
                            onClick={handleVote}
                            disabled={submitting || !selectedOffer}
                        >
                            {submitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                            تأكيد التصويت
                        </Button>
                    </div>
                )}

                {!canVote && currentUserVote && (
                    <div className="border-t pt-4 text-center text-sm text-green-600">
                        <Check className="ml-1 inline h-4 w-4" />
                        لقد قمت بالتصويت
                    </div>
                )}

                <div className="border-t pt-4">
                    <h4 className="mb-2 text-sm font-medium">حالة تصويت الأعضاء:</h4>
                    <div className="flex flex-wrap gap-2">
                        {members.map((member) => (
                            <Badge
                                key={member.id}
                                variant={member.has_voted ? 'default' : 'outline'}
                                className="text-xs"
                            >
                                {member.name}
                                {member.role === 'رئيس' && ' (رئيس)'}
                                {member.has_voted && <Check className="mr-1 h-3 w-3" />}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
