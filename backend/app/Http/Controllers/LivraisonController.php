<?php

namespace App\Http\Controllers;

use App\Models\Livraison;
use App\Models\Produit;
use App\Models\ProduitLivraison;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Exception;

class LivraisonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        return response()->json(Livraison::with('magasinier', 'produits.produit')->get());
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
            'dateL' => 'required|date',
            'fournisseur' => 'required|string',
            'id_magasinier' => 'nullable|exists:magasiniers,id_magasinier'
        ]);
        try{
            DB::transaction(function() use ($data) {
            // Create Livraison
            Livraison::create([
                'dateL' => $data['dateL'],
                'fournisseur' => $data['fournisseur'],
                'id_magasinier' => $data['id_magasinier'] ?? null,
            ]);
        });
        return response()->json([
            'message' => 'Livraison created successfully']);
        }catch(Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Livraison $livraison)
    {
        //
        return response()->json($livraison);
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Livraison $livraison)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Livraison $livraison)
    {
        //
        $data = $request->validate([
            'dateL' => 'required|date',
            'fournisseur' => 'required|string',
            'id_magasinier' => 'nullable|exists:magasiniers,id_magasinier'
        ]);

        try {
            DB::transaction(function () use ($livraison, $data) {
                $livraison->update($data);
            });

            return response()->json(['message' => 'livraison mis à jour avec succès'], 200);

        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Livraison $livraison)
    {
        //
        try {
            $lignes = ProduitLivraison::where('idL', $livraison->id)->get();

                foreach($lignes as $ligne) {
                    //  Pour chaque ligne, on décrémente le stock du produit correspondant
                    $produit = Produit::where('idP', $ligne->idP)->first();

                    if($produit) {
                        // Stock = Stock - Quantité de la livraison
                        $produit->decrement('nombre', $ligne->quantite);
                        $produit->save();
                    }
                }
            $livraison->delete();
            return response()->json(['message' => 'livraison supprimé avec succès'], 200);

        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
