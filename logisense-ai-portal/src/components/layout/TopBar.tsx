import { useGlobalStore } from '@/store/globalStore';
import { aqiData } from '@/lib/mockData';
import { Wifi } from 'lucide-react';

export function TopBar() {
  const policy = useGlobalStore((s) => s.policy);
  const wsConnected = useGlobalStore((s) => s.wsConnected);
  const delhiAqi = aqiData.find((a) => a.city === 'Delhi')!;

  const policyColors: Record<string, string> = {
    BALANCED: 'bg-muted text-muted-foreground',
    COST_FIRST: 'bg-success/15 text-success',
    SPEED_FIRST: 'bg-primary/15 text-primary',
    CARBON_FIRST: 'bg-warning/15 text-warning',
  };

  return (
    <header className="h-11 border-b border-border bg-background flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${policyColors[policy]}`}>
          {policy.replace('_', ' ')}
        </span>
        <span className="text-[11px] text-muted-foreground">
          AQI {delhiAqi.aqi} — {delhiAqi.city}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3 h-3 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">
            WS: {wsConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-success animate-pulse-dot' : 'bg-destructive'}`} />
      </div>
    </header>
  );
}
