<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('subtotal', 10, 2)->default(0)->after('status');
            $table->decimal('delivery_lat', 10, 8)->nullable()->after('delivery_address');
            $table->decimal('delivery_lng', 11, 8)->nullable()->after('delivery_lat');
            $table->decimal('delivery_distance_km', 8, 2)->default(0)->after('subtotal');
            $table->decimal('delivery_fee', 10, 2)->default(0)->after('delivery_distance_km');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'subtotal',
                'delivery_lat',
                'delivery_lng',
                'delivery_distance_km',
                'delivery_fee',
            ]);
        });
    }
};