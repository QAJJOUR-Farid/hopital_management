<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\InfirmiersController;
use App\Http\Controllers\MagasiniersController;
use App\Http\Controllers\MedecinsController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\ReceptionnistesController;
use Illuminate\Support\Facades\Route;

// store for users
Route::post('/patients', [PatientController::class, 'store']);
Route::post('/receptionnistes',[ReceptionnistesController::class,'store']);
Route::post('/medecins',[MedecinsController::class,'store']);
Route::post('/magasiniers',[MagasiniersController::class,'store']);
Route::post('/admin',[AdminController::class,'store']);
Route::post('/infirmiers',[InfirmiersController::class,'store']);


// store for products
Route::post('/produit', [ProduitController::class, 'store']);
// edit from product
Route::put('/produit/{produit}/update', [ProduitController::class, 'update'])->where('produit', '[0-9]+');
// delete from product
Route::delete('/produit/{produit}/destroy', [ProduitController::class, 'destroy'])->where('produit', '[0-9]+');
// show the product
Route::get('/produit/{produit}/show',[ProduitController::class,'show'])->where('produit','[0-9]+');
// return all the products
Route::get('/produit/index', [ProduitController::class, 'index']);
