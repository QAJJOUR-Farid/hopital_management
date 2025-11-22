<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RendezVous extends Model
{
    protected $primaryKey ='idR';
    protected $table = 'rendez_vous';//on forcer le nom  de tableau
    // public $timestamps= false; 
    protected $fillable =[
        // 'id_patient',
        // 'id_medecin',
        // 'id_rec',
        'date_rv',
        'dateDePrisedeRV',
        'statut', //  statut de rendzvous en_attente ,confirme ,annule et termine
        'motif' //la raison de rendezvous (courte description ex: controle generale)
    ];

    public function patient(){
        return $this ->belongsTo(Patient::class ,'id_patient','id_patient');
    }

    public function receptionniste(){
        return $this->belongsTo(Receptionnistes::class , 'id_rec','id_rec');
    }
}
