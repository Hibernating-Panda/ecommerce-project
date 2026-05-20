<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::withCount('products')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    public function show($id)
    {
        $category = Category::with([
                'products' => function ($query) {
                    $query->with(['shop', 'category'])
                        ->where('status', 'active')
                        ->latest();
                },
            ])
            ->find($id);

        if (! $category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $category,
        ]);
    }
}