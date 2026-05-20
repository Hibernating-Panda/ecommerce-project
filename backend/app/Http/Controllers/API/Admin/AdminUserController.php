<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::with('roles')
            ->whereDoesntHave('roles', fn ($query) => $query->where('name', 'admin'))
            ->when($request->role, function ($query) use ($request) {
                $query->whereHas('roles', fn ($roleQuery) => $roleQuery->where('name', $request->role));
            })
            ->when($request->account_status, fn ($query) => $query->where('account_status', $request->account_status))
            ->when($request->search, function ($query) use ($request) {
                $query->where('name', 'LIKE', "%{$request->search}%")
                    ->orWhere('email', 'LIKE', "%{$request->search}%")
                    ->orWhere('phone', 'LIKE', "%{$request->search}%");
            })
            ->latest()
            ->paginate($request->integer('per_page', 15));

        $users->getCollection()->transform(fn ($user) => $this->formatUser($user));

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'in:shop_owner,user,delivery_man'],
            'account_status' => ['required', 'in:active,pending,rejected'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'account_status' => $validated['account_status'],
        ]);

        $user->syncRoles([$validated['role']]);

        return response()->json([
            'message' => 'User created successfully.',
            'user' => $this->formatUser($user->load('roles')),
        ], 201);
    }

    public function show(User $user)
    {
        if ($user->hasRole('admin')) {
            return response()->json([
                'message' => 'Admin users cannot be viewed here.',
            ], 403);
        }

        return response()->json(
            $this->formatUser($user->load('roles'))
        );
    }

    public function update(Request $request, User $user)
    {
        if ($user->hasRole('admin')) {
            return response()->json([
                'message' => 'Admin users cannot be edited.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,' . $user->id],
            'role' => ['required', 'in:shop_owner,user,delivery_man'],
            'account_status' => ['required', 'in:active,pending,rejected'],
            'password' => ['nullable', 'string', 'min:6'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'account_status' => $validated['account_status'],
            ...($request->filled('password') ? ['password' => Hash::make($validated['password'])] : []),
        ]);

        $user->syncRoles([$validated['role']]);

        if ($validated['account_status'] !== 'active') {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $this->formatUser($user->fresh()->load('roles')),
        ]);
    }

    public function approve(User $user)
    {
        if ($user->hasRole('admin')) {
            return response()->json([
                'message' => 'Admin users cannot be changed here.',
            ], 403);
        }

        $user->update([
            'account_status' => 'active',
        ]);

        return response()->json([
            'message' => 'User approved successfully.',
            'user' => $this->formatUser($user->fresh()->load('roles')),
        ]);
    }

    public function reject(User $user)
    {
        if ($user->hasRole('admin')) {
            return response()->json([
                'message' => 'Admin users cannot be changed here.',
            ], 403);
        }

        $user->update([
            'account_status' => 'rejected',
        ]);

        $user->tokens()->delete();

        return response()->json([
            'message' => 'User rejected successfully.',
            'user' => $this->formatUser($user->fresh()->load('roles')),
        ]);
    }

    public function destroy(User $user)
    {
        if ($user->hasRole('admin')) {
            return response()->json([
                'message' => 'Admin users cannot be deleted.',
            ], 403);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
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
            'account_status' => $user->account_status,
            'created_at' => $user->created_at,
        ];
    }
}