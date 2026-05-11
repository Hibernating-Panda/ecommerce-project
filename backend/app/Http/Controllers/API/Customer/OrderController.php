<?php

namespace App\Http\Controllers\API\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Delivery;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Get customer orders
     */
    public function index(Request $request)
    {
        $orders = Order::where('customer_id', $request->user()->id)
            ->with(['delivery', 'payment'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($orders);
    }

    /**
     * Create new order
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'delivery_location' => 'required|string',
            'delivery_lat' => 'required|numeric',
            'delivery_lng' => 'required|numeric',
            'total_price' => 'required|numeric',
            'notes' => 'nullable|string',
        ]);

        $order = Order::create([
            'customer_id' => $request->user()->id,
            'status' => 'pending',
            'total_price' => $validated['total_price'],
        ]);

        // Create delivery record
        Delivery::create([
            'order_id' => $order->id,
            'status' => 'pending',
            'pickup_location' => 'Store',
            'pickup_lat' => 0,
            'pickup_lng' => 0,
            'delivery_location' => $validated['delivery_location'],
            'delivery_lat' => $validated['delivery_lat'],
            'delivery_lng' => $validated['delivery_lng'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json(['message' => 'Order created successfully', 'order' => $order], 201);
    }

    /**
     * Track order
     */
    public function track($id)
    {
        $order = Order::with(['delivery.latestLocation', 'delivery.driver'])->find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json($order);
    }

    /**
     * Get order details
     */
    public function show($id)
    {
        $order = Order::with(['delivery.locations', 'payment'])->find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json($order);
    }
}
