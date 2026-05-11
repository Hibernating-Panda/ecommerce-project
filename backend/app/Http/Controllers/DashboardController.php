<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Models\Delivery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'total_orders'       => Order::count(),
            'completed_orders'   => Order::where('status', 'delivered')->count(),
            'pending_orders'     => Order::where('status', 'pending')->count(),
            'in_transit'         => Order::where('status', 'in_transit')->count(),
            'total_revenue'      => Payment::where('payment_status', 'paid')->sum('amount'),
            'total_customers'    => User::role('customer')->count(),
            'total_delivery_men' => User::role('delivery_man')->count(),
            'today_orders'       => Order::whereDate('created_at', today())->count(),
            'today_revenue'      => Payment::where('payment_status', 'paid')
                                           ->whereDate('created_at', today())
                                           ->sum('amount'),
        ]);
    }

    public function charts()
    {
        // Revenue last 7 days
        $revenueChart = Payment::where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Orders by status
        $ordersByStatus = Order::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        // Orders per month (last 6 months)
        $ordersPerMonth = Order::where('created_at', '>=', now()->subMonths(6))
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Payment methods breakdown
        $paymentMethods = Payment::where('payment_status', 'paid')
            ->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('payment_method')
            ->get();

        // Top delivery men by completed orders
        $topDeliveryMen = User::role('delivery_man')
            ->withCount(['deliveries as completed' => fn($q) => $q->where('status', 'delivered')])
            ->orderByDesc('completed')
            ->limit(5)
            ->get(['id', 'name', 'phone']);

        return response()->json(compact(
            'revenueChart',
            'ordersByStatus',
            'ordersPerMonth',
            'paymentMethods',
            'topDeliveryMen'
        ));
    }
}
