<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $cartItems = CartItem::with('product.shop')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'cart_items' => $cartItems,
        ]);
    }

    public function store(Request $request)
    {
        if (!$request->user()->hasRole('user')) {
            return response()->json([
                'message' => 'Only customers can add to cart.',
                'debug_roles' => $request->user()->getRoleNames(),
            ], 403);
        }

        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $cartItem = CartItem::where('user_id', $request->user()->id)
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $validated['quantity'];
            $cartItem->save();
        } else {
            $cartItem = CartItem::create([
                'user_id' => $request->user()->id,
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'],
            ]);
        }

        return response()->json([
            'message' => 'Product added to cart.',
            'cart_item' => $cartItem,
        ]);
    }

    public function update(Request $request, CartItem $cartItem)
    {
        if ($cartItem->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $cartItem->update([
            'quantity' => $validated['quantity'],
        ]);

        return response()->json([
            'message' => 'Cart quantity updated.',
            'cart_item' => $cartItem,
        ]);
    }

    public function destroy(Request $request, CartItem $cartItem)
    {
        if ($cartItem->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $cartItem->delete();

        return response()->json([
            'message' => 'Item removed from cart.',
        ]);
    }
}