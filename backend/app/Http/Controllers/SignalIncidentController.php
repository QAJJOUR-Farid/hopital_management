<?php

namespace App\Http\Controllers;

use App\Models\SignalIncident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\log;

class SignalIncidentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $signalIncident = SignalIncident::with([
        'produit',
        'infirmier.user',
        'magasinier.user'
    ])->get();

    return response()->json($signalIncident, 200);
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
        $data = $request->validate([
            'type' => 'required|in:repture,malfonctionnement',
            'descriptionS' => 'required|string',
            'nbProduit' => 'nullable|integer',
            'id_infirmier' => 'required|exists:infirmiers,id_infirmier',
            'id_magasinier' => 'required|exists:magasiniers,id_magasinier',
            'idP' => 'required|exists:produits,idP',
        ]);


        $incident = SignalIncident::create($data);

        return response()->json([
            'message' => 'Signal Incident signalé avec succès',
            'data'    => $incident
        ], 200);

    }

    /**
     * Display the specified resource.
     */
    public function show(SignalIncident $signalIncident)
    {
        return response()->json($signalIncident);

    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SignalIncident $signalIncident)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SignalIncident $signalIncident)
    {
        $data =$request->validate([
           'type' => 'sometimes|in:repture,malfonctionnement',
            'descriptionS' => 'sometimes|string',
            'statut' => 'sometimes|in:resolu,nonResolu,enAttente',
            'nbProduit' => 'nullable|integer',
            'id_infirmier' => 'sometimes|exists:infirmiers,id_infirmier',
            'id_magasinier' => 'sometimes|exists:magasiniers,id_magasinier',
            'idP' => 'sometimes|exists:produits,idP',
        ]);

        try{
            DB::transaction(function() use ($signalIncident , $data ){
                $signalIncident->update($data);
            });

            return response()->json([
                'message' => 'signal Incident modifier avec succès'
            ]);
        }catch (Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SignalIncident $signalIncident)
    {
         try {
            $signalIncident->delete();
            return response()->json(['message' => 'Signal Incident supprimé avec succès'], 200);

        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
