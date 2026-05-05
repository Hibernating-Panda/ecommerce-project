<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    public function index()
    {
        $products = Product::with('category')->latest()->get();

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|string|max:1000',
            'status' => 'required|in:active,inactive,pending,rejected',
        ]);

        $product = Product::create([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'image' => $request->image,
            'status' => $request->status,
        ]);

        $product->load('category');

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product,
        ], 201);
    }

    public function show(Product $product)
    {
        $product->load('category');

        return response()->json($product);
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|string|max:1000',
            'status' => 'required|in:active,inactive,pending,rejected',
        ]);

        $product->update([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'image' => $request->image,
            'status' => $request->status,
        ]);

        $product->load('category');

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product,
        ]);
    }

    public function updateStatus(Request $request, Product $product)
    {
        $request->validate([
            'status' => 'required|in:active,inactive,pending,rejected',
        ]);

        $product->status = $request->status;
        $product->save();

        $product->load('category');

        return response()->json([
            'message' => 'Product status updated successfully',
            'product' => $product,
        ]);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }
}