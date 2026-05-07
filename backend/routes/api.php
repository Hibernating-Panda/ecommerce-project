<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\Admin\AdminDashboardController;
use App\Http\Controllers\API\Admin\AdminUserController;
use App\Http\Controllers\API\Admin\AdminProductController;
use App\Http\Controllers\API\Admin\AdminCategoryController;
use App\Http\Controllers\API\Admin\AdminProfileController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});

Route::get('/products', [ProductController::class,'index']);
Route::post('/products', [ProductController::class,'store']);
Route::get('/products/{id}', [ProductController::class,'show']);
Route::put('/products/{id}', [ProductController::class,'update']);
Route::delete('/products/{id}', [ProductController::class,'destroy']);


Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);

    Route::apiResource('/users', AdminUserController::class);
    Route::patch('/users/{user}/approve', [AdminUserController::class, 'approve']);
    Route::patch('/users/{user}/reject', [AdminUserController::class, 'reject']);

    Route::get('/products', [AdminProductController::class, 'index']);
    Route::post('/products', [AdminProductController::class, 'store']);
    Route::get('/products/{product}', [AdminProductController::class, 'show']);
    Route::put('/products/{product}', [AdminProductController::class, 'update']);
    Route::patch('/products/{product}/status', [AdminProductController::class, 'updateStatus']);
    Route::delete('/products/{product}', [AdminProductController::class, 'destroy']);
    
    Route::apiResource('/categories', AdminCategoryController::class);

    Route::get('/profile', [AdminProfileController::class, 'show']);
    Route::put('/profile', [AdminProfileController::class, 'update']);
    
});

