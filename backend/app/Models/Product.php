<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'shop_id',
        'name',
        'price',
        'stock',
        'category_id',
        'image',
        'description',
        'status',
        'discount_percent',
        'discount_start',
        'discount_end',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'discount_percent' => 'integer',
        'discount_start' => 'datetime',
        'discount_end' => 'datetime',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function sizes()
    {
        return $this->hasMany(ProductSize::class);
    }

    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}