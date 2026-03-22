import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useShipments } from '@/hooks/useApi';
import { Search, X } from 'lucide-react';

const statusColor: Record<string, string> = {
  IN_TRANSIT: 'bg-primary/10 text-primary',
  DELAYED: 'bg-warning/10 text-warning',
  AT_RISK: 'bg-destructive/10 text-destructive',
  DELIVERED: 'bg-success/10 text-success',
};

export default function Shipments() {
  const { data: shipments = [] } = useShipments();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = shipments.filter((s: any) => {
    const matchSearch = s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.origin.toLowerCase().includes(search.toLowerCase()) ||
      s.destination.toLowerCase().includes(search.toLowerCase()) ||
      (s.carrier_id?.toLowerCase().includes(search.toLowerCase()) || '');
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const selected = shipments.find((s: any) => s.id === selectedId);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-4">
        <h1 className="text-xl font-semibold text-foreground">Shipment Tracker</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search shipments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-[13px] border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 w-56"
            />
          </div>
          {['ALL', 'IN_TRANSIT', 'DELAYED', 'AT_RISK', 'DELIVERED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-[12px] px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === s ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          {/* Table */}
          <div className="flex-1 border border-border bg-card rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">ID</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Route</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Carrier</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">ETA</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">SLA</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Anomaly</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 30).map((s) => (
                    <tr
                      key={s.id}
                      className={`border-b border-border cursor-pointer transition-colors hover:bg-surface ${selectedId === s.id ? 'bg-primary/5' : ''}`}
                      onClick={() => setSelectedId(s.id === selectedId ? null : s.id)}
                    >
                      <td className="px-3 py-2 font-mono text-foreground">{s.id}</td>
                      <td className="px-3 py-2 text-foreground">{s.origin} → {s.destination}</td>
                      <td className="px-3 py-2 text-muted-foreground">{s.carrier_id}</td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusColor[s.status] || 'bg-muted text-foreground'}`}>
                          {s.status?.replace('_', ' ') || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-3 py-2 tabular-nums text-foreground">{s.eta ? new Date(s.eta).toLocaleString() : 'N/A'}</td>
                      <td className="px-3 py-2 tabular-nums text-foreground">{s.sla_deadline ? new Date(s.sla_deadline).toLocaleString() : 'N/A'}</td>
                      <td className="px-3 py-2 tabular-nums">
                        <span className={s.anomaly_score > 0.7 ? 'text-destructive' : s.anomaly_score > 0.4 ? 'text-warning' : 'text-success'}>
                          {s.anomaly_score || '0.0'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{s.updated_at ? new Date(s.updated_at).toLocaleString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail Drawer */}
          {selected && (
            <div className="w-80 border border-border bg-card rounded-lg p-4 space-y-4 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-foreground">{selected.id}</span>
                <button onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] text-muted-foreground">Route</div>
                  <div className="text-[13px] text-foreground">{selected.origin} → {selected.destination}</div>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">Carrier</div>
                  <div className="text-[13px] text-foreground">{selected.carrier_id}</div>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground mb-1">Risk Factors</div>
                  <div className="space-y-1.5 flex flex-col gap-1">
                    <span className="text-[12px] text-muted-foreground">Weight: {selected.weight_tonnes}t</span>
                    <span className="text-[12px] text-muted-foreground">Value: ₹{selected.value_inr?.toLocaleString() || '0'}</span>
                    <span className="text-[12px] text-muted-foreground">Distance: {selected.distance_km}km</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">Anomaly Score</div>
                  <div className={`text-[13px] font-medium ${selected.anomaly_score > 0.7 ? 'text-destructive' : 'text-foreground'}`}>
                    {selected.anomaly_score || '0.0'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
