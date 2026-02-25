<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseRequest extends Model
{
    protected $fillable = [
        'requester_id',
        'material',
        'specifications',
        'estimated_price',
        'pickup_location',
        'request_date',
        'status',
        'current_step_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'estimated_price' => 'decimal:2',
            'request_date' => 'date',
        ];
    }

    /**
     * @return BelongsTo<User>
     */
    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    /**
     * @return HasMany<PriceOffer>
     */
    public function priceOffers(): HasMany
    {
        return $this->hasMany(PriceOffer::class, 'request_id');
    }

    /**
     * @return HasMany<CommitteeMember>
     */
    public function committeeMembers(): HasMany
    {
        return $this->hasMany(CommitteeMember::class, 'request_id');
    }

    /**
     * @return HasMany<ApprovalStep>
     */
    public function approvalSteps(): HasMany
    {
        return $this->hasMany(ApprovalStep::class, 'purchase_request_id');
    }

    /**
     * Current workflow step (status). Used to display step name as request status.
     *
     * @return BelongsTo<WorkflowStep>
     */
    public function currentStep(): BelongsTo
    {
        return $this->belongsTo(WorkflowStep::class, 'current_step_id');
    }
}
