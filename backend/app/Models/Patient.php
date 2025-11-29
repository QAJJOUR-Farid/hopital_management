<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $primaryKey = 'id_patient';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable = [
        'CIN',
        'gender',
        'poids',
        'height',
        'id_rec'
    ];



    public function user()
    {
        return $this->belongsTo(User::class, 'CIN', 'CIN');
    }

}
