<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\Infirmiers;
use App\Models\Magasiniers;
use App\Models\Medecins;
use App\Models\Patient;
use App\Models\Receptionnistes;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Handles user registration across all supported roles.
     */
    public function register(Request $request)
    {
        $baseRules = [
            'role' => 'required|in:admin,patient,medecin,receptionniste,infirmier,magasinier',
            'CIN' => 'required|string|max:20|unique:users,CIN',
            'nom' => 'required|string|max:50',
            'prenom' => 'required|string|max:50',
            'date_naissance' => 'required|date',
            'etat' => 'nullable|in:actif,inactif',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'adresse' => 'nullable|string',
            'num_tel' => 'nullable|string|max:20',
        ];

        $roleSpecificRules = match ($request->input('role')) {
            'patient' => [
                'gender' => 'required|in:M,F',
                'poids' => 'nullable|numeric',
                'height' => 'nullable|numeric',
                'id_rec' => 'nullable|exists:receptionnistes,id_rec',
            ],
            'medecin' => [
                'annee_travail' => 'required|integer|min:1950|max:' . now()->year,
                'specialite' => 'required|string|max:100',
                'description' => 'nullable|string',
            ],
            'infirmier' => [
                'service' => 'required|string|max:100',
                'id_medecin' => 'nullable|exists:medecins,id_medecin',
            ],
            default => [],
        };

        $data = $request->validate(array_merge($baseRules, $roleSpecificRules));

        $user = DB::transaction(function () use ($data) {
            // Create the core user record first.
            $user = User::create([
                'CIN' => $data['CIN'],
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'date_naissance' => $data['date_naissance'],
                'etat' => $data['etat'] ?? 'inactif',
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'adresse' => $data['adresse'] ?? null,
                'num_tel' => $data['num_tel'] ?? null,
            ]);

            // Attach a role-specific record using the same CIN.
            $this->createRoleRecord($data['role'], $user, $data);

            return $user->fresh();
        });

        return response()->json([
            'message' => 'Registration completed successfully.',
            'role' => $data['role'],
            'user' => $user,
        ], 201);
    }

    /**
     * Handles user authentication and resolves their role.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials supplied.',
            ], 401);
        }

        $role = $this->resolveRole($user);

        // Extra payload depending on role (e.g. patient numeric id for rendez-vous, diagnostics).
        $extra = [];
        if ($role === 'patient' && $user->patient) {
            $extra['patient_id'] = $user->patient->id_patient;
        }
        if ($role === 'magasinier' && $user->magasiniers) {
            $extra['magasinier_id'] = $user->magasiniers->id_magasinier;
        }

        return response()->json(array_merge([
            'message' => 'Login successful.',
            'role' => $role,
            'user' => $user,
        ], $extra));
    }

    /**
     * Creates the role-specific row after a user record exists.
     */
    protected function createRoleRecord(string $role, User $user, array $data): void
    {
        switch ($role) {
            case 'admin':
                Admin::create(['CIN' => $user->CIN]);
                break;

            case 'patient':
                Patient::create([
                    'CIN' => $user->CIN,
                    'gender' => $data['gender'],
                    'poids' => $data['poids'] ?? null,
                    'height' => $data['height'] ?? null,
                    'id_rec' => $data['id_rec'] ?? null,
                ]);
                break;

            case 'medecin':
                Medecins::create([
                    'CIN' => $user->CIN,
                    'annee_travail' => $data['annee_travail'],
                    'description' => $data['description'] ?? null,
                    'specialite' => $data['specialite'],
                ]);
                break;

            case 'receptionniste':
                Receptionnistes::create(['CIN' => $user->CIN]);
                break;

            case 'magasinier':
                Magasiniers::create(['CIN' => $user->CIN]);
                break;

            case 'infirmier':
                Infirmiers::create([
                    'CIN' => $user->CIN,
                    'service' => $data['service'],
                    'id_medecin' => $data['id_medecin'] ?? null,
                ]);
                break;
        }
    }

    /**
     * Infers a user's role by checking linked role tables.
     */
    protected function resolveRole(User $user): string
    {
        if ($user->admin()->exists()) {
            return 'admin';
        }

        if ($user->medecins()->exists()) {
            return 'medecin';
        }

        if ($user->infirmiers()->exists()) {
            return 'infirmier';
        }

        if ($user->receptionniste()->exists()) {
            return 'receptionniste';
        }

        if ($user->magasiniers()->exists()) {
            return 'magasinier';
        }

        if ($user->patient()->exists()) {
            return 'patient';
        }

        return 'unknown';
    }
}

