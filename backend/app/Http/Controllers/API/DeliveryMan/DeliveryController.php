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
            'available' => Delivery::whereNull('driver_id')
                ->where('status', 'available')
                ->count(),

            'going_to_shop' => Delivery::where('driver_id', $driverId)
                ->where('status', 'going_to_shop')
                ->count(),

            'in_transit' => Delivery::where('driver_id', $driverId)
                ->where('status', 'in_transit')
                ->count(),

            'delivered' => Delivery::where('driver_id', $driverId)
                ->where('status', 'delivered')
                ->count(),

            'cancelled' => Delivery::where('driver_id', $driverId)
                ->where('status', 'cancelled')
                ->count(),
        ]);
    }

    public function availableDeliveries(Request $request)
    {
        $deliveries = Delivery::whereNull('driver_id')
            ->where('status', 'available')
            ->with([
                'order.customer',
                'shop',
                'orderItems.product',
                'orderItems.productSize',
            ])
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
            ->where('status', 'available')
            ->find($id);

        if (! $delivery) {
            return response()->json([
                'message' => 'Delivery task is not available anymore.',
            ], 404);
        }

        $delivery->update([
            'driver_id' => $request->user()->id,
            'status' => 'going_to_shop',
            'started_at' => now(),
        ]);

        return response()->json([
            'message' => 'Delivery task accepted. Go to the shop.',
            'delivery' => $delivery->fresh()->load([
                'order.customer',
                'shop',
                'orderItems.product',
                'orderItems.productSize',
            ]),
        ]);
    }

    public function assignedDeliveries(Request $request)
    {
        $deliveries = Delivery::where('driver_id', $request->user()->id)
            ->whereIn('status', ['going_to_shop', 'in_transit'])
            ->with([
                'order.customer',
                'shop',
                'orderItems.product',
                'orderItems.productSize',
                'latestLocation',
            ])
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
                'orderItems.productSize',
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

        if ($validated['status'] === 'picked_up') {
            if ($delivery->status !== 'going_to_shop') {
                return response()->json([
                    'message' => 'You can only pick up after accepting the task.',
                ], 422);
            }

            $delivery->update([
                'status' => 'in_transit',
                'picked_up_at' => now(),
                'notes' => $validated['notes'] ?? $delivery->notes,
            ]);

            $delivery->order?->update([
                'status' => 'in_transit',
            ]);

            return response()->json([
                'message' => 'Order picked up. Deliver to customer.',
                'delivery' => $delivery->fresh()->load([
                    'order.customer',
                    'shop',
                    'orderItems.product',
                    'orderItems.productSize',
                ]),
            ]);
        }

        if ($validated['status'] === 'in_transit') {
            $delivery->update([
                'status' => 'in_transit',
                'picked_up_at' => $delivery->picked_up_at ?? now(),
                'notes' => $validated['notes'] ?? $delivery->notes,
            ]);

            $delivery->order?->update([
                'status' => 'in_transit',
            ]);

            return response()->json([
                'message' => 'Delivery is now in transit.',
                'delivery' => $delivery->fresh()->load([
                    'order.customer',
                    'shop',
                    'orderItems.product',
                    'orderItems.productSize',
                ]),
            ]);
        }

        if ($validated['status'] === 'delivered') {
            if ($delivery->status !== 'in_transit') {
                return response()->json([
                    'message' => 'Please mark the order as picked up first.',
                ], 422);
            }

            $delivery->update([
                'status' => 'delivered',
                'completed_at' => now(),
                'notes' => $validated['notes'] ?? $delivery->notes,
            ]);

            $this->refreshOrderAfterDelivery($delivery);

            return response()->json([
                'message' => 'Delivery completed successfully.',
                'delivery' => $delivery->fresh()->load([
                    'order.customer',
                    'shop',
                    'orderItems.product',
                    'orderItems.productSize',
                ]),
            ]);
        }

        if ($validated['status'] === 'cancelled') {
            $delivery->update([
                'status' => 'cancelled',
                'notes' => $validated['notes'] ?? $delivery->notes,
            ]);

            return response()->json([
                'message' => 'Delivery cancelled.',
                'delivery' => $delivery->fresh()->load([
                    'order.customer',
                    'shop',
                    'orderItems.product',
                    'orderItems.productSize',
                ]),
            ]);
        }

        return response()->json([
            'message' => 'Invalid status.',
        ], 422);
    }

    public function updateLocation(Request $request, $id)
    {
        $validated = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
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
            'timestamp' => now(),
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
            ->with([
                'order.customer',
                'shop',
                'orderItems.product',
                'orderItems.productSize',
            ])
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

        if (
            $order->deliveries->isNotEmpty()
            && $order->deliveries->every(fn ($item) => $item->status === 'delivered')
        ) {
            $order->update([
                'status' => 'delivered',
            ]);

            return;
        }

        if ($order->deliveries->contains(fn ($item) => $item->status === 'in_transit')) {
            $order->update([
                'status' => 'in_transit',
            ]);
        }
    }
}