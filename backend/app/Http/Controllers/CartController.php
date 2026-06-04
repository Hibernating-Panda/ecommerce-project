<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductSize;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $cartItems = CartItem::with([
                'product.shop',
                'product.category',
                'productSize',
            ])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(function ($item) {
                return $this->formatCartItem($item);
            });

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
            'product_size_id' => ['nullable', 'exists:product_sizes,id'],
            'size' => ['nullable', 'string', 'max:50'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $product = Product::with('sizes')
            ->where('id', $validated['product_id'])
            ->where('status', 'active')
            ->first();

        if (! $product) {
            return response()->json([
                'message' => 'Product is not available.',
            ], 422);
        }

        $productSize = $this->resolveProductSize($product, $validated);

        if (! $productSize && $product->sizes->count() > 0) {
            return response()->json([
                'message' => 'Please select a valid product size.',
            ], 422);
        }

        $availableStock = $productSize
            ? (int) $productSize->stock
            : (int) $product->stock;

        if ($availableStock < $validated['quantity']) {
            return response()->json([
                'message' => 'Not enough stock available.',
            ], 422);
        }

        $cartItem = CartItem::firstOrNew([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'product_size_id' => $productSize?->id,
        ]);

        $newQuantity = $cartItem->exists
            ? (int) $cartItem->quantity + (int) $validated['quantity']
            : (int) $validated['quantity'];

        if ($availableStock < $newQuantity) {
            return response()->json([
                'message' => 'Not enough stock available.',
            ], 422);
        }

        $cartItem->quantity = $newQuantity;
        $cartItem->save();

        $cartItem->load([
            'product.shop',
            'product.category',
            'productSize',
        ]);

        return response()->json([
            'message' => 'Product added to cart.',
            'cart_item' => $this->formatCartItem($cartItem),
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

        $cartItem->load(['product', 'productSize']);

        if (! $cartItem->product) {
            return response()->json([
                'message' => 'Product is not available.',
            ], 422);
        }

        $availableStock = $cartItem->productSize
            ? (int) $cartItem->productSize->stock
            : (int) $cartItem->product->stock;

        if ($availableStock < $validated['quantity']) {
            return response()->json([
                'message' => 'Not enough stock available.',
            ], 422);
        }

        $cartItem->update([
            'quantity' => $validated['quantity'],
        ]);

        $cartItem->load([
            'product.shop',
            'product.category',
            'productSize',
        ]);

        return response()->json([
            'message' => 'Cart quantity updated.',
            'cart_item' => $this->formatCartItem($cartItem),
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

    private function resolveProductSize(Product $product, array $validated): ?ProductSize
    {
        if (! empty($validated['product_size_id'])) {
            $productSize = ProductSize::where('id', $validated['product_size_id'])
                ->where('product_id', $product->id)
                ->first();

            if (! $productSize) {
                abort(response()->json([
                    'message' => 'Selected size does not belong to this product.',
                ], 422));
            }

            return $productSize;
        }

        if (! empty($validated['size'])) {
            return ProductSize::where('product_id', $product->id)
                ->where('size', $validated['size'])
                ->first();
        }

        return null;
    }

    private function formatCartItem(CartItem $item): array
    {
        $product = $item->product;
        $productSize = $item->productSize;
        $quantity = (int) $item->quantity;

        $basePrice = $productSize
            ? (float) $productSize->price
            : (float) ($product?->price ?? 0);

        $unitPrice = $this->discountedPrice($product, $basePrice);
        $discountPercent = (float) ($product?->discount_percent ?? 0);

        return [
            'id' => $item->id,
            'user_id' => $item->user_id,
            'product_id' => $item->product_id,
            'product_size_id' => $item->product_size_id,
            'quantity' => $quantity,

            'size' => $productSize?->size,
            'size_price' => $productSize?->price,
            'size_stock' => $productSize?->stock,

            'base_price' => round($basePrice, 2),
            'unit_price' => round($unitPrice, 2),
            'price' => round($unitPrice, 2),
            'total' => round($unitPrice * $quantity, 2),
            'item_total' => round($unitPrice * $quantity, 2),
            'has_discount' => $unitPrice < $basePrice,
            'discount_percent' => $unitPrice < $basePrice ? $discountPercent : 0,

            'product_size' => $productSize,
            'productSize' => $productSize,
            'product' => $product ? $this->formatProduct($product) : null,

            'created_at' => $item->created_at,
            'updated_at' => $item->updated_at,
        ];
    }

    private function discountedPrice($product, float $basePrice): float
    {
        if (! $product) {
            return round($basePrice, 2);
        }

        $discountPercent = (float) ($product->discount_percent ?? 0);

        if ($discountPercent <= 0) {
            return round($basePrice, 2);
        }

        if ($product->discount_start && now()->lt($product->discount_start)) {
            return round($basePrice, 2);
        }

        if ($product->discount_end && now()->gt($product->discount_end)) {
            return round($basePrice, 2);
        }

        return round(max($basePrice - ($basePrice * ($discountPercent / 100)), 0), 2);
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
            'category' => $product->category,
            'shop' => $product->shop,
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
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
}