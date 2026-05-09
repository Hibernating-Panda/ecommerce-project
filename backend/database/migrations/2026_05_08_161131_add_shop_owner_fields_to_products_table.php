<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'shop_id')) {
                $table->foreignId('shop_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('shops')
                    ->onDelete('cascade');
            }

            if (!Schema::hasColumn('products', 'stock')) {
                $table->integer('stock')->default(0)->after('price');
            }

            if (!Schema::hasColumn('products', 'category')) {
                $table->string('category')->nullable()->after('stock');
            }

            if (!Schema::hasColumn('products', 'image')) {
                $table->string('image')->nullable()->after('category');
            }

            if (!Schema::hasColumn('products', 'description')) {
                $table->text('description')->nullable()->after('image');
            }

            if (!Schema::hasColumn('products', 'status')) {
                $table->enum('status', ['Active', 'Inactive'])
                    ->default('Active')
                    ->after('description');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'shop_id')) {
                $table->dropConstrainedForeignId('shop_id');
            }

            if (Schema::hasColumn('products', 'stock')) {
                $table->dropColumn('stock');
            }

            if (Schema::hasColumn('products', 'category')) {
                $table->dropColumn('category');
            }

            if (Schema::hasColumn('products', 'image')) {
                $table->dropColumn('image');
            }

            if (Schema::hasColumn('products', 'description')) {
                $table->dropColumn('description');
            }

            if (Schema::hasColumn('products', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};