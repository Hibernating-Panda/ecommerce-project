<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'total_orders' => Order::count(),
            'completed_orders' => Order::whereIn('status', ['completed', 'delivered'])->count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'in_transit' => Order::where('status', 'in_transit')->count(),

            'total_revenue' => Payment::where('status', 'completed')->sum('amount'),
            'today_revenue' => Payment::where('status', 'completed')
                ->whereDate('created_at', today())
                ->sum('amount'),

            'total_customers' => User::role('user')->count(),
            'total_delivery_men' => User::role('delivery_man')->count(),
            'today_orders' => Order::whereDate('created_at', today())->count(),

            'deliveries' => [
                'total' => Delivery::count(),
                'pending' => Delivery::where('status', 'pending')->count(),
                'assigned' => Delivery::where('status', 'assigned')->count(),
                'in_transit' => Delivery::whereIn('status', ['picked_up', 'in_transit'])->count(),
                'delivered' => Delivery::where('status', 'delivered')->count(),
            ],
        ]);
    }

    public function charts()
    {
        $revenueChart = Payment::where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $ordersByStatus = Order::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        $ordersPerMonth = Order::where('created_at', '>=', now()->subMonths(6))
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $paymentMethods = Payment::where('status', 'completed')
            ->selectRaw('method, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('method')
            ->get();

        $topDeliveryMen = User::role('delivery_man')
            ->withCount([
                'deliveries as completed' => fn ($query) => $query->where('status', 'delivered'),
            ])
            ->orderByDesc('completed')
            ->limit(5)
            ->get(['id', 'name', 'phone']);

        return response()->json([
            'revenueChart' => $revenueChart,
            'ordersByStatus' => $ordersByStatus,
            'ordersPerMonth' => $ordersPerMonth,
            'paymentMethods' => $paymentMethods,
            'topDeliveryMen' => $topDeliveryMen,
        ]);
    }
}