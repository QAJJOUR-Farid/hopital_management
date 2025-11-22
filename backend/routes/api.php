<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\DiagnosticController;
use App\Http\Controllers\InfirmiersController;
use App\Http\Controllers\MagasiniersController;
use App\Http\Controllers\MedecinsController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\ReceptionnistesController;
use App\Http\Controllers\RendezVousController;
use Illuminate\Support\Facades\Route;

// chnager l'etat d'utilisateur (fonction de l'admin)
Route::patch( '/admin/{CIN}/state', [AdminController::class, 'changeState']);



// store for users
Route::post('/patients', [PatientController::class, 'store']);
Route::post('/receptionnistes',[ReceptionnistesController::class,'store']);
Route::post('/medecins',[MedecinsController::class,'store']);
Route::post('/magasiniers',[MagasiniersController::class,'store']);
Route::post('/admin',[AdminController::class,'store']);
Route::post('/infirmiers',[InfirmiersController::class,'store']);


//geree Rendez-Vous
Route::post('/rendezVous',[RendezVousController::class,'store']);
Route::delete('/rendezVous/{rendezVous}',[RendezVousController::class, 'destroy'])->where('produit', '[0-9]+');


// store for products
Route::post('/produit', [ProduitController::class, 'store']);
// update from product
Route::put('/produit/{produit}/update', [ProduitController::class, 'update'])->where('produit', '[0-9]+');
// delete from product
Route::delete('/produit/{produit}/destroy', [ProduitController::class, 'destroy'])->where('produit', '[0-9]+');
// show the product
Route::get('/produit/{produit}/show',[ProduitController::class,'show'])->where('produit','[0-9]+');
// return all the products
Route::get('/produit/index', [ProduitController::class, 'index']);


Route::put('/receptionnistes/{receptionniste}', [ReceptionnistesController::class,'update']);
Route::put('/patients/{patient}', [PatientController::class, 'update']);
ROute::put('/infirmiers/{infirmier}',[InfirmiersController::class ,'update']);
Route::put('/medecins/{medecin}',[MedecinsController::class , 'update']);
Route::put('/magasiniers/{magasinier}',[MagasiniersController::class , 'update']);
Route::put('/admin/{admin}', [AdminController::class, 'update']);


Route::post('/diagnostics', [DiagnosticController::class, 'store']);
Route::delete('/diagnostics/{diagnostic}/destroy', [DiagnosticController::class, 'destroy']);
Route::get('/diagnostics/{diadnostic}/show',[DiagnosticController::class,'show']);
Route::get('/diagnostics/index', [DiagnosticController::class, 'index']);
Route::get('/diagnostics/{id}/patient', [DiagnosticController::class, 'getDiagnosticByPatientId']);
Route::put('/diagnostics/{diagnostic}/update', [DiagnosticController::class, 'update']);
