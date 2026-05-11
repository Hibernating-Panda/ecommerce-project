<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'shop_id',
        'customer_id',

        'customer_name',
        'product_name',
        'quantity',
        'total',
        'order_date',

        'pickup_address',
        'delivery_address',
        'pickup_lat',
        'pickup_lng',
        'delivery_lat',
        'delivery_lng',

        'status',
        'price',
        'assigned_delivery_man',
        'notes',
        'weight',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function deliveryMan()
    {
        return $this->belongsTo(User::class, 'assigned_delivery_man');
    }

    public function delivery()
    {
        return $this->hasOne(Delivery::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function trackings()
    {
        return $this->hasMany(Tracking::class);
    }
}