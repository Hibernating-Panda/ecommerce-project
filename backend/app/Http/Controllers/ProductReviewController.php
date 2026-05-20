<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\Request;

class ProductReviewController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        if (! $user->hasRole('user')) {
            return response()->json([
                'message' => 'Only customers can review products.',
            ], 403);
        }

        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $product = Product::where('id', $validated['product_id'])
            ->where('status', 'active')
            ->first();

        if (! $product) {
            return response()->json([
                'message' => 'Product is not available for review.',
            ], 422);
        }

        $review = ProductReview::updateOrCreate(
            [
                'user_id' => $user->id,
                'product_id' => $validated['product_id'],
            ],
            [
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
            ]
        );

        return response()->json([
            'message' => 'Product review saved.',
            'review' => $review->load(['product.shop', 'user:id,name,profile_image']),
        ]);
    }

    public function myReviews(Request $request)
    {
        $reviews = ProductReview::with([
                'product.shop',
                'product.category',
                'user:id,name,profile_image',
            ])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate($request->integer('per_page', 10));

        return response()->json([
            'product_reviews' => $reviews,
        ]);
    }
}