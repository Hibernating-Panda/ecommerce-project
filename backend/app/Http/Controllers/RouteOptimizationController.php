<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class RouteOptimizationController extends Controller
{
    /**
     * Optimize delivery route using Google Routes API (Optimization).
     * Falls back to nearest-neighbor algorithm if API unavailable.
     */
    public function optimize(Request $request)
    {
        $request->validate([
            'delivery_man_id' => 'required|exists:users,id',
            'order_ids'       => 'required|array|min:1',
            'order_ids.*'     => 'exists:orders,id',
            'start_location'  => 'required|array',
            'start_location.lat' => 'required|numeric',
            'start_location.lng' => 'required|numeric',
        ]);

        $orders = Order::whereIn('id', $request->order_ids)->get();

        // Try Google Route Optimization API
        if (config('services.google.maps_key')) {
            $optimized = $this->googleOptimize($request->start_location, $orders);
        } else {
            // Nearest-neighbor fallback
            $optimized = $this->nearestNeighborOptimize($request->start_location, $orders);
        }

        // Cache the route for this delivery man
        Cache::put(
            "optimized_route_{$request->delivery_man_id}",
            $optimized,
            now()->addHours(4)
        );

        activity('routing')->log("Route optimized for delivery man #{$request->delivery_man_id} with " . count($request->order_ids) . " stops");

        return response()->json([
            'delivery_man_id'   => $request->delivery_man_id,
            'optimized_route'   => $optimized,
            'total_stops'       => count($optimized['waypoints']),
            'estimated_distance' => $optimized['total_distance_km'] . ' km',
            'estimated_duration' => $optimized['total_duration_min'] . ' min',
        ]);
    }

    public function getOptimizedRoute(int $id)
    {
        $route = Cache::get("optimized_route_{$id}");

        if (! $route) {
            return response()->json(['message' => 'No optimized route found. Please re-optimize.'], 404);
        }

        return response()->json($route);
    }

    private function googleOptimize(array $start, $orders): array
    {
        $shipments = $orders->map(fn($order, $i) => [
            'deliveries' => [[
                'arrivalLocation' => [
                    'latitude'  => (float) explode(',', $order->delivery_address)[0] ?? 11.5626,
                    'longitude' => (float) explode(',', $order->delivery_address)[1] ?? 104.9282,
                ],
                'label' => "Order #{$order->id}",
            ]],
            'label' => "order_{$order->id}",
        ])->values()->toArray();

        $payload = [
            'model' => [
                'shipments' => $shipments,
                'vehicles'  => [[
                    'startLocation' => ['latitude' => $start['lat'], 'longitude' => $start['lng']],
                    'endLocation'   => ['latitude' => $start['lat'], 'longitude' => $start['lng']],
                    'label'         => 'delivery_van',
                ]],
            ],
        ];

        $response = Http::withHeaders(['X-Goog-Api-Key' => config('services.google.maps_key')])
            ->post('https://routeoptimization.googleapis.com/v1/projects/' . config('services.google.project_id') . ':optimizeTours', $payload);

        if ($response->successful()) {
            $data   = $response->json();
            $visits = $data['routes'][0]['visits'] ?? [];

            $waypoints = collect($visits)->map(fn($v) => [
                'order_id' => (int) str_replace('order_', '', $v['shipmentLabel'] ?? ''),
                'arrival'  => $v['startTime'] ?? null,
            ])->toArray();

            return [
                'waypoints'          => $waypoints,
                'total_distance_km'  => round(($data['metrics']['totalDistance'] ?? 0) / 1000, 2),
                'total_duration_min' => round(($data['metrics']['totalDuration'] ?? 0) / 60),
                'source'             => 'google_optimization',
            ];
        }

        return $this->nearestNeighborOptimize($start, $orders);
    }

    private function nearestNeighborOptimize(array $start, $orders): array
    {
        $remaining  = $orders->toArray();
        $route      = [];
        $currentLat = $start['lat'];
        $currentLng = $start['lng'];
        $totalDist  = 0;

        while (! empty($remaining)) {
            $nearest     = null;
            $nearestDist = PHP_INT_MAX;
            $nearestIdx  = 0;

            foreach ($remaining as $i => $order) {
                $lat  = $order['delivery_lat'] ?? 11.5626;
                $lng  = $order['delivery_lng'] ?? 104.9282;
                $dist = $this->haversine($currentLat, $currentLng, $lat, $lng);

                if ($dist < $nearestDist) {
                    $nearestDist = $dist;
                    $nearest     = $order;
                    $nearestIdx  = $i;
                }
            }

            $route[]    = ['order_id' => $nearest['id'], 'distance_km' => round($nearestDist, 2)];
            $totalDist += $nearestDist;
            $currentLat = $nearest['delivery_lat'] ?? 11.5626;
            $currentLng = $nearest['delivery_lng'] ?? 104.9282;

            array_splice($remaining, $nearestIdx, 1);
        }

        return [
            'waypoints'          => $route,
            'total_distance_km'  => round($totalDist, 2),
            'total_duration_min' => round($totalDist * 3), // ~3 min/km estimate
            'source'             => 'nearest_neighbor',
        ];
    }

    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $R    = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a    = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
