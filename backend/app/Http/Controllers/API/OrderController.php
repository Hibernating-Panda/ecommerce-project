<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Delivery;
use App\Models\DeliveryItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function customerIndex(Request $request)
    {
        $orders = Order::with([
                'items.product',
                'items.productSize',
                'items.shop',
                'delivery.shop',
                'delivery.driver',
                'deliveries.shop',
                'deliveries.driver',
                'payment',
            ])
            ->where('customer_id', $request->user()->id)
            ->latest()
            ->paginate($request->integer('per_page', 10));

        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (! $user->hasRole('user')) {
            return response()->json([
                'message' => 'Only customers can place orders.',
            ], 403);
        }

        if (! $user->address) {
            return response()->json([
                'message' => 'Please add your address before placing an order.',
            ], 422);
        }

        $cartItems = CartItem::with([
                'product.shop',
                'product.category',
                'productSize',
            ])
            ->where('user_id', $user->id)
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'message' => 'Your cart is empty.',
            ], 422);
        }

        $invalidItem = $cartItems->first(function ($item) {
            return ! $item->product || ! $item->product->shop;
        });

        if ($invalidItem) {
            return response()->json([
                'message' => 'Some cart products are no longer available.',
            ], 422);
        }

        foreach ($cartItems as $item) {
            $availableStock = $item->productSize
                ? (int) $item->productSize->stock
                : (int) $item->product->stock;

            if ($availableStock < (int) $item->quantity) {
                return response()->json([
                    'message' => 'Not enough stock available for ' . $item->product->name . '.',
                ], 422);
            }
        }

        $order = DB::transaction(function () use ($user, $cartItems) {
            $orderTotal = $cartItems->sum(function ($item) {
                $price = $this->cartItemPrice($item);

                return $price * (int) $item->quantity;
            });

            $order = Order::create([
                'customer_id' => $user->id,
                'customer_name' => $user->name,
                'delivery_address' => $user->address,
                'delivery_lat' => $user->latitude ?? null,
                'delivery_lng' => $user->longitude ?? null,
                'payment_method' => 'cash',
                'order_type' => null,
                'pickup_date' => null,
                'status' => 'pending',
                'subtotal' => $orderTotal,
                'delivery_distance_km' => 0,
                'delivery_fee' => 0,
                'total' => $orderTotal,
                'order_date' => now(),
            ]);

            foreach ($cartItems as $item) {
                $price = $this->cartItemPrice($item);
                $quantity = (int) $item->quantity;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'product_size_id' => $item->product_size_id,
                    'shop_id' => $item->product->shop_id,
                    'quantity' => $quantity,
                    'price' => $price,
                    'total' => $price * $quantity,
                    'status' => 'pending',
                ]);
            }

            CartItem::where('user_id', $user->id)->delete();

            return $order->load([
                'items.product',
                'items.productSize',
                'items.shop',
                'payment',
            ]);
        });

        return response()->json([
            'message' => 'Order placed successfully.',
            'order' => $order,
        ], 201);
    }

    public function cancel(Request $request, Order $order)
    {
        if ($order->customer_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $order->loadMissing('payment');

        if ($order->payment && $order->payment->status === 'paid') {
            return response()->json([
                'message' => 'This order has already been paid. Please contact support or admin for cancellation/refund.',
            ], 422);
        }

        if (in_array($order->status, [
            'ready_for_delivery',
            'in_transit',
            'delivered',
            'completed',
            'cancelled',
        ])) {
            return response()->json([
                'message' => 'This order can no longer be cancelled at this stage.',
            ], 422);
        }

        DB::transaction(function () use ($order) {
            $order->update([
                'status' => 'cancelled',
                'subtotal' => 0,
                'delivery_distance_km' => 0,
                'delivery_fee' => 0,
                'total' => 0,
            ]);

            $order->items()->update([
                'status' => 'rejected',
                'reject_reason' => 'Order cancelled by customer.',
            ]);

            $order->deliveries()->update([
                'status' => 'cancelled',
                'notes' => DB::raw("CONCAT(COALESCE(notes, ''), ' Cancelled because customer cancelled the order.')"),
            ]);

            $order->payment?->update([
                'status' => 'cancelled',
            ]);
        });

        return response()->json([
            'message' => 'Order cancelled successfully.',
            'order' => $order->fresh()->load([
                'items.product',
                'items.productSize',
                'items.shop',
                'delivery.shop',
                'delivery.driver',
                'deliveries.shop',
                'deliveries.driver',
                'payment',
            ]),
        ]);
    }

    public function previewCheckout(Request $request, Order $order)
    {
        if ($order->customer_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $validated = $request->validate([
            'order_type' => ['required', 'in:pickup,delivery'],
            'delivery_address' => ['required_if:order_type,delivery', 'nullable', 'string', 'max:1000'],
            'delivery_lat' => ['required_if:order_type,delivery', 'nullable', 'numeric', 'between:-90,90'],
            'delivery_lng' => ['required_if:order_type,delivery', 'nullable', 'numeric', 'between:-180,180'],
            'pickup_date' => ['nullable', 'date'],
        ]);

        $order->load([
            'items.shop',
            'items.product',
            'items.productSize',
        ]);

        $activeItems = $order->items->where('status', '!=', 'rejected');

        if ($activeItems->isEmpty()) {
            return response()->json([
                'message' => 'This order has no active products.',
            ], 422);
        }

        $subtotal = round((float) $activeItems->sum('total'), 2);

        if ($validated['order_type'] === 'pickup') {
            return response()->json([
                'subtotal' => $subtotal,
                'delivery_distance_km' => 0,
                'delivery_fee' => 0,
                'total' => $subtotal,
                'delivery_details' => [],
            ]);
        }

        $delivery = $this->calculateDeliveryFee(
            $activeItems,
            (float) $validated['delivery_lat'],
            (float) $validated['delivery_lng']
        );

        return response()->json([
            'subtotal' => $subtotal,
            'delivery_distance_km' => $delivery['distance_km'],
            'delivery_fee' => $delivery['fee'],
            'total' => round($subtotal + $delivery['fee'], 2),
            'delivery_details' => $delivery['details'],
        ]);
    }

    public function checkout(Request $request, Order $order)
    {
        if ($order->customer_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $validated = $request->validate([
            'order_type' => ['required', 'in:pickup,delivery'],
            'payment_method' => ['required_if:order_type,delivery', 'nullable', 'in:cash,online'],
            'pickup_date' => ['required_if:order_type,pickup', 'nullable', 'date', 'after_or_equal:today'],
            'delivery_address' => ['required_if:order_type,delivery', 'nullable', 'string', 'max:1000'],
            'delivery_lat' => ['required_if:order_type,delivery', 'nullable', 'numeric', 'between:-90,90'],
            'delivery_lng' => ['required_if:order_type,delivery', 'nullable', 'numeric', 'between:-180,180'],
        ]);

        $order->load([
            'items.shop',
            'items.product',
            'items.productSize',
            'customer',
            'payment',
        ]);

        if (! in_array($order->status, ['pending', 'partially_rejected'])) {
            return response()->json([
                'message' => 'This order has already been checked out.',
            ], 422);
        }

        if ($order->payment && $order->payment->status === 'paid') {
            return response()->json([
                'message' => 'This order has already been paid.',
            ], 422);
        }

        if ($order->order_type && $order->total > 0) {
            return response()->json([
                'message' => 'This order has already been checked out.',
            ], 422);
        }

        $activeItems = $order->items->where('status', '!=', 'rejected');

        if ($activeItems->isEmpty()) {
            return response()->json([
                'message' => 'This order cannot be checked out because all products were rejected.',
            ], 422);
        }

        $subtotal = round((float) $activeItems->sum('total'), 2);
        $deliveryDistanceKm = 0;
        $deliveryFee = 0;
        $deliveryDetails = [];

        if ($validated['order_type'] === 'delivery') {
            $delivery = $this->calculateDeliveryFee(
                $activeItems,
                (float) $validated['delivery_lat'],
                (float) $validated['delivery_lng']
            );

            $deliveryDistanceKm = $delivery['distance_km'];
            $deliveryFee = $delivery['fee'];
            $deliveryDetails = $delivery['details'];
        }

        DB::transaction(function () use (
            $order,
            $validated,
            $subtotal,
            $deliveryDistanceKm,
            $deliveryFee
        ) {
            $order->update([
                'status' => $validated['order_type'] === 'pickup'
                    ? 'accepted'
                    : 'ready_for_delivery',
                'subtotal' => $subtotal,
                'delivery_distance_km' => $deliveryDistanceKm,
                'delivery_fee' => $deliveryFee,
                'total' => round($subtotal + $deliveryFee, 2),
                'order_type' => $validated['order_type'],
                'payment_method' => $validated['order_type'] === 'delivery'
                    ? $validated['payment_method']
                    : 'cash',
                'pickup_date' => $validated['order_type'] === 'pickup'
                    ? $validated['pickup_date']
                    : null,
                'delivery_address' => $validated['order_type'] === 'delivery'
                    ? $validated['delivery_address']
                    : $order->delivery_address,
                'delivery_lat' => $validated['order_type'] === 'delivery'
                    ? $validated['delivery_lat']
                    : null,
                'delivery_lng' => $validated['order_type'] === 'delivery'
                    ? $validated['delivery_lng']
                    : null,
            ]);

            if ($validated['order_type'] === 'delivery') {
                $this->createDeliveryTasksForOrder($order->fresh());
            } else {
                $order->deliveries()->update([
                    'status' => 'cancelled',
                    'notes' => DB::raw("CONCAT(COALESCE(notes, ''), ' Cancelled because customer selected pickup.')"),
                ]);
            }
        });

        return response()->json([
            'message' => $validated['order_type'] === 'pickup'
                ? 'Pickup checkout completed.'
                : 'Delivery checkout completed.',
            'subtotal' => $subtotal,
            'delivery_distance_km' => $deliveryDistanceKm,
            'delivery_fee' => $deliveryFee,
            'total' => round($subtotal + $deliveryFee, 2),
            'delivery_details' => $deliveryDetails,
            'order' => $order->fresh()->load([
                'items.product',
                'items.productSize',
                'items.shop',
                'delivery.shop',
                'delivery.driver',
                'deliveries.shop',
                'deliveries.driver',
                'payment',
            ]),
        ]);
    }

    private function cartItemPrice(CartItem $item): float
    {
        $basePrice = $item->productSize
            ? (float) $item->productSize->price
            : (float) ($item->product?->price ?? 0);

        return $this->discountedPrice($item->product, $basePrice);
    }

    private function discountedPrice($product, float $basePrice): float
    {
        if (! $product) {
            return round($basePrice, 2);
        }

        $discountPercent = (float) ($product->discount_percent ?? 0);

        if ($discountPercent <= 0) {
            return round($basePrice, 2);
        }

        $discountStart = $product->discount_start;
        $discountEnd = $product->discount_end;

        if ($discountStart && now()->lt($discountStart)) {
            return round($basePrice, 2);
        }

        if ($discountEnd && now()->gt($discountEnd)) {
            return round($basePrice, 2);
        }

        $discounted = $basePrice - ($basePrice * ($discountPercent / 100));

        return round(max($discounted, 0), 2);
    }

    private function calculateDeliveryFee($activeItems, float $deliveryLat, float $deliveryLng): array
    {
        $baseFee = 1.00;
        $pricePerKm = 0.50;
        $minimumFeePerShop = 1.50;

        $details = [];
        $totalDistance = 0;
        $totalFee = 0;

        $shopGroups = $activeItems->groupBy('shop_id');

        foreach ($shopGroups as $shopId => $items) {
            $shop = $items->first()->shop;

            if (! $shop || ! $shop->latitude || ! $shop->longitude) {
                abort(response()->json([
                    'message' => 'Shop location is missing. Please ask the shop owner to set shop location.',
                    'shop_id' => $shopId,
                ], 422));
            }

            $distanceKm = $this->distanceKm(
                (float) $shop->latitude,
                (float) $shop->longitude,
                $deliveryLat,
                $deliveryLng
            );

            $fee = max($minimumFeePerShop, $baseFee + ($distanceKm * $pricePerKm));

            $distanceKm = round($distanceKm, 2);
            $fee = round($fee, 2);

            $totalDistance += $distanceKm;
            $totalFee += $fee;

            $details[] = [
                'shop_id' => $shop->id,
                'shop_name' => $shop->shop_name,
                'shop_latitude' => $shop->latitude,
                'shop_longitude' => $shop->longitude,
                'distance_km' => $distanceKm,
                'delivery_fee' => $fee,
            ];
        }

        return [
            'distance_km' => round($totalDistance, 2),
            'fee' => round($totalFee, 2),
            'details' => $details,
        ];
    }

    private function distanceKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371;

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2)
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2))
            * sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    private function createDeliveryTasksForOrder(Order $order): void
    {
        $order->load([
            'items.shop',
            'items.product',
            'items.productSize',
        ]);

        $activeItems = $order->items->where('status', '!=', 'rejected');
        $shopGroups = $activeItems->groupBy('shop_id');

        foreach ($shopGroups as $shopId => $items) {
            $shop = $items->first()->shop;

            if (! $shop) {
                continue;
            }

            $delivery = Delivery::updateOrCreate(
                [
                    'order_id' => $order->id,
                    'shop_id' => $shop->id,
                ],
                [
                    'driver_id' => null,
                    'status' => 'available',
                    'pickup_location' => $shop->address,
                    'pickup_lat' => $shop->latitude,
                    'pickup_lng' => $shop->longitude,
                    'delivery_location' => $order->delivery_address,
                    'delivery_lat' => $order->delivery_lat,
                    'delivery_lng' => $order->delivery_lng,
                    'notes' => null,
                ]
            );

            if (class_exists(DeliveryItem::class)) {
                DeliveryItem::where('delivery_id', $delivery->id)->delete();

                foreach ($items as $orderItem) {
                    DeliveryItem::create([
                        'delivery_id' => $delivery->id,
                        'order_item_id' => $orderItem->id,
                    ]);
                }
            }
        }
    }

    public function trackDelivery(Request $request, Order $order)
    {
        if ($order->customer_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $order->load([
            'customer',
            'items.product',
            'items.productSize',
            'items.shop',
            'deliveries.shop',
            'deliveries.driver',
            'deliveries.latestLocation',
            'deliveries.orderItems.product',
            'deliveries.orderItems.productSize',
        ]);

        $delivery = $order->deliveries
            ->whereNotIn('status', ['cancelled'])
            ->sortByDesc('id')
            ->first();

        if (! $delivery) {
            return response()->json([
                'order' => $order,
                'delivery' => null,
                'message' => 'No delivery task has been created for this order yet.',
            ]);
        }

        $latestLocation = $delivery->latestLocation;

        $driverLat = $delivery->current_lat ?: $latestLocation?->latitude;
        $driverLng = $delivery->current_lng ?: $latestLocation?->longitude;

        return response()->json([
            'order' => $order,
            'delivery' => $delivery,
            'tracking' => [
                'status' => $delivery->status,
                'pickup' => [
                    'label' => 'Shop Pickup',
                    'address' => $delivery->pickup_location,
                    'lat' => $delivery->pickup_lat,
                    'lng' => $delivery->pickup_lng,
                ],
                'destination' => [
                    'label' => 'Customer Address',
                    'address' => $delivery->delivery_location,
                    'lat' => $delivery->delivery_lat,
                    'lng' => $delivery->delivery_lng,
                ],
                'driver' => [
                    'label' => $delivery->driver?->name ?? 'Delivery Man',
                    'phone' => $delivery->driver?->phone,
                    'lat' => $driverLat,
                    'lng' => $driverLng,
                    'updated_at' => $latestLocation?->timestamp ?? $delivery->updated_at,
                ],
            ],
        ]);
    }
}