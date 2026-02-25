<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePurchaseRequest;
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

        $purchaseRequests = PurchaseRequest::query()
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
                'currentStep:id,step_name',
            ])
            ->latest()
            ->get();

        return Inertia::render('purchase-requests/current', [
            'purchaseRequests' => $purchaseRequests,
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
        $user = $request->user();

        $allowed = $purchaseRequest->requester_id === $user->id
            || $purchaseRequest->approvalSteps()->where('action_by', $user->id)->exists();

        if (! $allowed) {
            $user->load('department:id,name,name_ar');
            $deptName = $user->department?->name ? trim($user->department->name) : null;
            $deptNameAr = $user->department?->name_ar ? trim($user->department->name_ar) : null;
            $allowed = $purchaseRequest->currentStep && $purchaseRequest->currentStep->required_role === $user->team_role
                && (
                    $purchaseRequest->currentStep->step_department === null
                    || $purchaseRequest->currentStep->step_department === $deptName
                    || $purchaseRequest->currentStep->step_department === $deptNameAr
                );
        }

        if (! $allowed) {
            abort(403);
        }

        $this->loadRequestAndSteps($purchaseRequest);

        $workflowSteps = WorkflowStep::query()->orderBy('step_number')->get(['id', 'step_number', 'step_name', 'step_department', 'required_role']);

        if ($request->expectsJson() || $request->header('Accept') === 'application/json') {
            return response()->json([
                'request' => $purchaseRequest,
                'workflowSteps' => $workflowSteps,
            ]);
        }

        return Inertia::render('purchase-requests/show', [
            'purchaseRequest' => $purchaseRequest,
            'workflowSteps' => $workflowSteps,
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
            || $purchaseRequest->approvalSteps()->where('action_by', $user->id)->exists();

        if (! $allowed) {
            $user->load('department:id,name,name_ar');
            $deptName = $user->department?->name ? trim($user->department->name) : null;
            $deptNameAr = $user->department?->name_ar ? trim($user->department->name_ar) : null;
            $allowed = $purchaseRequest->currentStep && $purchaseRequest->currentStep->required_role === $user->team_role
                && (
                    $purchaseRequest->currentStep->step_department === null
                    || $purchaseRequest->currentStep->step_department === $deptName
                    || $purchaseRequest->currentStep->step_department === $deptNameAr
                );
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
            'currentStep:id,step_name,step_number',
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
}
