<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductSize extends Model
{
    protected $fillable = [
        'product_id',
        'size',
        'price',
        'stock',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}