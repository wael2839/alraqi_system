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
            $table->unsignedBigInteger('current_step_id')->nullable()->after('status');
            $table->foreign('current_step_id')
                ->references('id')
                ->on('workflow_steps')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_requests', function (Blueprint $table) {
            $table->dropForeign(['current_step_id']);
            $table->dropColumn('current_step_id');
        });
    }
};
