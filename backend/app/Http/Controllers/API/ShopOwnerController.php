<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Http\Request;
use App\Models\Category;

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

        $totalProducts = Product::where('shop_id', $shop->id)->count();

        $pendingOrders = Order::where('shop_id', $shop->id)
            ->where('status', 'Pending')
            ->count();

        $completedOrders = Order::where('shop_id', $shop->id)
            ->where('status', 'Completed')
            ->count();

        $totalSales = Order::where('shop_id', $shop->id)
            ->where('status', 'Completed')
            ->sum('total');

        $recentOrders = Order::where('shop_id', $shop->id)
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'shop' => $shop,
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

        $products = Product::with('category')
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
        ]);

        return response()->json([
            'message' => 'Product created successfully.',
            'product' => $product,
        ], 201);
    }

    public function showProduct(Request $request, $id)
    {
        $shop = $this->getShop($request);

        $product = Product::with('category')
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
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully.',
            'product' => $product,
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
}