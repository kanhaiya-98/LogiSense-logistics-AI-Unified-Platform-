import { AppLayout } from '@/components/layout/AppLayout';
import { skuForecasts } from '@/lib/mockData';
import { useInventory, useGenerateRebalance } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 24;
  const w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export default function Inventory() {
  const { data = { warehouseInventory: [], skuForecasts: [], transfers: [] } } = useInventory();
  const generateTransfer = useGenerateRebalance();
  const [generating, setGenerating] = useState<string | null>(null);

  const warehouseInventory = data.warehouseInventory || [];
  const transfers = data.transfers || [];

  const handleGenerate = async (warehouse_id: string, sku: string) => {
    setGenerating(`${warehouse_id}-${sku}`);
    try {
      await generateTransfer.mutateAsync({ warehouse_id, sku });
    } catch(e) { console.error(e); }
    setGenerating(null);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold text-foreground">Inventory Rebalancing</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Demand Forecasting */}
          <div className="space-y-4">
            <div className="border-b border-border pb-2">
              <div className="text-[13px] font-medium text-foreground">Demand Forecasting Agent</div>
              <div className="text-[11px] text-muted-foreground">Chronos-T5 · Active</div>
            </div>
            {skuForecasts.map((s) => (
              <div
                key={s.sku}
                className={`border rounded-lg p-3 bg-card ${s.alert ? 'border-warning/40' : 'border-border'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-[12px] font-medium text-foreground">{s.sku}</div>
                    <div className="text-[11px] text-muted-foreground">{s.region}</div>
                  </div>
                  <MiniSparkline data={s.forecast} color={s.alert ? '#F59E0B' : '#4F46E5'} />
                </div>
                {s.alert && (
                  <div className="text-[11px] bg-warning/10 text-warning px-2 py-1 rounded-md">
                    {s.alert}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Column 2: Inventory Strategist */}
          <div className="space-y-4">
            <div className="border-b border-border pb-2">
              <div className="text-[13px] font-medium text-foreground">Inventory Strategist Agent</div>
              <div className="text-[11px] text-muted-foreground">Safety stock analysis</div>
            </div>
            {warehouseInventory.map((w: any) => (
              <div key={w.warehouse} className="border border-border bg-card rounded-lg p-3">
                <div className="text-[12px] font-medium text-foreground mb-2">{w.warehouse}</div>
                <div className="space-y-1.5">
                  {w.skus.map((s: any) => (
                    <div key={s.sku} className="flex items-center justify-between text-[11px] group">
                      <span className="text-muted-foreground font-mono flex items-center gap-2">
                         {s.sku}
                         {s.status === 'deficit' && (
                           <button 
                             onClick={() => handleGenerate(w.warehouse, s.sku)}
                             disabled={generating === `${w.warehouse}-${s.sku}`}
                             className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded cursor-pointer disabled:opacity-50"
                           >
                             {generating === `${w.warehouse}-${s.sku}` ? <Loader2 className="w-3 h-3 animate-spin"/> : 'Fix'}
                           </button>
                         )}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums text-foreground">{s.current || 0}/{s.safetyStock || 0}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          s.status === 'deficit' ? 'bg-destructive/10 text-destructive' :
                          s.status === 'surplus' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                        }`}>{s.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Column 3: Transfer Orchestration */}
          <div className="space-y-4">
            <div className="border-b border-border pb-2">
              <div className="text-[13px] font-medium text-foreground">Transfer Orchestration Agent</div>
              <div className="text-[11px] text-muted-foreground">OR-Tools optimizer</div>
            </div>
            {transfers.map((t: any) => (
              <div key={t.id} className="border border-border bg-card rounded-lg p-3 space-y-2">
                <div className="text-[12px] font-medium text-foreground">
                  {t.units.toLocaleString()} units {t.sku}
                </div>
                <div className="text-[11px] text-muted-foreground">{t.from_warehouse} → {t.to_warehouse}</div>
                <div className="flex flex-wrap gap-2 text-[10px]">
                  <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{t.cost}</span>
                  <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{t.co2} CO₂</span>
                  <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{t.vehicle}</span>
                  <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{t.eta_text || '2 days'}</span>
                </div>
                <button className="bg-primary text-primary-foreground text-[11px] px-3 py-1 rounded-md hover:bg-primary-hover transition-colors">
                  Approve Transfer
                </button>
              </div>
            ))}

            {transfers.length === 0 && (
               <div className="border border-border bg-card rounded-lg p-4 text-center text-[12px] text-muted-foreground">
                  No active transfers. Trigger "Fix" on a deficit SKU to generate one using Gemini.
               </div>
            )}

            {/* Transfer map */}
            <div className="border border-border bg-card rounded-lg p-3">
              <div className="text-[12px] font-medium text-foreground mb-2">Active Transfers</div>
              <svg viewBox="0 0 400 500" className="w-full h-48">
                <path
                  d="M180,50 L220,60 L250,80 L260,110 L250,130 L270,160 L260,200 L250,230 L260,260 L250,290 L240,320 L230,340 L220,360 L210,380 L200,400 L190,410 L180,400 L170,380 L160,350 L150,320 L140,290 L130,260 L135,230 L140,200 L150,170 L160,140 L170,110 L175,80 Z"
                  fill="none" stroke="hsl(var(--border))" strokeWidth="1"
                />
                {/* Bangalore → Pune */}
                <line x1="210" y1="420" x2="195" y2="350" stroke="#4F46E5" strokeWidth="1.5" markerEnd="url(#arrow)" />
                {/* Delhi → Mumbai */}
                <line x1="210" y1="130" x2="180" y2="340" stroke="#4F46E5" strokeWidth="1.5" markerEnd="url(#arrow)" />
                <defs>
                  <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 Z" fill="#4F46E5" />
                  </marker>
                </defs>
              </svg>
            </div>

            <div className="border border-border bg-card rounded-lg p-3">
              <div className="text-[12px] font-medium text-foreground mb-1">Optimization Summary</div>
              <p className="text-[11px] text-muted-foreground">
                Transfer plan optimized: total cost ₹6,000 · 2.1 tonnes CO₂ · 3 return-leg trucks utilized
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
