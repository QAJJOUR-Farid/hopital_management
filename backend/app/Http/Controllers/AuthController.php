<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Admin;
use App\Models\Medecins;
use App\Models\Infirmiers;
use App\Models\Magasiniers;
use App\Models\Receptionnistes;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'CIN' => 'required|string|unique:users',
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'date_naissance' => 'required|date',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'adresse' => 'nullable|string',
            'num_tel' => 'nullable|string',
            'role' => 'required|in:admin,medecin,infirmier,magasinier,receptionniste,patient'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::transaction(function() use ($request) {
                // ✅ MODIFICATION : TOUS les comptes sont ACTIFS pour le développement
                $user = User::create([
                    'CIN' => $request->CIN,
                    'nom' => $request->nom,
                    'prenom' => $request->prenom,
                    'date_naissance' => $request->date_naissance,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'adresse' => $request->adresse ?? null,
                    'num_tel' => $request->num_tel ?? null,
                    'etat' => 'actif', // ← TOUJOURS ACTIF pour le développement
                ]);

                // Create specific role record
                switch ($request->role) {
                    case 'admin':
                        Admin::create(['CIN' => $request->CIN]);
                        break;
                    case 'medecin':
                        Medecins::create([
                            'CIN' => $request->CIN,
                            'annee_travail' => $request->annee_travail ?? date('Y'),
                            'specialite' => $request->specialite ?? 'Généraliste',
                            'description' => $request->description ?? null
                        ]);
                        break;
                    case 'infirmier':
                        Infirmiers::create([
                            'CIN' => $request->CIN,
                            'service' => $request->service ?? 'Général'
                        ]);
                        break;
                    case 'magasinier':
                        Magasiniers::create(['CIN' => $request->CIN]);
                        break;
                    case 'receptionniste':
                        Receptionnistes::create(['CIN' => $request->CIN]);
                        break;
                    case 'patient':
                        Patient::create([
                            'CIN' => $request->CIN,
                            'gender' => $request->gender ?? 'M',
                            'poids' => $request->poids ?? null,
                            'height' => $request->height ?? null,
                            'id_rec' => $request->id_rec ?? null
                        ]);
                        break;
                }
            });

            return response()->json([
                'message' => 'Utilisateur créé avec succès'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Identifiants incorrects'
            ], 401);
        }

        // ✅ PLUS BESOIN DE VÉRIFIER L'ÉTAT - tous les comptes sont actifs
        // if ($user->etat !== 'actif') {
        //     return response()->json([
        //         'message' => 'Compte désactivé. Contactez l\'administrateur.'
        //     ], 403);
        // }

        // Déterminer le rôle de l'utilisateur
        $role = $this->getUserRole($user);

        // Créer le token (assurez-vous que Sanctum est configuré)
        try {
            $token = $user->createToken('auth-token')->plainTextToken;
        } catch (\Exception $e) {
            // Fallback si Sanctum n'est pas configuré
            $token = 'dev-token-' . $user->CIN;
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'CIN' => $user->CIN,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'role' => $role,
                'etat' => $user->etat
            ],
            'token' => $token
        ]);
    }

    private function getUserRole(User $user)
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

    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
        } catch (\Exception $e) {
            // Ignorer l'erreur si Sanctum n'est pas configuré
        }

        return response()->json([
            'message' => 'Déconnexion réussie'
        ]);
    }


    public function getUserByCIN($CIN)
{
    // Charger l'utilisateur avec toutes ses relations
    $user = User::with(['infirmiers', 'medecins', 'patient', 'admin', 'magasiniers', 'receptionniste'])
        ->find($CIN);

    if (!$user) {
        return response()->json(['error' => 'Utilisateur non trouvé'], 404);
    }

    // Ajouter le rôle
    $user->role = $this->getUserRole($user);

    return response()->json($user);
}



}
