<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        $request->user()->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $request->user()->fresh(),
        ]);
    }
}