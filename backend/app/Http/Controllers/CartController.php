<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $cartItems = CartItem::with([
                'product.shop',
                'product.category',
            ])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'cart_items' => $cartItems,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (! $user->hasRole('user')) {
            return response()->json([
                'message' => 'Only customers can add to cart.',
            ], 403);
        }

        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $product = Product::where('id', $validated['product_id'])
            ->where('status', 'active')
            ->first();

        if (! $product) {
            return response()->json([
                'message' => 'Product is not available.',
            ], 422);
        }

        if ($product->stock < $validated['quantity']) {
            return response()->json([
                'message' => 'Not enough stock available.',
            ], 422);
        }

        $cartItem = CartItem::firstOrNew([
            'user_id' => $user->id,
            'product_id' => $validated['product_id'],
        ]);

        $newQuantity = $cartItem->exists
            ? $cartItem->quantity + $validated['quantity']
            : $validated['quantity'];

        if ($product->stock < $newQuantity) {
            return response()->json([
                'message' => 'Not enough stock available.',
            ], 422);
        }

        $cartItem->quantity = $newQuantity;
        $cartItem->save();

        return response()->json([
            'message' => 'Product added to cart.',
            'cart_item' => $cartItem->load('product.shop', 'product.category'),
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

        $cartItem->load('product');

        if (! $cartItem->product || $cartItem->product->stock < $validated['quantity']) {
            return response()->json([
                'message' => 'Not enough stock available.',
            ], 422);
        }

        $cartItem->update([
            'quantity' => $validated['quantity'],
        ]);

        return response()->json([
            'message' => 'Cart quantity updated.',
            'cart_item' => $cartItem->load('product.shop', 'product.category'),
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