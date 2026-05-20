<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryItem extends Model
{
    protected $fillable = [
        'delivery_id',
        'order_item_id',
    ];

    public function delivery()
    {
        return $this->belongsTo(Delivery::class);
    }

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }
}