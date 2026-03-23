import { AppLayout } from '@/components/layout/AppLayout';
import { useBlockchainLog, useBlockchainStats, useVerifyDecision } from '@/hooks/useApi';
import { useState } from 'react';
import { Loader2, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';

const merkleBatches = Array.from({ length: 12 }, (_, i) => ({
  id: `BATCH-${String(i + 1).padStart(3, '0')}`,
  time: `${14 - Math.floor(i * 0.5)}:${String(((12 - i) * 5) % 60).padStart(2, '0')}`,
  count: Math.floor(Math.random() * 8) + 2,
}));

export default function Blockchain() {
  const { data: log = [] } = useBlockchainLog();
  const { data: stats = {} } = useBlockchainStats();
  const verifyChain = useVerifyDecision();
  
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<'idle' | 'valid' | 'invalid' | 'tampered'>('idle');
  const [tamperDemo, setTamperDemo] = useState(false);

  const handleVerify = async () => {
    if (!verifyInput.trim()) return;
    try {
      const res = await verifyChain.mutateAsync(verifyInput);
      setVerifyResult(res.valid ? 'valid' : 'invalid');
    } catch(e) {
      setVerifyResult('invalid');
      console.error(e);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-foreground">Blockchain Audit</h1>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Polygon Testnet</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-border bg-card rounded-lg p-3">
            <div className="text-[12px] text-muted-foreground">Decisions Audited</div>
            <div className="text-xl font-semibold text-foreground tabular-nums mt-0.5">{stats.total_anchored || 0}</div>
          </div>
          <div className="border border-border bg-card rounded-lg p-3">
            <div className="text-[12px] text-muted-foreground">Merkle Batches</div>
            <div className="text-xl font-semibold text-foreground tabular-nums mt-0.5">{stats.batches || 0}</div>
          </div>
          <div className="border border-border bg-card rounded-lg p-3">
            <div className="text-[12px] text-muted-foreground">Last Anchor</div>
            <div className="text-xl font-semibold text-foreground mt-0.5">{stats.last_anchor || 'N/A'}</div>
          </div>
          <div className="border border-border bg-card rounded-lg p-3">
            <div className="text-[12px] text-muted-foreground">Network Status</div>
            <div className="text-xl font-semibold text-success mt-0.5">{stats.status || 'Active'}</div>
          </div>
        </div>

        {/* Audit Log */}
        <div className="border border-border bg-card rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <div className="text-[13px] font-medium text-foreground">Decision Audit Log</div>
          </div>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Timestamp</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Action</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">SHA-256</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Batch</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Link</th>
              </tr>
            </thead>
            <tbody>
              {log.map((d: any) => (
                <tr key={d.id} className="border-b border-border">
                  <td className="px-3 py-2 font-mono text-foreground">{d.decision_id || d.id}</td>
                  <td className="px-3 py-2 tabular-nums text-muted-foreground">{new Date(d.created_at || d.timestamp).toLocaleString()}</td>
                  <td className="px-3 py-2 text-foreground">{d.action}</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{d.sha256_hash?.substring(0, 16) || d.hash?.substring(0, 16)}...</td>
                  <td className="px-3 py-2 text-muted-foreground">{d.merkleBatch || `BATCH-${String(Math.floor((d.id || 0) / 5)).padStart(3, '0')}`}</td>
                  <td className="px-3 py-2">
                    <ExternalLink className="w-3.5 h-3.5 text-primary cursor-pointer" />
                  </td>
                </tr>
              ))}
              {log.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-4 text-center text-muted-foreground text-[12px]">No on-chain decisions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Verification + Tamper Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-border bg-card rounded-lg p-4 space-y-3">
            <div className="text-[13px] font-medium text-foreground">Verify Integrity</div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Decision ID (e.g. DEC-001)"
                value={verifyInput}
                onChange={(e) => { setVerifyInput(e.target.value); setVerifyResult('idle'); }}
                className="flex-1 text-[12px] border border-border rounded-md px-2.5 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={handleVerify}
                disabled={verifyChain.isPending || !verifyInput.trim()}
                className="bg-primary text-primary-foreground text-[12px] px-3 py-1.5 rounded-md hover:bg-primary-hover transition-colors font-medium flex items-center justify-center min-w-[70px] disabled:opacity-50"
              >
                {verifyChain.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : 'Verify'}
              </button>
            </div>
            {verifyResult === 'valid' && (
              <div className="flex items-center gap-2 text-success text-[12px] p-2 bg-success/10 rounded-md">
                <CheckCircle className="w-3.5 h-3.5" />
                Hash match verified · Merkle proof valid · On-chain confirmed
              </div>
            )}
            {verifyResult === 'invalid' && (
              <div className="flex items-center gap-2 text-destructive text-[12px] p-2 bg-destructive/10 rounded-md">
                <AlertTriangle className="w-3.5 h-3.5" />
                Invalid Proof - Could not verify decision on chain.
              </div>
            )}
          </div>

          <div className="border border-border bg-card rounded-lg p-4 space-y-3">
            <div className="text-[13px] font-medium text-foreground">Tamper Demo</div>
            <p className="text-[12px] text-muted-foreground">See what happens when a single character is altered in a decision record.</p>
            <button
              onClick={() => setTamperDemo(!tamperDemo)}
              className="border border-border text-foreground text-[12px] px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
            >
              {tamperDemo ? 'Reset' : 'Simulate Tamper'}
            </button>
            {tamperDemo && (
              <div className="flex items-center gap-2 text-destructive text-[12px] p-2 bg-destructive/10 rounded-md border border-destructive/30">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                INTEGRITY VIOLATION — Hash mismatch detected. Original: a3f8c2d1... → Tampered: a3f8c2d2...
              </div>
            )}
          </div>
        </div>

        {/* Merkle Timeline */}
        <div className="border border-border bg-card rounded-lg p-4">
          <div className="text-[13px] font-medium text-foreground mb-3">Merkle Batch Timeline — Today</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {merkleBatches.map((b) => (
              <div key={b.id} className="shrink-0 border border-border rounded-md p-2 min-w-[90px] hover:border-primary/30 transition-colors cursor-pointer">
                <div className="text-[10px] font-mono text-muted-foreground">{b.id}</div>
                <div className="text-[11px] text-foreground tabular-nums">{b.time}</div>
                <div className="text-[10px] text-muted-foreground">{b.count} decisions</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
