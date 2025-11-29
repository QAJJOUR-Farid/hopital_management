<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Diagnostic extends Model
{
    //
    protected $table = "diagnostics";
    protected $primaryKey = "idD";
    protected $fillable = [
        'dateD',
        'description',
        'resultats',
        'id_patient',
        'id_medecin',
        'id_infirmier',
        'etat'
        ];

    public function patient(){
        return $this->belongsTo(Patient::class,'id_patient','id_patient');
    }
    public function medecin(){
        return $this->belongsTo(Medecins::class,'id_medecin','id_medecin');
    }
    public function infirmier(){
        return $this->belongsTo(Infirmiers::class,'id_infirmier','id_infirmier');
    }

}
