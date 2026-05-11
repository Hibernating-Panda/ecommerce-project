<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ShopReview;
use Illuminate\Http\Request;

class ShopReviewController extends Controller
{
    public function store(Request $request)
    {
        if (!$request->user()->hasRole('user')) {
            return response()->json([
                'message' => 'Only customers can review shops.',
            ], 403);
        }

        $validated = $request->validate([
            'shop_id' => ['required', 'exists:shops,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['required', 'string', 'max:1000'],
        ]);

        $review = ShopReview::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'shop_id' => $validated['shop_id'],
            ],
            [
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
            ]
        );

        return response()->json([
            'message' => 'Shop review saved.',
            'review' => $review,
        ]);
    }

    public function myReviews(Request $request)
    {
        $reviews = ShopReview::with(['shop', 'user'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'shop_reviews' => $reviews,
        ]);
    }
}