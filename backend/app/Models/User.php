<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use  HasFactory, Notifiable;

    protected $primaryKey = 'CIN';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
    'CIN',
    'nom',
    'prenom',
    'date_naissance',
    'etat',
    'email',
    'password',
    'adresse',
    'num_tel'
];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',

    ];

    // Relationships

    public function patient()
    {
        return $this->hasOne(Patient::class, 'CIN', 'CIN');
    }

    public function receptionniste()
    {
        return $this->hasOne(Receptionnistes::class, 'CIN', 'CIN');
    }

    public function medecins(){
        return $this->hasOne(Medecins::class,'CIN','CIN');
    }

    public function magasiniers(){
        return $this->hasOne(Magasiniers::class,'CIN','CIN');
    }

    public function infirmiers(){
        return $this->hasOne(Infirmiers::class,'CIN','CIN');
    }
    public function admin(){
        return $this->hasOne(Admin::class,'CIN','CIN');
    }

    /*
       ! modifer infos all users
        !! modifier etat l admin
       ! ajouter modifer supprimer produit
        !! signaler reprure

    */

}
