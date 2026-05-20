<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionController extends Controller
{
    public function index()
    {
        return response()->json(
            Role::with('permissions')->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:roles,name']);

        $role = Role::create(['name' => $request->name, 'guard_name' => 'sanctum']);

        activity('roles')->log("Role '{$role->name}' created");

        return response()->json($role, 201);
    }

    public function show(Role $role)
    {
        return response()->json($role->load('permissions'));
    }

    public function update(Request $request, Role $role)
    {
        $request->validate(['name' => 'required|string|unique:roles,name,' . $role->id]);

        $role->update(['name' => $request->name]);

        return response()->json($role);
    }

    public function destroy(Role $role)
    {
        if (in_array($role->name, ['admin', 'customer', 'delivery_man'])) {
            return response()->json(['message' => 'Cannot delete default roles'], 403);
        }

        $role->delete();
        activity('roles')->log("Role '{$role->name}' deleted");

        return response()->json(['message' => 'Role deleted']);
    }

    public function syncPermissions(Request $request, Role $role)
    {
        $request->validate(['permissions' => 'required|array']);

        $role->syncPermissions($request->permissions);

        activity('roles')->log("Permissions synced for role '{$role->name}'");

        return response()->json($role->load('permissions'));
    }

    public function allPermissions()
    {
        return response()->json(Permission::all());
    }
}
