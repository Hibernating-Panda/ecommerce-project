<?php

return [
    'default' => env('BROADCAST_DRIVER', 'null'),

    'connections' => [
        'pusher' => [
            'driver' => 'pusher',
            'key'    => env('PUSHER_APP_KEY'),
            'secret' => env('PUSHER_APP_SECRET'),
            'app_id' => env('PUSHER_APP_ID'),
            'options' => [
                'cluster' => env('PUSHER_APP_CLUSTER', 'ap1'),
                'useTLS'  => true,
            ],
            'client_options' => [],
        ],

        'reverb' => [
            'driver'   => 'reverb',
            'key'      => env('REVERB_APP_KEY'),
            'secret'   => env('REVERB_APP_SECRET'),
            'app_id'   => env('REVERB_APP_ID'),
            'options'  => [
                'host'   => env('REVERB_HOST', '0.0.0.0'),
                'port'   => env('REVERB_PORT', 8080),
                'scheme' => env('REVERB_SCHEME', 'http'),
            ],
        ],

        'log'  => ['driver' => 'log'],
        'null' => ['driver' => 'null'],
    ],
];
