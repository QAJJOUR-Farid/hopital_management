<?php

namespace App\Http\Controllers;

use App\Models\Diagnostic;
use App\Models\Medecins;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Exception;
use Illuminate\Support\Facades\Log;

class MedecinsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $medecins = Medecins::with('user')->get();
        return response()->json($medecins, 200);
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
            'CIN' => 'required|string|unique:users',
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'date_naissance' => 'required|date',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'adresse' => 'nullable|string',
            'num_tel' => 'nullable|string',
            'annee_travail' => 'required|digits:4|integer|min:2000|max:' . date('Y'),
            'description' => 'nullable|string',
            'specialite' => 'required|string'
        ]);

        try{
            DB::transaction(function() use ($data) {
            // Create User
            $user = User::create([
                'CIN' => $data['CIN'],
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'date_naissance' => $data['date_naissance'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'adresse' => $data['adresse'] ?? null,
                'num_tel' => $data['num_tel'] ?? null,
                'etat' => 'inactif',
            ]);

            // Create Medecin linked to this user via CIN
            Medecins::create([
                'CIN' => $data['CIN'],
                'annee_travail' => $data['annee_travail'],
                'description' => $data['description'] ?? null,
                'specialite' => $data['specialite']
            ]);
        });

        return response()->json([
            'message' => 'Medecin created successfully']);

        } catch (Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Medecins $id)
    {
        //
        $medecin = Medecins::with('user')->find($id);

        if (!$medecin) {
            return response()->json(['error' => 'Médecin non trouvé'], 404);
        }

        return response()->json($medecin);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Medecins $medecins)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Medecins $medecin)
    {
        //validation des donnees
        $data = $request->validate([
            'nom' => 'sometimes|string',
            'prenom' => 'sometimes|string',
            'date_naissance' => 'sometimes|date',
            'email' => 'sometimes|email|unique:users,email,' . $medecin->CIN . ',CIN',
            'password' => 'sometimes|string|min:6',
            'adresse' => 'nullable|string',
            'num_tel' => 'nullable|string',
            'annee_travail' => 'sometimes|digits:4|integer|min:2000|max:' . date('Y'),
            'description' => 'nullable|string',
            'specialite' => 'sometimes|string'
        ]);

        try {
            // Debug logging
            Log::info('Medecin update request', [
                'medecin_id' => $medecin->id_medecin,
                'request_data' => $data
            ]);

            // mettre a jour l'utilisateur
            if ($medecin->user) {
            // Separate user data from medecin data
            $userData = collect($data)->except(['annee_travail', 'description', 'specialite'])->toArray();
            $medecinData = collect($data)->only(['annee_travail', 'description', 'specialite'])->toArray();

                Log::info('Separated data', [
                    'user_data' => $userData,
                    'medecin_data' => $medecinData
                ]);

                // mettre a jour user
                $userUpdateResult = $medecin->user->update($userData);
                Log::info('User update result', ['result' => $userUpdateResult, 'updated_user' => $medecin->user->fresh()]);

                // mettre a jour medecin
                if (!empty($medecinData)) {
                    $result = $medecin->update($medecinData);
                    Log::info('Medecin update result', ['result' => $result, 'updated_medecin' => $medecin->fresh()]);
                }
            }

            return response()->json(['message' => 'Medecin updated successfully']);
        } catch (\Exception $e) {
            Log::error('Medecin update error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Medecins $medecins)
    {
        //
    }

    public function changeState(Medecins $idM,Diagnostic $idD) {
        $diagnostic = Diagnostic::find($idD);
        $medecin = Medecins::find($idM);
        $diagnostic->etat = $diagnostic->etat == 'appouver' ? 'enAttente' : 'approuver';
        $diagnostic->id_medecin = $medecin->id_medecin ;
        $diagnostic->save();
        return response()->json(['message' => 'User state changed successfully']);
    }
}
