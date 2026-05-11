<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DeliveryController extends Controller
{
    public function index(Request $request)
    {
        $deliveries = Delivery::with('order.customer', 'deliveryMan')
            ->when($request->delivery_man_id, fn($q) => $q->where('delivery_man_id', $request->delivery_man_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(15);

        return response()->json($deliveries);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id'        => 'required|exists:orders,id',
            'delivery_man_id' => 'required|exists:users,id',
        ]);

        $delivery = Delivery::create([...$validated, 'status' => 'assigned']);

        Order::find($validated['order_id'])->update([
            'status'                => 'confirmed',
            'assigned_delivery_man' => $validated['delivery_man_id'],
        ]);

        return response()->json($delivery->load('order', 'deliveryMan'), 201);
    }

    public function show(Delivery $delivery)
    {
        return response()->json($delivery->load('order.customer', 'deliveryMan'));
    }

    public function update(Request $request, Delivery $delivery)
    {
        $validated = $request->validate([
            'status' => 'required|in:assigned,picked_up,in_transit,delivered,failed',
            'notes'  => 'nullable|string',
        ]);

        $delivery->update($validated);

        // Sync order status
        $statusMap = [
            'picked_up'  => 'picked_up',
            'in_transit' => 'in_transit',
            'delivered'  => 'delivered',
            'failed'     => 'cancelled',
        ];

        if (isset($statusMap[$validated['status']])) {
            $delivery->order->update(['status' => $statusMap[$validated['status']]]);
        }

        if ($validated['status'] === 'delivered') {
            $delivery->update(['delivered_at' => now()]);
        }

        \activity('deliveries')->causedBy($request->user())
            ->log("Delivery #{$delivery->id} status → {$validated['status']}");

        return response()->json($delivery->load('order'));
    }

    public function destroy(Delivery $delivery)
    {
        $delivery->delete();
        return response()->json(['message' => 'Delivery deleted']);
    }

    public function uploadProof(Request $request, Delivery $delivery)
    {
        $request->validate([
            'proof_image' => 'required|image|max:5120', // 5MB max
        ]);

        // Delete old proof image if exists
        if ($delivery->proof_image) {
            Storage::disk('public')->delete($delivery->proof_image);
        }

        $path = $request->file('proof_image')->store('delivery-proofs', 'public');

        $delivery->update([
            'proof_image' => $path,
            'status'      => 'delivered',
            'delivered_at'=> now(),
        ]);

        $delivery->order->update(['status' => 'delivered']);

        activity('deliveries')->causedBy($request->user())
            ->log("Delivery #{$delivery->id} proof uploaded");

        return response()->json([
            'message'     => 'Proof uploaded and delivery marked complete',
            'proof_url'   => Storage::url($path),
            'delivery'    => $delivery->load('order'),
        ]);
    }
}
