<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'customer_id',
        'customer_name',
        'delivery_address',
        'payment_method',
        'order_type',
        'pickup_date',
        'status',
        'total',
        'order_date',
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'order_date' => 'datetime',
        'pickup_date' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function deliveries()
    {
        return $this->hasMany(Delivery::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}