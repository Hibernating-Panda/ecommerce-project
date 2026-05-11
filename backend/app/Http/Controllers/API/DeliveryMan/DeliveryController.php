<?php

namespace App\Http\Controllers\API\DeliveryMan;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Location;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    /**
     * Get assigned deliveries for the delivery man
     */
    public function assignedDeliveries(Request $request)
    {
        $deliveries = Delivery::where('driver_id', $request->user()->id)
            ->whereIn('status', ['assigned', 'picked_up', 'in_transit'])
            ->with(['order', 'latestLocation'])
            ->paginate(10);

        return response()->json($deliveries);
    }

    /**
     * Get delivery details
     */
    public function show($id)
    {
        $delivery = Delivery::find($id);

        if (!$delivery) {
            return response()->json(['message' => 'Delivery not found'], 404);
        }

        return response()->json($delivery->load(['order', 'locations', 'driver']));
    }

    /**
     * Update delivery status
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:picked_up,in_transit,delivered,cancelled',
            'notes' => 'nullable|string',
        ]);

        $delivery = Delivery::find($id);

        if (!$delivery) {
            return response()->json(['message' => 'Delivery not found'], 404);
        }

        // Update status with timestamp
        $delivery->update([
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? $delivery->notes,
        ]);

        // Update timestamp based on status
        if ($validated['status'] === 'picked_up') {
            $delivery->update(['picked_up_at' => now()]);
        } elseif ($validated['status'] === 'delivered') {
            $delivery->update(['completed_at' => now()]);
        }

        return response()->json(['message' => 'Status updated successfully', 'delivery' => $delivery]);
    }

    /**
     * Update current location
     */
    public function updateLocation(Request $request, $id)
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'address' => 'nullable|string',
        ]);

        $delivery = Delivery::find($id);

        if (!$delivery) {
            return response()->json(['message' => 'Delivery not found'], 404);
        }

        // Update current location
        $delivery->update([
            'current_lat' => $validated['latitude'],
            'current_lng' => $validated['longitude'],
        ]);

        // Record location history
        Location::create([
            'delivery_id' => $id,
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'address' => $validated['address'] ?? null,
        ]);

        return response()->json(['message' => 'Location updated successfully']);
    }

    /**
     * Get delivery history
     */
    public function history(Request $request)
    {
        $deliveries = Delivery::where('driver_id', $request->user()->id)
            ->where('status', 'delivered')
            ->with('order')
            ->orderBy('completed_at', 'desc')
            ->paginate(10);

        return response()->json($deliveries);
    }
}
