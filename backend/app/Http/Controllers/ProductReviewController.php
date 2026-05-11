<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use Illuminate\Http\Request;

class ProductReviewController extends Controller
{
    public function store(Request $request)
    {
        if (!$request->user()->hasRole('user')) {
            return response()->json([
                'message' => 'Only customers can review products.',
            ], 403);
        }

        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['required', 'string', 'max:1000'],
        ]);

        $review = ProductReview::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'product_id' => $validated['product_id'],
            ],
            [
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
            ]
        );

        return response()->json([
            'message' => 'Product review saved.',
            'review' => $review,
        ]);
    }

    public function myReviews(Request $request)
    {
        $reviews = ProductReview::with(['product.shop', 'user'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'product_reviews' => $reviews,
        ]);
    }
}