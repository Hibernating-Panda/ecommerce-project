<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    private function formatUserWithRole($user)
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->getRoleNames()->first(),
            'account_status' => $user->account_status,
            'created_at' => $user->created_at,
        ];
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => 'required|in:user,shop_owner,delivery_man',
        ]);

        $accountStatus = $request->role === 'user' ? 'active' : 'pending';

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'account_status' => $accountStatus,
        ]);

        $user->assignRole($request->role);

        // Normal customers can login immediately
        if ($user->account_status === 'active') {
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Registered successfully',
                'token' => $token,
                'user' => $this->formatUserWithRole($user),
            ], 201);
        }

        // Shop owner / delivery man must wait for approval
        return response()->json([
            'message' => 'Registration submitted successfully. Please wait for admin approval.',
            'user' => $this->formatUserWithRole($user),
            'requires_approval' => true,
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid email or password',
            ], 401);
        }

        $user = Auth::user();

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

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully',
            'token' => $token,
            'user' => $this->formatUserWithRole($user),
        ]);
    }

    public function user(Request $request)
    {
        return response()->json(
            $this->formatUserWithRole($request->user())
        );
    }

    public function logout(Request $request)
    {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }
}