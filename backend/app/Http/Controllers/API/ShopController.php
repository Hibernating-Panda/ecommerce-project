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
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $shops,
        ]);
    }

    // GET /api/shops/{id}
    public function show($id)
    {
        $shop = Shop::with(['products.category'])
            ->withCount('products')
            ->find($id);

        if (!$shop) {
            return response()->json([
                'success' => false,
                'message' => 'Shop not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $shop,
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
        ]);

        $shop = Shop::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Shop created successfully',
            'data' => $shop,
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
        ]);

        $shop->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Shop updated successfully',
            'data' => $shop,
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
}