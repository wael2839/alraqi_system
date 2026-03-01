<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $user?->load('department:id,name,name_ar');

        $roleLabels = [
            'general_manager' => 'المدير العام',
            'department_manager' => 'مدير قسم',
            'employee' => 'موظف',
        ];

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    ...$user->toArray(),
                    'department_name' => $user->department?->name_ar ?? $user->department?->name,
                    'role_label' => $roleLabels[$user->team_role] ?? 'موظف',
                ] : null,
                'canSeeApprovalRequests' => (bool) trim((string) ($user?->team_role ?? '')),
                'isGeneralManager' => $user?->team_role === 'general_manager',
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
