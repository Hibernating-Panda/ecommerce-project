<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'customer_id',
        'customer_name',
        'delivery_address',
        'delivery_lat',
        'delivery_lng',
        'payment_method',
        'order_type',
        'pickup_date',
        'status',
        'subtotal',
        'delivery_distance_km',
        'delivery_fee',
        'total',
        'order_date',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'delivery_distance_km' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'total' => 'decimal:2',
        'delivery_lat' => 'decimal:8',
        'delivery_lng' => 'decimal:8',
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

    public function delivery()
    {
        return $this->hasOne(Delivery::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}