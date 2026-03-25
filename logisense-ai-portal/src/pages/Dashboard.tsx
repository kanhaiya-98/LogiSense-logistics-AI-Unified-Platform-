import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCarriers, useAgentStatus } from '@/hooks/useApi';
import { slaChartData, aqiData, activityFeed } from '@/lib/mockData';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function StatusDot({ status }: { status: string }) {
  const color = status === 'Active' ? 'bg-success' : status === 'Processing' ? 'bg-warning' : 'bg-muted-foreground/40';
  const pulse = status === 'Active' ? 'animate-pulse-dot' : '';
  return <div className={`w-2 h-2 rounded-full ${color} ${pulse}`} />;
}

function KpiCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="border border-border bg-card rounded-lg p-4">
      <div className="text-[12px] text-muted-foreground">{label}</div>
      <div className={`text-2xl font-semibold mt-1 tabular-nums ${color || 'text-foreground'}`}>{value}</div>
    </div>
  );
}

const aqiColor = (aqi: number) => aqi > 200 ? 'text-destructive' : aqi > 100 ? 'text-warning' : 'text-success';
const feedTypeColor = (type: string) => {
  if (type === 'critical') return 'bg-destructive/10 text-destructive';
  if (type === 'warning') return 'bg-warning/10 text-warning';
  if (type === 'success') return 'bg-success/10 text-success';
  return 'bg-primary/10 text-primary';
};

// Simple India SVG with city dots
function IndiaMap() {
  const cityPositions = [
    { name: 'Mumbai', x: 155, y: 280, status: 'warning' as const },
    { name: 'Delhi', x: 190, y: 120, status: 'critical' as const },
    { name: 'Bangalore', x: 185, y: 360, status: 'normal' as const },
    { name: 'Chennai', x: 220, y: 360, status: 'normal' as const },
    { name: 'Pune', x: 165, y: 300, status: 'warning' as const },
  ];
  const dotColor = (s: string) => s === 'critical' ? '#EF4444' : s === 'warning' ? '#F59E0B' : '#10B981';

  return (
    <div className="border border-border bg-card rounded-lg p-4">
      <div className="text-[13px] font-medium text-foreground mb-3">Live Shipment Map</div>
      <svg viewBox="0 0 400 500" className="w-full h-64">
        {/* Simplified India outline */}
        <path
          d="M180,50 L220,60 L250,80 L260,110 L250,130 L270,160 L260,200 L250,230 L260,260 L250,290 L240,320 L230,340 L220,360 L210,380 L200,400 L190,410 L180,400 L170,380 L160,350 L150,320 L140,290 L130,260 L135,230 L140,200 L150,170 L160,140 L170,110 L175,80 Z"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1.5"
        />
        {cityPositions.map((city) => (
          <g key={city.name}>
            <circle cx={city.x} cy={city.y} r="12" fill={dotColor(city.status)} opacity="0.15" />
            <circle cx={city.x} cy={city.y} r="5" fill={dotColor(city.status)} />
            {city.status === 'critical' && (
              <circle cx={city.x} cy={city.y} r="8" fill="none" stroke={dotColor(city.status)} strokeWidth="1" opacity="0.5">
                <animate attributeName="r" from="5" to="14" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <text x={city.x + 14} y={city.y + 4} fontSize="10" fill="hsl(var(--muted-foreground))">{city.name}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function Dashboard() {
  const { data: carriersData = [] } = useCarriers();
  const { data: agentStatus } = useAgentStatus();
  
  // Simulate live feed: start with first 3 events, add more over time
  const [feed, setFeed] = useState(activityFeed.slice(0, 3));
  useEffect(() => {
    let idx = 3;
    const timer = setInterval(() => {
      if (idx < activityFeed.length) {
        setFeed(prev => [activityFeed[idx], ...prev].slice(0, 10));
        idx++;
      } else {
        clearInterval(timer);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, []);



  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold text-foreground">Operations Dashboard</h1>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KpiCard label="Active Shipments" value="1,248" />
          <KpiCard label="SLA Breaches Prevented" value="47" color="text-success" />
          <KpiCard label="Pending Approvals" value={agentStatus?.active_anomalies?.toString() || "0"} color="text-warning" />
          <KpiCard label="CO₂ Saved Today" value="2.4t" />
          <KpiCard label="Blockchain Anchors" value="12" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Left 60% */}
          <div className="lg:col-span-3 space-y-4">
            <IndiaMap />
            {/* AQI Strip */}
            <div className="border border-border bg-card rounded-lg p-4">
              <div className="text-[13px] font-medium text-foreground mb-2">Air Quality Index</div>
              <div className="flex flex-wrap gap-4">
                {aqiData.map((a) => (
                  <div key={a.city} className="flex items-center gap-2">
                    <span className="text-[12px] text-muted-foreground">{a.city}</span>
                    <span className={`text-[12px] font-medium tabular-nums ${aqiColor(a.aqi)}`}>{a.aqi}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 40% */}
          <div className="lg:col-span-2 space-y-4">
            <div className="border border-border bg-card rounded-lg p-4">
              <div className="text-[13px] font-medium text-foreground mb-3">Live Activity Feed</div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {feed.map((item) => (
                  <div key={item.id} className="flex items-start gap-2">
                    <div className={`text-[10px] px-1.5 py-0.5 rounded-full mt-0.5 shrink-0 ${feedTypeColor(item.type)}`}>
                      {item.time}
                    </div>
                    <span className="text-[12px] text-foreground leading-relaxed">{item.message}</span>
                  </div>
                ))}
                {feed.length === 0 && (
                   <div className="text-[12px] text-muted-foreground p-2">Loading activity feed...</div>
                )}
              </div>
            </div>

            <div className="border border-border bg-card rounded-lg p-4">
              <div className="text-[13px] font-medium text-foreground mb-3">Agent Status</div>
              <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <StatusDot status={agentStatus?.observer === 'active' ? 'Active' : 'Offline'} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-foreground">Observer</div>
                      <div className="text-[11px] text-muted-foreground truncate">Monitoring events</div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">Live</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusDot status={agentStatus?.reasoner === 'active' ? 'Active' : 'Offline'} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-foreground">Reasoner</div>
                      <div className="text-[11px] text-muted-foreground truncate">Gemini mode</div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">Live</span>
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* SLA Chart */}
          <div className="border border-border bg-card rounded-lg p-4">
            <div className="text-[13px] font-medium text-foreground mb-3">SLA Performance (24h)</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={slaChartData}>
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="hsl(var(--border))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--border))" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid hsl(var(--border))' }} />
                <Line type="monotone" dataKey="breaches" stroke="#EF4444" strokeWidth={1.5} dot={false} name="Breaches" />
                <Line type="monotone" dataKey="prevented" stroke="#10B981" strokeWidth={1.5} dot={false} name="Prevented" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="border border-border bg-card rounded-lg p-4">
            <div className="text-[13px] font-medium text-foreground mb-3">Carrier Health</div>
            <div className="space-y-2">
              {carriersData.slice(0, 5).map((c: any) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-[12px] text-muted-foreground w-16 shrink-0">{c.carrier_id}</span>
                  <span className="text-[12px] text-foreground w-32 truncate">{c.name}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.status === 'CRITICAL' ? 'bg-destructive' : c.status === 'WARNING' ? 'bg-warning' : 'bg-success'}`}
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                  <span className="text-[12px] tabular-nums text-foreground w-8 text-right">{c.score}</span>
                </div>
              ))}
              {carriersData.length === 0 && <div className="text-[12px] text-muted-foreground">Loading carriers...</div>}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
