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
    Schema::create('committee_members', function (Blueprint $table) {
        $table->id(); // معرف تلقائي للسجل نفسه (اختياري لكنه مفيد)

        // 1. إنشاء حقل اللجنة والربط (لاحظ استخدام id الرقمي الجديد)
        $table->foreignId('request_id')
              ->constrained('purchase_requests')
              ->onDelete('cascade');

        // 2. إنشاء حقل المستخدم والربط (هذا الحقل الذي كان ناقصاً في كودك)
        $table->foreignId('user_id')
              ->constrained('users')
              ->onDelete('cascade');

        // 3. حقول إضافية
        $table->string('user_role', 50)->nullable(); // دور العضو في اللجنة (رئيس، عضو، سكرتير)
        
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('committee_members_tabl');
    }
};
