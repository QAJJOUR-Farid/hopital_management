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
        Schema::create('rendez_vous', function (Blueprint $table) {
            $table->id('idR');
            $table->unsignedBigInteger('id_medecin')->nullable();
            $table->unsignedBigInteger('id_patient');
            $table->unsignedBigInteger('id_rec')->nullable();
            $table->dateTime('date_rv');
            $table->dateTime('dateDePrisedeRV');
            $table->string('statut')->default('prévu');
            $table->string('motif')->nullable();
            $table->timestamps();

            //clees etrangeres
            $table->foreign('id_patient')->references('id_patient')->on('patients')->onDelete('cascade');

            $table->foreign('id_medecin')->references('id_medecin')->on('medecins')->onDelete('cascade');
             
            $table->foreign('id_rec')->references('id_rec')->on('receptionnistes')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rendez_vous');
    }
};
