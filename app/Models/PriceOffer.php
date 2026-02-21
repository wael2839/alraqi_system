<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceOffer extends Model
{
    protected $fillable = [
        'request_id',
        'vendor_name',
        'offer_amount',
        'file_path',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'offer_amount' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<PurchaseRequest>
     */
    public function purchaseRequest(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequest::class, 'request_id');
    }
}
