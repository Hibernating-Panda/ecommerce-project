<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;
use Barryvdh\DomPDF\Facade\Pdf;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $logs = Activity::with('causer')
            ->when($request->user_id,   fn($q) => $q->where('causer_id', $request->user_id))
            ->when($request->log_name,  fn($q) => $q->where('log_name', $request->log_name))
            ->when($request->date_from, fn($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to,   fn($q) => $q->whereDate('created_at', '<=', $request->date_to))
            ->when($request->search,    fn($q) => $q->where('description', 'LIKE', "%{$request->search}%"))
            ->latest()
            ->paginate($request->per_page ?? 50);

        return response()->json($logs);
    }

    public function export(Request $request)
    {
        $logs = Activity::with('causer')
            ->when($request->date_from, fn($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to,   fn($q) => $q->whereDate('created_at', '<=', $request->date_to))
            ->latest()
            ->get();

        $pdf = Pdf::loadView('pdf.activity-logs', compact('logs'))
            ->setPaper('a4', 'landscape');

        return $pdf->download('activity-logs-' . now()->format('Y-m-d') . '.pdf');
    }

    public function clear()
    {
        $this->authorize('admin');

        Activity::where('created_at', '<', now()->subDays(30))->delete();

        return response()->json(['message' => 'Old logs cleared (older than 30 days)']);
    }
}
