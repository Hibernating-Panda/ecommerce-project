<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DeliverySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ----Permissions----
        $permissions = [
            'manage-users',
            'manage-roles',
            'manage-orders',
            'manage-deliveries',
            'manage-payments',
            'view-reports',
            'manage-settings',
            'view-activity-logs',
            'assign-delivery-man',
            'update-order-status',
            'download-invoice',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(
                ['name' => $perm],
                ['guard_name' => 'sanctum']
            );
        }

        // ── Roles ─────────────────────────────────────────────
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'sanctum']);
        $driverRole = Role::firstOrCreate(['name' => 'delivery_man', 'guard_name' => 'sanctum']);
        $customerRole = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'sanctum']);

        // Admin gets all permissions
        $adminRole->syncPermissions($permissions);

        // Driver permissions
        $driverRole->syncPermissions([
            'update-order-status',
            'manage-deliveries',
            'download-invoice',
        ]);

        // Customer permissions
        $customerRole->syncPermissions([
            'manage-orders',
            'download-invoice',
        ]);

        // ── Demo Users ────────────────────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@demo.com'],
            [
                'name'     => 'Admin User',
                'password' => Hash::make('password'),
                'phone'    => '+855 12 000 001',
                'role'     => 'admin',
                'address'  => '123 Monivong Blvd, Phnom Penh',
            ]
        );
        $admin->assignRole('admin');

        $driver1 = User::firstOrCreate(
            ['email' => 'driver@demo.com'],
            [
                'name'     => 'Dara Driver',
                'password' => Hash::make('password'),
                'phone'    => '+855 12 000 002',
                'role'     => 'delivery_man',
                'address'  => '456 Street 51, Phnom Penh',
            ]
        );
        $driver1->assignRole('delivery_man');

        $driver2 = User::firstOrCreate(
            ['email' => 'driver2@demo.com'],
            [
                'name'     => 'Sophea Rider',
                'password' => Hash::make('password'),
                'phone'    => '+855 12 000 003',
                'role'     => 'delivery_man',
                'address'  => '789 Norodom, Phnom Penh',
            ]
        );
        $driver2->assignRole('delivery_man');

        $customer = User::firstOrCreate(
            ['email' => 'customer@demo.com'],
            [
                'name'     => 'Kosal Customer',
                'password' => Hash::make('password'),
                'phone'    => '+855 12 000 004',
                'role'     => 'customer',
                'address'  => '321 Toul Kork, Phnom Penh',
            ]
        );
        $customer->assignRole('customer');

        // ── Demo Orders ───────────────────────────────────────
        $statuses = ['pending', 'confirmed', 'in_transit', 'delivered', 'delivered', 'delivered'];

        for ($i = 1; $i <= 12; $i++) {
            $status = $statuses[array_rand($statuses)];
            $order = Order::firstOrCreate(
                ['id' => $i],
                [
                    'customer_id'          => $customer->id,
                    'pickup_address'       => "Pickup Location $i, Phnom Penh",
                    'delivery_address'     => "Delivery Location $i, Cambodia",
                    'pickup_lat'           => 11.5626 + ($i * 0.005),
                    'pickup_lng'           => 104.9282 + ($i * 0.004),
                    'delivery_lat'         => 11.5626 + ($i * 0.015),
                    'delivery_lng'         => 104.9282 + ($i * 0.012),
                    'status'               => $status,
                    'price'                => rand(5, 50) + 0.99,
                    'weight'               => rand(1, 20) * 0.5,
                    'assigned_delivery_man' => $driver1->id,
                ]
            );

            if (in_array($status, ['confirmed', 'delivered'])) {
                Payment::firstOrCreate(
                    ['order_id' => $order->id],
                    [
                        'amount'         => $order->price,
                        'payment_method' => $i % 3 === 0 ? 'khqr' : ($i % 2 === 0 ? 'stripe' : 'cash'),
                        'payment_status' => $status === 'delivered' ? 'paid' : 'pending',
                        'paid_at'        => $status === 'delivered' ? now()->subDays(rand(1, 10)) : null,
                    ]
                );
            }
        }

        $this->command->info('✅ Seeded: roles, permissions, 4 users, 12 orders');

    }
}
