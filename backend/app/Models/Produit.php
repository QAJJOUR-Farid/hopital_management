<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    protected $primaryKey = 'idP';
    protected $fillable = [
        'nom',
        'nombre',
        'prix_unitaire',
        'categorie',
        'id_magasinier'
    ];

    public function magasinier()
    {
        return $this->belongsTo(Magasiniers::class, 'id_magasinier', 'id_magasinier');
    }
}
