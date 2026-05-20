<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\ProductReviewController;
use App\Http\Controllers\ShopReviewController;

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\HomeController;
use App\Http\Controllers\API\ShopController;
use App\Http\Controllers\API\ShopOwnerController;
use App\Http\Controllers\API\OrderController as CartOrderController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\DeliveryMan\DeliveryController;
use App\Http\Controllers\API\InvoiceController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\RolePermissionController;
use App\Http\Controllers\API\RouteOptimizationController;
use App\Http\Controllers\API\ProfileController;

use App\Http\Controllers\API\Admin\AdminDashboardController;
use App\Http\Controllers\API\Admin\AdminUserController;
use App\Http\Controllers\API\Admin\AdminProductController;
use App\Http\Controllers\API\Admin\AdminCategoryController;
use App\Http\Controllers\API\Admin\AdminProfileController;
use App\Http\Controllers\API\Admin\AdminDeliveryController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/', [HomeController::class, 'index']);
Route::get('/homepage-products', [HomeController::class, 'index']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

Route::get('/shops', [ShopController::class, 'index']);
Route::get('/shops/{id}', [ShopController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/me', [AuthController::class, 'user']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{cartItem}', [CartController::class, 'update']);
    Route::delete('/cart/{cartItem}', [CartController::class, 'destroy']);

    Route::get('/customer/orders', [CartOrderController::class, 'customerIndex']);
    Route::post('/orders', [CartOrderController::class, 'store']);
    Route::put('/orders/{order}/cancel', [CartOrderController::class, 'cancel']);
    Route::put('/orders/{order}/checkout', [CartOrderController::class, 'checkout']);

    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);

    Route::post('/product-reviews', [ProductReviewController::class, 'store']);
    Route::post('/shop-reviews', [ShopReviewController::class, 'store']);
    Route::get('/my-product-reviews', [ProductReviewController::class, 'myReviews']);
    Route::get('/my-shop-reviews', [ShopReviewController::class, 'myReviews']);
});

Route::middleware('auth:sanctum')
    ->prefix('shopowner')
    ->group(function () {
        Route::get('/dashboard', [ShopOwnerController::class, 'dashboard']);
        Route::get('/categories', [ShopOwnerController::class, 'categories']);

        Route::get('/products', [ShopOwnerController::class, 'products']);
        Route::post('/products', [ShopOwnerController::class, 'storeProduct']);
        Route::get('/products/{id}', [ShopOwnerController::class, 'showProduct']);
        Route::put('/products/{id}', [ShopOwnerController::class, 'updateProduct']);
        Route::delete('/products/{id}', [ShopOwnerController::class, 'deleteProduct']);

        Route::get('/orders', [CartOrderController::class, 'shopOwnerOrders']);
        Route::put('/order-items/{orderItem}/reject', [CartOrderController::class, 'rejectItem']);
        Route::put('/order-items/{orderItem}/ready', [CartOrderController::class, 'readyItem']);

        Route::get('/sales', [ShopOwnerController::class, 'sales']);

        Route::get('/profile', [ShopOwnerController::class, 'profile']);
        Route::post('/profile', [ShopOwnerController::class, 'updateProfile']);
    });

Route::middleware(['auth:sanctum', 'role:admin'])
    ->prefix('admin')
    ->group(function () {
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

        Route::get('/deliveries', [AdminDeliveryController::class, 'index']);
        Route::get('/delivery-men', [AdminDeliveryController::class, 'deliveryMen']);
        Route::put('/deliveries/{delivery}/assign', [AdminDeliveryController::class, 'assign']);
        Route::put('/deliveries/{delivery}/cancel', [AdminDeliveryController::class, 'cancel']);
    });

Route::middleware('auth:sanctum')
    ->prefix('delivery')
    ->group(function () {
        Route::get('/stats', [DeliveryController::class, 'stats']);

        Route::get('/orders', [DeliveryController::class, 'assignedDeliveries']);
        Route::get('/orders/{id}', [DeliveryController::class, 'show']);
        Route::put('/orders/{id}/status', [DeliveryController::class, 'updateStatus']);
        Route::put('/orders/{id}/location', [DeliveryController::class, 'updateLocation']);
        Route::put('/orders/{id}/accept', [DeliveryController::class, 'acceptDelivery']);

        Route::get('/available', [DeliveryController::class, 'availableDeliveries']);
        Route::get('/history', [DeliveryController::class, 'history']);

        Route::get('/profile', [DeliveryController::class, 'profile']);
        Route::put('/profile', [DeliveryController::class, 'updateProfile']);
    });

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/charts', [DashboardController::class, 'charts']);

    Route::middleware('permission:manage-roles')->group(function () {
        Route::apiResource('/roles', RolePermissionController::class);
        Route::post('/roles/{role}/permissions', [RolePermissionController::class, 'syncPermissions']);
        Route::get('/permissions', [RolePermissionController::class, 'allPermissions']);
    });

    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments/khqr/generate', [PaymentController::class, 'generateKHQR']);
    Route::post('/payments/khqr/verify', [PaymentController::class, 'verifyKHQR']);
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);

    Route::post('/routes/optimize', [RouteOptimizationController::class, 'optimize']);
    Route::get('/routes/delivery-man/{id}', [RouteOptimizationController::class, 'getOptimizedRoute']);

    Route::get('/invoices/{order}/download', [InvoiceController::class, 'download']);
    Route::get('/invoices/{order}/preview', [InvoiceController::class, 'preview']);
});