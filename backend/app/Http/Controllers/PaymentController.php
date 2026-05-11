<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Delivery\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Webhook;

class PaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function index(Request $request)
    {
        $payments = Payment::with('order.customer')
            ->when($request->status, fn($q) => $q->where('payment_status', $request->status))
            ->when($request->method, fn($q) => $q->where('payment_method', $request->method))
            ->latest()
            ->paginate(20);

        return response()->json($payments);
    }

    public function show(Payment $payment)
    {
        return response()->json($payment->load('order.customer'));
    }

    // ─── Stripe ──────────────────────────────────────────────

    public function createStripeIntent(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        $order = Order::findOrFail($request->order_id);

        $intent = PaymentIntent::create([
            'amount'   => (int) ($order->price * 100), // cents
            'currency' => 'usd',
            'metadata' => ['order_id' => $order->id],
        ]);

        $payment = Payment::updateOrCreate(
            ['order_id' => $order->id, 'payment_method' => 'stripe'],
            [
                'amount'         => $order->price,
                'payment_status' => 'pending',
                'stripe_intent'  => $intent->id,
            ]
        );

        activity('payment')->log("Stripe intent created for order #{$order->id}");

        return response()->json([
            'client_secret' => $intent->client_secret,
            'payment_id'    => $payment->id,
        ]);
    }

    public function confirmStripe(Request $request)
    {
        $request->validate(['payment_intent_id' => 'required|string']);

        $intent = PaymentIntent::retrieve($request->payment_intent_id);

        if ($intent->status === 'succeeded') {
            $payment = Payment::where('stripe_intent', $intent->id)->firstOrFail();
            $payment->update(['payment_status' => 'paid']);
            $payment->order->update(['status' => 'confirmed']);

            activity('payment')->log("Stripe payment confirmed: {$intent->id}");

            return response()->json(['message' => 'Payment confirmed', 'payment' => $payment]);
        }

        return response()->json(['message' => 'Payment not yet completed'], 400);
    }

    public function stripeWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sig     = $request->header('Stripe-Signature');

        try {
            $event = Webhook::constructEvent($payload, $sig, config('services.stripe.webhook_secret'));
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }

        if ($event->type === 'payment_intent.succeeded') {
            $intent  = $event->data->object;
            $payment = Payment::where('stripe_intent', $intent->id)->first();
            if ($payment) {
                $payment->update(['payment_status' => 'paid']);
                $payment->order()->update(['status' => 'confirmed']);
            }
        }

        return response()->json(['received' => true]);
    }

    // ─── Bakong KHQR ─────────────────────────────────────────

    public function generateKHQR(Request $request)
    {
        $request->validate([
            'order_id'   => 'required|exists:orders,id',
            'currency'   => 'required|in:USD,KHR',
        ]);

        $order = Order::findOrFail($request->order_id);

        // Call Bakong API
        $response = Http::withToken(config('services.bakong.token'))
            ->post(config('services.bakong.url') . '/v1/generate_qr', [
                'merchantId'    => config('services.bakong.merchant_id'),
                'merchantName'  => config('services.bakong.merchant_name'),
                'currency'      => $request->currency,
                'amount'        => $order->price,
                'transactionId' => 'ORDER-' . $order->id . '-' . time(),
                'description'   => "Payment for Order #{$order->id}",
            ]);

        if ($response->failed()) {
            return response()->json(['message' => 'KHQR generation failed'], 500);
        }

        $data = $response->json();

        $payment = Payment::updateOrCreate(
            ['order_id' => $order->id, 'payment_method' => 'khqr'],
            [
                'amount'         => $order->price,
                'payment_status' => 'pending',
                'khqr_md5'       => $data['md5'] ?? null,
            ]
        );

        activity('payment')->log("KHQR generated for order #{$order->id}");

        return response()->json([
            'qr_string'  => $data['qrString']  ?? null,
            'qr_image'   => $data['qrImage']   ?? null,
            'md5'        => $data['md5']        ?? null,
            'payment_id' => $payment->id,
        ]);
    }

    public function verifyKHQR(Request $request)
    {
        $request->validate(['md5' => 'required|string']);

        $response = Http::withToken(config('services.bakong.token'))
            ->post(config('services.bakong.url') . '/v1/check_transaction_by_md5', [
                'md5' => $request->md5,
            ]);

        $data = $response->json();

        if (isset($data['responseCode']) && $data['responseCode'] === '00') {
            $payment = Payment::where('khqr_md5', $request->md5)->firstOrFail();
            $payment->update(['payment_status' => 'paid']);
            $payment->order->update(['status' => 'confirmed']);

            activity('payment')->log("KHQR payment verified: {$request->md5}");

            return response()->json(['message' => 'Payment verified', 'payment' => $payment]);
        }

        return response()->json(['message' => 'Payment pending or failed'], 400);
    }
}
