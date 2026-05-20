<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'delivery_id',
        'latitude',
        'longitude',
        'address',
        'timestamp',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'timestamp' => 'datetime',
    ];

    public function delivery()
    {
        return $this->belongsTo(Delivery::class);
    }
}