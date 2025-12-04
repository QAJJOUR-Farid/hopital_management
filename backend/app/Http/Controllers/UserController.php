<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $users = User::all();
            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des utilisateurs'
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'CIN' => 'required|string|unique:users',
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'email' => 'required|email|unique:users',
            'role' => 'required|in:admin,medecin,infirmier,receptionniste,magasinier,patient',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::create([
                'CIN' => $request->CIN,
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'email' => $request->email,
                'role' => $request->role,
                'password' => Hash::make($request->password),
                'etat' => 'actif',
            ]);

            return response()->json($user, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création'
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $CIN)
    {
        Log::info('=== MODIFICATION UTILISATEUR ===');
        Log::info('CIN: ' . $CIN);
        Log::info('Données reçues:', $request->all());

        // Trouver l'utilisateur
        $user = User::where('CIN', $CIN)->first();

        if (!$user) {
            Log::error('Utilisateur non trouvé: ' . $CIN);
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        Log::info('Utilisateur trouvé:', $user->toArray());

        // Validation
        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'role' => 'sometimes|required|in:admin,medecin,infirmier,receptionniste,magasinier,patient',
            'password' => 'sometimes|min:6',
        ]);

        if ($validator->fails()) {
            Log::error('Erreurs validation:', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Mettre à jour les champs
            if ($request->has('nom')) {
                $user->nom = $request->nom;
            }
            if ($request->has('prenom')) {
                $user->prenom = $request->prenom;
            }
            if ($request->has('email')) {
                $user->email = $request->email;
            }
            if ($request->has('role')) {
                $user->role = $request->role;
                Log::info('Rôle modifié: ' . $request->role);
            }
            if ($request->has('password') && !empty($request->password)) {
                $user->password = Hash::make($request->password);
            }

            $user->save();

            Log::info('Utilisateur après modification:', $user->toArray());

            return response()->json([
                'message' => 'Utilisateur modifié avec succès',
                'user' => $user
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur modification: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la modification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($CIN)
    {
        try {
            $user = User::where('CIN', $CIN)->first();

            if (!$user) {
                return response()->json(['message' => 'Utilisateur non trouvé'], 404);
            }

            $user->delete();

            return response()->json(['message' => 'Utilisateur supprimé avec succès']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression'
            ], 500);
        }
    }

    /**
     * Activer/désactiver un utilisateur
     */
    public function toggleState($CIN)
    {
        try {
            $user = User::where('CIN', $CIN)->first();

            if (!$user) {
                return response()->json(['message' => 'Utilisateur non trouvé'], 404);
            }

            $user->etat = $user->etat === 'actif' ? 'inactif' : 'actif';
            $user->save();

            return response()->json([
                'message' => 'État utilisateur modifié avec succès',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la modification de l\'état'
            ], 500);
        }
    }
}
