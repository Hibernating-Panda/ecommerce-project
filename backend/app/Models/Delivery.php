<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
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
        'notes'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the order associated with this delivery
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the driver/user associated with this delivery
     */
    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all location updates for this delivery
     */
    public function locations(): HasMany
    {
        return $this->hasMany(Location::class);
    }

    /**
     * Get the latest location for this delivery
     */
    public function latestLocation()
    {
        return $this->hasOne(Location::class)->latest('timestamp');
    }
}
