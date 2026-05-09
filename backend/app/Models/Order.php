<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'shop_id',
        'customer_name',
        'product_name',
        'quantity',
        'total',
        'status',
        'order_date',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}