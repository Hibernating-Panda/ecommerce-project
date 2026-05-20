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
                'items.shop',
                'delivery.shop',
                'delivery.driver',
                'delivery.orderItems.product',
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

        $cartItems = CartItem::with('product.shop')
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

        $order = DB::transaction(function () use ($user, $cartItems) {
            $orderTotal = $cartItems->sum(function ($item) {
                return (float) $item->product->price * (int) $item->quantity;
            });

            $order = Order::create([
                'customer_id' => $user->id,
                'customer_name' => $user->name,
                'delivery_address' => $user->address,
                'payment_method' => 'cash',
                'order_type' => null,
                'pickup_date' => null,
                'status' => 'pending',
                'total' => $orderTotal,
                'order_date' => now(),
            ]);

            foreach ($cartItems as $item) {
                $price = (float) $item->product->price;
                $quantity = (int) $item->quantity;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
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
                'items.shop',
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

        if (in_array($order->status, ['delivered', 'completed', 'in_transit'])) {
            return response()->json([
                'message' => 'This order can no longer be cancelled.',
            ], 422);
        }

        DB::transaction(function () use ($order) {
            $order->update([
                'status' => 'cancelled',
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
        });

        return response()->json([
            'message' => 'Order cancelled successfully.',
            'order' => $order->load([
                'items.product',
                'items.shop',
                'deliveries.shop',
                'deliveries.driver',
                'deliveries.orderItems.product',
            ]),
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
        ]);

        $order->load(['items.shop', 'items.product', 'customer']);

        if (in_array($order->status, ['cancelled', 'delivered', 'completed', 'in_transit'])) {
            return response()->json([
                'message' => 'This order can no longer be checked out.',
            ], 422);
        }

        $activeItems = $order->items->where('status', '!=', 'rejected');

        if ($activeItems->isEmpty()) {
            return response()->json([
                'message' => 'This order cannot be checked out because all products were rejected.',
            ], 422);
        }

        DB::transaction(function () use ($order, $validated, $activeItems) {
            $order->update([
                'status' => $validated['order_type'] === 'pickup'
                    ? 'accepted'
                    : 'ready_for_delivery',
                'total' => $activeItems->sum('total'),
                'order_type' => $validated['order_type'],
                'payment_method' => $validated['order_type'] === 'delivery'
                    ? $validated['payment_method']
                    : 'cash',
                'pickup_date' => $validated['order_type'] === 'pickup'
                    ? $validated['pickup_date']
                    : null,
            ]);

            if ($validated['order_type'] === 'delivery') {
                $this->createDeliveryTasksForOrder($order);
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
            'order' => $order->load([
                'items.product',
                'items.shop',
                'deliveries.shop',
                'deliveries.driver',
                'deliveries.orderItems.product',
            ]),
        ]);
    }

    public function shopOwnerOrders(Request $request)
    {
        $shop = $request->user()->shop;

        if (! $shop) {
            return response()->json([
                'message' => 'Shop not found for this owner.',
            ], 404);
        }

        $items = OrderItem::with([
                'order.customer',
                'order.deliveries.driver',
                'product',
            ])
            ->where('shop_id', $shop->id)
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($items);
    }

    public function rejectItem(Request $request, OrderItem $orderItem)
    {
        $shop = $request->user()->shop;

        if (! $shop || $orderItem->shop_id !== $shop->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $order = $orderItem->order;

        if ($order && in_array($order->status, ['delivered', 'completed', 'in_transit'])) {
            return response()->json([
                'message' => 'This product can no longer be rejected.',
            ], 422);
        }

        if ($orderItem->status === 'rejected') {
            return response()->json([
                'message' => 'This product is already rejected.',
            ], 422);
        }

        $validated = $request->validate([
            'reject_reason' => ['required', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($orderItem, $validated) {
            $orderItem->update([
                'status' => 'rejected',
                'reject_reason' => $validated['reject_reason'],
            ]);

            $this->removeRejectedItemFromDelivery($orderItem);

            if ($orderItem->order) {
                $this->refreshOrderStatus($orderItem->order);
            }
        });

        return response()->json([
            'message' => 'Product rejected.',
            'order_item' => $orderItem->load([
                'order.customer',
                'product',
            ]),
        ]);
    }

    public function readyItem(Request $request, OrderItem $orderItem)
    {
        $shop = $request->user()->shop;

        if (! $shop || $orderItem->shop_id !== $shop->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $order = $orderItem->order;

        if (! $order) {
            return response()->json([
                'message' => 'Order not found.',
            ], 404);
        }

        if ($order->order_type !== 'pickup') {
            return response()->json([
                'message' => 'Ready action is only used for pickup orders.',
            ], 422);
        }

        if (in_array($order->status, ['cancelled', 'delivered', 'completed', 'in_transit'])) {
            return response()->json([
                'message' => 'This product can no longer be marked ready.',
            ], 422);
        }

        if ($orderItem->status === 'rejected') {
            return response()->json([
                'message' => 'Rejected products cannot be marked ready.',
            ], 422);
        }

        $orderItem->update([
            'status' => 'ready',
        ]);

        $this->refreshOrderStatus($order);

        return response()->json([
            'message' => 'Product marked ready for pickup.',
            'order_item' => $orderItem->load(['order.customer', 'product']),
        ]);
    }

    private function refreshOrderStatus(Order $order): void
    {
        $order->load(['items', 'deliveries']);

        $items = $order->items;

        if ($items->isEmpty()) {
            $order->update([
                'status' => 'pending',
                'total' => 0,
            ]);

            return;
        }

        $activeItems = $items->where('status', '!=', 'rejected');
        $hasRejected = $items->contains('status', 'rejected');

        if ($activeItems->isEmpty()) {
            $order->update([
                'status' => 'cancelled',
                'total' => 0,
            ]);

            $order->deliveries()->update([
                'status' => 'cancelled',
            ]);

            return;
        }

        $activeTotal = $activeItems->sum('total');

        if (in_array($order->status, ['ready_for_delivery', 'in_transit', 'delivered'])) {
            $order->update([
                'total' => $activeTotal,
            ]);

            return;
        }

        if ($order->order_type === 'pickup') {
            $allReady = $activeItems->every(fn ($item) => $item->status === 'ready');

            $order->update([
                'status' => $allReady ? 'completed' : ($hasRejected ? 'partially_rejected' : 'accepted'),
                'total' => $activeTotal,
            ]);

            return;
        }

        $order->update([
            'status' => $hasRejected ? 'partially_rejected' : 'pending',
            'total' => $activeTotal,
        ]);
    }

    private function createDeliveryTasksForOrder(Order $order): void
    {
        $order->load(['items.shop', 'items.product', 'customer']);

        $activeItemsByShop = $order->items
            ->where('status', '!=', 'rejected')
            ->groupBy('shop_id');

        foreach ($activeItemsByShop as $shopId => $items) {
            $shop = $items->first()->shop;

            if (! $shop) {
                continue;
            }

            $delivery = Delivery::firstOrCreate(
                [
                    'order_id' => $order->id,
                    'shop_id' => $shopId,
                ],
                [
                    'driver_id' => null,
                    'status' => 'pending',
                    'pickup_location' => $shop->address ?? $shop->shop_name ?? 'Shop',
                    'delivery_location' => $order->delivery_address,
                    'notes' => 'Auto-created from customer checkout.',
                ]
            );

            foreach ($items as $orderItem) {
                DeliveryItem::firstOrCreate([
                    'delivery_id' => $delivery->id,
                    'order_item_id' => $orderItem->id,
                ]);
            }
        }
    }

    private function removeRejectedItemFromDelivery(OrderItem $orderItem): void
    {
        DeliveryItem::where('order_item_id', $orderItem->id)->delete();

        $order = $orderItem->order;

        if (! $order) {
            return;
        }

        $order->load(['items', 'deliveries.orderItems']);

        foreach ($order->deliveries as $delivery) {
            if ($delivery->orderItems->isEmpty()) {
                $delivery->update([
                    'status' => 'cancelled',
                    'notes' => trim(($delivery->notes ?? '') . ' Cancelled because all items from this shop were rejected.'),
                ]);
            }
        }

        $order->update([
            'total' => $order->items
                ->where('status', '!=', 'rejected')
                ->sum('total'),
        ]);
    }
}