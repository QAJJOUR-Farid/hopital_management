<?php

namespace App\Http\Controllers;

use App\Models\Receptionnistes;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Exception;
use Illuminate\Support\Facades\Log;

class ReceptionnistesController extends Controller
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

            // Create Receptionnistes linked to this user via CIN
            Receptionnistes::create([
                'CIN' => $data['CIN']
            ]);
        });

        return response()->json([
            'message' => 'Receptionnistes created successfully']);

        } catch (Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(receptionnistes $receptionnistes)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(receptionnistes $receptionnistes)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */


public function update(Request $request, Receptionnistes $receptionniste)
{
    //validation des donnees
    $data = $request->validate([
        'nom' => 'sometimes|string',
        'num_tel' => 'sometimes|string|nullable',
        'CIN' => 'sometimes|string|unique:users,CIN,' . $receptionniste->CIN . ',CIN',
        'prenom' => 'sometimes|string',
        'date_naissance' => 'sometimes|date',
        'email' => 'sometimes|email|unique:users,email,' . $receptionniste->CIN . ',CIN',
        'password' => 'sometimes|string|min:6',
        'adresse' => 'nullable|string'
    ]);

    try {// mettre a jour l'utilisateur
        if ($receptionniste->user) {

            // mettre a jour receptionniste
            $receptionniste->user->update($data);
        }

        return response()->json(['message' => 'Receptionniste updated successfully']);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}



    /**
     * Remove the specified resource from storage.
     */
    public function destroy(receptionnistes $receptionnistes)
    {
        //
    }
}
