<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json(
            $this->formatUser($request->user())
        );
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
            'profile_image' => ['nullable', 'string', 'max:1000'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'profile_image' => $validated['profile_image'] ?? null,
            ...($request->filled('password') ? ['password' => Hash::make($validated['password'])] : []),
        ]);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $this->formatUser($user->fresh()),
        ]);
    }

    private function formatUser($user): array
    {
        $user->loadMissing('roles');

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'profile_image' => $user->profile_image,
            'role' => $user->roles->first()?->name ?? 'admin',
            'account_status' => $user->account_status,
            'created_at' => $user->created_at,
        ];
    }
}