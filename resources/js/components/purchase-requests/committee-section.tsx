import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users } from 'lucide-react';
import { CommitteeSelection } from './committee-selection';
import { OffersEntryForm } from './offers-entry-form';
import { OfferVoting } from './offer-voting';
import { CommitteeData } from './types';

type Props = {
    requestId: number;
    currentStepDepartment: string | null;
    currentStepName: string | null;
};

const statusLabels: Record<string, string> = {
    pending_members: 'في انتظار تحديد الأعضاء',
    pending_offers: 'في انتظار إدخال العروض',
    voting: 'جاري التصويت',
    completed: 'مكتملة',
};

export function CommitteeSection({ requestId, currentStepDepartment, currentStepName }: Props) {
    const [data, setData] = useState<CommitteeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isCommitteeRelatedStep =
        currentStepDepartment === 'committee_members' ||
        currentStepName?.includes('تحديد اعضاء اللجنة') ||
        currentStepName?.includes('تحديد أعضاء اللجنة') ||
        currentStepName?.includes('دراسة العروض');

    const fetchData = useCallback(() => {
        setLoading(true);
        fetch(`/purchase-requests/${requestId}/committee`, {
            headers: { Accept: 'application/json' },
        })
            .then((res) => res.json())
            .then((result) => {
                setData(result);
                setLoading(false);
            })
            .catch(() => {
                setError('حدث خطأ في تحميل بيانات اللجنة');
                setLoading(false);
            });
    }, [requestId]);

    useEffect(() => {
        if (isCommitteeRelatedStep) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [isCommitteeRelatedStep, fetchData]);

    if (!isCommitteeRelatedStep && !data?.committee_status) {
        return null;
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="mr-2">جاري تحميل بيانات اللجنة...</span>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-red-200">
                <CardContent className="py-4 text-center text-red-600">{error}</CardContent>
            </Card>
        );
    }

    if (!data) {
        return null;
    }

    const { committee_status, members, offers, permissions, current_user_vote, winning_offer } = data;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            لجنة فحص العروض
                        </span>
                        {committee_status && (
                            <Badge
                                variant={committee_status === 'completed' ? 'default' : 'secondary'}
                            >
                                {statusLabels[committee_status] || committee_status}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {members.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {members.map((member) => (
                                <Badge
                                    key={member.id}
                                    variant={member.role === 'رئيس' ? 'default' : 'outline'}
                                >
                                    {member.name}
                                    {member.role === 'رئيس' && ' (رئيس)'}
                                </Badge>
                            ))}
                        </div>
                    ) : permissions.can_select_committee ? (
                        <CommitteeSelection requestId={requestId} onSuccess={fetchData} />
                    ) : (
                        <p className="text-muted-foreground text-center text-sm">
                            لم يتم تحديد أعضاء اللجنة بعد
                        </p>
                    )}
                </CardContent>
            </Card>

            {permissions.can_enter_offers && (
                <OffersEntryForm
                    requestId={requestId}
                    existingOffers={offers}
                    canStartVoting={permissions.can_start_voting}
                    onSuccess={fetchData}
                />
            )}

            {(committee_status === 'voting' || winning_offer) && (
                <OfferVoting
                    requestId={requestId}
                    offers={offers}
                    members={members}
                    canVote={permissions.can_vote}
                    currentUserVote={current_user_vote}
                    winningOffer={winning_offer}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
}
