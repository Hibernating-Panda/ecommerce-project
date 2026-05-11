<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\ProductSize;
use Illuminate\Support\Carbon;

class ShopOwnerController extends Controller
{
    public function categories()
    {
        return response()->json(Category::orderBy('name')->get());
    }
    private function getShop(Request $request)
    {
        return Shop::firstOrCreate(
            ['user_id' => $request->user()->id],
            [
                'shop_name' => 'My Shop',
                'owner_name' => $request->user()->name ?? 'Shop Owner',
                'phone' => '',
                'address' => '',
                'description' => '',
            ]
        );
    }

    public function dashboard(Request $request)
    {
        $shop = $this->getShop($request);

        $filter = $request->query('filter', 'day');

        $startDate = match ($filter) {
            'week' => Carbon::now()->startOfWeek(),
            'month' => Carbon::now()->startOfMonth(),
            default => Carbon::now()->startOfDay(),
        };

        $ordersQuery = Order::where('shop_id', $shop->id)
            ->where('created_at', '>=', $startDate);

        $totalProducts = Product::where('shop_id', $shop->id)->count();

        $pendingOrders = (clone $ordersQuery)
            ->where('status', 'Pending')
            ->count();

        $completedOrders = (clone $ordersQuery)
            ->where('status', 'Completed')
            ->count();

        $totalSales = (clone $ordersQuery)
            ->where('status', 'Completed')
            ->sum('total');

        $recentOrders = Order::where('shop_id', $shop->id)
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'shop' => $shop,
            'filter' => $filter,
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
            ->where('shop_id', $shop->id)
            ->latest()
            ->get();

        return response()->json($products);
    }

    public function storeProduct(Request $request)
    {
        $shop = $this->getShop($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'required|in:Active,Inactive',

            'sizes' => 'nullable|array',
            'sizes.*.size' => 'required_with:sizes|string|max:50',
            'sizes.*.price' => 'required_with:sizes|numeric|min:0',
            'sizes.*.stock' => 'required_with:sizes|integer|min:0',

            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'discount_start' => 'nullable|date',
            'discount_end' => 'nullable|date|after_or_equal:discount_start',
        ]);

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

        if (!empty($validated['sizes'])) {
            foreach ($validated['sizes'] as $size) {
                $product->sizes()->create([
                    'size' => $size['size'],
                    'price' => $size['price'],
                    'stock' => $size['stock'],
                ]);
            }
        }

        return response()->json([
            'message' => 'Product created successfully.',
            'product' => $product->load(['category', 'sizes']),
        ], 201);
    }

    public function showProduct(Request $request, $id)
    {
        $shop = $this->getShop($request);

        $product = Product::with(['category', 'sizes'])
            ->where('shop_id', $shop->id)
            ->where('id', $id)
            ->firstOrFail();

        return response()->json($product);
    }

    public function updateProduct(Request $request, $id)
    {
        $shop = $this->getShop($request);

        $product = Product::where('shop_id', $shop->id)
            ->where('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'required|in:Active,Inactive',

            'sizes' => 'nullable|array',
            'sizes.*.size' => 'required_with:sizes|string|max:50',
            'sizes.*.price' => 'required_with:sizes|numeric|min:0',
            'sizes.*.stock' => 'required_with:sizes|integer|min:0',

            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'discount_start' => 'nullable|date',
            'discount_end' => 'nullable|date|after_or_equal:discount_start',
        ]);

        $product->update([
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

        $product->sizes()->delete();

        if (!empty($validated['sizes'])) {
            foreach ($validated['sizes'] as $size) {
                $product->sizes()->create([
                    'size' => $size['size'],
                    'price' => $size['price'],
                    'stock' => $size['stock'],
                ]);
            }
        }

        return response()->json([
            'message' => 'Product updated successfully.',
            'product' => $product->load(['category', 'sizes']),
        ]);
    }

    public function deleteProduct(Request $request, $id)
    {
        $shop = $this->getShop($request);

        $product = Product::where('shop_id', $shop->id)
            ->where('id', $id)
            ->firstOrFail();

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully.',
        ]);
    }

    public function orders(Request $request)
    {
        $shop = $this->getShop($request);

        $orders = Order::where('shop_id', $shop->id)
            ->latest()
            ->get();

        return response()->json($orders);
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $shop = $this->getShop($request);

        $validated = $request->validate([
            'status' => 'required|in:Pending,Processing,Completed,Cancelled',
        ]);

        $order = Order::where('shop_id', $shop->id)
            ->where('id', $id)
            ->firstOrFail();

        $order->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Order status updated successfully.',
            'order' => $order,
        ]);
    }

    public function profile(Request $request)
    {
        $shop = $this->getShop($request);

        return response()->json($shop);
    }

    public function updateProfile(Request $request)
    {
        $shop = $this->getShop($request);

        $validated = $request->validate([
            'shop_name' => 'required|string|max:255',
            'owner_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $shop->update($validated);

        return response()->json([
            'message' => 'Shop profile updated successfully.',
            'shop' => $shop,
        ]);
    }

    public function sales(Request $request)
    {
        $shop = $this->getShop($request);

        $filter = $request->query('filter', 'month');

        $startDate = match ($filter) {
            'day' => Carbon::now()->startOfDay(),
            'week' => Carbon::now()->startOfWeek(),
            'month' => Carbon::now()->startOfMonth(),
            default => Carbon::now()->startOfMonth(),
        };

        $orders = Order::where('shop_id', $shop->id)
            ->where('created_at', '>=', $startDate)
            ->latest()
            ->get();

        $completedOrders = $orders->where('status', 'Completed');

        $totalSales = $completedOrders->sum('total');
        $totalOrders = $orders->count();
        $completedCount = $completedOrders->count();
        $cancelledCount = $orders->where('status', 'Cancelled')->count();

        $bestSellingProduct = $completedOrders
            ->groupBy('product_name')
            ->map(function ($items, $productName) {
                return [
                    'product_name' => $productName,
                    'quantity_sold' => $items->sum('quantity'),
                    'total_sales' => $items->sum('total'),
                ];
            })
            ->sortByDesc('quantity_sold')
            ->values()
            ->first();

        return response()->json([
            'filter' => $filter,
            'total_sales' => $totalSales,
            'total_orders' => $totalOrders,
            'completed_orders' => $completedCount,
            'cancelled_orders' => $cancelledCount,
            'best_selling_product' => $bestSellingProduct,
            'orders' => $orders,
        ]);
    }
}