<?php

namespace App\Http\Controllers\API\DeliveryMan;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Location;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function stats(Request $request)
    {
        $driverId = $request->user()->id;

        return response()->json([
            'assigned' => Delivery::where('driver_id', $driverId)->where('status', 'assigned')->count(),
            'delivering' => Delivery::where('driver_id', $driverId)->whereIn('status', ['picked_up', 'in_transit'])->count(),
            'delivered' => Delivery::where('driver_id', $driverId)->where('status', 'delivered')->count(),
            'cancelled' => Delivery::where('driver_id', $driverId)->where('status', 'cancelled')->count(),
        ]);
    }

    public function availableDeliveries(Request $request)
    {
        $deliveries = Delivery::whereNull('driver_id')
            ->where('status', 'pending')
            ->with(['order.customer', 'shop', 'orderItems.product'])
            ->latest()
            ->paginate($request->integer('per_page', 10));

        return response()->json($deliveries);
    }

    public function acceptDelivery(Request $request, $id)
    {
        if (! $request->user()->hasRole('delivery_man')) {
            return response()->json([
                'message' => 'Only delivery men can accept deliveries.',
            ], 403);
        }

        $delivery = Delivery::whereNull('driver_id')
            ->where('status', 'pending')
            ->find($id);

        if (! $delivery) {
            return response()->json([
                'message' => 'Delivery task is not available anymore.',
            ], 404);
        }

        $delivery->update([
            'driver_id' => $request->user()->id,
            'status' => 'assigned',
            'started_at' => now(),
        ]);

        $delivery->order?->update([
            'status' => 'in_transit',
        ]);

        return response()->json([
            'message' => 'Delivery task accepted.',
            'delivery' => $delivery->load(['order.customer', 'shop', 'orderItems.product']),
        ]);
    }

    public function assignedDeliveries(Request $request)
    {
        $deliveries = Delivery::where('driver_id', $request->user()->id)
            ->whereIn('status', ['assigned', 'picked_up', 'in_transit'])
            ->with(['order.customer', 'shop', 'orderItems.product', 'latestLocation'])
            ->latest()
            ->paginate($request->integer('per_page', 10));

        return response()->json($deliveries);
    }

    public function show(Request $request, $id)
    {
        $delivery = Delivery::with([
                'order.customer',
                'shop',
                'orderItems.product',
                'locations',
                'driver',
            ])
            ->where(function ($query) use ($request) {
                $query->where('driver_id', $request->user()->id)
                    ->orWhereNull('driver_id');
            })
            ->find($id);

        if (! $delivery) {
            return response()->json([
                'message' => 'Delivery not found.',
            ], 404);
        }

        return response()->json($delivery);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:picked_up,in_transit,delivered,cancelled'],
            'notes' => ['nullable', 'string'],
        ]);

        $delivery = Delivery::where('driver_id', $request->user()->id)->find($id);

        if (! $delivery) {
            return response()->json([
                'message' => 'Delivery not found or not assigned to you.',
            ], 404);
        }

        if (in_array($delivery->status, ['delivered', 'cancelled'])) {
            return response()->json([
                'message' => 'This delivery is already finished.',
            ], 422);
        }

        $data = [
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? $delivery->notes,
        ];

        if ($validated['status'] === 'picked_up') {
            $data['picked_up_at'] = now();
        }

        if ($validated['status'] === 'in_transit') {
            $data['started_at'] = $delivery->started_at ?? now();
        }

        if ($validated['status'] === 'delivered') {
            $data['completed_at'] = now();
        }

        $delivery->update($data);
        $this->refreshOrderAfterDelivery($delivery);

        return response()->json([
            'message' => 'Delivery status updated successfully.',
            'delivery' => $delivery->load(['order.customer', 'shop', 'orderItems.product']),
        ]);
    }

    public function updateLocation(Request $request, $id)
    {
        $validated = $request->validate([
            'latitude' => ['required', 'numeric'],
            'longitude' => ['required', 'numeric'],
            'address' => ['nullable', 'string'],
        ]);

        $delivery = Delivery::where('driver_id', $request->user()->id)->find($id);

        if (! $delivery) {
            return response()->json([
                'message' => 'Delivery not found or not assigned to you.',
            ], 404);
        }

        if (in_array($delivery->status, ['delivered', 'cancelled'])) {
            return response()->json([
                'message' => 'Cannot update location for finished delivery.',
            ], 422);
        }

        $delivery->update([
            'current_lat' => $validated['latitude'],
            'current_lng' => $validated['longitude'],
        ]);

        Location::create([
            'delivery_id' => $delivery->id,
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'address' => $validated['address'] ?? null,
        ]);

        return response()->json([
            'message' => 'Location updated successfully.',
            'delivery' => $delivery->fresh(),
        ]);
    }

    public function history(Request $request)
    {
        $deliveries = Delivery::where('driver_id', $request->user()->id)
            ->whereIn('status', ['delivered', 'cancelled'])
            ->with(['order.customer', 'shop', 'orderItems.product'])
            ->orderByDesc('completed_at')
            ->paginate($request->integer('per_page', 10));

        return response()->json($deliveries);
    }

    public function profile(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'status' => 'online',
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        $request->user()->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $request->user()->fresh(),
        ]);
    }

    private function refreshOrderAfterDelivery(Delivery $delivery): void
    {
        $order = $delivery->order;

        if (! $order) {
            return;
        }

        $order->load('deliveries');

        if ($order->deliveries->isNotEmpty() && $order->deliveries->every(fn ($item) => $item->status === 'delivered')) {
            $order->update(['status' => 'delivered']);
            return;
        }

        if ($order->deliveries->contains(fn ($item) => in_array($item->status, ['picked_up', 'in_transit']))) {
            $order->update(['status' => 'in_transit']);
        }
    }
}