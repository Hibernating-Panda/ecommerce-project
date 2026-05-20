<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            $table->foreignId('shop_id')
                ->constrained('shops')
                ->cascadeOnDelete();

            $table->foreignId('category_id')
                ->nullable()
                ->constrained('categories')
                ->nullOnDelete();

            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('discount_percent', 5, 2)->default(0);
            $table->dateTime('discount_start')->nullable();
            $table->dateTime('discount_end')->nullable();
            $table->integer('stock')->default(0);
            $table->string('image')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();

            $table->index(['shop_id', 'status']);
            $table->index(['category_id', 'status']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};