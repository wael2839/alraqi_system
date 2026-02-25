@php
    /**
     * تحضير النص للعرض في Dompdf: عكس المقاطع العربية فقط مع عكس ترتيب المقاطع
     * حتى تظهر العربية صحيحة ولا تُعكس الإنجليزية أو الأرقام.
     */
    if (!function_exists('pdf_ar')) {
        function pdf_ar($s) {
            if ($s === null || $s === '') {
                return $s === null ? '—' : $s;
            }
            $s = (string) $s;
            $enc = 'UTF-8';
            if (!preg_match('/\p{Arabic}/u', $s)) {
                return $s;
            }
            $segments = preg_split('/(\p{Arabic}+|[^\p{Arabic}]+)/u', $s, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
            $processed = [];
            foreach ($segments as $seg) {
                if (preg_match('/\p{Arabic}/u', $seg)) {
                    $len = mb_strlen($seg, $enc);
                    $rev = '';
                    for ($i = $len - 1; $i >= 0; $i--) {
                        $rev .= mb_substr($seg, $i, 1, $enc);
                    }
                    $processed[] = $rev;
                } else {
                    $processed[] = $seg;
                }
            }
            return implode('', array_reverse($processed));
        }
    }
@endphp
<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ pdf_ar('طلب شراء') }} REQ-{{ str_pad((string) $purchaseRequest->id, 4, '0', STR_PAD_LEFT) }}</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; line-height: 1.4; color: #1a1a1a; padding: 20px; direction: ltr; }
        .header { border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 20px; }
        .app-name { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
        .request-id { font-size: 13px; font-weight: bold; color: #333; }
        .status-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-left: 8px; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 12px; font-weight: bold; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid #ddd; }
        table.data { width: 100%; border-collapse: collapse; }
        table.data td { padding: 6px 8px; vertical-align: top; }
        table.data td:first-child { width: 140px; font-weight: bold; color: #555; }
        .workflow-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        .workflow-table th, .workflow-table td { padding: 8px 10px; text-align: right; border: 1px solid #ddd; }
        .workflow-table th { background: #f5f5f5; font-weight: bold; font-size: 10px; }
        .workflow-table .step-done { background: #e8f5e9; }
        .workflow-table .step-current { background: #e3f2fd; font-weight: bold; }
        .workflow-table .step-pending { background: #fafafa; color: #888; }
        .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 9px; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <div class="app-name">{{ pdf_ar(config('app.name')) }}</div>
        <div class="request-id">{{ pdf_ar('طلب شراء') }} REQ-{{ str_pad((string) $purchaseRequest->id, 4, '0', STR_PAD_LEFT) }}</div>
        <div style="margin-top: 6px;">
            <span class="status-badge" style="background: #e3f2fd; border: 1px solid #2196f3;">{{ pdf_ar($purchaseRequest->status ?? '—') }}</span>
            <span>{{ pdf_ar('المرحلة الحالية:') }} <strong>{{ pdf_ar($purchaseRequest->currentStep?->step_name ?? '—') }}</strong></span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">{{ pdf_ar('بيانات الطلب') }}</div>
        <table class="data">
            <tr><td>{{ pdf_ar('المادة / الصنف') }}</td><td>{{ pdf_ar($purchaseRequest->material) }}</td></tr>
            @if($purchaseRequest->specifications)
            <tr><td>{{ pdf_ar('المواصفات') }}</td><td>{{ pdf_ar($purchaseRequest->specifications) }}</td></tr>
            @endif
            @if($purchaseRequest->estimated_price !== null)
            <tr><td>{{ pdf_ar('السعر التقديري') }}</td><td>{{ $purchaseRequest->estimated_price }}</td></tr>
            @endif
            @if($purchaseRequest->pickup_location)
            <tr><td>{{ pdf_ar('مكان الاستلام') }}</td><td>{{ pdf_ar($purchaseRequest->pickup_location) }}</td></tr>
            @endif
            <tr><td>{{ pdf_ar('تاريخ الطلب') }}</td><td>{{ pdf_ar($purchaseRequest->request_date?->translatedFormat('d F Y') ?? '—') }}</td></tr>
            <tr><td>{{ pdf_ar('مقدم الطلب') }}</td><td>{{ pdf_ar($purchaseRequest->requester?->name ?? '—') }}</td></tr>
            <tr><td>{{ pdf_ar('القسم') }}</td><td>{{ pdf_ar($purchaseRequest->requester?->department?->name_ar ?? '—') }}</td></tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">{{ pdf_ar('مسار الموافقة') }}</div>
        <table class="workflow-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>{{ pdf_ar('المرحلة') }}</th>
                    <th>{{ pdf_ar('القسم') }}</th>
                    <th>{{ pdf_ar('الصلاحية المطلوبة') }}</th>
                    <th>{{ pdf_ar('الحالة') }}</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $currentId = $purchaseRequest->current_step_id;
                    $currentStepNumber = $purchaseRequest->currentStep?->step_number;
                @endphp
                @foreach($workflowSteps as $step)
                <tr class="@if($currentStepNumber !== null && $step->step_number < $currentStepNumber) step-done @elseif($step->id === $currentId) step-current @else step-pending @endif">
                    <td>{{ $step->step_number }}</td>
                    <td>{{ pdf_ar($step->step_name) }}</td>
                    <td>{{ $step->step_department ? pdf_ar($step->step_department) : '—' }}</td>
                    <td>{{ $step->required_role ? pdf_ar($step->required_role) : '—' }}</td>
                    <td>
                        @if($currentStepNumber !== null && $step->step_number < $currentStepNumber) {{ pdf_ar('تم') }}
                        @elseif($step->id === $currentId) {{ pdf_ar('جاري') }}
                        @else —
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="footer">
        {{ pdf_ar('تم الإنشاء في') }} {{ pdf_ar(now()->translatedFormat('Y-m-d H:i')) }} — {{ pdf_ar(config('app.name')) }}
    </div>
</body>
</html>
