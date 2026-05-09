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

            $table->foreignId('shop_id')
                ->nullable()
                ->constrained('shops')
                ->onDelete('cascade');

            $table->string('customer_name')->nullable();
            $table->string('product_name')->nullable();
            $table->integer('quantity')->default(1);
            $table->decimal('total', 10, 2)->default(0);

            $table->enum('status', [
                'Pending',
                'Processing',
                'Completed',
                'Cancelled'
            ])->default('Pending');

            $table->date('order_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};