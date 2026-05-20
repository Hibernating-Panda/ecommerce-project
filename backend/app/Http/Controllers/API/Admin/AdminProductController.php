<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with(['category', 'shop'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->withSum('orderItems as total_sold', 'quantity')
            ->when($request->status, fn ($query) => $query->where('status', $request->status))
            ->when($request->shop_id, fn ($query) => $query->where('shop_id', $request->shop_id))
            ->when($request->category_id, fn ($query) => $query->where('category_id', $request->category_id))
            ->when($request->search, function ($query) use ($request) {
                $query->where('name', 'LIKE', "%{$request->search}%")
                    ->orWhere('description', 'LIKE', "%{$request->search}%");
            })
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $this->validateProduct($request);

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Product created successfully.',
            'product' => $product->load(['category', 'shop']),
        ], 201);
    }

    public function show(Product $product)
    {
        return response()->json(
            $product->load(['category', 'shop', 'sizes'])
        );
    }

    public function update(Request $request, Product $product)
    {
        $validated = $this->validateProduct($request);

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully.',
            'product' => $product->load(['category', 'shop']),
        ]);
    }

    public function updateStatus(Request $request, Product $product)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:active,inactive,pending,rejected'],
        ]);

        $product->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Product status updated successfully.',
            'product' => $product->load(['category', 'shop']),
        ]);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully.',
        ]);
    }

    private function validateProduct(Request $request): array
    {
        return $request->validate([
            'shop_id' => ['required', 'exists:shops,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'image' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', 'in:active,inactive,pending,rejected'],
            'discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'discount_start' => ['nullable', 'date'],
            'discount_end' => ['nullable', 'date', 'after_or_equal:discount_start'],
        ]);
    }
}