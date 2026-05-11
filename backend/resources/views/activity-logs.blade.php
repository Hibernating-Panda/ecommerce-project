<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 11px; color: #1e293b; }
  .page { padding: 30px; }
  h1 { font-size: 20px; font-weight: 700; color: #0f4c81; margin: 0 0 4px; }
  .sub { font-size: 11px; color: #64748b; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #0f4c81; color: white; }
  th { padding: 8px 10px; font-size: 10px; text-align: left; letter-spacing: 0.05em; text-transform: uppercase; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  tbody tr { border-bottom: 1px solid #e2e8f0; }
  td { padding: 7px 10px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 600; text-transform: uppercase; }
  .badge-auth    { background: #dbeafe; color: #1d4ed8; }
  .badge-api     { background: #f1f5f9; color: #475569; }
  .badge-payment { background: #dcfce7; color: #15803d; }
  .badge-roles   { background: #f3e8ff; color: #7e22ce; }
  .badge-invoice { background: #fef9c3; color: #a16207; }
  .badge-orders  { background: #fee2e2; color: #b91c1c; }
  .footer { margin-top: 20px; text-align: right; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
</style>
</head>
<body>
<div class="page">
  <h1>Activity Logs Export</h1>
  <p class="sub">Generated {{ now()->format('d M Y H:i') }} · {{ $logs->count() }} records</p>

  <table>
    <thead>
      <tr>
        <th>Timestamp</th>
        <th>User</th>
        <th>Category</th>
        <th>Action</th>
        <th>IP</th>
        <th>Method</th>
      </tr>
    </thead>
    <tbody>
      @foreach($logs as $log)
      <tr>
        <td>{{ $log->created_at->format('d/m/Y H:i') }}</td>
        <td>
          <strong>{{ $log->causer?->name ?? 'System' }}</strong><br>
          <span style="color:#94a3b8; font-size:9px;">{{ $log->causer?->email }}</span>
        </td>
        <td>
          <span class="badge badge-{{ $log->log_name }}">{{ $log->log_name }}</span>
        </td>
        <td style="max-width:200px;">{{ $log->description }}</td>
        <td style="color:#94a3b8; font-size:9px; font-family:monospace;">{{ $log->properties['ip'] ?? '—' }}</td>
        <td>
          @if(!empty($log->properties['method']))
            <span style="font-family:monospace; font-weight:700; font-size:9px;
              color: {{ $log->properties['method'] === 'GET' ? '#15803d' : ($log->properties['method'] === 'DELETE' ? '#b91c1c' : '#1d4ed8') }}">
              {{ $log->properties['method'] }}
            </span>
          @else
            <span style="color:#cbd5e1;">—</span>
          @endif
        </td>
      </tr>
      @endforeach
    </tbody>
  </table>

  <div class="footer">DeliveryPro · Activity Log Export · {{ now()->format('Y') }}</div>
</div>
</body>
</html>
