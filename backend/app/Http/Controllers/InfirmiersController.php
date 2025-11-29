<?php

namespace App\Http\Controllers;

use App\Models\Infirmiers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Exception;
use Illuminate\Support\Facades\Log;

class InfirmiersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
{
    $infirmiers = Infirmiers::with('user')->get();
    return response()->json($infirmiers);
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
            'service' => 'required|string'
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

            // Create infirmiers linked to this user via CIN
            Infirmiers::create([
                'CIN' => $data['CIN'],
                'service' => $data['service']
            ]);
        });

        return response()->json([
            'message' => 'infirmier created successfully']);

        } catch (Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Infirmiers $infermiers)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Infirmiers $infermiers)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Infirmiers $infirmier)
    {
        // validation des nouvelles donnees
        $data = $request ->validate([
            'nom'=>'sometimes|string',
            'prenom'=>'sometimes|string',
            'date_naissance'=>'sometimes|date',
            'email' => 'sometimes|email|unique:users,email,' . $infirmier->CIN . ',CIN',
            'password'=>'sometimes|string|min:6',
            'adresse'=>'sometimes|string|nullable',
            'num_tel'=>'sometimes|string|nullable',
            'service'=>'sometimes|string'

    ]);

    try {
        // Debug logging
        Log::info('Infirmier update request', [
            'infirmier_id' => $infirmier->id_infirmier,
            'request_data' => $data
        ]);

        // mettre a jour l'utilisateur
        if ($infirmier->user) {
            // Separate user data from infirmier data
            $userData = collect($data)->except(['service'])->toArray();
            $infirmierData = collect($data)->only(['service'])->toArray();

            // mettre a jour user
            $infirmier->user->update($userData);

            // mettre a jour infirmier
            if (!empty($infirmierData)) {
                $result = $infirmier->update($infirmierData);
                Log::info('Infirmier update result', ['result' => $result, 'new_service' => $infirmier->service]);
            }
        }

        return response()->json(['message' => 'infirmier updated successfully']);
    } catch (\Exception $e) {
        Log::error('Infirmier update error', ['error' => $e->getMessage()]);
        return response()->json(['error' => $e->getMessage()], 500);
    }


    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Infirmiers $infermiers)
    {
        //
    }
}
