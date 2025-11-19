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
        Schema::create('produits', function (Blueprint $table) {
            $table->id('idP');
            $table->string('nom');
            $table->integer('nombre');
            $table->decimal('prix_unitaire', 5, 2);
            $table->enum('categorie', ['materiel', 'medicament']);
            $table->unsignedBigInteger('id_magasinier')->nullable();
            $table->foreign('id_magasinier')->references('id_magasinier')->
                    on('magasiniers')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produits');
    }
};
