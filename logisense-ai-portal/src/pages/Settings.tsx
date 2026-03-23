import { AppLayout } from '@/components/layout/AppLayout';
import { useGlobalStore, PolicyMode } from '@/store/globalStore';
import { useState } from 'react';

const policies: { mode: PolicyMode; desc: string }[] = [
  { mode: 'BALANCED', desc: 'Equal TOPSIS weights across cost, speed, and carbon dimensions' },
  { mode: 'COST_FIRST', desc: 'Prioritize lowest cost routes — weight: cost 0.6, speed 0.25, carbon 0.15' },
  { mode: 'SPEED_FIRST', desc: 'Prioritize fastest delivery — weight: speed 0.6, cost 0.25, carbon 0.15' },
  { mode: 'CARBON_FIRST', desc: 'Minimize carbon footprint — weight: carbon 0.6, speed 0.25, cost 0.15' },
];

const agentConfigs = [
  { name: 'Observer', setting: 'Polling interval', value: '5s', type: 'interval' },
  { name: 'Reasoner', setting: 'LightGBM threshold', value: '0.65', type: 'threshold' },
  { name: 'Red Team', setting: 'Monte Carlo simulations', value: '500', type: 'count' },
  { name: 'Learner', setting: 'Retrain cycle', value: '24hr', type: 'duration' },
];

const tiers = [
  { tier: 'Tier 1 — Auto Execute', condition: '< 5 shipments OR confidence > 85%', color: 'border-success/30', dotColor: 'bg-success' },
  { tier: 'Tier 2 — HITL Card', condition: '5–50 shipments, confidence 65–84%', color: 'border-warning/30', dotColor: 'bg-warning' },
  { tier: 'Tier 3 — Escalate', condition: '> 50 shipments OR confidence < 65%', color: 'border-destructive/30', dotColor: 'bg-destructive' },
];

export default function Settings() {
  const { policy, setPolicy } = useGlobalStore();
  const [aqiThreshold, setAqiThreshold] = useState(300);
  const [autoRevertDelay, setAutoRevertDelay] = useState(6);
  const [tierThresholds, setTierThresholds] = useState({ t1Ships: 5, t1Conf: 85, t2Ships: 50, t2Conf: 65 });

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>

        {/* Global Policy */}
        <section className="space-y-3">
          <div className="text-[13px] font-medium text-foreground">Global Routing Policy</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {policies.map((p) => (
              <button
                key={p.mode}
                onClick={() => setPolicy(p.mode)}
                className={`border rounded-lg p-3 text-left transition-all ${
                  policy === p.mode
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-muted-foreground/30'
                }`}
              >
                <div className={`text-[12px] font-medium ${policy === p.mode ? 'text-primary' : 'text-foreground'}`}>
                  {p.mode.replace('_', ' ')}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{p.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Agent Config */}
        <section className="space-y-3">
          <div className="text-[13px] font-medium text-foreground">Agent Configuration</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agentConfigs.map((a) => (
              <div key={a.name} className="border border-border bg-card rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-medium text-foreground">{a.name}</div>
                  <div className="text-[11px] text-muted-foreground">{a.setting}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-mono text-foreground tabular-nums">{a.value}</span>
                  <div className="w-8 h-4 bg-primary rounded-full relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-primary-foreground rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border border-border bg-card rounded-lg p-4">
              <div className="text-[12px] font-medium text-foreground mb-2">AQI CARBON_FIRST Trigger</div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={aqiThreshold}
                  onChange={(e) => setAqiThreshold(Number(e.target.value))}
                  className="w-20 text-[12px] border border-border rounded-md px-2 py-1 bg-background tabular-nums"
                />
                <span className="text-[11px] text-muted-foreground">AQI threshold</span>
              </div>
            </div>
            <div className="border border-border bg-card rounded-lg p-4">
              <div className="text-[12px] font-medium text-foreground mb-2">Auto-Revert Delay</div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={autoRevertDelay}
                  onChange={(e) => setAutoRevertDelay(Number(e.target.value))}
                  className="w-20 text-[12px] border border-border rounded-md px-2 py-1 bg-background tabular-nums"
                />
                <span className="text-[11px] text-muted-foreground">hours</span>
              </div>
            </div>
          </div>
        </section>

        {/* Autonomy Tiers */}
        <section className="space-y-3">
          <div className="text-[13px] font-medium text-foreground">Autonomy Tiers</div>
          <div className="space-y-3">
            {tiers.map((t, i) => (
              <div key={t.tier} className={`border rounded-lg p-4 bg-card ${t.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${t.dotColor}`} />
                  <span className="text-[12px] font-medium text-foreground">{t.tier}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mb-2">{t.condition}</div>
                {i < 2 && (
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground">Ships:</span>
                      <input
                        type="number"
                        value={i === 0 ? tierThresholds.t1Ships : tierThresholds.t2Ships}
                        onChange={(e) => setTierThresholds((prev) => ({
                          ...prev,
                          [i === 0 ? 't1Ships' : 't2Ships']: Number(e.target.value),
                        }))}
                        className="w-14 text-[11px] border border-border rounded px-1.5 py-0.5 bg-background tabular-nums"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground">Conf:</span>
                      <input
                        type="number"
                        value={i === 0 ? tierThresholds.t1Conf : tierThresholds.t2Conf}
                        onChange={(e) => setTierThresholds((prev) => ({
                          ...prev,
                          [i === 0 ? 't1Conf' : 't2Conf']: Number(e.target.value),
                        }))}
                        className="w-14 text-[11px] border border-border rounded px-1.5 py-0.5 bg-background tabular-nums"
                      />
                      <span className="text-[11px] text-muted-foreground">%</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
