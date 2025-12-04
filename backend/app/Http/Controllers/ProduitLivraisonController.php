<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use App\Models\ProduitLivraison;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class ProduitLivraisonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
{
    // Charger toutes les livraisons avec leurs produits et les détails du produit associé
    $livraisons = \App\Models\Livraison::with([
        'produits',          // ProduitLivraison
        'produits.produit'   // Produit relié à ProduitLivraison
    ])->get();

    return response()->json($livraisons, 200);
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
        //
        $data = $request->validate([
            'idL' => 'required|exists:livraisons,id',
            'idP' => 'required|exists:produits,idP',
            'quantite' => 'required|numeric'
        ]);
        try{
            DB::transaction(function() use ($data) {
            // Create Produit
            ProduitLivraison::create([
                'idL' => $data['idL'],
                'idP' => $data['idP'],
                'quantite' => $data['quantite']
            ]);
            $produit = Produit::where('idP', $data['idP'])->firstOrFail();

                // On ajoute la quantité livrée au stock existant
                $produit->nombre = $produit->nombre + $data['quantite'];
                $produit->save();
        });

        return response()->json([
            'message' => 'product-livraison created successfully']);
        }catch(Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(ProduitLivraison $produitLivraison)
    {
        //
    }
    public function showLivraison(ProduitLivraison $produitLivraison){
        return response()->json($produitLivraison);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ProduitLivraison $produitLivraison)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProduitLivraison $produitLivraison)
    {
        //
        $data = $request->validate([
            'quantite' => 'required|numeric',
            'idL' => 'required|exists:livraisons,id',
            'idP' => 'required|exists:produits,idP'
        ]);
        try {
            DB::transaction(function () use ($produitLivraison, $data) {
                $produitLivraison->update($data);
            });


            return response()->json(['message' => 'Produit-livraison mis à jour avec succès'], 200);

        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($produitLivraison)
    {
        //
        try {
            $produitLivraisonX = ProduitLivraison::findOrFail($produitLivraison);
            $produit = Produit::where('idP', $produitLivraisonX->idP)->firstOrFail();
            // 2. **AUTO - quantite**
            $produit->decrement('nombre', $produitLivraisonX->quantite);
            $produit->save();
            $produitLivraisonX->delete();
            return response()->json(['message' => 'Produit-livraison supprimé avec succès'], 200);

        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
