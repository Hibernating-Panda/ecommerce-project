<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;

class HomeController extends Controller
{
    public function index()
    {
        $flashSale = Product::with(['category', 'shop'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->where('discount_percent', '>', 0)
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

        // Since your table may not have total_sold, use latest for now.
        $trending = Product::with(['category', 'shop'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
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

    private function formatProduct($product)
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
            'thumbnail' => $image,
            'image_url' => $this->getImageUrl($image),

            'discount_percent' => $product->discount_percent ?? 0,
            'discount_start' => $product->discount_start ?? null,
            'discount_end' => $product->discount_end ?? null,

            'total_sold' => 0,
            'sold' => 0,

            'average_rating' => $product->reviews_avg_rating
                ? round($product->reviews_avg_rating, 1)
                : null,

            'reviews_count' => $product->reviews_count ?? 0,

            'category' => $product->category,
            'shop' => $product->shop,

            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
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