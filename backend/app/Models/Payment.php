<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'amount',
        'method',
        'status',
        'transaction_id',
        'response'
    ];

    protected $casts = [
        'response' => 'array',
    ];

    /**
     * Get the order associated with this payment
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
