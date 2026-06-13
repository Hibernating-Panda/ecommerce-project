<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\PayWayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PayWayPaymentController extends Controller
{
    public function createCheckout(Request $request, Order $order, PayWayService $payWay)
    {
        if ($order->customer_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $order->loadMissing([
            'customer',
            'items.product',
            'payment',
        ]);

        if ($order->payment_method !== 'online') {
            return response()->json([
                'message' => 'This order is not set to online payment.',
            ], 422);
        }

        if (! $order->order_type) {
            return response()->json([
                'message' => 'Please checkout the order before payment.',
            ], 422);
        }

        if ((float) $order->total <= 0) {
            return response()->json([
                'message' => 'Invalid order total.',
            ], 422);
        }

        if ($order->payment && $order->payment->status === 'paid') {
            return response()->json([
                'message' => 'This order has already been paid.',
                'payment' => $order->payment,
            ]);
        }

        $checkout = $payWay->createPurchase($order);
        $paywayResponse = $checkout['response'];

        if (! $checkout['ok']) {
            return response()->json([
                'message' => 'Failed to create ABA PayWay QR.',
                'payway_response' => $paywayResponse,
            ], 422);
        }

        $payment = Payment::updateOrCreate(
            [
                'order_id' => $order->id,
            ],
            [
                'customer_id' => $order->customer_id,
                'amount' => $order->total,
                'currency' => config('payway.currency', 'USD'),
                'method' => 'online',
                'provider' => 'aba_payway',
                'status' => 'pending',
                'transaction_id' => $checkout['tran_id'],
                'merchant_reference' => $checkout['tran_id'],
                'qr_string' => $paywayResponse['qrString'] ?? null,
                'qr_image' => $paywayResponse['qrImage'] ?? null,
                'deeplink' => $paywayResponse['abapay_deeplink'] ?? null,
                'response' => $paywayResponse,
            ]
        );

        return response()->json([
            'message' => 'ABA PayWay QR created.',
            'payment' => $payment,
            'qr_string' => $paywayResponse['qrString'] ?? null,
            'qr_image' => $paywayResponse['qrImage'] ?? null,
            'deeplink' => $paywayResponse['abapay_deeplink'] ?? null,
            'app_store' => $paywayResponse['app_store'] ?? null,
            'play_store' => $paywayResponse['play_store'] ?? null,
            'payway_response' => $paywayResponse,
        ]);
    }

    public function check(Request $request, Order $order, PayWayService $payWay)
    {
        if ($order->customer_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $payment = $order->payment;

        if (! $payment || ! $payment->transaction_id) {
            return response()->json([
                'message' => 'No payment transaction found.',
            ], 404);
        }

        $result = $payWay->checkTransaction($payment->transaction_id);
        $response = $result['response'];
        $isPaid = $this->isApproved($response);

        DB::transaction(function () use ($payment, $order, $response, $isPaid) {
            $payment->update([
                'status' => $isPaid ? 'paid' : $payment->status,
                'response' => $response,
                'paid_at' => $isPaid ? now() : $payment->paid_at,
                'verified_at' => $isPaid ? now() : $payment->verified_at,
            ]);

            if ($isPaid) {
                $order->update([
                    'payment_method' => 'online',
                ]);
            }
        });

        return response()->json([
            'payment' => $payment->fresh(),
            'paid' => $isPaid,
            'payway_response' => $response,
        ]);
    }

    public function callback(Request $request)
    {
        $payload = $request->all();

        $transactionId =
            $payload['tran_id']
            ?? data_get($payload, 'status.tran_id')
            ?? data_get($payload, 'data.tran_id');

        if (! $transactionId) {
            return response()->json([
                'message' => 'Transaction id missing.',
            ], 422);
        }

        $payment = Payment::where('transaction_id', $transactionId)
            ->orWhere('merchant_reference', $transactionId)
            ->first();

        if (! $payment) {
            return response()->json([
                'message' => 'Payment not found.',
            ], 404);
        }

        $isPaid = $this->isApproved($payload);

        DB::transaction(function () use ($payment, $payload, $isPaid) {
            $payment->update([
                'status' => $isPaid ? 'paid' : 'failed',
                'response' => $payload,
                'paid_at' => $isPaid ? now() : $payment->paid_at,
                'verified_at' => $isPaid ? now() : $payment->verified_at,
            ]);

            if ($isPaid && $payment->order) {
                $payment->order->update([
                    'payment_method' => 'online',
                ]);
            }
        });

        return response()->json([
            'message' => 'Callback received.',
        ]);
    }

    public function simulateSuccess(Request $request, Order $order)
    {
        if ($order->customer_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        if ($order->payment_method !== 'online') {
            return response()->json([
                'message' => 'This order is not an online payment order.',
            ], 422);
        }

        $payment = $order->payment;

        if (! $payment) {
            return response()->json([
                'message' => 'Payment record not found.',
            ], 404);
        }

        if ($payment->status === 'paid') {
            return response()->json([
                'message' => 'Payment is already paid.',
                'payment' => $payment,
                'paid' => true,
            ]);
        }

        $simulatedTransactionId = $payment->transaction_id
            ?: 'SIM-' . $order->id . '-' . now()->format('YmdHis');

        DB::transaction(function () use ($payment, $simulatedTransactionId) {
            $payment->update([
                'status' => 'paid',
                'transaction_id' => $simulatedTransactionId,
                'merchant_reference' => $payment->merchant_reference ?: $simulatedTransactionId,
                'response' => [
                    'mode' => 'simulation',
                    'message' => 'Payment simulated successfully.',
                    'paid_at' => now()->toDateTimeString(),
                ],
                'paid_at' => now(),
                'verified_at' => now(),
            ]);
        });

        return response()->json([
            'message' => 'Simulated payment successful.',
            'payment' => $payment->fresh(),
            'paid' => true,
        ]);
    }

    public function simulateFailed(Request $request, Order $order)
    {
        if ($order->customer_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        if ($order->payment_method !== 'online') {
            return response()->json([
                'message' => 'This order is not an online payment order.',
            ], 422);
        }

        $payment = $order->payment;

        if (! $payment) {
            return response()->json([
                'message' => 'Payment record not found.',
            ], 404);
        }

        $payment->update([
            'status' => 'failed',
            'response' => [
                'mode' => 'simulation',
                'message' => 'Payment simulated as failed.',
                'failed_at' => now()->toDateTimeString(),
            ],
        ]);

        return response()->json([
            'message' => 'Simulated payment failed.',
            'payment' => $payment->fresh(),
            'paid' => false,
        ]);
    }

    private function isApproved($response): bool
    {
        $paymentStatus = strtoupper($this->safeText(data_get($response, 'data.payment_status')));
        $paymentStatusCode = $this->safeText(data_get($response, 'data.payment_status_code'));

        $transactionStatus = strtoupper($this->safeText(data_get($response, 'data.transaction_status')));
        $transactionStatusCode = $this->safeText(data_get($response, 'data.transaction_status_code'));

        $statusText = strtoupper($this->safeText(data_get($response, 'payment_status')));
        $statusCode = $this->safeText(data_get($response, 'payment_status_code'));

        $tranStatus = strtoupper($this->safeText(data_get($response, 'transaction_status')));
        $tranStatusCode = $this->safeText(data_get($response, 'transaction_status_code'));

        return $paymentStatus === 'APPROVED'
            || $paymentStatus === 'PAID'
            || $paymentStatus === 'SUCCESS'
            || $transactionStatus === 'APPROVED'
            || $transactionStatus === 'PAID'
            || $transactionStatus === 'SUCCESS'
            || $statusText === 'APPROVED'
            || $statusText === 'PAID'
            || $statusText === 'SUCCESS'
            || $tranStatus === 'APPROVED'
            || $tranStatus === 'PAID'
            || $tranStatus === 'SUCCESS'
            || $paymentStatusCode === '0'
            || $paymentStatusCode === '00'
            || $transactionStatusCode === '0'
            || $transactionStatusCode === '00'
            || $statusCode === '0'
            || $statusCode === '00'
            || $tranStatusCode === '0'
            || $tranStatusCode === '00';
    }

    private function safeText($value): string
    {
        if (is_array($value) || is_object($value)) {
            return json_encode($value);
        }

        return trim((string) $value);
    }
}