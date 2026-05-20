<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('shop_name')->default('My Shop');
            $table->string('owner_name')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->text('description')->nullable();
            $table->string('aba_qr_image')->nullable();
            $table->string('aba_account_name')->nullable();
            $table->string('aba_account_number')->nullable();
            $table->timestamps();

            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shops');
    }
};