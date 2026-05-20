<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'users' => [
                'total' => User::count(),
                'admins' => User::role('admin')->count(),
                'shop_owners' => User::role('shop_owner')->count(),
                'customers' => User::role('user')->count(),
                'delivery_men' => User::role('delivery_man')->count(),
                'pending' => User::where('account_status', 'pending')->count(),
                'active' => User::where('account_status', 'active')->count(),
                'rejected' => User::where('account_status', 'rejected')->count(),
            ],

            'shops' => [
                'total' => Shop::count(),
            ],

            'products' => [
                'total' => Product::count(),
                'active' => Product::where('status', 'active')->count(),
                'inactive' => Product::where('status', 'inactive')->count(),
                'pending' => Product::where('status', 'pending')->count(),
                'rejected' => Product::where('status', 'rejected')->count(),
            ],

            'orders' => [
                'total' => Order::count(),
                'pending' => Order::where('status', 'pending')->count(),
                'completed' => Order::whereIn('status', ['completed', 'delivered'])->count(),
                'cancelled' => Order::where('status', 'cancelled')->count(),
                'total_sales' => OrderItem::whereIn('status', ['accepted', 'ready'])->sum('total'),
            ],

            'deliveries' => [
                'total' => Delivery::count(),
                'pending' => Delivery::where('status', 'pending')->count(),
                'assigned' => Delivery::where('status', 'assigned')->count(),
                'delivered' => Delivery::where('status', 'delivered')->count(),
                'cancelled' => Delivery::where('status', 'cancelled')->count(),
            ],

            'total_users' => User::count(),
            'total_admins' => User::role('admin')->count(),
            'total_shop_owners' => User::role('shop_owner')->count(),
            'total_customers' => User::role('user')->count(),
            'total_delivery_men' => User::role('delivery_man')->count(),
            'total_products' => Product::count(),
            'pending_accounts' => User::where('account_status', 'pending')->count(),
            'active_accounts' => User::where('account_status', 'active')->count(),
            'rejected_accounts' => User::where('account_status', 'rejected')->count(),
        ]);
    }
}