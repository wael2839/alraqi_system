<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::with('department')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->department, function ($query, $department) {
                $query->where('dep_id', $department);
            })
            ->when($request->status !== null, function ($query) use ($request) {
                $query->where('is_active', $request->status === 'active');
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('user-management/index', [
            'users' => $users,
            'departments' => Department::select('id', 'name', 'name_ar')->get(),
            'filters' => $request->only(['search', 'department', 'status']),
        ]);
    }

    public function toggleActive(User $user): RedirectResponse
    {
        $user->update([
            'is_active' => ! $user->is_active,
        ]);

        $message = $user->is_active ? 'تم تفعيل الحساب بنجاح' : 'تم تعطيل الحساب بنجاح';

        return back()->with('success', $message);
    }

    public function updateDepartment(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'dep_id' => ['required', 'exists:departments,id'],
        ]);

        $generalManagementDeptId = Department::where('name', 'General_Manager')->first()?->id;

        if ($user->team_role === 'general_manager' && (int) $request->dep_id !== $generalManagementDeptId) {
            return back()->withErrors([
                'dep_id' => 'المدير العام يجب أن ينتمي لقسم الإدارة العامة حصراً.',
            ]);
        }

        if ((int) $request->dep_id !== $generalManagementDeptId && $user->team_role === 'general_manager') {
            $user->update([
                'dep_id' => $request->dep_id,
                'team_role' => 'employee',
            ]);

            return back()->with('success', 'تم تغيير القسم وإزالة دور المدير العام');
        }

        $user->update([
            'dep_id' => $request->dep_id,
        ]);

        return back()->with('success', 'تم تغيير القسم بنجاح');
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'team_role' => ['nullable', 'string', 'in:employee,department_manager,general_manager'],
        ]);

        $generalManagementDeptId = Department::where('name', 'General_Manager')->first()?->id;

        if ($request->team_role === 'general_manager' && (int) $user->dep_id !== $generalManagementDeptId) {
            return back()->withErrors([
                'team_role' => 'لا يمكن تعيين مدير عام إلا لمستخدم ينتمي لقسم الإدارة العامة.',
            ]);
        }

        $user->update([
            'team_role' => $request->team_role,
        ]);

        return back()->with('success', 'تم تغيير الدور بنجاح');
    }
}
