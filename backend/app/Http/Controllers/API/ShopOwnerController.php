<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

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

        $recentOrders = OrderItem::with(['order.customer', 'product'])
            ->where('shop_id', $shop->id)
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

        $products = Product::with(['category', 'sizes'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->where('shop_id', $shop->id)
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($products);
    }

    public function storeProduct(Request $request)
    {
        $shop = $this->getShop($request);
        $validated = $this->validateProduct($request);

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
            'product' => $product,
        ], 201);
    }

    public function showProduct(Request $request, $id)
    {
        $shop = $this->getShop($request);

        $product = Product::with(['category', 'sizes'])
            ->where('shop_id', $shop->id)
            ->findOrFail($id);

        return response()->json($product);
    }

    public function updateProduct(Request $request, $id)
    {
        $shop = $this->getShop($request);

        $product = Product::where('shop_id', $shop->id)
            ->findOrFail($id);

        $validated = $this->validateProduct($request);

        DB::transaction(function () use ($product, $validated) {
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

            $this->syncSizes($product, $validated['sizes'] ?? []);
        });

        return response()->json([
            'message' => 'Product updated successfully.',
            'product' => $product->fresh()->load(['category', 'sizes']),
        ]);
    }

    public function deleteProduct(Request $request, $id)
    {
        $shop = $this->getShop($request);

        $product = Product::where('shop_id', $shop->id)
            ->findOrFail($id);

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully.',
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
            'shop' => $this->getShop($request),
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
            'aba_qr_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        $shopData = collect($validated)
            ->except('aba_qr_image')
            ->toArray();

        if ($request->hasFile('aba_qr_image')) {
            $shopData['aba_qr_image'] = $request->file('aba_qr_image')
                ->store('shops/aba_qr', 'public');
        }

        $shop->update($shopData);

        return response()->json([
            'message' => 'Shop profile updated successfully.',
            'shop' => $shop->fresh(),
        ]);
    }

    public function sales(Request $request)
    {
        $shop = $this->getShop($request);
        $startDate = $this->startDate($request->query('filter', 'month'));

        $items = OrderItem::with(['order.customer', 'product'])
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

    private function validateProduct(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'image' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:active,inactive'],
            'sizes' => ['nullable', 'array'],
            'sizes.*.size' => ['required_with:sizes', 'string', 'max:50'],
            'sizes.*.price' => ['required_with:sizes', 'numeric', 'min:0'],
            'sizes.*.stock' => ['required_with:sizes', 'integer', 'min:0'],
            'discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'discount_start' => ['nullable', 'date'],
            'discount_end' => ['nullable', 'date', 'after_or_equal:discount_start'],
        ]);
    }

    private function syncSizes(Product $product, array $sizes): void
    {
        $product->sizes()->delete();

        foreach ($sizes as $size) {
            $product->sizes()->create([
                'size' => $size['size'],
                'price' => $size['price'],
                'stock' => $size['stock'],
            ]);
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