<?php

namespace App\Http\Controllers;

use App\Models\RendezVous;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception; 
use Illuminate\Support\Facades\log;

class RendezVousController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
        //validation request
        $data=$request->validate([
            'id_patient'=>'required|exists:patients,id_patient',
            'id_medecin'=>'required|exists:medecins,id_medecin',
            'id_rec'=>'required|exists:receptionnistes,id_rec',
            'date_rv'=>'required|date',
            'dateDePrisedeRV'=>'nullable|date',
            'statut'=>'required|string|in:prévu,annulé,terminé',
            'motif'=>'required|string' 
        ]);
        
        if(!isset($data['dateDePrisedeRV'])){

            $data['dateDePrisedeRV']=now();
        }
        try{
        DB::transaction(function() use ($data){
            RendezVous::create($data);
        }); 
         return response()->json(['message' => 'Rendez-vous créé avec succès'],201);
        
         } catch (Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }

    }

    /**
     * Display the specified resource.
     */
    public function show(RendezVous $rendezVous)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(RendezVous $rendezVous)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RendezVous $rendezVous)
    {
        $data =$request->validate([
            'id_patient'=>'sometimes|exists:patients,id_patient',
            'id_medecin'=>'sometimes|exists:medecins,id_medecin',
            'id_rec'=>'sometimes|exists:receptionnistes,id_rec',
            'date_rv'=>'sometimes|date',
            'dateDePrisedeRV'=>'sometimes|date',
            'statut'=>'sometimes|string|in:prévu,annulé,terminé',
            'motif'=>'sometimes|string'
        ]);

        try{
            DB::transaction(function() use ($rendezVous , $data ){
                $rendezVous->update($data);
            });

            return response()->json([
                'message' => 'Rendez-vous modifier avec succès'
            ]);
        }catch (Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RendezVous $rendezVous)
    {
         try {
            $rendezVous->delete();
            return response()->json(['message' => 'rendezVous supprimé avec succès'], 200);

        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
