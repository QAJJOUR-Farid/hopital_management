<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DiagnosticController;
use App\Http\Controllers\InfirmiersController;
use App\Http\Controllers\LivraisonController;
use App\Http\Controllers\MagasiniersController;
use App\Http\Controllers\MedecinsController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\ProduitLivraisonController;
use App\Http\Controllers\ReceptionnistesController;
use App\Http\Controllers\RendezVousController;
use App\Http\Controllers\SignalIncidentController;
use Illuminate\Support\Facades\Route;


// Auth
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);


// chnager l'etat d'utilisateur (fonction de l'admin)
Route::patch( '/admin/{CIN}/state', [AdminController::class, 'changeState']);



// store for users
Route::post('/patients', [PatientController::class, 'store']);
Route::post('/receptionnistes',[ReceptionnistesController::class,'store']);
Route::post('/medecins',[MedecinsController::class,'store']);
Route::post('/magasiniers',[MagasiniersController::class,'store']);
Route::post('/admin',[AdminController::class,'store']);
Route::post('/infirmiers',[InfirmiersController::class,'store']);


//prende un rendez-vous
Route::post('/rendezVous',[RendezVousController::class,'store']);
//suprimmer un Rendez-Vous
Route::delete('/rendezVous/{rendezVous}/destroy',[RendezVousController::class, 'destroy'])->where('produit', '[0-9]+');
//modifier un Rendez-Vous
Route::put('/rendezVous/{rendezVous}/update', [RendezVousController::class, 'update'])->where('rendezVous', '[0-9]+');
//get un Rendez-Vous
Route::get('/rendezVous/{rendezVous}/show', [RendezVousController::class, 'show'])->where('rendezVous', '[0-9]+');
//retourne tous Rendez-Vous
Route::get('/rendezVous/index', [RendezVousController::class, 'index']);


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
Route::patch('/medecins/{idM}/{idD}',[MedecinsController::class, 'changeState']); // testé cette fonction




// Livraison
Route::post('/livraison', [LivraisonController::class, 'store']);
Route::get('/livraison/{livraison}', [LivraisonController::class, 'show'])->where('livraison', '[0-9]+');
Route::get('/livraison/index', [LivraisonController::class, 'index']);
Route::put('/livraison/update/{livraison}', [LivraisonController::class, 'update'])->where('livraison', '[0-9]+');
Route::delete('/livraison/delete/{livraison}', [LivraisonController::class, 'destroy'])->where('livraison', '[0-9]+');


// livraison - produit
Route::post('/livraison-produit', [ProduitLivraisonController::class, 'store']);
Route::get('/livraison-produit/index', [ProduitLivraisonController::class, 'index']);

Route::get('/livraison-produit/{livraison}', [ProduitLivraisonController::class, 'showLivraison'])->where('livraison', '[0-9]+');
Route::put('/livraison-produit/update/{livraison}', [ProduitLivraisonController::class, 'update'])->where('livraison', '[0-9]+');
Route::delete('/livraison-produit/delete/{livraison}', [ProduitLivraisonController::class, 'destroy'])->where('livraison', '[0-9]+');


//signaler un repture
Route::post('/signalIncident',[SignalIncidentController::class,'store']);
//suprimmer un signal /rupture
Route::delete('/signalIncident/{signalIncident}/destroy',[SignalIncidentController::class, 'destroy'])->where('signal_incidents', '[0-9]+');
//modifier un signal_incidents
Route::put('/signalIncident/{signalIncident}/update', [SignalIncidentController::class, 'update'])->where('signal_incidents', '[0-9]+');
//get un signal_incidents
Route::get('/signalIncident/{signalIncident}/show', [SignalIncidentController::class, 'show'])->where('signal_incidents', '[0-9]+');
//retourne tous signal_incidents
Route::get('/signalIncident/index', [SignalIncidentController::class, 'index']);

