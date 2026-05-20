<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('customer_name')->nullable();
            $table->text('delivery_address')->nullable();

            $table->enum('payment_method', ['cash', 'online'])
                ->default('cash');

            $table->enum('order_type', ['pickup', 'delivery'])
                ->nullable();

            $table->dateTime('pickup_date')->nullable();

            $table->enum('status', [
                'pending',
                'accepted',
                'partially_rejected',
                'cancelled',
                'ready_for_delivery',
                'in_transit',
                'delivered',
                'completed',
            ])->default('pending');

            $table->decimal('total', 10, 2)->default(0);
            $table->timestamp('order_date')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index('payment_method');
            $table->index('order_type');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};