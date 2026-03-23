import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { rtoOrders, returnCases } from '@/lib/mockData'; // Keeping static mock data for historical table for now
import { useScoreRTO } from '@/hooks/useApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

const rtoByCity = [
  { city: 'Lucknow', rate: 31 },
  { city: 'Jaipur', rate: 28 },
  { city: 'Patna', rate: 25 },
  { city: 'Hyderabad', rate: 18 },
  { city: 'Mumbai', rate: 12 },
  { city: 'Bangalore', rate: 9 },
  { city: 'Delhi', rate: 14 },
];

const riskBadge = (level: string) => {
  if (level === 'CRITICAL') return 'bg-destructive/10 text-destructive';
  if (level === 'HIGH') return 'bg-destructive/10 text-destructive';
  if (level === 'MEDIUM') return 'bg-warning/10 text-warning';
  return 'bg-success/10 text-success';
};

const damageBadge = (d: string) => {
  if (d === 'TOTAL_LOSS') return 'bg-destructive/10 text-destructive';
  if (d === 'MAJOR') return 'bg-warning/10 text-warning';
  if (d === 'MINOR') return 'bg-primary/10 text-primary';
  return 'bg-success/10 text-success';
};

export default function RTO() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const selected = rtoOrders.find((o) => o.id === selectedOrder);

  // New Order Scoring State
  const [orderData, setOrderData] = useState({
    order_id: 'ORD-9999',
    customer: 'New Customer',
    pin_code: '400001',
    order_value: 5000,
  });
  const [scoreResult, setScoreResult] = useState<any>(null);

  const scoreRTO = useScoreRTO();

  const handleScore = async () => {
    try {
      const res = await scoreRTO.mutateAsync({
        order_id: orderData.order_id,
        payment_method: "COD",
        shipping_address: { pin_code: orderData.pin_code, city: "Mumbai" },
        items: [{ price: orderData.order_value }],
        customer: { id: "CUST-1", days_since_registration: 10, total_orders: 1, return_rate: 0.0 }
      });
      setScoreResult(res);
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold text-foreground">RTO Risk & COD Fraud</h1>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-border bg-card rounded-lg p-3">
            <div className="text-[12px] text-muted-foreground">Orders Scored Today</div>
            <div className="text-xl font-semibold text-foreground tabular-nums mt-0.5">487</div>
          </div>
          <div className="border border-border bg-card rounded-lg p-3">
            <div className="text-[12px] text-muted-foreground">High-Risk Held</div>
            <div className="text-xl font-semibold text-destructive tabular-nums mt-0.5">12</div>
          </div>
          <div className="border border-border bg-card rounded-lg p-3">
            <div className="text-[12px] text-muted-foreground">WhatsApp Sent</div>
            <div className="text-xl font-semibold text-foreground tabular-nums mt-0.5">34</div>
          </div>
          <div className="border border-border bg-card rounded-lg p-3">
            <div className="text-[12px] text-muted-foreground">Est. Savings</div>
            <div className="text-xl font-semibold text-success mt-0.5">₹42,000</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Order Feed */}
          <div className="space-y-4">
            <div className="text-[13px] font-medium text-foreground">Order Risk Feed</div>
            <div className="border border-border bg-card rounded-lg overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Order</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">PIN</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Score</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Risk</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rtoOrders.map((o) => (
                    <tr
                      key={o.id}
                      className={`border-b border-border cursor-pointer hover:bg-surface ${selectedOrder === o.id ? 'bg-primary/5' : ''}`}
                      onClick={() => setSelectedOrder(o.id === selectedOrder ? null : o.id)}
                    >
                      <td className="px-3 py-2 font-mono text-foreground">{o.id}</td>
                      <td className="px-3 py-2 text-foreground">{o.customer}</td>
                      <td className="px-3 py-2 tabular-nums text-muted-foreground">{o.pinCode}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${o.rtoScore > 0.8 ? 'bg-destructive' : o.rtoScore > 0.5 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${o.rtoScore * 100}%` }} />
                          </div>
                          <span className="tabular-nums text-foreground">{o.rtoScore.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded-full ${riskBadge(o.riskLevel)}`}>{o.riskLevel}</span></td>
                      <td className="px-3 py-2 text-muted-foreground">{o.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selected && (
              <div className="border border-border bg-card rounded-lg p-4 space-y-2">
                <div className="text-[13px] font-medium text-foreground">{selected.id} — SHAP Explanation</div>
                <div className="space-y-1 text-[12px]">
                  <div className="flex justify-between"><span className="text-muted-foreground">pincode_rto_rate</span><span className="text-destructive tabular-nums">{(selected.pincodeRtoRate * 100).toFixed(0)}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">address_completeness</span><span className="text-foreground tabular-nums">{selected.addressCompleteness}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">order_value</span><span className="text-foreground">{selected.orderValue}</span></div>
                </div>
              </div>
            )}
            
            {/* New Order Scoring Form */}
            <div className="border border-border bg-card rounded-lg p-4 space-y-4">
               <div className="text-[13px] font-medium text-foreground">Score New Order (Gemini Powered)</div>
               <div className="grid grid-cols-2 gap-3 text-[12px]">
                  <input className="border border-border bg-surface px-2 py-1.5 rounded" placeholder="Order ID" value={orderData.order_id} onChange={e => setOrderData({...orderData, order_id: e.target.value})} />
                  <input className="border border-border bg-surface px-2 py-1.5 rounded" placeholder="PIN Code" value={orderData.pin_code} onChange={e => setOrderData({...orderData, pin_code: e.target.value})} />
                  <input className="border border-border bg-surface px-2 py-1.5 rounded" type="number" placeholder="Value (INR)" value={orderData.order_value} onChange={e => setOrderData({...orderData, order_value: Number(e.target.value)})} />
               </div>
               <button 
                  onClick={handleScore}
                  disabled={scoreRTO.isPending}
                  className="w-full bg-primary text-primary-foreground py-2 rounded text-[12px] font-medium hover:bg-primary/90 flex justify-center items-center gap-2"
               >
                 {scoreRTO.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Predict RTO Risk'}
               </button>

               {scoreResult && (
                 <div className="mt-4 p-3 bg-surface border border-border rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                       <span className="text-[12px] font-medium">Risk Score:</span>
                       <span className={`text-[12px] px-2 py-1 rounded-full font-bold ${riskBadge(scoreResult.risk_level)}`}>
                         {scoreResult.risk_level} ({(scoreResult.rto_score * 100).toFixed(1)}%)
                       </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground leading-relaxed mt-2 border-t border-border/50 pt-2">
                       {scoreResult.explanation}
                    </div>
                 </div>
               )}
            </div>
          </div>

          {/* Right: Analytics */}
          <div className="space-y-4">
            <div className="text-[13px] font-medium text-foreground">RTO Analytics</div>

            <div className="border border-border bg-card rounded-lg p-4">
              <div className="text-[12px] font-medium text-foreground mb-2">RTO Rate by City</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={rtoByCity} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--border))" />
                  <YAxis type="category" dataKey="city" tick={{ fontSize: 10 }} stroke="hsl(var(--border))" width={70} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="rate" fill="#4F46E5" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="border border-border bg-card rounded-lg p-4">
              <div className="text-[12px] font-medium text-foreground mb-1">Savings Calculator</div>
              <p className="text-[12px] text-muted-foreground">
                At 500 orders/day, 50% RTO reduction = <span className="text-success font-medium">₹50,000 daily savings</span>
              </p>
            </div>
          </div>
        </div>

        {/* Returns */}
        <div className="border border-border bg-card rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <div className="text-[13px] font-medium text-foreground">Returns Management</div>
          </div>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Return ID</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Order</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Damage</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Routing</th>
              </tr>
            </thead>
            <tbody>
              {returnCases.map((r) => (
                <tr key={r.id} className="border-b border-border">
                  <td className="px-3 py-2 font-mono text-foreground">{r.id}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.orderId}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded-full ${damageBadge(r.damageClass)}`}>{r.damageClass}</span></td>
                  <td className="px-3 py-2 text-foreground">{r.routing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
