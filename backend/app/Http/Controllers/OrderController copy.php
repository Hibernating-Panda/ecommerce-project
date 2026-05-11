<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\User;
use App\Models\Delivery;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with('customer', 'deliveryMan', 'payment')
            ->when($request->search, function ($q) use ($request) {
                $q->where('pickup_address', 'LIKE', "%{$request->search}%")
                  ->orWhere('delivery_address', 'LIKE', "%{$request->search}%")
                  ->orWhereHas('customer', fn($q2) => $q2->where('name', 'LIKE', "%{$request->search}%"));
            })
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->customer_id, fn($q) => $q->where('customer_id', $request->customer_id))
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id'      => 'required|exists:users,id',
            'pickup_address'   => 'required|string',
            'delivery_address' => 'required|string',
            'price'            => 'required|numeric|min:0',
            'weight'           => 'nullable|numeric|min:0',
            'notes'            => 'nullable|string',
            'pickup_lat'       => 'nullable|numeric',
            'pickup_lng'       => 'nullable|numeric',
            'delivery_lat'     => 'nullable|numeric',
            'delivery_lng'     => 'nullable|numeric',
        ]);

        $order = Order::create($validated);

        activity('orders')->causedBy($request->user())
            ->performedOn($order)
            ->log("Order #{$order->id} created");

        return response()->json($order->load('customer'), 201);
    }

    public function show(Order $order)
    {
        return response()->json(
            $order->load('customer', 'deliveryMan', 'delivery', 'payment', 'trackings')
        );
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'pickup_address'         => 'sometimes|string',
            'delivery_address'       => 'sometimes|string',
            'price'                  => 'sometimes|numeric|min:0',
            'weight'                 => 'nullable|numeric',
            'notes'                  => 'nullable|string',
            'status'                 => 'sometimes|in:pending,confirmed,picked_up,in_transit,delivered,cancelled',
            'assigned_delivery_man'  => 'nullable|exists:users,id',
        ]);

        $order->update($validated);

        activity('orders')->causedBy($request->user())
            ->performedOn($order)
            ->log("Order #{$order->id} updated");

        return response()->json($order->load('customer', 'deliveryMan'));
    }

    public function destroy(Order $order)
    {
        activity('orders')->log("Order #{$order->id} deleted");
        $order->delete();

        return response()->json(['message' => 'Order deleted']);
    }

    public function assignDeliveryMan(Request $request, Order $order)
    {
        $request->validate([
            'delivery_man_id' => 'required|exists:users,id',
        ]);

        $driver = User::findOrFail($request->delivery_man_id);

        $order->update([
            'assigned_delivery_man' => $driver->id,
            'status'                => 'confirmed',
        ]);

        Delivery::updateOrCreate(
            ['order_id' => $order->id],
            ['delivery_man_id' => $driver->id, 'status' => 'assigned']
        );

        activity('orders')->causedBy($request->user())
            ->log("Order #{$order->id} assigned to {$driver->name}");

        return response()->json([
            'message' => "Assigned to {$driver->name}",
            'order'   => $order->load('deliveryMan'),
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,picked_up,in_transit,delivered,cancelled',
        ]);

        $old = $order->status;
        $order->update(['status' => $request->status]);

        if ($request->status === 'delivered' && $order->delivery) {
            $order->delivery->update([
                'status'       => 'delivered',
                'delivered_at' => now(),
            ]);
        }

        activity('orders')->causedBy($request->user())
            ->log("Order #{$order->id} status: {$old} → {$request->status}");

        return response()->json(['message' => 'Status updated', 'order' => $order]);
    }
}
