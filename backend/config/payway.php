<?php

return [
    'env' => env('PAYWAY_ENV', 'sandbox'),

    'base_url' => env('PAYWAY_BASE_URL', 'https://checkout-sandbox.payway.com.kh'),

    'merchant_id' => env('PAYWAY_MERCHANT_ID'),

    'api_key' => env('PAYWAY_API_KEY'),

    'currency' => env('PAYWAY_CURRENCY', 'USD'),

    'callback_url' => env('PAYWAY_CALLBACK_URL'),

    'return_url' => env('PAYWAY_RETURN_URL'),
];