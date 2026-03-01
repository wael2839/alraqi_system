<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CommitteeMember extends Model
{
    protected $fillable = [
        'request_id',
        'user_id',
        'user_role',
    ];

    /**
     * @return BelongsTo<PurchaseRequest, $this>
     */
    public function purchaseRequest(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequest::class, 'request_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return HasOne<OfferVote, $this>
     */
    public function vote(): HasOne
    {
        return $this->hasOne(OfferVote::class, 'committee_member_id');
    }

    public function isHead(): bool
    {
        return $this->user_role === 'رئيس';
    }

    public function hasVoted(): bool
    {
        return $this->vote()->exists();
    }
}
