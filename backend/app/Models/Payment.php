<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'amount',
        'method',
        'status',
        'transaction_id',
        'response',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'response' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}