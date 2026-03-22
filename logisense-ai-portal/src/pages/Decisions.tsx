import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRecentDecisions, usePendingCards } from '@/hooks/useApi';
import { Check, X, Edit2, Star, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function Decisions() {
  const { data: approvals = [], refetch: refetchCards } = usePendingCards();
  const { data: decisions = [], isLoading: decLoading } = useRecentDecisions();
  
  const [approving, setApproving] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      await api.resolveCard(id, 'APPROVE');
      await refetchCards();
    } catch(e) { console.error(e); }
    setApproving(null);
  };

  const handleReject = async (id: string) => {
    setApproving(id);
    try {
      await api.resolveCard(id, 'REJECT');
      await refetchCards();
    } catch(e) { console.error(e); }
    setApproving(null);
  };

  const tierCounts = { auto: 38, supervised: approvals.length, escalated: 1 };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold text-foreground">Decision Engine — HITL</h1>

        {/* Autonomy Tiers */}
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-border bg-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-[13px] font-medium text-foreground">Tier 1 — Auto</span>
            </div>
            <div className="text-2xl font-semibold text-foreground tabular-nums">{tierCounts.auto}</div>
            <div className="text-[11px] text-muted-foreground">autonomous today</div>
          </div>
          <div className="border border-border bg-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span className="text-[13px] font-medium text-foreground">Tier 2 — Supervised</span>
            </div>
            <div className="text-2xl font-semibold text-warning tabular-nums">{tierCounts.supervised}</div>
            <div className="text-[11px] text-muted-foreground">pending approval</div>
          </div>
          <div className="border border-border bg-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-[13px] font-medium text-foreground">Tier 3 — Escalated</span>
            </div>
            <div className="text-2xl font-semibold text-destructive tabular-nums">{tierCounts.escalated}</div>
            <div className="text-[11px] text-muted-foreground">escalated</div>
          </div>
        </div>

        {/* Pending Approval Cards */}
        <div className="space-y-4">
          <div className="text-[13px] font-medium text-foreground">Pending Approvals</div>
          {approvals.map((a: any) => (
            <div key={a.incident_id} className={`border rounded-lg p-4 bg-card ${a.status === 'RESOLVED' ? 'border-success/40' : 'border-border'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[13px] font-medium text-foreground">{a.incident_id} — {a.title}</div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{a.action_type || 'CARRIER_SWAP'}</span>
                    <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">ETA: +2h</span>
                  </div>
                </div>
                {a.status === 'approved' && (
                  <div className="flex items-center gap-1 text-success text-[12px]">
                    <Check className="w-3.5 h-3.5" />
                    <span className="font-medium">Approved</span>
                  </div>
                )}
              </div>

              {a.status === 'pending' && (
                <>
                  <div className="overflow-x-auto mb-3">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-1.5 px-2 text-muted-foreground font-medium">Option</th>
                          <th className="text-left py-1.5 px-2 text-muted-foreground font-medium">Cost Δ</th>
                          <th className="text-left py-1.5 px-2 text-muted-foreground font-medium">ETA Δ</th>
                          <th className="text-left py-1.5 px-2 text-muted-foreground font-medium">CO₂ Δ</th>
                          <th className="text-left py-1.5 px-2 text-muted-foreground font-medium">SLA Risk</th>
                          <th className="text-left py-1.5 px-2 text-muted-foreground font-medium">Agent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {a.options.map((opt) => (
                          <tr key={opt.type} className={`border-b border-border ${opt.recommended ? 'bg-primary/5' : ''}`}>
                            <td className="py-1.5 px-2 font-medium text-foreground">{opt.type}</td>
                            <td className="py-1.5 px-2 tabular-nums text-foreground">{opt.costDelta}</td>
                            <td className="py-1.5 px-2 text-foreground">{opt.etaDelta}</td>
                            <td className="py-1.5 px-2 tabular-nums text-foreground">{opt.co2Delta}</td>
                            <td className="py-1.5 px-2 tabular-nums text-foreground">{opt.slaRisk}</td>
                            <td className="py-1.5 px-2">
                              {opt.recommended && <Star className="w-3 h-3 text-warning fill-warning" />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(a.incident_id)}
                      disabled={approving === a.incident_id}
                      className="bg-primary text-primary-foreground text-[12px] px-3 py-1.5 rounded-md hover:bg-primary-hover transition-colors flex items-center justify-center min-w-[80px]"
                    >
                      {approving === a.incident_id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve'}
                    </button>
                    <button onClick={() => handleReject(a.incident_id)} className="border border-destructive/30 text-destructive text-[12px] px-3 py-1.5 rounded-md hover:bg-destructive/5 transition-colors">
                      Reject
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Decision History */}
        <div className="border border-border bg-card rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <div className="text-[13px] font-medium text-foreground">Decision History</div>
          </div>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Time</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Incident</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Tier</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Executed By</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">On-Chain Hash</th>
              </tr>
            </thead>
            <tbody>
              {decisions.map((d: any) => (
                <tr key={d.decision_id || d.id} className="border-b border-border">
                  <td className="px-3 py-2 tabular-nums text-foreground">{new Date(d.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2 text-foreground">{d.action}</td>
                  <td className="px-3 py-2 text-muted-foreground">{d.tier}</td>
                  <td className="px-3 py-2 text-muted-foreground">{d.executed_by}</td>
                  <td className="px-3 py-2 font-mono text-primary text-[11px] cursor-pointer hover:underline">{d.sha256_hash?.substring(0, 16) || 'pending'}...</td>
                </tr>
              ))}
              {decisions.length === 0 && !decLoading && (
                <tr className="border-b border-border"><td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">No recent decisions in DB</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
