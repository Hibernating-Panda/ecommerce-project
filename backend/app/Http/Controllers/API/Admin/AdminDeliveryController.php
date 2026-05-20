<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\User;
use Illuminate\Http\Request;

class AdminDeliveryController extends Controller
{
    public function index(Request $request)
    {
        $deliveries = Delivery::with([
                'order.customer',
                'shop',
                'driver',
                'orderItems.product',
            ])
            ->when($request->status, fn ($query) => $query->where('status', $request->status))
            ->when($request->driver_id, fn ($query) => $query->where('driver_id', $request->driver_id))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'deliveries' => $deliveries,
        ]);
    }

    public function deliveryMen()
    {
        $drivers = User::role('delivery_man')
            ->where('account_status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone']);

        return response()->json([
            'delivery_men' => $drivers,
        ]);
    }

    public function assign(Request $request, Delivery $delivery)
    {
        if (in_array($delivery->status, ['cancelled', 'delivered'])) {
            return response()->json([
                'message' => 'This delivery can no longer be assigned.',
            ], 422);
        }

        $validated = $request->validate([
            'driver_id' => ['required', 'exists:users,id'],
        ]);

        $driver = User::findOrFail($validated['driver_id']);

        if (! $driver->hasRole('delivery_man') || $driver->account_status !== 'active') {
            return response()->json([
                'message' => 'Selected user is not an active delivery man.',
            ], 422);
        }

        $delivery->update([
            'driver_id' => $driver->id,
            'status' => 'assigned',
            'started_at' => $delivery->started_at ?? now(),
        ]);

        return response()->json([
            'message' => 'Delivery man assigned successfully.',
            'delivery' => $delivery->load([
                'order.customer',
                'shop',
                'driver',
                'orderItems.product',
            ]),
        ]);
    }

    public function cancel(Delivery $delivery)
    {
        if ($delivery->status === 'delivered') {
            return response()->json([
                'message' => 'Delivered orders cannot be cancelled.',
            ], 422);
        }

        $delivery->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'message' => 'Delivery cancelled.',
            'delivery' => $delivery->load([
                'order.customer',
                'shop',
                'driver',
                'orderItems.product',
            ]),
        ]);
    }
}