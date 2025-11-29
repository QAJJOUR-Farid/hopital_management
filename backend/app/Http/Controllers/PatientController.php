<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Exception;
use Illuminate\Support\Facades\Log;



class PatientController extends Controller
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
            'gender' => 'required|in:M,F',
            'poids' => 'nullable|numeric',
            'height' => 'nullable|numeric',
            'id_rec' => 'nullable|exists:receptionnistes,id_rec',
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
                'etat' => 'actif',
            ]);

            // Create Patient linked to this user via CIN
            Patient::create([
                'CIN' => $user->CIN,
                'gender' => $data['gender'],
                'poids' => $data['poids'] ?? null,
                'height' => $data['height'] ?? null,
                'id_rec' => $data['id_rec'] ?? null,
            ]);
        });

        return response()->json([
            'message' => 'Patient created successfully']);

        } catch (Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }



    }

    /**
     * Display the specified resource.
     */
    public function show(Patient $id)
    {
        //
        $patient = Patient::with('user')->find($id);

        if (!$patient) {
            return response()->json(['error' => 'Patient non trouvé'], 404);
        }

        return response()->json($patient);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Patient $patient)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    //
    public function update(Request $request, Patient $patient)
{
    //validation des donnees
    $data = $request->validate([
        'CIN' => 'sometimes|string|unique:users,CIN,' . $patient->CIN . ',CIN',
        'nom' => 'sometimes|string',
        'prenom' => 'sometimes|string',
        'date_naissance' => 'sometimes|date',
        'email' => 'sometimes|email|unique:users,email,' . $patient->CIN . ',CIN',
        'password' => 'sometimes|string|min:6',
        'adresse' => 'nullable|string',
        'num_tel' => 'nullable|string',
        'gender' => 'sometimes|in:M,F',
        'poids' => 'sometimes|numeric',
        'height' => 'sometimes|numeric',
        'id_rec' => 'sometimes|exists:receptionnistes,id_rec'
    ]);

    try {
        // mettre a jour l'utilisateur
        if ($patient->user) {
            // Separate user data from patient data
            $userData = collect($data)->except(['gender', 'poids', 'height', 'id_rec'])->toArray();
            $patientData = collect($data)->only(['gender', 'poids', 'height', 'id_rec'])->toArray();

            // mettre a jour user
            $patient->user->update($userData);

            // mettre a jour patient
            if (!empty($patientData)) {
                $patient->update($patientData);
            }
        }

        return response()->json(['message' => 'Patient updated successfully']);

    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Patient $patient)
    {
        //
    }
}
