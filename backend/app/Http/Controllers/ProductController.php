<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductReview;
use App\Models\ShopReview;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with(['category', 'shop'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->withSum('orderItems as total_sold', 'quantity')
            ->where('status', 'active')
            ->when($request->category_id, fn ($query) => $query->where('category_id', $request->category_id))
            ->when($request->shop_id, fn ($query) => $query->where('shop_id', $request->shop_id))
            ->when($request->search, function ($query) use ($request) {
                $query->where('name', 'LIKE', "%{$request->search}%")
                    ->orWhere('description', 'LIKE', "%{$request->search}%");
            })
            ->latest()
            ->paginate($request->integer('per_page', 12));

        $products->getCollection()->transform(fn ($product) => $this->formatProduct($product));

        return response()->json($products);
    }

    public function show(Request $request, Product $product)
    {
        $product->load(['category', 'shop', 'sizes'])
            ->loadAvg('reviews', 'rating')
            ->loadCount('reviews')
            ->loadSum('orderItems as total_sold', 'quantity');

        $isWishlisted = $request->user()
            ? Wishlist::where('user_id', $request->user()->id)
                ->where('product_id', $product->id)
                ->exists()
            : false;

        $formattedProduct = $this->formatProduct($product);
        $formattedProduct['is_wishlisted'] = $isWishlisted;

        $productReviews = ProductReview::with('user:id,name,profile_image')
            ->where('product_id', $product->id)
            ->latest()
            ->paginate(10);

        $shopReviews = ShopReview::with('user:id,name,profile_image')
            ->where('shop_id', $product->shop_id)
            ->latest()
            ->paginate(10);

        return response()->json([
            'product' => $formattedProduct,
            'product_reviews' => $productReviews,
            'shop_reviews' => $shopReviews,
        ]);
    }

    private function formatProduct(Product $product)
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
            return asset('images/no-image.png');
        }

        if (str_starts_with($image, 'http://') || str_starts_with($image, 'https://')) {
            return $image;
        }

        return str_starts_with($image, 'storage/')
            ? asset($image)
            : asset('storage/' . $image);
    }
}