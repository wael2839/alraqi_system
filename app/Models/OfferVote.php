<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfferVote extends Model
{
    protected $fillable = [
        'offer_id',
        'committee_member_id',
    ];

    /**
     * @return BelongsTo<PriceOffer, $this>
     */
    public function offer(): BelongsTo
    {
        return $this->belongsTo(PriceOffer::class, 'offer_id');
    }

    /**
     * @return BelongsTo<CommitteeMember, $this>
     */
    public function committeeMember(): BelongsTo
    {
        return $this->belongsTo(CommitteeMember::class, 'committee_member_id');
    }
}
