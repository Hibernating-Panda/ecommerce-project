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
use App\Http\Controllers\Api\ShopOwnerController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\Api\ShopController;

Route::middleware('auth:sanctum')->prefix('shopowner')->group(function () {
    Route::get('/dashboard', [ShopOwnerController::class, 'dashboard']);
    Route::get('/categories', [ShopOwnerController::class, 'categories']);

    Route::get('/products', [ShopOwnerController::class, 'products']);
    Route::post('/products', [ShopOwnerController::class, 'storeProduct']);
    Route::get('/products/{id}', [ShopOwnerController::class, 'showProduct']);
    Route::put('/products/{id}', [ShopOwnerController::class, 'updateProduct']);
    Route::delete('/products/{id}', [ShopOwnerController::class, 'deleteProduct']);

    Route::get('/orders', [ShopOwnerController::class, 'orders']);
    Route::put('/orders/{id}/status', [ShopOwnerController::class, 'updateOrderStatus']);

    Route::get('/profile', [ShopOwnerController::class, 'profile']);
    Route::put('/profile', [ShopOwnerController::class, 'updateProfile']);
});

use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\DeliveryController;
use App\Http\Controllers\API\InvoiceController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\RolePermissionController;
use App\Http\Controllers\API\RouteOptimizationController;
use App\Http\Controllers\API\TrackingController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\API\UserController;            

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/payments/stripe/webhook', [PaymentController::class, 'stripeWebhook']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});

Route::get('/products', [ProductController::class,'index']);
Route::post('/products', [ProductController::class,'store']);
Route::get('/products/{id}', [ProductController::class,'show']);
Route::put('/products/{id}', [ProductController::class,'update']);
Route::delete('/products/{id}', [ProductController::class,'destroy']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::post('/categories', [CategoryController::class, 'store']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::put('/categories/{id}', [CategoryController::class, 'update']);
Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

Route::get('/shops', [ShopController::class, 'index']);
Route::get('/shops/{id}', [ShopController::class, 'show']);
Route::post('/shops', [ShopController::class, 'store']);
Route::put('/shops/{id}', [ShopController::class, 'update']);
Route::delete('/shops/{id}', [ShopController::class, 'destroy']);

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

Route::middleware(['auth:sanctum', 'activity.log'])->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/charts', [DashboardController::class, 'charts']);

    // Users & Roles (admin only)
    Route::middleware('permission:manage-users')->group(function () {
        Route::apiResource('users', UserController::class);
    });

    // Roles & Permissions
    Route::middleware('permission:manage-roles')->group(function () {
        Route::apiResource('roles', RolePermissionController::class);
        Route::post('/roles/{role}/permissions', [RolePermissionController::class, 'syncPermissions']);
        Route::get('/permissions', [RolePermissionController::class, 'allPermissions']);
    });

    // Orders
    Route::apiResource('orders', OrderController::class);
    Route::post('/orders/{order}/assign', [OrderController::class, 'assignDeliveryMan']);
    Route::post('/orders/{order}/status', [OrderController::class, 'updateStatus']);

    // Deliveries
    Route::apiResource('deliveries', DeliveryController::class);
    Route::post('/deliveries/{delivery}/proof', [DeliveryController::class, 'uploadProof']);

    // Payments
    Route::get('/payments',                  [PaymentController::class, 'index']);
    Route::post('/payments/stripe/intent',   [PaymentController::class, 'createStripeIntent']);
    Route::post('/payments/stripe/confirm',  [PaymentController::class, 'confirmStripe']);
    Route::post('/payments/khqr/generate',   [PaymentController::class, 'generateKHQR']);
    Route::post('/payments/khqr/verify',     [PaymentController::class, 'verifyKHQR']);
    Route::get('/payments/{payment}',        [PaymentController::class, 'show']);

    // Live GPS Tracking
    Route::get('/tracking/{order}',          [TrackingController::class, 'getLocation']);
    Route::post('/tracking/update',          [TrackingController::class, 'updateLocation']);
    Route::get('/tracking/history/{order}',  [TrackingController::class, 'history']);

    // AI Route Optimization
    Route::post('/routes/optimize',          [RouteOptimizationController::class, 'optimize']);
    Route::get('/routes/delivery-man/{id}',  [RouteOptimizationController::class, 'getOptimizedRoute']);

    // PDF Invoice
    Route::get('/invoices/{order}/download', [InvoiceController::class, 'download']);
    Route::get('/invoices/{order}/preview',  [InvoiceController::class, 'preview']);

    // Activity Logs
    Route::get('/activity-logs',             [ActivityLogController::class, 'index']);
    Route::get('/activity-logs/export',      [ActivityLogController::class, 'export']);
    Route::delete('/activity-logs/clear',    [ActivityLogController::class, 'clear']);
});