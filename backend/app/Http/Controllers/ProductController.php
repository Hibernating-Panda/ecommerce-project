<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductReview;
use App\Models\ShopReview;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display all products.
     */
    public function index()
    {
        $products = Product::with(['category', 'shop'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->latest()
            ->get()
            ->map(function ($product) {
                return $this->formatProduct($product);
            });

        return response()->json($products);
    }

    /**
     * Homepage products:
     * - flash_sale = products with discount
     * - best_deal = newest products
     * - trending = most sold products
     */
    public function homepageProducts()
    {
        $flashSale = Product::with(['category', 'shop'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->where(function ($query) {
                $query->where('discount_percent', '>', 0)
                    ->orWhere('discount_price', '>', 0)
                    ->orWhere('discount', '>', 0);
            })
            ->latest()
            ->take(12)
            ->get()
            ->map(function ($product) {
                return $this->formatProduct($product);
            });

        $bestDeal = Product::with(['category', 'shop'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->latest()
            ->take(12)
            ->get()
            ->map(function ($product) {
                return $this->formatProduct($product);
            });

        $trending = Product::with(['category', 'shop'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->orderByDesc('total_sold')
            ->latest()
            ->take(12)
            ->get()
            ->map(function ($product) {
                return $this->formatProduct($product);
            });

        return response()->json([
            'flash_sale' => $flashSale,
            'best_deal' => $bestDeal,
            'trending' => $trending,
        ]);
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'shop_id' => ['nullable', 'exists:shops,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'image' => ['nullable'],
            'thumbnail' => ['nullable'],
            'discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'discount_price' => ['nullable', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'total_sold' => ['nullable', 'integer', 'min:0'],
        ]);

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Product created successfully.',
            'product' => $this->formatProduct($product->load(['category', 'shop'])),
        ], 201);
    }

    /**
     * Display one product detail.
     */
    public function show(Request $request, Product $product)
    {
        $product->load(['category', 'shop']);

        $isWishlisted = false;

        if ($request->user()) {
            $isWishlisted = Wishlist::where('user_id', $request->user()->id)
                ->where('product_id', $product->id)
                ->exists();
        }

        $formattedProduct = $this->formatProduct($product);
        $formattedProduct['is_wishlisted'] = $isWishlisted;

        $productReviews = ProductReview::with('user')
            ->where('product_id', $product->id)
            ->latest()
            ->get();

        $shopReviews = ShopReview::with('user')
            ->where('shop_id', $product->shop_id)
            ->latest()
            ->get();

        return response()->json([
            'product' => $formattedProduct,
            'product_reviews' => $productReviews,
            'shop_reviews' => $shopReviews,
        ]);
    }

    /**
     * Update product.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'shop_id' => ['nullable', 'exists:shops,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'image' => ['nullable'],
            'thumbnail' => ['nullable'],
            'discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'discount_price' => ['nullable', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'total_sold' => ['nullable', 'integer', 'min:0'],
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully.',
            'product' => $this->formatProduct($product->load(['category', 'shop'])),
        ]);
    }

    /**
     * Delete product.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully.',
        ]);
    }

    /**
     * Format product image and useful frontend fields.
     */
    private function formatProduct(Product $product)
    {
        $image = $product->image ?? $product->thumbnail ?? null;

        return [
            'id' => $product->id,
            'shop_id' => $product->shop_id,
            'category_id' => $product->category_id,

            'name' => $product->name,
            'description' => $product->description,

            'price' => $product->price,
            'stock' => $product->stock ?? 0,

            'image' => $image,
            'thumbnail' => $product->thumbnail ?? $image,
            'image_url' => $this->getImageUrl($image),

            'discount' => $product->discount ?? 0,
            'discount_percent' => $product->discount_percent ?? $product->discount ?? 0,
            'discount_price' => $product->discount_price ?? null,

            'total_sold' => $product->total_sold ?? 0,
            'sold' => $product->total_sold ?? 0,

            'category' => $product->category,
            'shop' => $product->shop,

            'average_rating' => $product->reviews_avg_rating
                ? round($product->reviews_avg_rating, 1)
                : null,

            'reviews_count' => $product->reviews_count ?? 0,

            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
        ];
    }

    /**
     * Convert local image path to full URL.
     */
    private function getImageUrl($image)
    {
        if (!$image) {
            return asset('images/no-image.png');
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