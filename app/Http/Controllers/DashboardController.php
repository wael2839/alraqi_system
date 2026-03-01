<?php

namespace App\Http\Controllers;

use App\Models\PurchaseRequest;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class DashboardController extends Controller
{
    public function index(): InertiaResponse
    {
        $stats = [
            'totalRequests' => PurchaseRequest::count(),
            'completedRequests' => PurchaseRequest::where('status', 'مكتمل')->count(),
            'rejectedRequests' => PurchaseRequest::where('status', 'مرفوض')->count(),
            'pendingRequests' => PurchaseRequest::whereNotIn('status', ['مكتمل', 'مرفوض'])->count(),
            'totalEmployees' => User::where('is_active', true)->count(),
            'inactiveEmployees' => User::where('is_active', false)->count(),
        ];

        return Inertia::render('dashboard', [
            'stats' => $stats,
        ]);
    }
}
