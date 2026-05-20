<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'in:user,shop_owner,delivery_man'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        $user = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
                'account_status' => $validated['role'] === 'user' ? 'active' : 'pending',
            ]);

            $user->syncRoles([$validated['role']]);

            return $user;
        });

        if ($user->account_status !== 'active') {
            return response()->json([
                'message' => 'Registration submitted successfully. Please wait for admin approval.',
                'user' => $this->formatUser($user),
                'requires_approval' => true,
            ], 201);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registered successfully.',
            'token' => $token,
            'user' => $this->formatUser($user),
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid email or password.',
            ], 401);
        }

        $user = $request->user();

        if ($user->account_status === 'pending') {
            return response()->json([
                'message' => 'Your account is pending admin approval.',
            ], 403);
        }

        if ($user->account_status === 'rejected') {
            return response()->json([
                'message' => 'Your account registration was rejected.',
            ], 403);
        }

        if ($user->account_status !== 'active') {
            return response()->json([
                'message' => 'Your account is not active.',
            ], 403);
        }

        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully.',
            'token' => $token,
            'user' => $this->formatUser($user),
        ]);
    }

    public function user(Request $request)
    {
        return response()->json(
            $this->formatUser($request->user())
        );
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    private function formatUser(User $user): array
    {
        $user->loadMissing('roles');

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'profile_image' => $user->profile_image,
            'role' => $user->roles->first()?->name ?? 'user',
            'role_name' => $user->roles->first()?->name ?? 'user',
            'account_status' => $user->account_status,
            'created_at' => $user->created_at,
        ];
    }
}