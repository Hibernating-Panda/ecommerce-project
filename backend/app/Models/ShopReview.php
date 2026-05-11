<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShopReview extends Model
{
    protected $fillable = [
        'user_id',
        'shop_id',
        'rating',
        'comment',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}