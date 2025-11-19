<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class ProduitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // retourner tous les produits
        return response()->json(Produit::all());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
         // Validate request
        $data = $request->validate([
            'nom' => 'required|string',
            'nombre' => 'required|numeric',
            'prix_unitaire' => 'required|numeric',
            'categorie' => 'required|in:materiel,medicament',
            'id_magasinier' => 'nullable|exists:magasiniers,id_magasinier'
        ]);

        try{
            DB::transaction(function() use ($data) {
            // Create Produit
            Produit::create([
                'nom' => $data['nom'],
                'nombre' => $data['nombre'],
                'prix_unitaire' => $data['prix_unitaire'],
                'categorie' => $data['categorie'],
                'id_magasinier' => $data['id_magasinier'] ?? null
            ]);
        });
        return response()->json([
            'message' => 'product created successfully']);
        }catch(Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }

    }

    /**
     * Display the specified resource.
     */
    public function show(Produit $produit)
    {
        //
        return response()->json($produit);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Produit $produit)
    {
        //
    }

    /**
     * Update an existing product.
     */
    public function update(Request $request, Produit $produit)
    {
        $data = $request->validate([
            'nom' => 'required|string',
            'nombre' => 'required|numeric',
            'prix_unitaire' => 'required|numeric',
            'categorie' => 'required|in:materiel,medicament',
            'id_magasinier' => 'nullable|exists:magasiniers,id_magasinier'
        ]);

        try {
            DB::transaction(function () use ($produit, $data) {
                $produit->update($data);
            });

            return response()->json(['message' => 'Produit mis à jour avec succès'], 200);

        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a product.
     */
    public function destroy(Produit $produit)
    {
        try {
            $produit->delete();
            return response()->json(['message' => 'Produit supprimé avec succès'], 200);

        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
