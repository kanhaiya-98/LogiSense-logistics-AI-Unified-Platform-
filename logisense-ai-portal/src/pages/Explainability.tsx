import { AppLayout } from '@/components/layout/AppLayout';
import { useState } from 'react';
import { useGenerateCounterfactual } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

const shapFeatures = [
  { name: 'on_time_rate', value: -0.31, direction: 'negative' },
  { name: 'carrier_drift_score', value: 0.28, direction: 'positive' },
  { name: 'warehouse_load', value: 0.19, direction: 'positive' },
  { name: 'eta_lag', value: 0.14, direction: 'positive' },
  { name: 'aqi_flag', value: 0.09, direction: 'positive' },
];

const tabs = ['SHAP Attribution', 'Counterfactuals', 'Calibration'] as const;

export default function Explainability() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('SHAP Attribution');
  const [sliders, setSliders] = useState({
    on_time_rate: 61,
    carrier_drift_score: 28,
    warehouse_load: 78,
    eta_lag: 14,
    aqi_flag: 9,
  });

  const riskScore = Math.min(0.99, Math.max(0.01,
    0.87 - (sliders.on_time_rate - 61) * 0.015 + (sliders.carrier_drift_score - 28) * 0.008 +
    (sliders.warehouse_load - 78) * 0.005 + (sliders.eta_lag - 14) * 0.006 + (sliders.aqi_flag - 9) * 0.004
  ));
  const flipped = riskScore < 0.5;

  const counterfactualApi = useGenerateCounterfactual();
  const [cfExplanation, setCfExplanation] = useState<string | null>(null);

  const handleGenerateCF = async () => {
    try {
      const res = await counterfactualApi.mutateAsync({
         features: sliders,
         current_prediction: flipped ? "SAFE" : "FLAGGED",
      });
      setCfExplanation(res.closest_counterfactual_text || "No counterfactual could be generated.");
    } catch(e) { console.error(e); }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-4">
        <h1 className="text-xl font-semibold text-foreground">XAI Engine</h1>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[13px] px-3 py-2 transition-colors border-b-2 ${
                activeTab === tab ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'SHAP Attribution' && (
          <div className="space-y-4">
            <div className="border border-border bg-card rounded-lg p-4">
              <div className="text-[13px] font-medium text-foreground mb-4">SHAP Feature Attribution — CAR-07 Risk Assessment</div>
              <div className="space-y-3">
                {shapFeatures.map((f) => (
                  <div key={f.name} className="flex items-center gap-3">
                    <span className="text-[12px] text-muted-foreground w-40 shrink-0 font-mono">{f.name}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-6 relative">
                        <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
                        <div
                          className={`absolute top-1 bottom-1 rounded-sm ${f.value > 0 ? 'bg-destructive/70' : 'bg-success/70'}`}
                          style={{
                            left: f.value > 0 ? '50%' : `${50 + f.value * 100}%`,
                            width: `${Math.abs(f.value) * 100}%`,
                          }}
                        />
                      </div>
                      <span className={`text-[12px] tabular-nums w-12 text-right ${f.value > 0 ? 'text-destructive' : 'text-success'}`}>
                        {f.value > 0 ? '+' : ''}{f.value.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-border bg-card rounded-lg p-4">
              <div className="text-[13px] font-medium text-foreground mb-2">Plain English Summary</div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Decision driven by: on-time rate 61% (↓ high risk), carrier drift +0.28 (↑ high risk), warehouse load 78% (↑ moderate risk).
                Combined effect pushes risk score to 0.87 — well above the 0.50 threshold for CRITICAL classification.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'Counterfactuals' && (
          <div className="space-y-4">
            <div className="border border-border bg-card rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[13px] font-medium text-foreground">Current: CAR-07 → FLAGGED</div>
                  <div className="text-[12px] text-muted-foreground">Adjust features to see decision change</div>
                </div>
                <div className={`text-sm font-semibold px-3 py-1 rounded-full ${flipped ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>
                  {flipped ? 'SAFE' : 'FLAGGED'} — {riskScore.toFixed(2)}
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(sliders).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-[12px] text-muted-foreground w-40 shrink-0 font-mono">{key}</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={val}
                      onChange={(e) => setSliders((s) => ({ ...s, [key]: Number(e.target.value) }))}
                      className="flex-1 accent-primary"
                    />
                    <span className="text-[12px] tabular-nums text-foreground w-10 text-right">{val}%</span>
                  </div>
                ))}
              </div>

              {flipped && (
                <div className="mt-4 p-3 bg-success/10 rounded-md text-[12px] text-success">
                  Decision flips to SAFE — threshold crossed
                </div>
              )}
            </div>

            <div className="border border-border bg-card rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                 <div className="text-[13px] font-medium text-foreground">Closest Counterfactual (Gemini Powered)</div>
                 <button 
                   onClick={handleGenerateCF} 
                   disabled={counterfactualApi.isPending}
                   className="flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded text-[11px] font-medium transition-colors"
                 >
                   {counterfactualApi.isPending && <Loader2 className="w-3 h-3 animate-spin"/>}
                   Generate AI Insight
                 </button>
              </div>
              <p className="text-[12px] text-muted-foreground mt-2">
                {cfExplanation ? cfExplanation : 'Click "Generate AI Insight" to ask Gemini what specific variable changes would currently flip the decision.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'Calibration' && (
          <div className="space-y-4">
            <div className="border border-border bg-card rounded-lg p-4">
              <div className="text-[13px] font-medium text-foreground mb-3">Reliability Diagram</div>
              <svg viewBox="0 0 300 300" className="w-full max-w-md mx-auto">
                {/* Grid */}
                {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                  <g key={v}>
                    <line x1="40" y1={260 - v * 220} x2="280" y2={260 - v * 220} stroke="hsl(var(--border))" strokeWidth="0.5" />
                    <text x="32" y={264 - v * 220} fontSize="9" fill="hsl(var(--muted-foreground))" textAnchor="end">{v.toFixed(1)}</text>
                    <line x1={40 + v * 240} y1="260" x2={40 + v * 240} y2="40" stroke="hsl(var(--border))" strokeWidth="0.5" />
                    <text x={40 + v * 240} y="275" fontSize="9" fill="hsl(var(--muted-foreground))" textAnchor="middle">{v.toFixed(1)}</text>
                  </g>
                ))}
                {/* Perfect line */}
                <line x1="40" y1="260" x2="280" y2="40" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4" />
                {/* Data points */}
                {[
                  [0.1, 0.08], [0.2, 0.18], [0.3, 0.27], [0.4, 0.42], [0.5, 0.48],
                  [0.6, 0.62], [0.7, 0.68], [0.8, 0.82], [0.9, 0.88],
                ].map(([pred, actual]) => (
                  <circle key={pred} cx={40 + pred * 240} cy={260 - actual * 220} r="4" fill="hsl(var(--primary))" />
                ))}
                <text x="160" y="295" fontSize="10" fill="hsl(var(--muted-foreground))" textAnchor="middle">Predicted Confidence</text>
              </svg>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-border bg-card rounded-lg p-4">
                <div className="text-[12px] text-muted-foreground">ECE Score</div>
                <div className="text-lg font-semibold text-foreground mt-0.5">0.032</div>
                <span className="text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded-full">Excellent</span>
              </div>
              <div className="border border-border bg-card rounded-lg p-4">
                <div className="text-[12px] text-muted-foreground">OOD Detector</div>
                <div className="text-[13px] font-medium text-foreground mt-1">No out-of-distribution signals</div>
                <div className="text-[11px] text-muted-foreground">Last 100 samples</div>
              </div>
              <div className="border border-border bg-card rounded-lg p-4">
                <div className="text-[12px] text-muted-foreground">Model Version</div>
                <div className="text-[13px] font-medium text-foreground mt-1">v2.4.1</div>
                <div className="text-[11px] text-muted-foreground">RMSE: 0.042 · F1: 0.94</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
