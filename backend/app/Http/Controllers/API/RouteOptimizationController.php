<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class RouteOptimizationController extends Controller
{
    public function optimize(Request $request)
    {
        $validated = $request->validate([
            'driver_id' => 'required|exists:users,id',
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'exists:orders,id',
            'start_location' => 'required|array',
            'start_location.lat' => 'required|numeric',
            'start_location.lng' => 'required|numeric',
        ]);

        $orders = Order::with('delivery')
            ->whereIn('id', $validated['order_ids'])
            ->get();

        $optimized = config('services.google.maps_key') && config('services.google.project_id')
            ? $this->googleOptimize($validated['start_location'], $orders)
            : $this->nearestNeighborOptimize($validated['start_location'], $orders);

        Cache::put(
            "optimized_route_{$validated['driver_id']}",
            $optimized,
            now()->addHours(4)
        );

        return response()->json([
            'driver_id' => $validated['driver_id'],
            'optimized_route' => $optimized,
            'total_stops' => count($optimized['waypoints']),
            'estimated_distance' => $optimized['total_distance_km'] . ' km',
            'estimated_duration' => $optimized['total_duration_min'] . ' min',
        ]);
    }

    public function getOptimizedRoute(int $id)
    {
        $route = Cache::get("optimized_route_{$id}");

        if (! $route) {
            return response()->json([
                'message' => 'No optimized route found.',
            ], 404);
        }

        return response()->json($route);
    }

    private function googleOptimize(array $start, $orders): array
    {
        $shipments = $orders->map(function ($order) {
            $location = $this->getDeliveryLocation($order);

            return [
                'deliveries' => [[
                    'arrivalLocation' => [
                        'latitude' => $location['lat'],
                        'longitude' => $location['lng'],
                    ],
                    'label' => "Order #{$order->id}",
                ]],
                'label' => "order_{$order->id}",
            ];
        })->values()->toArray();

        $payload = [
            'model' => [
                'shipments' => $shipments,
                'vehicles' => [[
                    'startLocation' => [
                        'latitude' => $start['lat'],
                        'longitude' => $start['lng'],
                    ],
                    'endLocation' => [
                        'latitude' => $start['lat'],
                        'longitude' => $start['lng'],
                    ],
                    'label' => 'delivery_driver',
                ]],
            ],
        ];

        $response = Http::withHeaders([
            'X-Goog-Api-Key' => config('services.google.maps_key'),
        ])->post(
            'https://routeoptimization.googleapis.com/v1/projects/' .
            config('services.google.project_id') .
            ':optimizeTours',
            $payload
        );

        if (! $response->successful()) {
            return $this->nearestNeighborOptimize($start, $orders);
        }

        $data = $response->json();
        $route = $data['routes'][0] ?? [];
        $visits = $route['visits'] ?? [];

        $waypoints = collect($visits)->map(function ($visit) {
            return [
                'order_id' => (int) str_replace('order_', '', $visit['shipmentLabel'] ?? ''),
                'arrival' => $visit['startTime'] ?? null,
            ];
        })->toArray();

        return [
            'waypoints' => $waypoints,
            'total_distance_km' => round(($route['metrics']['travelDistanceMeters'] ?? 0) / 1000, 2),
            'total_duration_min' => round(($route['metrics']['travelDuration'] ?? 0) / 60),
            'source' => 'google_optimization',
        ];
    }

    private function nearestNeighborOptimize(array $start, $orders): array
    {
        $remaining = $orders->values();
        $route = [];
        $currentLat = (float) $start['lat'];
        $currentLng = (float) $start['lng'];
        $totalDistance = 0;

        while ($remaining->isNotEmpty()) {
            $nearestIndex = null;
            $nearestOrder = null;
            $nearestDistance = PHP_FLOAT_MAX;

            foreach ($remaining as $index => $order) {
                $location = $this->getDeliveryLocation($order);

                $distance = $this->haversine(
                    $currentLat,
                    $currentLng,
                    $location['lat'],
                    $location['lng']
                );

                if ($distance < $nearestDistance) {
                    $nearestDistance = $distance;
                    $nearestOrder = $order;
                    $nearestIndex = $index;
                }
            }

            $location = $this->getDeliveryLocation($nearestOrder);

            $route[] = [
                'order_id' => $nearestOrder->id,
                'distance_km' => round($nearestDistance, 2),
                'lat' => $location['lat'],
                'lng' => $location['lng'],
            ];

            $totalDistance += $nearestDistance;
            $currentLat = $location['lat'];
            $currentLng = $location['lng'];

            $remaining->forget($nearestIndex);
            $remaining = $remaining->values();
        }

        return [
            'waypoints' => $route,
            'total_distance_km' => round($totalDistance, 2),
            'total_duration_min' => round($totalDistance * 3),
            'source' => 'nearest_neighbor',
        ];
    }

    private function getDeliveryLocation(Order $order): array
    {
        return [
            'lat' => (float) ($order->delivery?->delivery_lat ?? 11.5626),
            'lng' => (float) ($order->delivery?->delivery_lng ?? 104.9282),
        ];
    }

    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371;

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1))
            * cos(deg2rad($lat2))
            * sin($dLng / 2) ** 2;

        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}