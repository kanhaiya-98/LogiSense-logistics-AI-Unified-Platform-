import { AppLayout } from '@/components/layout/AppLayout';
import { useRiskEvents, useAnalyzeRiskScenario } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const feedSources = [
  { name: 'OpenWeatherMap', lastPoll: '34 min ago' },
  { name: 'NewsAPI', lastPoll: '8 min ago' },
  { name: 'GDELT', lastPoll: '22 min ago' },
];

const keywords = ['port strike', 'embargo', 'fuel price', 'cyclone', 'monsoon'];

const historicalRisks = [
  { date: '2024-03-23', event: 'Heavy rainfall — Pune corridor', severity: 'MEDIUM', resolved: true },
  { date: '2024-03-22', event: 'Fuel price spike — diesel +4%', severity: 'LOW', resolved: true },
  { date: '2024-03-21', event: 'Port congestion — Chennai', severity: 'MEDIUM', resolved: true },
  { date: '2024-03-20', event: 'Political rally — Hyderabad route blockage', severity: 'HIGH', resolved: true },
  { date: '2024-03-19', event: 'Flash flood warning — Kerala', severity: 'HIGH', resolved: true },
];

const severityBadge = (s: string) => {
  if (s === 'HIGH') return 'bg-destructive/10 text-destructive';
  if (s === 'MEDIUM') return 'bg-warning/10 text-warning';
  return 'bg-muted text-muted-foreground';
};

export default function Risk() {
  const { data: riskEvents = [] } = useRiskEvents();
  const analyzeRisk = useAnalyzeRiskScenario();
  const [scenario, setScenario] = useState('');

  const handleAnalyze = async () => {
    if (!scenario.trim()) return;
    try {
      await analyzeRisk.mutateAsync(scenario);
      setScenario('');
    } catch(e) { console.error(e); }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold text-foreground">Geopolitical & Weather Risk</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Active Events */}
          <div className="space-y-4">
            <div className="text-[13px] font-medium text-foreground flex items-center justify-between">
              <span>Active Risk Events</span>
            </div>

            <div className="border border-border bg-card rounded-lg p-3 space-y-3">
               <div className="text-[12px] font-medium text-foreground">Analyze Custom Scenario (Gemini)</div>
               <textarea 
                  className="w-full bg-surface border border-border rounded-md p-2 text-[12px] text-foreground focus:outline-none focus:border-primary resize-none h-16"
                  placeholder="e.g. A major port strike in Mumbai is delaying all inbound cargo by 3 days."
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
               />
               <button 
                  onClick={handleAnalyze}
                  disabled={analyzeRisk.isPending || !scenario.trim()}
                  className="w-full bg-primary text-primary-foreground text-[12px] py-1.5 rounded-md hover:bg-primary-hover transition-colors font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"
               >
                  {analyzeRisk.isPending && <Loader2 className="w-3 h-3 animate-spin"/>}
                  Analyze Impact & Add Event
               </button>
            </div>

            {riskEvents.map((e: any) => (
              <div key={e.id} className={`border rounded-lg p-4 bg-card ${e.severity === 'HIGH' ? 'border-destructive/30' : 'border-border'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="text-[13px] font-medium text-foreground">{e.title}</div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${severityBadge(e.severity)}`}>
                    {e.severity}
                  </span>
                </div>
                <div className="space-y-1 text-[12px] text-muted-foreground">
                  <div><span className="text-muted-foreground">Source:</span> <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{e.source}</span></div>
                  <div>{e.affected_shipments || e.affectedShipments} shipments affected · {e.corridors}</div>
                  <div className="text-foreground">Recommended: {e.recommendation}</div>
                </div>
                <button className="mt-2 text-[12px] text-primary hover:underline">
                  Trigger Inventory Repositioning →
                </button>
              </div>
            ))}
          </div>

          {/* Right: Monitoring */}
          <div className="space-y-4">
            <div className="text-[13px] font-medium text-foreground">Monitoring Status</div>

            <div className="border border-border bg-card rounded-lg p-4 space-y-3">
              <div className="text-[12px] font-medium text-foreground">Feed Schedule</div>
              {feedSources.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-[12px]">
                  <span className="text-foreground">{s.name}</span>
                  <span className="text-muted-foreground">Last polled: {s.lastPoll}</span>
                </div>
              ))}
            </div>

            <div className="border border-border bg-card rounded-lg p-4">
              <div className="text-[12px] font-medium text-foreground mb-2">Active Keywords</div>
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((k) => (
                  <span key={k} className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{k}</span>
                ))}
              </div>
            </div>

            {/* Mini map */}
            <div className="border border-border bg-card rounded-lg p-4">
              <div className="text-[12px] font-medium text-foreground mb-2">Affected Areas</div>
              <svg viewBox="0 0 400 500" className="w-full h-48">
                <path
                  d="M180,50 L220,60 L250,80 L260,110 L250,130 L270,160 L260,200 L250,230 L260,260 L250,290 L240,320 L230,340 L220,360 L210,380 L200,400 L190,410 L180,400 L170,380 L160,350 L150,320 L140,290 L130,260 L135,230 L140,200 L150,170 L160,140 L170,110 L175,80 Z"
                  fill="none" stroke="hsl(var(--border))" strokeWidth="1.5"
                />
                {/* Gujarat - cyclone */}
                <circle cx="140" cy="230" r="20" fill="#EF4444" opacity="0.1" />
                <circle cx="140" cy="230" r="5" fill="#EF4444" opacity="0.8" />
                {/* Mumbai - monsoon */}
                <circle cx="155" cy="280" r="15" fill="#F59E0B" opacity="0.1" />
                <circle cx="155" cy="280" r="4" fill="#F59E0B" opacity="0.8" />
                {/* JNPT */}
                <circle cx="160" cy="290" r="12" fill="#EF4444" opacity="0.1" />
                <circle cx="160" cy="290" r="4" fill="#EF4444" opacity="0.8" />
              </svg>
            </div>
          </div>
        </div>

        {/* Historical */}
        <div className="border border-border bg-card rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <div className="text-[13px] font-medium text-foreground">Historical Risk Events (7 days)</div>
          </div>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Event</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Severity</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {historicalRisks.map((r, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="px-3 py-2 tabular-nums text-muted-foreground">{r.date}</td>
                  <td className="px-3 py-2 text-foreground">{r.event}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded-full ${severityBadge(r.severity)}`}>{r.severity}</span></td>
                  <td className="px-3 py-2"><span className="text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded-full">Resolved</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
