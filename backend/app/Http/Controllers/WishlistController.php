<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $wishlist = Wishlist::with('product.shop')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'wishlist' => $wishlist,
        ]);
    }

    public function toggle(Request $request)
    {
        if (!$request->user()->hasRole('user')) {
            return response()->json([
                'message' => 'Only customers can use wishlist.',
            ], 403);
        }

        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
        ]);

        $wishlist = Wishlist::where('user_id', $request->user()->id)
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
            'user_id' => $request->user()->id,
            'product_id' => $validated['product_id'],
        ]);

        return response()->json([
            'message' => 'Added to wishlist.',
            'is_wishlisted' => true,
        ]);
    }
}