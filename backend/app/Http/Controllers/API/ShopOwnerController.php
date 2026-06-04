<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ShopOwnerController extends Controller
{
    public function categories()
    {
        return response()->json(
            Category::orderBy('name')->get()
        );
    }

    public function dashboard(Request $request)
    {
        $shop = $this->getShop($request);
        $startDate = $this->startDate($request->query('filter', 'day'));

        $itemsQuery = OrderItem::where('shop_id', $shop->id)
            ->where('created_at', '>=', $startDate);

        $totalProducts = Product::where('shop_id', $shop->id)->count();

        $pendingOrders = (clone $itemsQuery)
            ->where('status', 'pending')
            ->count();

        $completedOrders = (clone $itemsQuery)
            ->whereIn('status', ['accepted', 'ready'])
            ->count();

        $totalSales = (clone $itemsQuery)
            ->whereIn('status', ['accepted', 'ready'])
            ->sum('total');

        $recentOrders = OrderItem::with([
                'order.customer',
                'product',
                'productSize',
            ])
            ->where('shop_id', $shop->id)
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'shop' => $this->formatShop($shop),
            'total_products' => $totalProducts,
            'pending_orders' => $pendingOrders,
            'completed_orders' => $completedOrders,
            'total_sales' => $totalSales,
            'recent_orders' => $recentOrders,
        ]);
    }

    public function products(Request $request)
    {
        $shop = $this->getShop($request);

        $products = Product::with(['category', 'sizes'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->where('shop_id', $shop->id)
            ->latest()
            ->paginate($request->integer('per_page', 15));

        $products->getCollection()->transform(fn ($product) => $this->formatProduct($product));

        return response()->json($products);
    }

    public function storeProduct(Request $request)
    {
        $shop = $this->getShop($request);
        $validated = $this->validateProduct($request);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product = DB::transaction(function () use ($shop, $validated) {
            $product = Product::create([
                'shop_id' => $shop->id,
                'name' => $validated['name'],
                'price' => $validated['price'],
                'stock' => $validated['stock'],
                'category_id' => $validated['category_id'] ?? null,
                'image' => $validated['image'] ?? null,
                'description' => $validated['description'] ?? null,
                'status' => $validated['status'],
                'discount_percent' => $validated['discount_percent'] ?? 0,
                'discount_start' => $validated['discount_start'] ?? null,
                'discount_end' => $validated['discount_end'] ?? null,
            ]);

            $this->syncSizes($product, $validated['sizes'] ?? []);

            return $product->load(['category', 'sizes']);
        });

        return response()->json([
            'message' => 'Product created successfully.',
            'product' => $this->formatProduct($product),
        ], 201);
    }

    public function showProduct(Request $request, $id)
    {
        $shop = $this->getShop($request);

        $product = Product::with(['category', 'sizes'])
            ->where('shop_id', $shop->id)
            ->findOrFail($id);

        return response()->json($this->formatProduct($product));
    }

    public function updateProduct(Request $request, $id)
    {
        $shop = $this->getShop($request);

        $product = Product::where('shop_id', $shop->id)->findOrFail($id);

        $validated = $this->validateProduct($request, true);

        if ($request->hasFile('image')) {
            $this->deleteOldImage($product->image);
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        DB::transaction(function () use ($product, $validated) {
            $data = [
                'name' => $validated['name'],
                'price' => $validated['price'],
                'stock' => $validated['stock'],
                'category_id' => $validated['category_id'] ?? null,
                'description' => $validated['description'] ?? null,
                'status' => $validated['status'],
                'discount_percent' => $validated['discount_percent'] ?? 0,
                'discount_start' => $validated['discount_start'] ?? null,
                'discount_end' => $validated['discount_end'] ?? null,
            ];

            if (array_key_exists('image', $validated)) {
                $data['image'] = $validated['image'];
            }

            $product->update($data);
            $this->syncSizes($product, $validated['sizes'] ?? []);
        });

        $product = $product->fresh()->load(['category', 'sizes']);

        return response()->json([
            'message' => 'Product updated successfully.',
            'product' => $this->formatProduct($product),
        ]);
    }

    public function deleteProduct(Request $request, $id)
    {
        $shop = $this->getShop($request);

        $product = Product::where('shop_id', $shop->id)->findOrFail($id);

        $this->deleteOldImage($product->image);
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully.',
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
            'shop' => $this->formatShop($this->getShop($request)),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $shop = $this->getShop($request);

        $validated = $request->validate([
            'shop_name' => ['required', 'string', 'max:255'],
            'owner_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:1000'],
            'aba_account_name' => ['nullable', 'string', 'max:255'],
            'aba_account_number' => ['nullable', 'string', 'max:100'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'shop_logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'aba_qr_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        $shopData = collect($validated)
            ->except(['shop_logo', 'aba_qr_image'])
            ->toArray();

        if ($request->hasFile('shop_logo')) {
            $this->deleteOldImage($shop->shop_logo);
            $shopData['shop_logo'] = $request->file('shop_logo')->store('shops/logos', 'public');
        }

        if ($request->hasFile('aba_qr_image')) {
            $this->deleteOldImage($shop->aba_qr_image);
            $shopData['aba_qr_image'] = $request->file('aba_qr_image')->store('shops/aba_qr', 'public');
        }

        $shop->update($shopData);

        return response()->json([
            'message' => 'Shop profile updated successfully.',
            'shop' => $this->formatShop($shop->fresh()),
        ]);
    }

    public function orders(Request $request)
    {
        $shop = $this->getShop($request);

        $items = OrderItem::with([
                'order.customer',
                'product',
                'productSize',
                'shop',
            ])
            ->where('shop_id', $shop->id)
            ->whereHas('order', function ($query) {
                $query->whereNotNull('order_type')
                    ->whereNotIn('status', ['cancelled', 'delivered', 'completed']);
            })
            ->latest()
            ->get();

        return response()->json($items);
    }

    public function acceptOrderItem(Request $request, OrderItem $orderItem)
    {
        $shop = $this->getShop($request);

        if ($orderItem->shop_id !== $shop->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        if ($orderItem->status === 'rejected') {
            return response()->json([
                'message' => 'Rejected item cannot be accepted.',
            ], 422);
        }

        if ($orderItem->status === 'ready') {
            return response()->json([
                'message' => 'Ready item is already accepted.',
            ], 422);
        }

        $orderItem->update([
            'status' => 'accepted',
            'reject_reason' => null,
        ]);

        $this->updateOrderStatusAfterItemChange($orderItem->order_id);

        return response()->json([
            'message' => 'Product accepted.',
            'item' => $orderItem->fresh()->load([
                'order.customer',
                'product',
                'productSize',
                'shop',
            ]),
        ]);
    }

    public function rejectOrderItem(Request $request, OrderItem $orderItem)
    {
        $shop = $this->getShop($request);

        if ($orderItem->shop_id !== $shop->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        if ($orderItem->status === 'ready') {
            return response()->json([
                'message' => 'Ready item cannot be rejected.',
            ], 422);
        }

        $validated = $request->validate([
            'reject_reason' => ['required', 'string', 'max:1000'],
        ]);

        $orderItem->update([
            'status' => 'rejected',
            'reject_reason' => $validated['reject_reason'],
        ]);

        $this->updateOrderStatusAfterItemChange($orderItem->order_id);

        return response()->json([
            'message' => 'Product rejected.',
            'item' => $orderItem->fresh()->load([
                'order.customer',
                'product',
                'productSize',
                'shop',
            ]),
        ]);
    }

    public function readyOrder(Request $request, Order $order)
    {
        $shop = $this->getShop($request);

        if (in_array($order->status, ['cancelled', 'delivered', 'completed', 'in_transit'])) {
            return response()->json([
                'message' => 'This order can no longer be marked ready.',
            ], 422);
        }

        $items = OrderItem::where('order_id', $order->id)
            ->where('shop_id', $shop->id)
            ->get();

        if ($items->isEmpty()) {
            return response()->json([
                'message' => 'No products found for this shop in this order.',
            ], 404);
        }

        $activeItems = $items->where('status', '!=', 'rejected');

        if ($activeItems->isEmpty()) {
            return response()->json([
                'message' => 'There are no active products to mark ready.',
            ], 422);
        }

        $hasPendingItems = $activeItems->contains(function ($item) {
            return $item->status === 'pending';
        });

        if ($hasPendingItems) {
            return response()->json([
                'message' => 'Please accept or reject all products before marking the order ready.',
            ], 422);
        }

        OrderItem::where('order_id', $order->id)
            ->where('shop_id', $shop->id)
            ->where('status', 'accepted')
            ->update([
                'status' => 'ready',
            ]);

        $this->updateOrderStatusAfterItemChange($order->id);

        return response()->json([
            'message' => 'Order marked ready.',
            'order' => $order->fresh()->load([
                'items.product',
                'items.productSize',
                'items.shop',
                'customer',
            ]),
        ]);
    }

    public function sales(Request $request)
    {
        $shop = $this->getShop($request);
        $startDate = $this->startDate($request->query('filter', 'month'));

        $items = OrderItem::with([
                'order.customer',
                'product',
                'productSize',
            ])
            ->where('shop_id', $shop->id)
            ->where('created_at', '>=', $startDate)
            ->latest()
            ->get();

        $soldItems = $items->whereIn('status', ['accepted', 'ready']);

        $bestSellingProduct = $soldItems
            ->groupBy('product_id')
            ->map(function ($items) {
                $first = $items->first();

                return [
                    'product_id' => $first->product_id,
                    'product_name' => $first->product?->name,
                    'quantity_sold' => $items->sum('quantity'),
                    'total_sales' => $items->sum('total'),
                ];
            })
            ->sortByDesc('quantity_sold')
            ->values()
            ->first();

        return response()->json([
            'total_sales' => $soldItems->sum('total'),
            'total_orders' => $items->pluck('order_id')->unique()->count(),
            'completed_orders' => $soldItems->pluck('order_id')->unique()->count(),
            'cancelled_orders' => $items->where('status', 'rejected')->count(),
            'best_selling_product' => $bestSellingProduct,
            'orders' => $items,
        ]);
    }

    private function updateOrderStatusAfterItemChange(int $orderId): void
    {
        $order = Order::with(['items.shop'])->find($orderId);

        if (! $order || in_array($order->status, ['cancelled', 'delivered', 'completed', 'in_transit'])) {
            return;
        }

        $items = $order->items;

        if ($items->isEmpty()) {
            return;
        }

        $activeItems = $items->where('status', '!=', 'rejected');
        $rejectedItems = $items->where('status', 'rejected');

        if ($activeItems->isEmpty()) {
            $order->update([
                'status' => 'cancelled',
                'subtotal' => 0,
                'delivery_fee' => 0,
                'delivery_distance_km' => 0,
                'total' => 0,
            ]);

            return;
        }

        $subtotal = round((float) $activeItems->sum('total'), 2);
        $deliveryFee = (float) ($order->delivery_fee ?? 0);

        $allActiveAcceptedOrReady = $activeItems->every(function ($item) {
            return in_array($item->status, ['accepted', 'ready']);
        });

        $allActiveReady = $activeItems->every(function ($item) {
            return $item->status === 'ready';
        });

        if ($allActiveReady) {
            $newStatus = 'ready_for_delivery';
        } elseif ($rejectedItems->isNotEmpty()) {
            $newStatus = 'partially_rejected';
        } elseif ($allActiveAcceptedOrReady) {
            $newStatus = 'accepted';
        } else {
            $newStatus = 'pending';
        }

        $order->update([
            'status' => $newStatus,
            'subtotal' => $subtotal,
            'total' => round($subtotal + $deliveryFee, 2),
        ]);

        if ($allActiveReady && $order->order_type === 'delivery') {
            $this->createDeliveryTasksForOrder($order->fresh());
        }
    }

    private function createDeliveryTasksForOrder(Order $order): void
    {
        $order->load(['items.shop']);

        $activeItems = $order->items->where('status', 'ready');
        $shopGroups = $activeItems->groupBy('shop_id');

        foreach ($shopGroups as $shopId => $items) {
            $shop = $items->first()->shop;

            if (! $shop) {
                continue;
            }

            Delivery::updateOrCreate(
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
        }
    }

    private function getShop(Request $request)
    {
        return Shop::firstOrCreate(
            ['user_id' => $request->user()->id],
            [
                'shop_name' => 'My Shop',
                'owner_name' => $request->user()->name ?? 'Shop Owner',
            ]
        );
    }

    private function validateProduct(Request $request, bool $isUpdate = false): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:active,inactive'],
            'sizes' => ['nullable', 'array'],
            'sizes.*.size' => ['required_with:sizes', 'string', 'max:50'],
            'sizes.*.price' => ['required_with:sizes', 'numeric', 'min:0'],
            'sizes.*.stock' => ['required_with:sizes', 'integer', 'min:0'],
            'discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'discount_start' => ['nullable', 'date'],
            'discount_end' => ['nullable', 'date', 'after_or_equal:discount_start'],
        ];

        if ($request->hasFile('image')) {
            $rules['image'] = ['image', 'mimes:jpg,jpeg,png,webp', 'max:4096'];
        } else {
            $rules['image'] = ['nullable'];
        }

        return $request->validate($rules);
    }

    private function syncSizes(Product $product, array $sizes): void
    {
        $product->sizes()->delete();

        foreach ($sizes as $size) {
            $product->sizes()->create([
                'size' => strtoupper(trim($size['size'])),
                'price' => $size['price'],
                'stock' => $size['stock'],
            ]);
        }
    }

    private function formatProduct(Product $product): array
    {
        return [
            'id' => $product->id,
            'shop_id' => $product->shop_id,
            'category_id' => $product->category_id,
            'name' => $product->name,
            'description' => $product->description,
            'price' => $product->price,
            'stock' => $product->stock,
            'image' => $product->image,
            'thumbnail' => $product->image,
            'image_url' => $this->imageUrl($product->image),
            'status' => $product->status,
            'discount_percent' => $product->discount_percent ?? 0,
            'discount_start' => $product->discount_start,
            'discount_end' => $product->discount_end,
            'average_rating' => $product->reviews_avg_rating
                ? round($product->reviews_avg_rating, 1)
                : null,
            'reviews_count' => $product->reviews_count ?? 0,
            'category' => $product->category,
            'sizes' => $product->sizes,
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
        ];
    }

    private function formatShop(Shop $shop): array
    {
        return [
            'id' => $shop->id,
            'user_id' => $shop->user_id,
            'shop_name' => $shop->shop_name,
            'name' => $shop->shop_name,
            'owner_name' => $shop->owner_name,
            'phone' => $shop->phone,
            'address' => $shop->address,
            'description' => $shop->description,

            'shop_logo' => $shop->shop_logo,
            'logo' => $shop->shop_logo,
            'image' => $shop->shop_logo,
            'shop_logo_url' => $this->imageUrl($shop->shop_logo),
            'logo_url' => $this->imageUrl($shop->shop_logo),
            'image_url' => $this->imageUrl($shop->shop_logo),

            'aba_qr_image' => $shop->aba_qr_image,
            'aba_qr_url' => $this->imageUrl($shop->aba_qr_image),
            'aba_account_name' => $shop->aba_account_name,
            'aba_account_number' => $shop->aba_account_number,

            'latitude' => $shop->latitude,
            'longitude' => $shop->longitude,

            'created_at' => $shop->created_at,
            'updated_at' => $shop->updated_at,
        ];
    }

    private function imageUrl(?string $image): ?string
    {
        if (! $image) {
            return null;
        }

        if (str_starts_with($image, 'http://') || str_starts_with($image, 'https://')) {
            return $image;
        }

        return str_starts_with($image, 'storage/')
            ? asset($image)
            : asset('storage/' . $image);
    }

    private function deleteOldImage(?string $image): void
    {
        if (! $image || str_starts_with($image, 'http://') || str_starts_with($image, 'https://')) {
            return;
        }

        $path = str_replace('storage/', '', $image);

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    private function startDate(string $filter)
    {
        return match ($filter) {
            'day' => Carbon::now()->startOfDay(),
            'week' => Carbon::now()->startOfWeek(),
            default => Carbon::now()->startOfMonth(),
        };
    }
}