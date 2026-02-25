<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        body { font-family: aealarabiya, serif; font-size: 11px; line-height: 1.4; color: #1a1a1a; padding: 15px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
        .app-name { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
        .request-id { font-size: 13px; font-weight: bold; }
        .status-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-left: 8px; background: #e3f2fd; border: 1px solid #2196f3; }
        .section { margin-bottom: 15px; }
        .section-title { font-size: 12px; font-weight: bold; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #ddd; }
        table.data { width: 100%; border-collapse: collapse; }
        table.data td { padding: 5px 8px; vertical-align: top; }
        table.data td:first-child { width: 130px; font-weight: bold; color: #555; }
        .workflow-steps { margin-top: 6px; }
        .workflow-step { margin-bottom: 8px; padding: 8px 10px; border-right: 3px solid #ddd; }
        .workflow-step.step-done { border-right-color: #4caf50; background: #e8f5e9; }
        .workflow-step.step-current { border-right-color: #2196f3; background: #e3f2fd; font-weight: bold; }
        .workflow-step.step-pending { border-right-color: #e0e0e0; background: #fafafa; color: #888; }
        .workflow-step-title { font-size: 11px; margin-bottom: 2px; }
        .workflow-step-title .step-num { display: inline-block; width: 20px; margin-left: 6px; font-weight: bold; color: #555; }
        .workflow-step.step-done .step-num { color: #2e7d32; }
        .workflow-step.step-current .step-num { color: #1565c0; }
        .workflow-step-meta { font-size: 10px; color: #555; margin-bottom: 2px; }
        .workflow-step.step-pending .workflow-step-meta { color: #999; }
        .workflow-step-status { font-size: 10px; font-weight: bold; }
        .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 9px; color: #666; text-align: center; }
    </style>
</head>
<body dir="rtl">
    <div class="header">
        <div class="app-name">{{ config('app.name') }}</div>
        <div class="request-id">طلب شراء REQ-{{ str_pad((string) $purchaseRequest->id, 4, '0', STR_PAD_LEFT) }}</div>
        <div style="margin-top: 6px;">
            <span class="status-badge">{{ $purchaseRequest->status ?? '—' }}</span>
            <span>المرحلة الحالية: <strong>{{ $purchaseRequest->currentStep?->step_name ?? '—' }}</strong></span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">بيانات الطلب</div>
        <table class="data">
            <tr><td>المادة / الصنف</td><td>{{ $purchaseRequest->material }}</td></tr>
            @if($purchaseRequest->specifications)
            <tr><td>المواصفات</td><td>{{ $purchaseRequest->specifications }}</td></tr>
            @endif
            @if($purchaseRequest->estimated_price !== null)
            <tr><td>السعر التقديري</td><td>{{ $purchaseRequest->estimated_price }}</td></tr>
            @endif
            @if($purchaseRequest->pickup_location)
            <tr><td>مكان الاستلام</td><td>{{ $purchaseRequest->pickup_location }}</td></tr>
            @endif
            <tr><td>تاريخ الطلب</td><td>{{ $purchaseRequest->request_date?->translatedFormat('d F Y') ?? '—' }}</td></tr>
            <tr><td>مقدم الطلب</td><td>{{ $purchaseRequest->requester?->name ?? '—' }}</td></tr>
            <tr><td>القسم</td><td>{{ $purchaseRequest->requester?->department?->name_ar ?? '—' }}</td></tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">مسار الموافقة</div>
        <div class="workflow-steps">
            @php
                $currentId = $purchaseRequest->current_step_id;
                $currentStepNumber = $purchaseRequest->currentStep?->step_number;
            @endphp
            @foreach($workflowSteps as $step)
            <div class="workflow-step @if($currentStepNumber !== null && $step->step_number < $currentStepNumber) step-done @elseif($step->id === $currentId) step-current @else step-pending @endif">
                <div class="workflow-step-title"><span class="step-num">{{ $step->step_number }}.</span> {{ $step->step_name }}</div>
                <div class="workflow-step-meta">
                    القسم: {{ $step->step_department ?? '—' }} — الصلاحية المطلوبة: {{ $step->required_role ?? '—' }}
                </div>
                <div class="workflow-step-status">
                    @if($currentStepNumber !== null && $step->step_number < $currentStepNumber)
                        تم
                    @elseif($step->id === $currentId)
                        جاري
                    @else
                        —
                    @endif
                </div>
            </div>
            @endforeach
        </div>
    </div>

    <div class="footer">
        تم الإنشاء في {{ now()->translatedFormat('Y-m-d H:i') }} — {{ config('app.name') }}
    </div>
</body>
</html>
