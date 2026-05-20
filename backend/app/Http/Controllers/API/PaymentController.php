<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $payments = Payment::with('order.customer')
            ->when(! $request->user()->hasRole('admin'), function ($query) use ($request) {
                $query->whereHas('order', fn ($orderQuery) => $orderQuery->where('customer_id', $request->user()->id));
            })
            ->when($request->status, fn ($query) => $query->where('status', $request->status))
            ->when($request->filled('method'), fn ($query) => $query->where('method', $request->input('method')))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($payments);
    }

    public function show(Request $request, Payment $payment)
    {
        $payment->load('order.customer');

        if (! $this->canViewPayment($request, $payment)) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        return response()->json($payment);
    }

    public function createStripeIntent(Request $request)
    {
        return response()->json([
            'message' => 'Stripe payment is disabled. ABA payment will be added later.',
        ], 501);
    }

    public function confirmStripe(Request $request)
    {
        return response()->json([
            'message' => 'Stripe payment is disabled. ABA payment will be added later.',
        ], 501);
    }

    public function stripeWebhook(Request $request)
    {
        return response()->json([
            'received' => true,
            'message' => 'Stripe webhook is disabled.',
        ]);
    }

    public function generateKHQR(Request $request)
    {
        $validated = $request->validate([
            'order_id' => ['required', 'exists:orders,id'],
        ]);

        $order = Order::where('id', $validated['order_id'])
            ->where('customer_id', $request->user()->id)
            ->first();

        if (! $order) {
            return response()->json([
                'message' => 'Order not found.',
            ], 404);
        }

        $payment = Payment::updateOrCreate(
            ['order_id' => $order->id],
            [
                'amount' => $order->total,
                'method' => 'online',
                'status' => 'pending',
                'transaction_id' => null,
                'response' => [
                    'type' => 'manual_shop_qr',
                    'message' => 'Customer must scan the shop QR and complete payment manually.',
                ],
            ]
        );

        $order->load('items.shop');

        $shops = $order->items
            ->pluck('shop')
            ->filter()
            ->unique('id')
            ->values()
            ->map(function ($shop) {
                return [
                    'id' => $shop->id,
                    'shop_name' => $shop->shop_name,
                    'aba_qr_image' => $shop->aba_qr_image,
                    'aba_qr_url' => $shop->aba_qr_url,
                    'aba_account_name' => $shop->aba_account_name,
                    'aba_account_number' => $shop->aba_account_number,
                ];
            });

        return response()->json([
            'message' => 'Payment QR information loaded.',
            'payment' => $payment,
            'shops' => $shops,
        ]);
    }

    public function verifyKHQR(Request $request)
    {
        $validated = $request->validate([
            'order_id' => ['required', 'exists:orders,id'],
            'transaction_id' => ['nullable', 'string', 'max:255'],
        ]);

        $order = Order::where('id', $validated['order_id'])
            ->where('customer_id', $request->user()->id)
            ->first();

        if (! $order && ! $request->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Order not found.',
            ], 404);
        }

        $payment = Payment::where('order_id', $validated['order_id'])->first();

        if (! $payment) {
            return response()->json([
                'message' => 'Payment record not found.',
            ], 404);
        }

        $payment->update([
            'transaction_id' => $validated['transaction_id'] ?? $payment->transaction_id,
            'response' => array_merge($payment->response ?? [], [
                'verification_note' => 'Manual payment verification placeholder.',
            ]),
        ]);

        return response()->json([
            'message' => 'Payment verification submitted. Admin confirmation may be required.',
            'payment' => $payment->fresh(),
        ]);
    }

    public function markCompleted(Request $request, Payment $payment)
    {
        if (! $request->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $payment->update([
            'status' => 'completed',
        ]);

        return response()->json([
            'message' => 'Payment marked as completed.',
            'payment' => $payment->fresh()->load('order.customer'),
        ]);
    }

    private function canViewPayment(Request $request, Payment $payment): bool
    {
        if ($request->user()->hasRole('admin')) {
            return true;
        }

        return $payment->order?->customer_id === $request->user()->id;
    }
}