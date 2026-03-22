import { AppLayout } from '@/components/layout/AppLayout';
import { useWarehouses } from '@/hooks/useApi';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const statusColor = (s: string) => s === 'CRITICAL' ? '#EF4444' : s === 'WARNING' ? '#F59E0B' : '#10B981';

export default function Warehouses() {
  const { data: warehouses = [] } = useWarehouses();
  const [selected, setSelected] = useState<string | null>(null);
  const selectedWh = warehouses.find((w: any) => w.id === selected);

  const throughputData = selectedWh?.throughput.map((v, i) => ({ time: `${i * 15}min`, load: v }));

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-4">
        <h1 className="text-xl font-semibold text-foreground">Warehouse Heatmap</h1>

        {/* Top stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-border bg-card rounded-lg p-3">
            <div className="text-[12px] text-muted-foreground">Network Throughput</div>
            <div className="text-lg font-semibold text-foreground mt-0.5">
              {warehouses.reduce((acc: number, w: any) => acc + (w.mock_throughput || 0), 0).toLocaleString()} pkg/hr
            </div>
          </div>
          <div className="border border-border bg-card rounded-lg p-3">
            <div className="text-[12px] text-muted-foreground">Congestion Alerts</div>
            <div className="text-lg font-semibold text-destructive mt-0.5">
              {warehouses.filter((w: any) => w.status === 'CRITICAL').length}
            </div>
          </div>
          <div className="border border-border bg-card rounded-lg p-3">
            <div className="text-[12px] text-muted-foreground">Pending Redirects</div>
            <div className="text-lg font-semibold text-warning mt-0.5">
              {warehouses.filter((w: any) => w.status === 'WARNING').length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Map */}
          <div className="border border-border bg-card rounded-lg p-4">
            <div className="text-[13px] font-medium text-foreground mb-3">Warehouse Network</div>
            <svg viewBox="0 0 400 500" className="w-full h-80">
              <path
                d="M180,50 L220,60 L250,80 L260,110 L250,130 L270,160 L260,200 L250,230 L260,260 L250,290 L240,320 L230,340 L220,360 L210,380 L200,400 L190,410 L180,400 L170,380 L160,350 L150,320 L140,290 L130,260 L135,230 L140,200 L150,170 L160,140 L170,110 L175,80 Z"
                fill="none" stroke="hsl(var(--border))" strokeWidth="1.5"
              />
              {warehouses.map((wh: any) => (
                <g key={wh.id} onClick={() => setSelected(wh.id)} className="cursor-pointer">
                  <circle cx={wh.x || 200} cy={wh.y || 200} r="18" fill={statusColor(wh.status)} opacity="0.15" />
                  <circle cx={wh.x || 200} cy={wh.y || 200} r="8" fill={statusColor(wh.status)} opacity="0.8" />
                  <text x={(wh.x || 200) + 22} y={(wh.y || 200) - 4} fontSize="10" fill="hsl(var(--foreground))" fontWeight="500">{wh.id}</text>
                  <text x={(wh.x || 200) + 22} y={(wh.y || 200) + 8} fontSize="9" fill="hsl(var(--muted-foreground))">{wh.city} — {wh.load}%</text>
                  {wh.status === 'CRITICAL' && (
                    <circle cx={wh.x || 200} cy={wh.y || 200} r="12" fill="none" stroke={statusColor(wh.status)} strokeWidth="0.8" opacity="0.4">
                      <animate attributeName="r" from="8" to="20" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              ))}
            </svg>
          </div>

          {/* Detail */}
          <div className="space-y-4">
            {selectedWh ? (
              <>
                <div className="border border-border bg-card rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] font-medium text-foreground">{selectedWh.id} — {selectedWh.city}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      selectedWh.status === 'CRITICAL' ? 'bg-destructive/10 text-destructive' :
                      selectedWh.status === 'WARNING' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                    }`}>{selectedWh.status}</span>
                  </div>

                  {/* Gauge */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-10">
                      <svg viewBox="0 0 100 50" className="w-full">
                        <path d="M10 45 A 35 35 0 0 1 90 45" fill="none" stroke="hsl(var(--border))" strokeWidth="6" strokeLinecap="round" />
                        <path
                          d="M10 45 A 35 35 0 0 1 90 45"
                          fill="none"
                          stroke={statusColor(selectedWh.status)}
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={`${selectedWh.load * 1.1} 110`}
                        />
                      </svg>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[12px] font-semibold text-foreground tabular-nums">
                        {selectedWh.load}%
                      </div>
                    </div>
                    <div className="text-[12px] text-muted-foreground">
                      <div>Queue: {selectedWh.inbound_queue || 0} inbound</div>
                      <div>{selectedWh.forecast || "Volume nominal"}</div>
                    </div>
                  </div>
                </div>

                {/* Throughput chart */}
                <div className="border border-border bg-card rounded-lg p-4">
                  <div className="text-[13px] font-medium text-foreground mb-2">Throughput Trend</div>
                  <ResponsiveContainer width="100%" height={140}>
                    <LineChart data={throughputData}>
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--border))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--border))" domain={[0, 100]} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid hsl(var(--border))' }} />
                      <Line type="monotone" dataKey="load" stroke={statusColor(selectedWh.status)} strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {selectedWh.status !== 'HEALTHY' && (
                  <div className="border border-border bg-card rounded-lg p-4 space-y-2">
                    <div className="text-[13px] font-medium text-foreground">Recommended Action</div>
                    <div className="text-[12px] text-foreground">Redirect 12 incoming shipments to WH-04</div>
                    <button className="bg-primary text-primary-foreground text-[12px] px-3 py-1.5 rounded-md hover:bg-primary-hover transition-colors">
                      Execute Redirect
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="border border-border bg-card rounded-lg p-8 flex items-center justify-center">
                <span className="text-[13px] text-muted-foreground">Select a warehouse on the map</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
