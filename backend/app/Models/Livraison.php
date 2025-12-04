<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Livraison extends Model
{
    //
    use HasFactory;
    protected $table = 'livraisons';
    protected $fillable = [
        'dateL',
        'fournisseur',
        'id_magasinier'
    ];

    public function magasinier()
    {
        return $this->belongsTo(Magasiniers::class, 'id_magasinier', 'id_magasinier');
    }
    public function produits()
    {
        return $this->hasMany(ProduitLivraison::class, 'idL');
    }
}
