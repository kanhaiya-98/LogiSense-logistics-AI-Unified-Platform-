import { AppLayout } from '@/components/layout/AppLayout';
import { useCarriers } from '@/hooks/useApi';

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 24;
  const w = 60;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

const statusBadge = (status: string) => {
  if (status === 'CRITICAL') return 'bg-destructive/10 text-destructive';
  if (status === 'WARNING') return 'bg-warning/10 text-warning';
  return 'bg-success/10 text-success';
};

export default function Carriers() {
  const { data: carriers = [] } = useCarriers();

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold text-foreground">Carrier Intelligence</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {carriers.map((c: any) => (
            <div
              key={c.id}
              className={`border rounded-lg p-4 bg-card transition-all duration-200 hover:shadow-card ${
                c.status === 'CRITICAL' ? 'border-destructive/40' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[13px] font-medium text-foreground">{c.carrier_id}</div>
                  <div className="text-[12px] text-muted-foreground">{c.name}</div>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusBadge(c.status)}`}>
                  {c.status}
                </span>
              </div>

              {/* Score Ring */}
              <div className="flex items-center gap-4 mb-3">
                <div className="relative w-14 h-14">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--border))" strokeWidth="2.5" />
                    <circle
                      cx="18" cy="18" r="15" fill="none"
                      stroke={c.status === 'CRITICAL' ? '#EF4444' : c.status === 'WARNING' ? '#F59E0B' : '#10B981'}
                      strokeWidth="2.5"
                      strokeDasharray={`${c.score * 0.94} 94`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[13px] font-semibold text-foreground tabular-nums">{c.score}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-[11px] text-muted-foreground mb-1">Drift Velocity</div>
                  <MiniSparkline
                    data={c.sparkline || [0,0,0,0,0]} // Fallback if no sparkline data
                    color={c.status === 'CRITICAL' ? '#EF4444' : c.status === 'WARNING' ? '#F59E0B' : '#10B981'}
                  />
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground mb-1">72h: {c.projection_72h || 'Stable'}</div>

              <div className="grid grid-cols-2 gap-y-1 mt-2 text-[11px]">
                <div><span className="text-muted-foreground">On-time:</span> <span className="text-foreground tabular-nums">{((c.on_time_rate || 0) * 100).toFixed(0)}%</span></div>
                <div><span className="text-muted-foreground">Check-in:</span> <span className="text-foreground tabular-nums">{((c.checkin_responsiveness || 0) * 100).toFixed(0)}%</span></div>
                <div><span className="text-muted-foreground">Delay:</span> <span className="text-foreground tabular-nums">{c.delay_magnitude || 0}h</span></div>
                <div><span className="text-muted-foreground">Load:</span> <span className="text-foreground tabular-nums">{((c.load_acceptance_rate || 0) * 100).toFixed(0)}%</span></div>
              </div>
            </div>
          ))}
        </div>

        {/* Full table */}
        <div className="border border-border bg-card rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <div className="text-[13px] font-medium text-foreground">30-Day Carrier Scorecard</div>
          </div>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Carrier</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Score</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">On-Time</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Responsiveness</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Avg Delay</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Trend</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {carriers.map((c: any) => (
                <tr key={c.id} className="border-b border-border">
                  <td className="px-3 py-2 text-foreground">{c.carrier_id} — {c.name}</td>
                  <td className="px-3 py-2 tabular-nums text-foreground">{c.score}/100</td>
                  <td className="px-3 py-2 tabular-nums text-foreground">{((c.on_time_rate || 0) * 100).toFixed(0)}%</td>
                  <td className="px-3 py-2 tabular-nums text-foreground">{((c.checkin_responsiveness || 0) * 100).toFixed(0)}%</td>
                  <td className="px-3 py-2 tabular-nums text-foreground">{c.delay_magnitude || 0}h</td>
                  <td className="px-3 py-2">
                    <MiniSparkline
                      data={c.sparkline || [0,0,0,0,0]}
                      color={c.status === 'CRITICAL' ? '#EF4444' : c.status === 'WARNING' ? '#F59E0B' : '#10B981'}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
