<?php

namespace App\Http\Controllers;

use App\Models\ApprovalStep;
use App\Models\CommitteeMember;
use App\Models\OfferVote;
use App\Models\PriceOffer;
use App\Models\PurchaseRequest;
use App\Models\User;
use App\Models\WorkflowStep;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CommitteeController extends Controller
{
    public function getAvailableMembers(PurchaseRequest $purchaseRequest): \Illuminate\Http\JsonResponse
    {
        $users = User::where('is_active', true)
            ->where('id', '!=', $purchaseRequest->requester_id)
            ->with('department')
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'department' => $user->department?->name_ar ?? $user->department?->name,
                'role' => $user->team_role,
            ]);

        return response()->json(['users' => $users]);
    }

    public function storeMembers(Request $request, PurchaseRequest $purchaseRequest): RedirectResponse
    {
        $validated = $request->validate([
            'members' => 'required|array|min:3',
            'members.*.user_id' => 'required|exists:users,id',
            'members.*.user_role' => 'required|in:رئيس,عضو',
        ]);

        $user = Auth::user();
        $department = $user->department;

        if ($department?->name !== 'Supply' || $user->team_role !== 'department_manager') {
            abort(403, 'غير مصرح لك بتحديد أعضاء اللجنة');
        }

        $headCount = collect($validated['members'])->where('user_role', 'رئيس')->count();
        if ($headCount !== 1) {
            return back()->withErrors(['members' => 'يجب تحديد رئيس لجنة واحد فقط']);
        }

        DB::transaction(function () use ($purchaseRequest, $validated, $user) {
            $purchaseRequest->committeeMembers()->delete();

            foreach ($validated['members'] as $member) {
                CommitteeMember::create([
                    'request_id' => $purchaseRequest->id,
                    'user_id' => $member['user_id'],
                    'user_role' => $member['user_role'],
                ]);
            }

            ApprovalStep::create([
                'purchase_request_id' => $purchaseRequest->id,
                'action_by' => $user->id,
                'action_taken' => 'approved',
                'comment' => 'تم تحديد أعضاء اللجنة',
            ]);

            $purchaseRequest->update(['committee_status' => 'pending_offers']);

            $this->moveToNextWorkflowStep($purchaseRequest);
        });

        return back()->with('success', 'تم تحديد أعضاء اللجنة والانتقال لمرحلة دراسة العروض');
    }

    public function storeOffer(Request $request, PurchaseRequest $purchaseRequest): RedirectResponse
    {
        $validated = $request->validate([
            'vendor_name' => 'required|string|max:255',
            'offer_amount' => 'required|numeric|min:0',
            'delivery_period' => 'nullable|string|max:100',
            'payment_method' => 'nullable|string|max:100',
            'meets_specifications' => 'required|boolean',
            'notes' => 'nullable|string',
        ]);

        $user = Auth::user();
        $head = $purchaseRequest->getCommitteeHead();

        if (! $head || $head->user_id !== $user->id) {
            abort(403, 'فقط رئيس اللجنة يمكنه إدخال العروض');
        }

        PriceOffer::create([
            'request_id' => $purchaseRequest->id,
            'vendor_name' => $validated['vendor_name'],
            'offer_amount' => $validated['offer_amount'],
            'delivery_period' => $validated['delivery_period'],
            'payment_method' => $validated['payment_method'],
            'meets_specifications' => $validated['meets_specifications'],
            'notes' => $validated['notes'],
            'created_by' => $user->id,
        ]);

        return back()->with('success', 'تم إضافة العرض بنجاح');
    }

    public function startVoting(PurchaseRequest $purchaseRequest): RedirectResponse
    {
        $user = Auth::user();
        $head = $purchaseRequest->getCommitteeHead();

        if (! $head || $head->user_id !== $user->id) {
            abort(403, 'فقط رئيس اللجنة يمكنه بدء التصويت');
        }

        $offersCount = $purchaseRequest->priceOffers()->count();
        if ($offersCount < 2) {
            return back()->withErrors(['offers' => 'يجب إدخال عرضين على الأقل لبدء التصويت']);
        }

        $purchaseRequest->update(['committee_status' => 'voting']);

        return back()->with('success', 'تم بدء مرحلة التصويت');
    }

    public function vote(Request $request, PurchaseRequest $purchaseRequest): RedirectResponse
    {
        $validated = $request->validate([
            'offer_id' => 'required|exists:price_offers,id',
        ]);

        $user = Auth::user();
        $member = $purchaseRequest->committeeMembers()->where('user_id', $user->id)->first();

        if (! $member) {
            abort(403, 'أنت لست عضواً في هذه اللجنة');
        }

        if ($member->hasVoted()) {
            return back()->withErrors(['vote' => 'لقد قمت بالتصويت مسبقاً']);
        }

        if ($purchaseRequest->committee_status !== 'voting') {
            return back()->withErrors(['vote' => 'لم تبدأ مرحلة التصويت بعد']);
        }

        OfferVote::create([
            'offer_id' => $validated['offer_id'],
            'committee_member_id' => $member->id,
        ]);

        $this->checkVotingCompletion($purchaseRequest);

        return back()->with('success', 'تم تسجيل تصويتك بنجاح');
    }

    private function checkVotingCompletion(PurchaseRequest $purchaseRequest): void
    {
        $totalMembers = $purchaseRequest->committeeMembers()->count();
        $offers = $purchaseRequest->priceOffers()->withCount('votes')->get();
        $majorityThreshold = $totalMembers / 2;

        $winningOffer = $offers->first(fn ($offer) => $offer->votes_count > $majorityThreshold);

        if ($winningOffer) {
            $head = $purchaseRequest->getCommitteeHead();

            DB::transaction(function () use ($purchaseRequest, $winningOffer, $head) {
                $winningOffer->update(['is_winner' => true]);

                $purchaseRequest->update([
                    'committee_status' => 'completed',
                    'winning_offer_id' => $winningOffer->id,
                ]);

                ApprovalStep::create([
                    'purchase_request_id' => $purchaseRequest->id,
                    'action_by' => $head?->user_id ?? Auth::id(),
                    'action_taken' => 'approved',
                    'comment' => 'تم اختيار العرض الفائز: '.$winningOffer->vendor_name,
                ]);

                $this->moveToNextWorkflowStep($purchaseRequest);
            });
        }
    }

    private function moveToNextWorkflowStep(PurchaseRequest $purchaseRequest): void
    {
        $currentStep = $purchaseRequest->currentStep;
        if (! $currentStep) {
            return;
        }

        $nextStep = WorkflowStep::where('step_number', '>', $currentStep->step_number)
            ->orderBy('step_number')
            ->first();

        if ($nextStep) {
            $purchaseRequest->update(['current_step_id' => $nextStep->id]);
        } else {
            $purchaseRequest->update([
                'current_step_id' => null,
                'status' => 'مكتمل',
            ]);
        }
    }

    public function getCommitteeData(PurchaseRequest $purchaseRequest): \Illuminate\Http\JsonResponse
    {
        $purchaseRequest->load([
            'committeeMembers.user.department',
            'committeeMembers.vote.offer',
            'priceOffers.votes',
            'priceOffers.creator',
            'winningOffer',
        ]);

        $user = Auth::user();
        $member = $purchaseRequest->committeeMembers->firstWhere('user_id', $user->id);
        $head = $purchaseRequest->getCommitteeHead();

        $canSelectCommittee = $this->canSelectCommittee($purchaseRequest, $user);

        $currentStep = $purchaseRequest->currentStep;
        $isOffersStudyStep = $currentStep && str_contains($currentStep->step_name, 'دراسة العروض');

        $canEnterOffers = $head && $head->user_id === $user->id
            && $purchaseRequest->committee_status === 'pending_offers'
            && $isOffersStudyStep;

        $canVote = $member && ! $member->hasVoted()
            && $purchaseRequest->committee_status === 'voting'
            && $isOffersStudyStep;

        $canStartVoting = $head && $head->user_id === $user->id
            && $purchaseRequest->committee_status === 'pending_offers'
            && $purchaseRequest->priceOffers->count() >= 2
            && $isOffersStudyStep;

        return response()->json([
            'committee_status' => $purchaseRequest->committee_status,
            'members' => $purchaseRequest->committeeMembers->map(fn ($m) => [
                'id' => $m->id,
                'user_id' => $m->user_id,
                'name' => $m->user->name,
                'department' => $m->user->department?->name_ar ?? $m->user->department?->name,
                'role' => $m->user_role,
                'has_voted' => $m->hasVoted(),
            ]),
            'offers' => $purchaseRequest->priceOffers->map(fn ($o) => [
                'id' => $o->id,
                'vendor_name' => $o->vendor_name,
                'offer_amount' => $o->offer_amount,
                'delivery_period' => $o->delivery_period,
                'payment_method' => $o->payment_method,
                'meets_specifications' => $o->meets_specifications,
                'notes' => $o->notes,
                'votes_count' => $o->votes->count(),
                'is_winner' => $o->is_winner,
            ]),
            'winning_offer' => $purchaseRequest->winningOffer ? [
                'id' => $purchaseRequest->winningOffer->id,
                'vendor_name' => $purchaseRequest->winningOffer->vendor_name,
                'offer_amount' => $purchaseRequest->winningOffer->offer_amount,
            ] : null,
            'permissions' => [
                'can_select_committee' => $canSelectCommittee,
                'can_enter_offers' => $canEnterOffers,
                'can_vote' => $canVote,
                'can_start_voting' => $canStartVoting,
            ],
            'current_user_vote' => $member?->vote?->offer_id,
        ]);
    }

    private function canSelectCommittee(PurchaseRequest $purchaseRequest, $user): bool
    {
        $currentStep = $purchaseRequest->currentStep;
        if (! $currentStep) {
            return false;
        }

        $isCommitteeSelectionStep = str_contains($currentStep->step_name, 'تحديد اعضاء اللجنة')
            || str_contains($currentStep->step_name, 'تحديد أعضاء اللجنة');

        if (! $isCommitteeSelectionStep) {
            return false;
        }

        $department = $user->department;
        if (! $department || $department->name !== 'Supply') {
            return false;
        }

        if ($user->team_role !== 'department_manager') {
            return false;
        }

        if ($purchaseRequest->committee_status && $purchaseRequest->committee_status !== 'pending_members') {
            return false;
        }

        return true;
    }
}
