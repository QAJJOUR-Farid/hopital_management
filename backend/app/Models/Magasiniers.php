<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;

class Magasiniers extends Model
{
    protected $primaryKey = 'id_magasinier';

    protected $fillable = [
        'CIN'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'CIN', 'CIN');
    }
    public function produit()
    {
        return $this->hasMany(Produit::class, 'id_magasinier', 'id_magasinier');
    }
}
