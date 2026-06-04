<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    protected $fillable = [
        'user_id',
        'shop_name',
        'owner_name',
        'phone',
        'address',
        'latitude',
        'longitude',
        'description',
        'shop_logo',
        'aba_qr_image',
        'aba_account_name',
        'aba_account_number',
    ];

    protected $appends = [
        'shop_logo_url',
        'logo_url',
        'aba_qr_url',
    ];

    public function getShopLogoUrlAttribute()
    {
        return $this->shop_logo
            ? asset('storage/' . $this->shop_logo)
            : null;
    }

    public function getLogoUrlAttribute()
    {
        return $this->shop_logo
            ? asset('storage/' . $this->shop_logo)
            : null;
    }

    public function getAbaQrUrlAttribute()
    {
        return $this->aba_qr_image
            ? asset('storage/' . $this->aba_qr_image)
            : null;
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function reviews()
    {
        return $this->hasMany(ShopReview::class);
    }
}