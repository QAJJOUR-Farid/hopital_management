<?php

namespace App\Http\Controllers;

use App\Models\Diagnostic;
use Illuminate\Http\Request;
use PhpParser\Node\Stmt\TryCatch;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Exception;
use Illuminate\Support\Facades\Log;

class DiagnosticController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $diagnostics = Diagnostic::with(['patient.user', 'medecin.user'])->get();
        return response()->json($diagnostics);
    }


    public function getDiagnosticByPatientId($id){
        return response()->json(Diagnostic::where('id_patient', $id)->get());
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
    $request->validate([
        'description' => 'nullable|string',
        'resultats' => 'nullable|string',
        'dateD' => 'required|date',
        'id_patient' => 'required|exists:patients,id_patient',
        'id_medecin' => 'nullable|exists:medecins,id_medecin',
        'id_infirmier' => 'nullable|exists:infirmiers,id_infirmier'
    ]);

    try{
        DB::transaction(function() use ($request) {
            Diagnostic::create([
                'description' => $request->description ?? null,
                'resultats' => $request->resultats ?? null,
                'dateD' => $request->dateD,
                'id_patient' => $request->id_patient,
                'id_medecin' => $request->id_medecin ?? null,
                'id_infirmier' => $request->id_infirmier ?? null
            ]);
        });

        return response()->json([
            'message' => 'Diagnostic created successfully'
        ]);

    } catch(Exception $e){
        return response()->json(['error' => $e->getMessage()], 500);
    }
}


    /**
     * Display the specified resource.
     */
    public function show(Diagnostic $diagnostic)
    {
        //
        return response()->json($diagnostic);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Diagnostic $diagnostic)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Diagnostic $diagnostic)
    {
        $data = $request->validate([
            'description' => 'nullable|string',
            'resultats' => 'nullable|string',
            'dateD' => 'required|date',
            'id_patient' => 'required|exists:patients,id_patient',
            'id_medecin' => 'nullable|exists:medecins,id_medecin',
            'id_infirmier' => 'nullable|exists:infirmiers,id_infirmier'
        ]);

        try {
            DB::transaction(function () use ($diagnostic, $data) {
                $diagnostic->update($data);
            });

            return response()->json(['message' => 'diagnostic mis à jour avec succès'], 200);

        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Diagnostic $diagnostic)
    {
        //
        try {
            $diagnostic->delete();
            return response()->json(['message' => 'diagnostic supprimé avec succès'], 200);

        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
