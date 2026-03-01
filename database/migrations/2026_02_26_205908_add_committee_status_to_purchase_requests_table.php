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
        Schema::table('purchase_requests', function (Blueprint $table) {
            $table->enum('committee_status', ['pending_members', 'pending_offers', 'voting', 'completed'])
                ->nullable()
                ->after('status');
            $table->foreignId('winning_offer_id')->nullable()->after('committee_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_requests', function (Blueprint $table) {
            $table->dropColumn(['committee_status', 'winning_offer_id']);
        });
    }
};
