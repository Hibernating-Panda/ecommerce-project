<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function download(Order $order)
    {
        $this->authorize('view', $order);

        $order->load('customer', 'payment', 'delivery.deliveryMan');

        $pdf = Pdf::loadView('pdf.invoice', [
            'order'       => $order,
            'payment'     => $order->payment,
            'company'     => [
                'name'    => config('app.name'),
                'address' => config('company.address', '123 Main Street, Phnom Penh, Cambodia'),
                'phone'   => config('company.phone', '+855 12 345 678'),
                'email'   => config('company.email', 'support@delivery.com'),
                'logo'    => public_path('logo.png'),
            ],
            'generated'   => now()->format('d M Y H:i'),
        ])->setPaper('a4');

        activity('invoice')->causedBy(request()->user())
            ->log("Invoice downloaded for order #{$order->id}");

        return $pdf->download("invoice-order-{$order->id}.pdf");
    }

    public function preview(Order $order)
    {
        $this->authorize('view', $order);

        $order->load('customer', 'payment', 'delivery.deliveryMan');

        $pdf = Pdf::loadView('pdf.invoice', [
            'order'   => $order,
            'payment' => $order->payment,
            'company' => [
                'name'    => config('app.name'),
                'address' => config('company.address', '123 Main Street, Phnom Penh, Cambodia'),
                'phone'   => config('company.phone', '+855 12 345 678'),
                'email'   => config('company.email', 'support@delivery.com'),
                'logo'    => public_path('logo.png'),
            ],
            'generated' => now()->format('d M Y H:i'),
        ])->setPaper('a4');

        return $pdf->stream("invoice-order-{$order->id}.pdf");
    }
}
