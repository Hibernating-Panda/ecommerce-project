<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'shop_id',
        'driver_id',
        'status',
        'pickup_location',
        'delivery_location',
        'pickup_lat',
        'pickup_lng',
        'current_lat',
        'current_lng',
        'delivery_lat',
        'delivery_lng',
        'estimated_time',
        'started_at',
        'picked_up_at',
        'completed_at',
        'notes',
    ];

    protected $casts = [
        'pickup_lat' => 'decimal:8',
        'pickup_lng' => 'decimal:8',
        'current_lat' => 'decimal:8',
        'current_lng' => 'decimal:8',
        'delivery_lat' => 'decimal:8',
        'delivery_lng' => 'decimal:8',
        'estimated_time' => 'integer',
        'started_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function items()
    {
        return $this->hasMany(DeliveryItem::class);
    }

    public function orderItems()
    {
        return $this->belongsToMany(
            OrderItem::class,
            'delivery_items',
            'delivery_id',
            'order_item_id'
        );
    }

    public function locations()
    {
        return $this->hasMany(Location::class);
    }

    public function latestLocation()
    {
        return $this->hasOne(Location::class)->latestOfMany('timestamp');
    }
}