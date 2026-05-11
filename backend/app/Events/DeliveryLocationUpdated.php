<?php

namespace App\Events;

use App\Models\Tracking;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeliveryLocationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Tracking $tracking) {}

    public function broadcastOn(): Channel
    {
        return new Channel('order.' . $this->tracking->order_id);
    }

    public function broadcastAs(): string
    {
        return 'delivery.location.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'order_id'        => $this->tracking->order_id,
            'delivery_man_id' => $this->tracking->delivery_man_id,
            'latitude'        => $this->tracking->latitude,
            'longitude'       => $this->tracking->longitude,
            'speed'           => $this->tracking->speed,
            'heading'         => $this->tracking->heading,
            'timestamp'       => $this->tracking->created_at->toISOString(),
        ];
    }
}
