<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'discount_percent')) {
                $table->decimal('discount_percent', 5, 2)->default(0)->after('price');
            }

            if (!Schema::hasColumn('products', 'discount_start')) {
                $table->dateTime('discount_start')->nullable()->after('discount_percent');
            }

            if (!Schema::hasColumn('products', 'discount_end')) {
                $table->dateTime('discount_end')->nullable()->after('discount_start');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'discount_percent')) {
                $table->dropColumn('discount_percent');
            }

            if (Schema::hasColumn('products', 'discount_start')) {
                $table->dropColumn('discount_start');
            }

            if (Schema::hasColumn('products', 'discount_end')) {
                $table->dropColumn('discount_end');
            }
        });
    }
};