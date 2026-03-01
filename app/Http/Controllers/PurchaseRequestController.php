<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePurchaseRequest;
use App\Models\ApprovalStep;
use App\Models\PurchaseRequest;
use App\Models\WorkflowStep;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\View;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use TCPDF;

/**
 * Purchase Requests controller.
 *
 * Connects the frontend (Inertia pages) to the database via the PurchaseRequest model.
 */
class PurchaseRequestController extends Controller
{
    /**
     * طلباتي — Requests the user submitted (requester only).
     */
    public function index(Request $request): InertiaResponse
    {
        $user = $request->user();

        $purchaseRequests = PurchaseRequest::query()
            ->where('requester_id', $user->id)
            ->with([
                'requester:id,name,email,dep_id',
                'requester.department:id,name,name_ar',
                'currentStep:id,step_name',
            ])
            ->latest()
            ->get();

        return Inertia::render('purchase-requests/index', [
            'purchaseRequests' => $purchaseRequests,
            'status' => $request->session()->get('status'),
            'storeUrl' => route('purchase-requests.store'),
        ]);
    }

    /**
     * الطلبات الحالية — Requests that require the user's approval (current step matches role + department).
     */
    public function current(Request $request): InertiaResponse
    {
        $user = $request->user();
        $user->load('department:id,name,name_ar');

        $deptName = $user->department?->name ? trim($user->department->name) : null;
        $deptNameAr = $user->department?->name_ar ? trim($user->department->name_ar) : null;
        $userDepId = $user->dep_id;

        $purchaseRequests = PurchaseRequest::query()
            ->whereNotNull('current_step_id')
            ->whereNotIn('status', ['مرفوض', 'مكتمل'])
            ->whereHas('currentStep', function ($q) use ($user, $deptName, $deptNameAr) {
                $q->where('required_role', $user->team_role);
                $q->where(function ($q2) use ($deptName, $deptNameAr) {
                    $q2->whereNull('step_department')
                        ->orWhere('step_department', $deptName)
                        ->orWhere('step_department', $deptNameAr);
                });
            })
            ->with([
                'requester:id,name,email,dep_id',
                'requester.department:id,name,name_ar',
                'currentStep:id,step_name,step_department',
            ])
            ->latest()
            ->get();

        $requesterDeptRequests = PurchaseRequest::query()
            ->whereNotNull('current_step_id')
            ->whereNotIn('status', ['مرفوض', 'مكتمل'])
            ->whereHas('currentStep', function ($q) use ($user) {
                $q->where('required_role', $user->team_role);
                $q->where('step_department', 'department_of_requester');
            })
            ->whereHas('requester', function ($q) use ($userDepId) {
                $q->where('dep_id', $userDepId);
            })
            ->with([
                'requester:id,name,email,dep_id',
                'requester.department:id,name,name_ar',
                'currentStep:id,step_name,step_department',
            ])
            ->latest()
            ->get();

        $committeeRequests = PurchaseRequest::query()
            ->whereNotNull('current_step_id')
            ->whereNotIn('status', ['مرفوض', 'مكتمل'])
            ->whereHas('committeeMembers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->whereIn('committee_status', ['pending_offers', 'voting'])
            ->with([
                'requester:id,name,email,dep_id',
                'requester.department:id,name,name_ar',
                'currentStep:id,step_name,step_department',
            ])
            ->latest()
            ->get();

        $allRequests = $purchaseRequests
            ->merge($requesterDeptRequests)
            ->merge($committeeRequests)
            ->unique('id')
            ->sortByDesc('created_at')
            ->values();

        return Inertia::render('purchase-requests/current', [
            'purchaseRequests' => $allRequests,
        ]);
    }

    /**
     * الطلبات السابقة — Requests the user has already approved or rejected.
     */
    public function past(Request $request): InertiaResponse
    {
        $user = $request->user();

        $purchaseRequests = PurchaseRequest::query()
            ->whereHas('approvalSteps', fn ($q) => $q->where('action_by', $user->id))
            ->with([
                'requester:id,name,email,dep_id',
                'requester.department:id,name,name_ar',
                'currentStep:id,step_name',
            ])
            ->latest()
            ->get();

        return Inertia::render('purchase-requests/past', [
            'purchaseRequests' => $purchaseRequests,
        ]);
    }

    /**
     * Show a single purchase request (for modal/details). Returns JSON when Accept: application/json.
     * Allowed: requester, or user who has an approval step, or current step matches user role+department.
     */
    public function show(Request $request, PurchaseRequest $purchaseRequest): JsonResponse|InertiaResponse
    {
        $purchaseRequest->refresh();
        $user = $request->user();

        $allowed = $purchaseRequest->requester_id === $user->id
            || $purchaseRequest->approvalSteps()->where('action_by', $user->id)->exists()
            || $purchaseRequest->committeeMembers()->where('user_id', $user->id)->exists();

        if (! $allowed) {
            $user->load('department:id,name,name_ar');
            $deptName = $user->department?->name ? trim($user->department->name) : null;
            $deptNameAr = $user->department?->name_ar ? trim($user->department->name_ar) : null;

            if ($purchaseRequest->currentStep && $purchaseRequest->currentStep->required_role === $user->team_role) {
                if ($purchaseRequest->currentStep->step_department === 'department_of_requester') {
                    $purchaseRequest->load('requester:id,dep_id');
                    $allowed = $purchaseRequest->requester?->dep_id === $user->dep_id;
                } else {
                    $allowed = $purchaseRequest->currentStep->step_department === null
                        || $purchaseRequest->currentStep->step_department === $deptName
                        || $purchaseRequest->currentStep->step_department === $deptNameAr;
                }
            }
        }

        if (! $allowed) {
            abort(403);
        }

        $this->loadRequestAndSteps($purchaseRequest);

        $workflowSteps = WorkflowStep::query()->orderBy('step_number')->get(['id', 'step_number', 'step_name', 'step_department', 'required_role']);

        $approvalHistory = ApprovalStep::where('purchase_request_id', $purchaseRequest->id)
            ->with('actionBy:id,name')
            ->orderBy('created_at')
            ->get(['id', 'action_by', 'action_taken', 'comment', 'created_at']);

        $canApprove = $this->userCanApprove($request, $purchaseRequest);

        if ($request->expectsJson() || $request->header('Accept') === 'application/json') {
            return response()->json([
                'request' => $purchaseRequest,
                'workflowSteps' => $workflowSteps,
                'approvalHistory' => $approvalHistory,
                'canApprove' => $canApprove,
            ]);
        }

        return Inertia::render('purchase-requests/show', [
            'purchaseRequest' => $purchaseRequest,
            'workflowSteps' => $workflowSteps,
            'approvalHistory' => $approvalHistory,
            'canApprove' => $canApprove,
        ]);
    }

    /**
     * Download purchase request as PDF. Same authorization as show().
     */
    public function pdf(Request $request, PurchaseRequest $purchaseRequest): Response
    {
        $this->authorizeViewRequest($request, $purchaseRequest);

        $this->loadRequestAndSteps($purchaseRequest);

        $workflowSteps = WorkflowStep::query()->orderBy('step_number')->get(['id', 'step_number', 'step_name', 'step_department', 'required_role']);

        $html = View::make('purchase-requests.pdf-tcpdf', [
            'purchaseRequest' => $purchaseRequest,
            'workflowSteps' => $workflowSteps,
        ])->render();

        $tcpdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8');
        $tcpdf->setPrintHeader(false);
        $tcpdf->setPrintFooter(false);
        $tcpdf->SetAutoPageBreak(true, 15);
        $tcpdf->setRTL(true);
        $tcpdf->setFontSubsetting(false);
        $tcpdf->SetFont('aealarabiya', '', 11);
        $tcpdf->AddPage();
        $tcpdf->writeHTML($html, true, false, true, false, '');
        $tcpdf->lastPage();

        $filename = 'طلب-شراء-REQ-'.str_pad((string) $purchaseRequest->id, 4, '0', STR_PAD_LEFT).'.pdf';

        return response($tcpdf->Output($filename, 'S'), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    private function authorizeViewRequest(Request $request, PurchaseRequest $purchaseRequest): void
    {
        $user = $request->user();

        $allowed = $purchaseRequest->requester_id === $user->id
            || $purchaseRequest->approvalSteps()->where('action_by', $user->id)->exists()
            || $purchaseRequest->committeeMembers()->where('user_id', $user->id)->exists();

        if (! $allowed) {
            $user->load('department:id,name,name_ar');
            $deptName = $user->department?->name ? trim($user->department->name) : null;
            $deptNameAr = $user->department?->name_ar ? trim($user->department->name_ar) : null;

            if ($purchaseRequest->currentStep && $purchaseRequest->currentStep->required_role === $user->team_role) {
                if ($purchaseRequest->currentStep->step_department === 'department_of_requester') {
                    $purchaseRequest->load('requester:id,dep_id');
                    $allowed = $purchaseRequest->requester?->dep_id === $user->dep_id;
                } else {
                    $allowed = $purchaseRequest->currentStep->step_department === null
                        || $purchaseRequest->currentStep->step_department === $deptName
                        || $purchaseRequest->currentStep->step_department === $deptNameAr;
                }
            }
        }

        if (! $allowed) {
            abort(403);
        }
    }

    private function loadRequestAndSteps(PurchaseRequest $purchaseRequest): void
    {
        $purchaseRequest->load([
            'requester:id,name,email,dep_id',
            'requester.department:id,name,name_ar',
            'currentStep:id,step_name,step_number,step_department,required_role',
            'winningOffer:id,vendor_name,offer_amount,delivery_period,payment_method,meets_specifications,notes',
        ]);
    }

    /**
     * Show the "create purchase request" page (empty form only).
     */
    public function create(): InertiaResponse
    {
        return Inertia::render('purchase-requests/create', [
            'storeUrl' => route('purchase-requests.store'),
        ]);
    }

    /**
     * Store a new purchase request in the database.
     */
    public function store(StorePurchaseRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        PurchaseRequest::create([
            ...$validated,
            'requester_id' => $request->user()->id,
            'current_step_id' => 1,
            'status' => 'قيد المراجعة',
        ]);

        return redirect()
            ->route('purchase-requests.index')
            ->with('status', 'تم إنشاء طلب الشراء بنجاح.');
    }

    /**
     * Approve a purchase request - move to next workflow step.
     */
    public function approve(Request $request, PurchaseRequest $purchaseRequest): RedirectResponse
    {
        $purchaseRequest->refresh();
        $this->authorizeApprovalAction($request, $purchaseRequest);

        $currentStep = $purchaseRequest->currentStep;
        $nextStep = WorkflowStep::where('step_number', '>', $currentStep->step_number)
            ->orderBy('step_number')
            ->first();

        ApprovalStep::create([
            'purchase_request_id' => $purchaseRequest->id,
            'action_by' => $request->user()->id,
            'action_taken' => 'approved',
            'comment' => null,
        ]);

        if ($nextStep) {
            $purchaseRequest->update([
                'current_step_id' => $nextStep->id,
            ]);
            $message = 'تمت الموافقة وانتقل الطلب إلى: '.$nextStep->step_name;
        } else {
            $purchaseRequest->update([
                'status' => 'مكتمل',
                'current_step_id' => null,
            ]);
            $message = 'تمت الموافقة النهائية على الطلب';
        }

        return back()->with('success', $message);
    }

    /**
     * Reject a purchase request.
     */
    public function reject(Request $request, PurchaseRequest $purchaseRequest): RedirectResponse
    {
        $purchaseRequest->refresh();
        $this->authorizeApprovalAction($request, $purchaseRequest);

        $request->validate([
            'comment' => ['required', 'string', 'min:5', 'max:1000'],
        ], [
            'comment.required' => 'يجب إدخال سبب الرفض',
            'comment.min' => 'سبب الرفض يجب أن يكون 5 أحرف على الأقل',
        ]);

        ApprovalStep::create([
            'purchase_request_id' => $purchaseRequest->id,
            'action_by' => $request->user()->id,
            'action_taken' => 'rejected',
            'comment' => $request->comment,
        ]);

        $purchaseRequest->update([
            'status' => 'مرفوض',
            'current_step_id' => null,
        ]);

        return back()->with('success', 'تم رفض الطلب');
    }

    /**
     * Check if user can approve/reject this request (returns boolean, no abort).
     */
    private function userCanApprove(Request $request, PurchaseRequest $purchaseRequest): bool
    {
        $user = $request->user();

        if ($purchaseRequest->current_step_id === null) {
            return false;
        }

        if (in_array($purchaseRequest->status, ['مرفوض', 'مكتمل', 'rejected', 'completed'])) {
            return false;
        }

        if (! $purchaseRequest->currentStep) {
            return false;
        }

        $stepName = $purchaseRequest->currentStep->step_name ?? '';
        $isCommitteeStep = str_contains($stepName, 'تحديد اعضاء اللجنة')
            || str_contains($stepName, 'تحديد أعضاء اللجنة')
            || str_contains($stepName, 'دراسة العروض');

        if ($isCommitteeStep) {
            return false;
        }

        if ($purchaseRequest->currentStep->required_role !== $user->team_role) {
            return false;
        }

        $user->load('department:id,name,name_ar');
        $deptName = $user->department?->name ? trim($user->department->name) : null;
        $deptNameAr = $user->department?->name_ar ? trim($user->department->name_ar) : null;

        $stepDept = $purchaseRequest->currentStep->step_department;

        if ($stepDept === 'department_of_requester') {
            $purchaseRequest->load('requester:id,dep_id');

            return $purchaseRequest->requester?->dep_id === $user->dep_id;
        }

        if ($stepDept !== null && $stepDept !== $deptName && $stepDept !== $deptNameAr) {
            return false;
        }

        return true;
    }

    /**
     * Check if user can approve/reject this request.
     */
    private function authorizeApprovalAction(Request $request, PurchaseRequest $purchaseRequest): void
    {
        $user = $request->user();

        if ($purchaseRequest->current_step_id === null) {
            abort(400, 'الطلب مكتمل أو مرفوض ولا يمكن اتخاذ إجراء عليه');
        }

        if (in_array($purchaseRequest->status, ['مرفوض', 'مكتمل', 'rejected', 'completed'])) {
            abort(400, 'الطلب مكتمل أو مرفوض ولا يمكن اتخاذ إجراء عليه');
        }

        if (! $purchaseRequest->currentStep) {
            abort(400, 'الطلب مكتمل أو مرفوض ولا يمكن اتخاذ إجراء عليه');
        }

        if ($purchaseRequest->currentStep->required_role !== $user->team_role) {
            abort(403, 'ليس لديك صلاحية اتخاذ إجراء على هذا الطلب');
        }

        $user->load('department:id,name,name_ar');
        $deptName = $user->department?->name ? trim($user->department->name) : null;
        $deptNameAr = $user->department?->name_ar ? trim($user->department->name_ar) : null;

        $stepDept = $purchaseRequest->currentStep->step_department;

        if ($stepDept === 'department_of_requester') {
            $purchaseRequest->load('requester:id,dep_id');
            if ($purchaseRequest->requester?->dep_id !== $user->dep_id) {
                abort(403, 'هذا الطلب يتطلب موافقة مدير قسم صاحب الطلب');
            }
        } elseif ($stepDept !== null && $stepDept !== $deptName && $stepDept !== $deptNameAr) {
            abort(403, 'هذا الطلب يتطلب موافقة قسم آخر');
        }
    }
}
