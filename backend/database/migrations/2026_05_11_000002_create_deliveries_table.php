<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_id')
                ->constrained('orders')
                ->cascadeOnDelete();

            $table->foreignId('shop_id')
                ->nullable()
                ->constrained('shops')
                ->nullOnDelete();

            $table->foreignId('driver_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('status')->default('pending');
            $table->text('pickup_location')->nullable();
            $table->text('delivery_location')->nullable();

            $table->decimal('pickup_lat', 10, 8)->nullable();
            $table->decimal('pickup_lng', 11, 8)->nullable();
            $table->decimal('current_lat', 10, 8)->nullable();
            $table->decimal('current_lng', 11, 8)->nullable();
            $table->decimal('delivery_lat', 10, 8)->nullable();
            $table->decimal('delivery_lng', 11, 8)->nullable();

            $table->integer('estimated_time')->nullable();
            $table->dateTime('started_at')->nullable();
            $table->dateTime('picked_up_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['driver_id', 'status']);
            $table->index(['shop_id', 'status']);
            $table->index(['order_id', 'status']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};