<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admineshop@outlook.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('L!onHeart#168'),
                'account_status' => 'active',
            ]
        );

        $admin->syncRoles(['admin']);
    }
}