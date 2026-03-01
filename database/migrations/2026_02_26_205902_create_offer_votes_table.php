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
        Schema::create('offer_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offer_id')->constrained('price_offers')->cascadeOnDelete();
            $table->foreignId('committee_member_id')->constrained('committee_members')->cascadeOnDelete();
            $table->timestamps();

            $table->unique('committee_member_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('offer_votes');
    }
};
