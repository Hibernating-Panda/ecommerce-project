<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
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
            'merchant_id' => config('payway.merchant_id'),
            'tran_id' => $tranId,

            'firstname' => $this->firstName($order->customer?->name),
            'lastname' => $this->lastName($order->customer?->name),
            'email' => $order->customer?->email ?? '',
            'phone' => $this->cleanPhone($order->customer?->phone),

            'type' => '',
            'payment_option' => '',
            'items' => '',
            'shipping' => '',
            'amount' => $amount,
            'currency' => config('payway.currency', 'USD'),

            'return_url' => config('payway.return_url') ?: '',
            'cancel_url' => '',
            'skip_success_page' => '',
            'continue_success_url' => '',
            'return_deeplink' => '',
            'custom_fields' => '',
            'return_params' => base64_encode(json_encode([
                'order_id' => $order->id,
            ])),
            'view_type' => '',
            'payment_gate' => '',
            'payout' => '',
            'additional_params' => '',
            'lifetime' => '',
            'google_pay_token' => '',
        ];

        $fields['hash'] = $this->hashPurchase($fields);

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
                'merchant_id' => config('payway.merchant_id'),
                'tran_id' => $transactionId,
            ];

            $payload['hash'] = $this->hashCheckTransaction($payload);

            $url = $this->baseUrl() . '/api/payment-gateway/v1/payments/check-transaction-2';

            $response = Http::timeout(25)
                ->acceptJson()
                ->asJson()
                ->post($url, $payload);

            return [
                'ok' => $response->successful(),
                'payload' => $this->safePayload($payload),
                'response' => $response->json() ?: [
                    'http_status' => $response->status(),
                    'raw_body' => $response->body(),
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
        $parts = preg_split('/\s+/', trim($name ?: 'Customer'));

        return $parts[0] ?? 'Customer';
    }

    private function lastName(?string $name): string
    {
        $parts = preg_split('/\s+/', trim($name ?: 'User'));

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
        $raw = $fields['req_time']
            . $fields['merchant_id']
            . $fields['tran_id']
            . $fields['firstname']
            . $fields['lastname']
            . $fields['email']
            . $fields['phone']
            . $fields['type']
            . $fields['payment_option']
            . $fields['items']
            . $fields['shipping']
            . $fields['amount']
            . $fields['currency']
            . $fields['return_url']
            . $fields['cancel_url']
            . $fields['skip_success_page']
            . $fields['continue_success_url']
            . $fields['return_deeplink']
            . $fields['custom_fields']
            . $fields['return_params']
            . $fields['view_type']
            . $fields['payment_gate']
            . $fields['payout']
            . $fields['additional_params']
            . $fields['lifetime']
            . $fields['google_pay_token'];

        return base64_encode(
            hash_hmac('sha512', $raw, (string) config('payway.api_key'), true)
        );
    }

    private function hashCheckTransaction(array $payload): string
    {
        $raw = $payload['req_time']
            . $payload['merchant_id']
            . $payload['tran_id'];

        return base64_encode(
            hash_hmac('sha512', $raw, (string) config('payway.api_key'), true)
        );
    }

    private function safePayload(array $payload): array
    {
        unset($payload['hash']);

        return $payload;
    }
}