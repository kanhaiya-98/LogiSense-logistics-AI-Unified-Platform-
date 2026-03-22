import { AppLayout } from '@/components/layout/AppLayout';
import { aqiData } from '@/lib/mockData';
import { useGlobalStore } from '@/store/globalStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const models = [
  { name: 'ETA Model', type: 'XGBoost', version: 'v3.1.2', metric: 'RMSE: 0.042', ece: '0.028', trainDate: '2024-03-22', retrain: '4h' },
  { name: 'Delay Classifier', type: 'LightGBM', version: 'v2.8.0', metric: 'F1: 0.94', ece: '0.032', trainDate: '2024-03-21', retrain: '8h' },
  { name: 'Carrier Reliability', type: 'Bayesian', version: 'v1.5.3', metric: 'AUC: 0.91', ece: '0.041', trainDate: '2024-03-20', retrain: '12h' },
];

const learningCurve = Array.from({ length: 30 }, (_, i) => ({
  cycle: i + 1,
  confidence: 0.72 + (i * 0.008) + (Math.random() * 0.02 - 0.01),
  accuracy: 0.70 + (i * 0.009) + (Math.random() * 0.02 - 0.01),
}));

const aqiTrend = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  aqi: i < 8 ? 180 + Math.random() * 20 : i < 14 ? 220 + i * 8 : i === 14 ? 312 : 280 - (i - 14) * 3,
}));

const mlflowVersions = [
  { version: 'v3.1.2', metrics: 'RMSE 0.042', hash: 'abc12def', deployed: true },
  { version: 'v3.1.1', metrics: 'RMSE 0.045', hash: '98f7e6d5', deployed: false },
  { version: 'v3.1.0', metrics: 'RMSE 0.051', hash: '4c3b2a19', deployed: false },
];

const aqiColor = (aqi: number) => aqi > 200 ? 'text-destructive' : aqi > 100 ? 'text-warning' : 'text-success';

export default function Learning() {
  const policy = useGlobalStore((s) => s.policy);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold text-foreground">Outcome Learning & AQI Policy</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: ML Performance */}
          <div className="space-y-4">
            <div className="text-[13px] font-medium text-foreground">ML Model Performance</div>
            {models.map((m) => (
              <div key={m.name} className="border border-border bg-card rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-medium text-foreground">{m.name}</div>
                    <div className="text-[11px] text-muted-foreground">{m.type} · {m.version}</div>
                  </div>
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{m.metric}</span>
                </div>
                <div className="flex gap-4 text-[11px] text-muted-foreground">
                  <span>ECE: {m.ece}</span>
                  <span>Trained: {m.trainDate}</span>
                  <span>Retrain in {m.retrain}</span>
                </div>
              </div>
            ))}

            <div className="border border-border bg-card rounded-lg p-4">
              <div className="text-[13px] font-medium text-foreground mb-2">Learning Curve (30 cycles)</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={learningCurve}>
                  <XAxis dataKey="cycle" tick={{ fontSize: 10 }} stroke="hsl(var(--border))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--border))" domain={[0.6, 1]} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="confidence" stroke="#4F46E5" strokeWidth={1.5} dot={false} name="Confidence" />
                  <Line type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={1.5} dot={false} name="Accuracy" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="border border-border bg-card rounded-lg overflow-hidden">
              <div className="px-4 py-2 border-b border-border text-[12px] font-medium text-foreground">MLflow Version History</div>
              <table className="w-full text-[12px]">
                <tbody>
                  {mlflowVersions.map((v) => (
                    <tr key={v.version} className="border-b border-border">
                      <td className="px-3 py-2 font-mono text-foreground">{v.version}</td>
                      <td className="px-3 py-2 text-muted-foreground">{v.metrics}</td>
                      <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{v.hash}</td>
                      <td className="px-3 py-2">{v.deployed && <span className="text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded-full">Deployed</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: AQI Carbon Policy */}
          <div className="space-y-4">
            <div className="text-[13px] font-medium text-foreground">AQI Carbon Policy</div>

            <div className="border border-border bg-card rounded-lg p-4">
              <div className="text-[12px] text-muted-foreground mb-2">Live AQI</div>
              <div className="space-y-2">
                {aqiData.map((a) => (
                  <div key={a.city} className="flex items-center justify-between">
                    <span className="text-[12px] text-foreground">{a.city}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[12px] font-medium tabular-nums ${aqiColor(a.aqi)}`}>{a.aqi}</span>
                      <span className="text-[10px] text-muted-foreground">{a.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-border bg-card rounded-lg p-4">
              <div className="text-[12px] text-muted-foreground mb-1">Current Policy</div>
              <div className="inline-block text-[13px] font-medium bg-warning/15 text-warning px-3 py-1 rounded-full">
                {policy}
              </div>
              <div className="mt-2 text-[12px] text-muted-foreground">
                Auto-switched to CARBON_FIRST at 14:32 — AQI Delhi hit 312
              </div>
            </div>

            <div className="border border-border bg-card rounded-lg p-4">
              <div className="text-[12px] text-muted-foreground">Carbon Saved Today</div>
              <div className="text-2xl font-semibold text-success mt-0.5 tabular-nums">2.4 tonnes</div>
              <div className="text-[11px] text-muted-foreground">vs default routing baseline</div>
            </div>

            <div className="border border-border bg-card rounded-lg p-4">
              <div className="text-[13px] font-medium text-foreground mb-2">AQI Trend — Delhi (24h)</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={aqiTrend}>
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="hsl(var(--border))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--border))" />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="aqi" stroke="#EF4444" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
