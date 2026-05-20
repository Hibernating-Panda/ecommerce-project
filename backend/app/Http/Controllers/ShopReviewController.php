<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use App\Models\ShopReview;
use Illuminate\Http\Request;

class ShopReviewController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        if (! $user->hasRole('user')) {
            return response()->json([
                'message' => 'Only customers can review shops.',
            ], 403);
        }

        $validated = $request->validate([
            'shop_id' => ['required', 'exists:shops,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $shop = Shop::find($validated['shop_id']);

        if (! $shop) {
            return response()->json([
                'message' => 'Shop not found.',
            ], 404);
        }

        $review = ShopReview::updateOrCreate(
            [
                'user_id' => $user->id,
                'shop_id' => $validated['shop_id'],
            ],
            [
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
            ]
        );

        return response()->json([
            'message' => 'Shop review saved.',
            'review' => $review->load(['shop', 'user:id,name,profile_image']),
        ]);
    }

    public function myReviews(Request $request)
    {
        $reviews = ShopReview::with([
                'shop',
                'user:id,name,profile_image',
            ])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate($request->integer('per_page', 10));

        return response()->json([
            'shop_reviews' => $reviews,
        ]);
    }
}