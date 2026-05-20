<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $wishlist = Wishlist::with([
                'product.shop',
                'product.category',
            ])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'wishlist' => $wishlist,
        ]);
    }

    public function toggle(Request $request)
    {
        $user = $request->user();

        if (! $user->hasRole('user')) {
            return response()->json([
                'message' => 'Only customers can use wishlist.',
            ], 403);
        }

        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
        ]);

        $product = Product::where('id', $validated['product_id'])
            ->where('status', 'active')
            ->first();

        if (! $product) {
            return response()->json([
                'message' => 'Product is not available.',
            ], 422);
        }

        $wishlist = Wishlist::where('user_id', $user->id)
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($wishlist) {
            $wishlist->delete();

            return response()->json([
                'message' => 'Removed from wishlist.',
                'is_wishlisted' => false,
            ]);
        }

        Wishlist::create([
            'user_id' => $user->id,
            'product_id' => $validated['product_id'],
        ]);

        return response()->json([
            'message' => 'Added to wishlist.',
            'is_wishlisted' => true,
        ]);
    }
}