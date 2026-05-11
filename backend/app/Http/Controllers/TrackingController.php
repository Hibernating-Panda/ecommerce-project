<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Tracking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use App\Events\DeliveryLocationUpdated;

class TrackingController extends Controller
{
    public function getLocation(Order $order)
    {
        $tracking = Tracking::where('order_id', $order->id)
            ->latest()
            ->first();

        return response()->json([
            'order_id'    => $order->id,
            'status'      => $order->status,
            'location'    => $tracking,
            'delivery_man' => $order->deliveryMan?->only('id', 'name', 'phone'),
        ]);
    }

    public function updateLocation(Request $request)
    {
        $request->validate([
            'order_id'  => 'required|exists:orders,id',
            'latitude'  => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'speed'     => 'nullable|numeric',
            'heading'   => 'nullable|numeric',
        ]);

        $tracking = Tracking::create([
            'order_id'      => $request->order_id,
            'delivery_man_id' => $request->user()->id,
            'latitude'      => $request->latitude,
            'longitude'     => $request->longitude,
            'speed'         => $request->speed,
            'heading'       => $request->heading,
        ]);

        // Broadcast via Laravel Echo / Pusher / Soketi
        broadcast(new DeliveryLocationUpdated($tracking))->toOthers();

        return response()->json(['message' => 'Location updated', 'tracking' => $tracking]);
    }

    public function history(Order $order)
    {
        $history = Tracking::where('order_id', $order->id)
            ->orderBy('created_at')
            ->get(['latitude', 'longitude', 'speed', 'created_at']);

        return response()->json($history);
    }
}
