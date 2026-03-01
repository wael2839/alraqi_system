<?php

use App\Http\Controllers\CommitteeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PurchaseRequestController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::get('dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'general_manager'])
    ->name('dashboard');

// مسارات طلبات الشراء (تتطلب تسجيل الدخول)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('purchase-requests', [PurchaseRequestController::class, 'index'])->name('purchase-requests.index');
    Route::get('purchase-requests/current', [PurchaseRequestController::class, 'current'])->name('purchase-requests.current');
    Route::get('purchase-requests/past', [PurchaseRequestController::class, 'past'])->name('purchase-requests.past');
    Route::get('purchase-requests/create', [PurchaseRequestController::class, 'create'])->name('purchase-requests.create');
    Route::get('purchase-requests/{purchaseRequest}/pdf', [PurchaseRequestController::class, 'pdf'])->name('purchase-requests.pdf');
    Route::get('purchase-requests/{purchaseRequest}', [PurchaseRequestController::class, 'show'])->name('purchase-requests.show');
    Route::post('purchase-requests', [PurchaseRequestController::class, 'store'])->name('purchase-requests.store');
    Route::post('purchase-requests/{purchaseRequest}/approve', [PurchaseRequestController::class, 'approve'])->name('purchase-requests.approve');
    Route::post('purchase-requests/{purchaseRequest}/reject', [PurchaseRequestController::class, 'reject'])->name('purchase-requests.reject');

    // Committee routes
    Route::get('purchase-requests/{purchaseRequest}/committee', [CommitteeController::class, 'getCommitteeData'])->name('purchase-requests.committee.data');
    Route::get('purchase-requests/{purchaseRequest}/committee/available-members', [CommitteeController::class, 'getAvailableMembers'])->name('purchase-requests.committee.available-members');
    Route::post('purchase-requests/{purchaseRequest}/committee/members', [CommitteeController::class, 'storeMembers'])->name('purchase-requests.committee.store-members');
    Route::post('purchase-requests/{purchaseRequest}/committee/offers', [CommitteeController::class, 'storeOffer'])->name('purchase-requests.committee.store-offer');
    Route::post('purchase-requests/{purchaseRequest}/committee/start-voting', [CommitteeController::class, 'startVoting'])->name('purchase-requests.committee.start-voting');
    Route::post('purchase-requests/{purchaseRequest}/committee/vote', [CommitteeController::class, 'vote'])->name('purchase-requests.committee.vote');
});

// مسارات إدارة المستخدمين (للمدير العام فقط)
Route::middleware(['auth', 'verified', 'general_manager'])->prefix('user-management')->name('user-management.')->group(function () {
    Route::get('/', [UserManagementController::class, 'index'])->name('index');
    Route::patch('/{user}/toggle-active', [UserManagementController::class, 'toggleActive'])->name('toggle-active');
    Route::patch('/{user}/department', [UserManagementController::class, 'updateDepartment'])->name('update-department');
    Route::patch('/{user}/role', [UserManagementController::class, 'updateRole'])->name('update-role');
});

require __DIR__.'/settings.php';
