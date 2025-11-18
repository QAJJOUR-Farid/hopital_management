<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Infirmiers extends Model
{
    protected $table = 'infirmiers';
    protected $primaryKey = 'id_infirmier';
    protected $fillable = [
        'CIN',
        'service'
    ];

    public function user(){
        return $this->belongsTo(User::class,'CIN','CIN');
    }

    public function medecin(){
        return $this->belongsTo(Medecins::class,'id_medecin','id_medecin');
    }
}
