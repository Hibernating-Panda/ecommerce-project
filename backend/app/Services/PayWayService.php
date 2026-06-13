<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class PayWayService
{
    public function createPurchaseForm(Order $order): array
    {
        $order->loadMissing([
            'customer',
            'items.product',
        ]);

        $reqTime = now()->format('YmdHis');
        $tranId = $this->makeTransactionId($order);
        $amount = number_format((float) $order->total, 2, '.', '');

        $fields = [
            'req_time' => $reqTime,
            'merchant_id' => (string) config('payway.merchant_id'),
            'tran_id' => $tranId,

            'firstname' => $this->firstName($order->customer?->name),
            'lastname' => $this->lastName($order->customer?->name),
            'email' => $order->customer?->email ?? '',
            'phone' => $this->cleanPhone($order->customer?->phone),

            'type' => '',
            'payment_option' => '',
            'items' => '',
            'shipping' => '0.00',
            'amount' => $amount,
            'currency' => (string) config('payway.currency', 'USD'),

            'return_url' => (string) (config('payway.return_url') ?: ''),
            'cancel_url' => '',
            'continue_success_url' => '',
            'return_deeplink' => '',
            'custom_fields' => '',
            'return_params' => base64_encode(json_encode([
                'order_id' => $order->id,
            ])),
            'payout' => '',
            'additional_params' => '',
            'lifetime' => '',
            'google_pay_token' => '',
        ];

        $fields['hash'] = $this->hashPurchase($fields);

        Log::info('PayWay purchase form created', [
            'order_id' => $order->id,
            'tran_id' => $tranId,
            'amount' => $amount,
            'action_url' => $this->purchaseUrl(),
            'fields_without_hash' => collect($fields)->except('hash')->toArray(),
            'api_key_length' => strlen((string) config('payway.api_key')),
        ]);

        return [
            'tran_id' => $tranId,
            'action_url' => $this->purchaseUrl(),
            'fields' => $fields,
        ];
    }

    public function checkTransaction(string $transactionId): array
    {
        try {
            $reqTime = now()->format('YmdHis');

            $payload = [
                'req_time' => $reqTime,
                'merchant_id' => (string) config('payway.merchant_id'),
                'tran_id' => $transactionId,
            ];

            $payload['hash'] = $this->hashCheckTransaction($payload);

            $url = $this->baseUrl() . '/api/payment-gateway/v1/payments/check-transaction-2';

            $response = Http::timeout(25)
                ->acceptJson()
                ->asForm()
                ->post($url, $payload);

            $body = $response->body();
            $json = $response->json();

            Log::info('PayWay check transaction response', [
                'url' => $url,
                'status' => $response->status(),
                'body' => $body,
                'json' => $json,
                'tran_id' => $transactionId,
            ]);

            return [
                'ok' => $response->successful(),
                'payload' => $this->safePayload($payload),
                'response' => $json ?: [
                    'http_status' => $response->status(),
                    'raw_body' => $body,
                ],
            ];
        } catch (Throwable $e) {
            Log::error('PayWay check transaction exception', [
                'message' => $e->getMessage(),
            ]);

            return [
                'ok' => false,
                'payload' => [],
                'response' => [
                    'exception' => $e->getMessage(),
                ],
            ];
        }
    }

    private function baseUrl(): string
    {
        return rtrim((string) config('payway.base_url'), '/');
    }

    private function purchaseUrl(): string
    {
        return $this->baseUrl() . '/api/payment-gateway/v1/payments/purchase';
    }

    private function makeTransactionId(Order $order): string
    {
        $orderId = str_pad(substr((string) $order->id, -6), 6, '0', STR_PAD_LEFT);

        return 'O' . $orderId . now()->format('ymdHis');
    }

    private function firstName(?string $name): string
    {
        $name = trim($name ?: 'Customer');
        $parts = preg_split('/\s+/', $name);

        return $parts[0] ?? 'Customer';
    }

    private function lastName(?string $name): string
    {
        $name = trim($name ?: 'User');
        $parts = preg_split('/\s+/', $name);

        if (count($parts) <= 1) {
            return 'User';
        }

        array_shift($parts);

        return implode(' ', $parts);
    }

    private function cleanPhone(?string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone ?: '');

        return $phone ?: '010000000';
    }

    private function hashPurchase(array $fields): string
    {
        $raw = ($fields['req_time'] ?? '')
            . ($fields['merchant_id'] ?? '')
            . ($fields['tran_id'] ?? '')
            . ($fields['amount'] ?? '')
            . ($fields['items'] ?? '')
            . ($fields['shipping'] ?? '')
            . ($fields['firstname'] ?? '')
            . ($fields['lastname'] ?? '')
            . ($fields['email'] ?? '')
            . ($fields['phone'] ?? '')
            . ($fields['type'] ?? '')
            . ($fields['payment_option'] ?? '')
            . ($fields['return_url'] ?? '')
            . ($fields['cancel_url'] ?? '')
            . ($fields['continue_success_url'] ?? '')
            . ($fields['return_deeplink'] ?? '')
            . ($fields['currency'] ?? '')
            . ($fields['custom_fields'] ?? '')
            . ($fields['return_params'] ?? '')
            . ($fields['payout'] ?? '')
            . ($fields['lifetime'] ?? '')
            . ($fields['additional_params'] ?? '')
            . ($fields['google_pay_token'] ?? '');

        Log::info('PayWay purchase hash debug', [
            'raw' => $raw,
            'raw_length' => strlen($raw),
            'api_key_length' => strlen((string) config('payway.api_key')),
        ]);

        return base64_encode(
            hash_hmac('sha512', $raw, (string) config('payway.api_key'), true)
        );
    }

    private function hashCheckTransaction(array $payload): string
    {
        $hashFields = [
            'req_time',
            'merchant_id',
            'tran_id',
        ];
 
        $raw = '';

        foreach ($hashFields as $field) {
            $raw .= array_key_exists($field, $payload)
                ? (string) $payload[$field]
                : '';
        }

        return base64_encode(
            hash_hmac('sha512', $raw, (string) config('payway.api_key'), true)
        );
    }

    private function safePayload(array $payload): array
    {
        unset($payload['hash']);

        return $payload;
    }

    public function createPurchase(Order $order): array
    {
        try {
            $checkout = $this->createPurchaseForm($order);

            $response = Http::timeout(25)
                ->asForm()
                ->post($checkout['action_url'], $checkout['fields']);

            $body = $response->body();
            $json = $response->json();

            Log::info('PayWay purchase response', [
                'status' => $response->status(),
                'body' => $body,
                'json' => $json,
                'tran_id' => $checkout['tran_id'],
            ]);

            return [
                'ok' => $response->successful()
                    && data_get($json, 'status.code') === '00',
                'tran_id' => $checkout['tran_id'],
                'fields' => $checkout['fields'],
                'response' => $json ?: [
                    'http_status' => $response->status(),
                    'raw_body' => $body,
                ],
            ];
        } catch (Throwable $e) {
            Log::error('PayWay purchase exception', [
                'message' => $e->getMessage(),
            ]);

            return [
                'ok' => false,
                'tran_id' => null,
                'fields' => [],
                'response' => [
                    'exception' => $e->getMessage(),
                ],
            ];
        }
    }
}