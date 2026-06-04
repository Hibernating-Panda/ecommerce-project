<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->foreignId('product_size_id')
                ->nullable()
                ->after('product_id')
                ->constrained('product_sizes')
                ->nullOnDelete();

            $table->unique(['user_id', 'product_id', 'product_size_id'], 'cart_user_product_size_unique');
        });
    }

    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropUnique('cart_user_product_size_unique');
            $table->dropConstrainedForeignId('product_size_id');
        });
    }
};