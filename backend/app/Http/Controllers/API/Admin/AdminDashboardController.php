<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'total_users' => User::count(),
            'total_admins' => User::role('admin')->count(),
            'total_shop_owners' => User::role('shop_owner')->count(),
            'total_customers' => User::role('user')->count(),
            'total_delivery_men' => User::role('delivery_man')->count(),
            'total_products' => Product::count(),
        ]);
    }
}