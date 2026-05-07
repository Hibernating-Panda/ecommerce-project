<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminProfileController extends Controller
{
    private function formatUser($user)
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'profile_image' => $user->profile_image,
            'role' => $user->getRoleNames()->first(),
            'account_status' => $user->account_status,
            'created_at' => $user->created_at,
        ];
    }

    public function show(Request $request)
    {
        return response()->json($this->formatUser($request->user()));
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:1000',
            'profile_image' => 'nullable|string|max:1000',
            'password' => 'nullable|min:6',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->phone = $request->phone;
        $user->address = $request->address;
        $user->profile_image = $request->profile_image;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $this->formatUser($user),
        ]);
    }
}