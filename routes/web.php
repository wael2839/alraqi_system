<?php

use App\Http\Controllers\PurchaseRequestController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// مسارات طلبات الشراء (تتطلب تسجيل الدخول)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('purchase-requests', [PurchaseRequestController::class, 'index'])->name('purchase-requests.index');
    Route::get('purchase-requests/current', [PurchaseRequestController::class, 'current'])->name('purchase-requests.current');
    Route::get('purchase-requests/past', [PurchaseRequestController::class, 'past'])->name('purchase-requests.past');
    Route::get('purchase-requests/create', [PurchaseRequestController::class, 'create'])->name('purchase-requests.create');
    Route::get('purchase-requests/{purchaseRequest}/pdf', [PurchaseRequestController::class, 'pdf'])->name('purchase-requests.pdf');
    Route::get('purchase-requests/{purchaseRequest}', [PurchaseRequestController::class, 'show'])->name('purchase-requests.show');
    Route::post('purchase-requests', [PurchaseRequestController::class, 'store'])->name('purchase-requests.store');
});

require __DIR__.'/settings.php';
