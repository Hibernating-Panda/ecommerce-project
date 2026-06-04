<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;

class HomeController extends Controller
{
    public function index()
    {
        return response()->json([
            'flash_sale' => $this->flashSaleProducts(),
            'best_deal' => $this->latestProducts(),
            'trending' => $this->trendingProducts(),
        ]);
    }

    private function baseProductQuery()
    {
        return Product::with(['category', 'shop', 'sizes'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->where('status', 'active');
    }

    private function flashSaleProducts()
    {
        return $this->baseProductQuery()
            ->where('discount_percent', '>', 0)
            ->where(function ($query) {
                $query->whereNull('discount_start')
                    ->orWhere('discount_start', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('discount_end')
                    ->orWhere('discount_end', '>=', now());
            })
            ->latest()
            ->take(12)
            ->get()
            ->map(fn ($product) => $this->formatProduct($product));
    }

    private function latestProducts()
    {
        return $this->baseProductQuery()
            ->latest()
            ->take(12)
            ->get()
            ->map(fn ($product) => $this->formatProduct($product));
    }

    private function trendingProducts()
    {
        return $this->baseProductQuery()
            ->withSum('orderItems as total_sold', 'quantity')
            ->orderByDesc('total_sold')
            ->latest()
            ->take(12)
            ->get()
            ->map(fn ($product) => $this->formatProduct($product));
    }

    private function formatProduct($product)
    {
        $image = $product->image;

        return [
            'id' => $product->id,
            'shop_id' => $product->shop_id,
            'category_id' => $product->category_id,
            'name' => $product->name,
            'description' => $product->description,
            'price' => $product->price,
            'stock' => $product->stock,
            'image' => $image,
            'thumbnail' => $image,
            'image_url' => $this->imageUrl($image),
            'discount_percent' => $product->discount_percent ?? 0,
            'discount_start' => $product->discount_start,
            'discount_end' => $product->discount_end,
            'total_sold' => (int) ($product->total_sold ?? 0),
            'sold' => (int) ($product->total_sold ?? 0),
            'average_rating' => $product->reviews_avg_rating
                ? round($product->reviews_avg_rating, 1)
                : null,
            'reviews_count' => $product->reviews_count ?? 0,
            'category' => $product->category,
            'shop' => $product->shop,
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
            'sizes' => $product->sizes ?? [],
        ];
    }

    private function imageUrl(?string $image)
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