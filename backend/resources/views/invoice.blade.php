<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 13px; color: #1a1a2e; background: #fff; }
  .page { padding: 40px; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #0f4c81; }
  .company-name { font-size: 26px; font-weight: 700; color: #0f4c81; letter-spacing: -0.5px; }
  .company-info { font-size: 11px; color: #555; line-height: 1.6; margin-top: 4px; }
  .invoice-title { text-align: right; }
  .invoice-title h1 { font-size: 32px; font-weight: 800; color: #0f4c81; letter-spacing: 2px; }
  .invoice-title p { font-size: 12px; color: #777; margin-top: 4px; }

  /* Status Badge */
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
  .status-paid { background: #d4f5e4; color: #0a7a45; }
  .status-pending { background: #fff3cd; color: #856404; }
  .status-failed { background: #fde8e8; color: #c0392b; }

  /* Info Grid */
  .info-grid { display: table; width: 100%; margin-bottom: 32px; }
  .info-col { display: table-cell; width: 50%; vertical-align: top; }
  .info-col h3 { font-size: 11px; font-weight: 700; color: #0f4c81; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
  .info-col p { font-size: 12px; color: #444; line-height: 1.7; }
  .info-col .name { font-size: 14px; font-weight: 600; color: #1a1a2e; }

  /* Items Table */
  .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .items-table thead tr { background: #0f4c81; color: white; }
  .items-table th { padding: 10px 14px; font-size: 11px; font-weight: 600; text-align: left; letter-spacing: 0.5px; text-transform: uppercase; }
  .items-table tbody tr { border-bottom: 1px solid #eef0f5; }
  .items-table tbody tr:nth-child(even) { background: #f7f9fc; }
  .items-table td { padding: 10px 14px; font-size: 12px; color: #333; }
  .text-right { text-align: right !important; }

  /* Totals */
  .totals { float: right; width: 280px; }
  .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; border-bottom: 1px solid #eee; }
  .total-row.grand { font-size: 16px; font-weight: 700; color: #0f4c81; border-top: 2px solid #0f4c81; border-bottom: none; padding-top: 10px; margin-top: 4px; }

  /* Timeline */
  .timeline { margin-top: 40px; padding-top: 24px; border-top: 1px solid #eee; }
  .timeline h3 { font-size: 11px; font-weight: 700; color: #0f4c81; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .timeline-item { display: flex; gap: 12px; margin-bottom: 8px; }
  .timeline-dot { width: 8px; height: 8px; border-radius: 50%; background: #0f4c81; margin-top: 4px; flex-shrink: 0; }
  .timeline-text { font-size: 11px; color: #555; }

  /* Footer */
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #eee; display: flex; justify-content: space-between; font-size: 10px; color: #aaa; }
  .clearfix::after { content: ''; display: table; clear: both; }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div>
      <div class="company-name">{{ $company['name'] }}</div>
      <div class="company-info">
        {{ $company['address'] }}<br>
        {{ $company['phone'] }} &bull; {{ $company['email'] }}
      </div>
    </div>
    <div class="invoice-title">
      <h1>INVOICE</h1>
      <p>#INV-{{ str_pad($order->id, 6, '0', STR_PAD_LEFT) }}</p>
      <p>{{ $generated }}</p>
      <br>
      @if($payment)
        <span class="status-badge status-{{ $payment->payment_status }}">
          {{ strtoupper($payment->payment_status ?? 'pending') }}
        </span>
      @endif
    </div>
  </div>

  <!-- Bill To / Order Info -->
  <div class="info-grid">
    <div class="info-col">
      <h3>Bill To</h3>
      <p class="name">{{ $order->customer->name }}</p>
      <p>{{ $order->customer->email }}</p>
      <p>{{ $order->customer->phone }}</p>
      <p>{{ $order->customer->address }}</p>
    </div>
    <div class="info-col" style="text-align:right;">
      <h3>Order Details</h3>
      <p><strong>Order #:</strong> {{ $order->id }}</p>
      <p><strong>Date:</strong> {{ $order->created_at->format('d M Y') }}</p>
      <p><strong>Status:</strong> {{ ucfirst($order->status) }}</p>
      @if($payment)
      <p><strong>Method:</strong> {{ strtoupper($payment->payment_method) }}</p>
      @endif
    </div>
  </div>

  <!-- Service Items -->
  <table class="items-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Description</th>
        <th>From</th>
        <th>To</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>Delivery Service</td>
        <td>{{ $order->pickup_address }}</td>
        <td>{{ $order->delivery_address }}</td>
        <td class="text-right">${{ number_format($order->price, 2) }}</td>
      </tr>
    </tbody>
  </table>

  <!-- Totals -->
  <div class="clearfix">
    <div class="totals">
      <div class="total-row">
        <span>Subtotal</span>
        <span>${{ number_format($order->price, 2) }}</span>
      </div>
      <div class="total-row">
        <span>Tax (0%)</span>
        <span>$0.00</span>
      </div>
      <div class="total-row grand">
        <span>Total</span>
        <span>${{ number_format($order->price, 2) }}</span>
      </div>
    </div>
  </div>

  <!-- Status Timeline -->
  <div class="timeline">
    <h3>Delivery Timeline</h3>
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-text">Order placed — {{ $order->created_at->format('d M Y, H:i') }}</div>
    </div>
    @if($order->delivery)
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-text">Assigned to {{ $order->delivery->deliveryMan->name ?? 'N/A' }}</div>
    </div>
    @endif
    @if($order->status === 'delivered')
    <div class="timeline-item">
      <div class="timeline-dot" style="background:#0a7a45"></div>
      <div class="timeline-text">Delivered successfully — {{ $order->updated_at->format('d M Y, H:i') }}</div>
    </div>
    @endif
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>Thank you for using {{ $company['name'] }}!</span>
    <span>Generated {{ $generated }}</span>
  </div>

</div>
</body>
</html>
