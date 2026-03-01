<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('price_offers', function (Blueprint $table) {
            $table->string('delivery_period')->nullable()->after('offer_amount');
            $table->string('payment_method')->nullable()->after('delivery_period');
            $table->boolean('meets_specifications')->default(false)->after('payment_method');
            $table->text('notes')->nullable()->after('file_path');
            $table->foreignId('created_by')->nullable()->after('notes')->constrained('users')->nullOnDelete();
            $table->boolean('is_winner')->default(false)->after('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('price_offers', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn([
                'delivery_period',
                'payment_method',
                'meets_specifications',
                'notes',
                'created_by',
                'is_winner',
            ]);
        });
    }
};
