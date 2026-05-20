<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    public function download(Order $order)
    {
        $this->authorize('view', $order);

        $order->load($this->relations());

        $pdf = Pdf::loadView('pdf.invoice', [
            'order' => $order,
            'payment' => $order->payment,
            'company' => $this->companyInfo(),
            'generated' => now()->format('d M Y H:i'),
        ])->setPaper('a4');

        return $pdf->download("invoice-order-{$order->id}.pdf");
    }

    public function preview(Order $order)
    {
        $this->authorize('view', $order);

        $order->load($this->relations());

        $pdf = Pdf::loadView('pdf.invoice', [
            'order' => $order,
            'payment' => $order->payment,
            'company' => $this->companyInfo(),
            'generated' => now()->format('d M Y H:i'),
        ])->setPaper('a4');

        return $pdf->stream("invoice-order-{$order->id}.pdf");
    }

    private function relations(): array
    {
        return [
            'customer',
            'payment',
            'items.product',
            'items.shop',
            'deliveries.driver',
            'deliveries.shop',
            'deliveries.orderItems.product',
        ];
    }

    private function companyInfo(): array
    {
        return [
            'name' => config('app.name'),
            'address' => config('company.address', 'Phnom Penh, Cambodia'),
            'phone' => config('company.phone', '+855 12 345 678'),
            'email' => config('company.email', 'support@iteshop.online'),
            'logo' => public_path('logo.png'),
        ];
    }
}