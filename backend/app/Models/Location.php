<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'delivery_id',
        'latitude',
        'longitude',
        'address',
        'timestamp'
    ];

    public $timestamps = false;

    protected $casts = [
        'timestamp' => 'datetime',
    ];

    /**
     * Get the delivery associated with this location
     */
    public function delivery(): BelongsTo
    {
        return $this->belongsTo(Delivery::class);
    }
}
