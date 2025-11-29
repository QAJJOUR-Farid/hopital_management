<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Exception;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{

    /*
        changer l'etat d'un utilisateur
    */

    public function changeState($CIN){
        $user = User::find($CIN);
        $user->etat = $user->etat == 'actif' ? 'inactif' : 'actif';
        $user->save();
        return response()->json(['message' => 'User state changed successfully']);
    }

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
                'etat' => 'actif'
            ]);

            // Create Admin linked to this user via CIN
            Admin::create([
                'CIN' => $data['CIN']
            ]);
        });

        return response()->json([
            'message' => 'Admin created successfully']);

        } catch (Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Admin $admin)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Admin $admin)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
   public function update(Request $request, Admin $admin)
{
    //validation des donnees
    $data = $request->validate([
        'CIN' => 'sometimes|string|unique:users,CIN,' . $admin->CIN . ',CIN',
        'nom' => 'sometimes|string',
        'prenom' => 'sometimes|string',
        'date_naissance' => 'sometimes|date',
        'email' => 'sometimes|email|unique:users,email,' . $admin->CIN . ',CIN',
        'password' => 'sometimes|string|min:6',
        'adresse' => 'nullable|string',
        'num_tel' => 'nullable|string'
    ]);

    try {
        // mettre a jour l'utilisateur
        if ($admin->user) {
            $admin->user->update($data); // pas de hash
        }

        // Admin table has no additional fields to update
        // $admin->update([]); // Not needed

        return response()->json(['message' => 'Admin updated successfully']);

    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

public function getAllUsers() {
    $users = User::with(['admin', 'medecins', 'infirmiers', 'magasiniers', 'receptionniste', 'patient'])->get();

    // Add role to each user
    $users->transform(function ($user) {
        $user->role = $this->getUserRole($user);
        return $user;
    });

    return response()->json($users);
}

private function getUserRole($user)
{
    // Vérifier chaque relation pour déterminer le rôle
    if ($user->admin) return 'admin';
    if ($user->medecins) return 'medecin';
    if ($user->infirmiers) return 'infirmier';
    if ($user->magasiniers) return 'magasinier';
    if ($user->receptionniste) return 'receptionniste';
    if ($user->patient) return 'patient';
    return 'user';
}



    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Admin $admin)
    {
        //
    }
}
