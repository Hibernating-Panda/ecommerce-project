<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    // GET /api/shops
    public function index()
    {
        $shops = Shop::withCount('products')
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->latest()
            ->get()
            ->map(function ($shop) {
                return $this->formatShop($shop);
            });

        return response()->json([
            'success' => true,
            'data' => $shops,
        ]);
    }

    // GET /api/shops/{id}
    public function show($id)
    {
        $shop = Shop::with([
                'products.category',
                'reviews.user',
            ])
            ->withCount('products')
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->find($id);

        if (!$shop) {
            return response()->json([
                'success' => false,
                'message' => 'Shop not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->formatShop($shop),
        ]);
    }

    // POST /api/shops
    public function store(Request $request)
    {
        $validated = $request->validate([
            'shop_name' => 'required|string|max:255',
            'owner_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
            'logo' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        $shop = Shop::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Shop created successfully',
            'data' => $this->formatShop($shop),
        ], 201);
    }

    // PUT /api/shops/{id}
    public function update(Request $request, $id)
    {
        $shop = Shop::find($id);

        if (!$shop) {
            return response()->json([
                'success' => false,
                'message' => 'Shop not found',
            ], 404);
        }

        $validated = $request->validate([
            'shop_name' => 'sometimes|required|string|max:255',
            'owner_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
            'logo' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        $shop->update($validated);

        $shop->loadCount('products')
            ->loadAvg('reviews', 'rating')
            ->loadCount('reviews');

        return response()->json([
            'success' => true,
            'message' => 'Shop updated successfully',
            'data' => $this->formatShop($shop),
        ]);
    }

    // DELETE /api/shops/{id}
    public function destroy($id)
    {
        $shop = Shop::find($id);

        if (!$shop) {
            return response()->json([
                'success' => false,
                'message' => 'Shop not found',
            ], 404);
        }

        $shop->delete();

        return response()->json([
            'success' => true,
            'message' => 'Shop deleted successfully',
        ]);
    }

    private function formatShop($shop)
    {
        $logo = $shop->logo ?? $shop->image ?? null;

        return [
            'id' => $shop->id,
            'user_id' => $shop->user_id,

            'name' => $shop->shop_name ?? $shop->name ?? 'Shop',
            'shop_name' => $shop->shop_name ?? $shop->name ?? 'Shop',
            'owner_name' => $shop->owner_name,
            'phone' => $shop->phone,
            'address' => $shop->address,
            'description' => $shop->description,

            'logo' => $logo,
            'image' => $logo,
            'logo_url' => $this->getImageUrl($logo),

            'products_count' => $shop->products_count ?? 0,
            'items_count' => $shop->products_count ?? 0,

            'average_rating' => $shop->reviews_avg_rating
                ? round($shop->reviews_avg_rating, 1)
                : null,

            'reviews_count' => $shop->reviews_count ?? 0,

            'products' => $shop->products ?? null,
            'reviews' => $shop->reviews ?? null,

            'created_at' => $shop->created_at,
            'updated_at' => $shop->updated_at,
        ];
    }

    private function getImageUrl($image)
    {
        if (!$image) {
            return null;
        }

        if (str_starts_with($image, 'http://') || str_starts_with($image, 'https://')) {
            return $image;
        }

        if (str_starts_with($image, 'storage/')) {
            return asset($image);
        }

        return asset('storage/' . $image);
    }
}