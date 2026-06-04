<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (!Schema::hasColumn('payments', 'customer_id')) {
                $table->foreignId('customer_id')
                    ->nullable()
                    ->after('order_id')
                    ->constrained('users')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('payments', 'currency')) {
                $table->string('currency', 10)->default('USD')->after('amount');
            }

            if (!Schema::hasColumn('payments', 'provider')) {
                $table->string('provider')->nullable()->after('method');
            }

            if (!Schema::hasColumn('payments', 'merchant_reference')) {
                $table->string('merchant_reference')->nullable()->unique()->after('transaction_id');
            }

            if (!Schema::hasColumn('payments', 'qr_string')) {
                $table->text('qr_string')->nullable()->after('merchant_reference');
            }

            if (!Schema::hasColumn('payments', 'qr_image')) {
                $table->longText('qr_image')->nullable()->after('qr_string');
            }

            if (!Schema::hasColumn('payments', 'deeplink')) {
                $table->text('deeplink')->nullable()->after('qr_image');
            }

            if (!Schema::hasColumn('payments', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('response');
            }

            if (!Schema::hasColumn('payments', 'verified_at')) {
                $table->timestamp('verified_at')->nullable()->after('paid_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $columns = [
                'customer_id',
                'currency',
                'provider',
                'merchant_reference',
                'qr_string',
                'qr_image',
                'deeplink',
                'paid_at',
                'verified_at',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('payments', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};