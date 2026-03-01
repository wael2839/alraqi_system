<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PriceOffer extends Model
{
    protected $fillable = [
        'request_id',
        'vendor_name',
        'offer_amount',
        'delivery_period',
        'payment_method',
        'meets_specifications',
        'file_path',
        'notes',
        'created_by',
        'is_winner',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'offer_amount' => 'decimal:2',
            'meets_specifications' => 'boolean',
            'is_winner' => 'boolean',
        ];
    }

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
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return HasMany<OfferVote, $this>
     */
    public function votes(): HasMany
    {
        return $this->hasMany(OfferVote::class, 'offer_id');
    }

    public function getVoteCount(): int
    {
        return $this->votes()->count();
    }
}
