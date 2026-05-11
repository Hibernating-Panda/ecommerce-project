<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::with('roles')
            ->when($request->search, function ($q) use ($request) {
                $q->where('name', 'LIKE', "%{$request->search}%")
                  ->orWhere('email', 'LIKE', "%{$request->search}%")
                  ->orWhere('phone', 'LIKE', "%{$request->search}%");
            })
            ->when($request->role, function ($q) use ($request) {
                $q->whereHas('roles', fn($r) => $r->where('name', $request->role));
            })
            ->when($request->active !== null, fn($q) => $q->where('is_active', $request->active))
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:8',
            'phone'    => 'nullable|string',
            'role'     => 'required|in:admin,delivery_man,customer',
            'address'  => 'nullable|string',
        ]);

        $user = User::create([
            ...$validated,
            'password' => Hash::make($validated['password']),
        ]);
        $user->assignRole($validated['role']);

        activity('users')->causedBy($request->user())->log("User '{$user->name}' created");

        return response()->json($user->load('roles'), 201);
    }

    public function show(User $user)
    {
        return response()->json($user->load('roles', 'permissions', 'orders', 'deliveries'));
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'    => 'sometimes|string|max:255',
            'email'   => 'sometimes|email|unique:users,email,' . $user->id,
            'password'=> 'nullable|min:8',
            'phone'   => 'nullable|string',
            'role'    => 'sometimes|in:admin,delivery_man,customer',
            'address' => 'nullable|string',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        if (!empty($validated['role'])) {
            $user->syncRoles([$validated['role']]);
        }

        $user->update($validated);

        activity('users')->causedBy($request->user())->log("User '{$user->name}' updated");

        return response()->json($user->load('roles'));
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 403);
        }

        activity('users')->causedBy($request->user())->log("User '{$user->name}' deleted");
        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }
}
