<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_id')
                ->constrained('orders')
                ->cascadeOnDelete();

            $table->decimal('amount', 10, 2);
            $table->string('method');
            $table->string('status')->default('pending');
            $table->string('transaction_id')->nullable()->unique();
            $table->json('response')->nullable();
            $table->timestamps();

            $table->unique('order_id');
            $table->index(['method', 'status']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};