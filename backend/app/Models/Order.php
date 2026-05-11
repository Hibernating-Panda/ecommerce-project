<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Order extends Model
{
<<<<<<< Updated upstream
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
=======
    //
    use LogsActivity;

    protected $fillable = [
        'customer_id', 'pickup_address', 'delivery_address',
        'pickup_lat', 'pickup_lng', 'delivery_lat', 'delivery_lng',
        'status', 'price', 'assigned_delivery_man', 'notes', 'weight',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty();
    }

    public function customer()  { return $this->belongsTo(User::class, 'customer_id'); }
    public function deliveryMan() { return $this->belongsTo(User::class, 'assigned_delivery_man'); }
    public function delivery() { return $this->hasOne(Delivery::class); }
    public function payment()   { return $this->hasOne(Payment::class); }
    public function trackings() { return $this->hasMany(Tracking::class); }
}
>>>>>>> Stashed changes
