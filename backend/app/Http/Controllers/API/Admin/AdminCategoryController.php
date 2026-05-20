<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::withCount('products')
            ->when($request->search, function ($query) use ($request) {
                $query->where('name', 'LIKE', "%{$request->search}%");
            })
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
            'description' => ['nullable', 'string'],
        ]);

        $category = Category::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'message' => 'Category created successfully.',
            'category' => $category,
        ], 201);
    }

    public function show(Category $category)
    {
        return response()->json(
            $category->loadCount('products')
        );
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name,' . $category->id],
            'description' => ['nullable', 'string'],
        ]);

        $category->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'message' => 'Category updated successfully.',
            'category' => $category->fresh()->loadCount('products'),
        ]);
    }

    public function destroy(Category $category)
    {
        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'Cannot delete category with products.',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully.',
        ]);
    }
}