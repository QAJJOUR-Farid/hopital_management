<?php

namespace App\Http\Controllers;

use App\Models\Magasiniers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Exception;
use Illuminate\Support\Facades\Log;

class MagasiniersController extends Controller
{

    public function index(){
        return Magasiniers::with('user')->get();
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
            'num_tel' => 'nullable|string'
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

            // Create magasinier linked to this user via CIN
            Magasiniers::create([
                'CIN' => $data['CIN']
            ]);
        });

        return response()->json([
            'message' => 'Magasiniers created successfully']);

        } catch (Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

        public function update(Request $request, Magasiniers $magasinier)
    {
        //validation des donnees
        $data = $request->validate([
              'CIN' => 'sometimes|string|unique:users,CIN,' . $magasinier->CIN . ',CIN',
            'nom' => 'sometimes|string',
            'prenom' => 'sometimes|string',
            'date_naissance' => 'sometimes|date',
            'email' => 'sometimes|email|unique:users,email,' . $magasinier->CIN . ',CIN',
            'password' => 'sometimes|string|min:6',
            'adresse' => 'nullable|string',
            'num_tel' => 'nullable|string'
    ]);

    try {
        // mettre a jour l'utilisateur
        if ($magasinier->user) {

            // mettre a jour magasinier
            $magasinier->user->update($data);
        }

        return response()->json(['message' => 'magasinier updated successfully']);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
    }


}
