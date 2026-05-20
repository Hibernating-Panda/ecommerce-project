<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('delivery_id')
                ->constrained('deliveries')
                ->cascadeOnDelete();

            $table->foreignId('order_item_id')
                ->constrained('order_items')
                ->cascadeOnDelete();

            $table->timestamps();

            $table->unique(['delivery_id', 'order_item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_items');
    }
};