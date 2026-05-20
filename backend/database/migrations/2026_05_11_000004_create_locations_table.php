<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('delivery_id')
                ->constrained('deliveries')
                ->cascadeOnDelete();

            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->string('address')->nullable();
            $table->timestamp('timestamp')->useCurrent();

            $table->index(['delivery_id', 'timestamp']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};