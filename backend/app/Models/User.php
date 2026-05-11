<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'account_status',
        'phone',
        'address',
        'profile_image',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'role_name',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Role Name Accessor
    |--------------------------------------------------------------------------
    | Uses Spatie roles safely.
    */

    public function getRoleNameAttribute()
    {
        return $this->roles->first()?->name ?? 'customer';
    }

    /*
    |--------------------------------------------------------------------------
    | Deliveries
    |--------------------------------------------------------------------------
    */

    public function deliveries()
    {
        return $this->hasMany(Delivery::class, 'delivery_man_id');
    }

    /*
    |--------------------------------------------------------------------------
    | User Notifications
    |--------------------------------------------------------------------------
    */

    public function userNotifications()
    {
        return $this->hasMany(Notification::class);
    }
}