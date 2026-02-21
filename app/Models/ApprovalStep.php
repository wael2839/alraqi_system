<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApprovalStep extends Model
{
    protected $table = 'approval_steps';

    protected $fillable = [
        'purchase_request_id',
        'action_by',
        'action_taken',
        'comment',
    ];

    /**
     * @return BelongsTo<PurchaseRequest>
     */
    public function purchaseRequest(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequest::class, 'purchase_request_id');
    }

    /**
     * @return BelongsTo<User>
     */
    public function actionBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'action_by');
    }
}
