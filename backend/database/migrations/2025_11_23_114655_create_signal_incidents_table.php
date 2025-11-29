<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('signal_incident', function (Blueprint $table) {
            $table->id('idS');
            $table->enum('type', ['repture', 'malfonctionnement']);
            $table->dateTime('dateS')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->text('descriptionS');
            $table->enum('statut', ['resolu', 'nonResolu'])->default('nonResolu');
            $table->integer('nbProduit')->nullable();

            //foreign keys
            $table->unsignedBigInteger('id_infirmier');
            $table->unsignedBigInteger('id_magasinier');
            $table->unsignedBigInteger('idP');

            $table->timestamps();

            $table->foreign('id_infirmier')->references('id_infirmier')->on('infirmiers')->onDelete('cascade');
            $table->foreign('id_magasinier')->references('id_magasinier')->on('magasiniers')->onDelete('cascade');
            $table->foreign('idP')->references('idP')->on('produits')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('signal_incident');
    }
};
