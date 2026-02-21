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
    Schema::create('price_offers', function (Blueprint $table) {
        $table->id(); 
        
        // الربط بجدول اللجنة (يجب أن يكون جدول اللجنة قد أُنشئ أولاً)
        $table->foreignId('request_id') 
              ->constrained('purchase_requests') 
              ->onDelete('cascade');

        $table->string('vendor_name');
        $table->decimal('offer_amount', 15, 2);
        $table->string('file_path')->nullable(); // لرفع ملف العرض (PDF/Image)
        
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('price_offers');
    }
};
