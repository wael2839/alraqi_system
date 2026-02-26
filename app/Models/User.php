<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'dep_id',
        'team_role',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function isGeneralManager(): bool
    {
        return $this->team_role === 'general_manager';
    }

    public function isDepartmentManager(): bool
    {
        return $this->team_role === 'department_manager';
    }

    public function isEmployee(): bool
    {
        return $this->team_role === 'employee' || $this->team_role === null;
    }

    /**
     * @return BelongsTo<Department>
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'dep_id');
    }

    /**
     * @return HasMany<PurchaseRequest>
     */
    public function purchaseRequests(): HasMany
    {
        return $this->hasMany(PurchaseRequest::class, 'requester_id');
    }

    /**
     * @return HasMany<CommitteeMember>
     */
    public function committeeMembers(): HasMany
    {
        return $this->hasMany(CommitteeMember::class, 'user_id');
    }

    /**
     * @return HasMany<ApprovalStep>
     */
    public function approvalSteps(): HasMany
    {
        return $this->hasMany(ApprovalStep::class, 'action_by');
    }
}
