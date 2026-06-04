<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropUnique('cart_items_user_id_product_id_unique');
        });

        $hasNewIndex = collect(DB::select("SHOW INDEX FROM cart_items"))
            ->contains(function ($index) {
                return $index->Key_name === 'cart_user_product_size_unique';
            });

        if (! $hasNewIndex) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->unique(
                    ['user_id', 'product_id', 'product_size_id'],
                    'cart_user_product_size_unique'
                );
            });
        }
    }

    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropUnique('cart_user_product_size_unique');

            $table->unique(
                ['user_id', 'product_id'],
                'cart_items_user_id_product_id_unique'
            );
        });
    }
};