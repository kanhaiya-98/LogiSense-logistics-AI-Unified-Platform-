import { AppLayout } from '@/components/layout/AppLayout';
import { useState } from 'react';
import { useCascadeNodes } from '@/hooks/useApi';

const incidents = [
  { id: 'INC-001', label: 'CAR-07 Carrier Failure', rootCause: 'Reliability score dropped to 34/100', triggerTime: '14:28:01', blastRadius: 47, slaImpact: '47 potential breaches' },
  { id: 'INC-002', label: 'WH-01 Congestion Overflow', rootCause: 'Load reached 92% capacity', triggerTime: '13:45:22', blastRadius: 12, slaImpact: '12 delayed shipments' },
  { id: 'INC-003', label: 'Delhi Corridor Weather', rootCause: 'Monsoon alert — heavy rainfall', triggerTime: '12:15:33', blastRadius: 8, slaImpact: '8 ETA recalculations' },
];

function nodeColor(risk: number) {
  if (risk > 0.8) return '#EF4444';
  if (risk > 0.5) return '#F59E0B';
  return '#10B981';
}

export default function CascadeFailure() {
  const { data: cascadeNodes = [] } = useCascadeNodes();
  const [selectedIncident, setSelectedIncident] = useState(incidents[0]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const hovered = cascadeNodes.find((n: any) => n.id === hoveredNode);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Cascade Failure Tree</h1>
          <div className="flex gap-2">
            <select
              value={selectedIncident.id}
              onChange={(e) => setSelectedIncident(incidents.find((i) => i.id === e.target.value)!)}
              className="text-[12px] border border-border rounded-md px-2 py-1 bg-card text-foreground"
            >
              {incidents.map((i) => (
                <option key={i.id} value={i.id}>{i.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tree */}
          <div className="lg:col-span-2 border border-border bg-card rounded-lg p-4 relative">
            <svg viewBox="0 0 800 550" className="w-full h-[500px]">
              {/* Root node */}
              <rect x="330" y="10" width="140" height="36" rx="6" fill="#EF4444" opacity="0.15" stroke="#EF4444" strokeWidth="1" />
              <text x="400" y="33" textAnchor="middle" fontSize="11" fill="#EF4444" fontWeight="600">
                {selectedIncident.label}
              </text>

              {/* Lines from root to nodes */}
              {cascadeNodes.map((node: any) => (
                <line
                  key={`line-${node.id}`}
                  x1="400"
                  y1="46"
                  x2={node.x * 1.1 + 100}
                  y2={node.y + 50}
                  stroke={selectedNode === node.id ? nodeColor(node.risk) : 'hsl(var(--border))'}
                  strokeWidth={selectedNode === node.id ? 1.5 : 0.5}
                  opacity={selectedNode && selectedNode !== node.id ? 0.2 : 0.6}
                />
              ))}

              {/* Nodes */}
              {cascadeNodes.map((node: any) => (
                <g
                  key={node.id}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={node.x * 1.1 + 100}
                    cy={node.y + 50}
                    r={selectedNode === node.id ? 8 : 6}
                    fill={nodeColor(node.risk)}
                    opacity={selectedNode && selectedNode !== node.id ? 0.3 : 0.8}
                  />
                  {node.risk > 0.8 && !selectedNode && (
                    <circle cx={node.x * 1.1 + 100} cy={node.y + 50} r="10" fill="none" stroke="#EF4444" strokeWidth="0.5" opacity="0.4">
                      <animate attributeName="r" from="6" to="14" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              ))}
            </svg>

            {/* Tooltip */}
            {hovered && (
              <div className="absolute bottom-4 left-4 bg-card border border-border rounded-lg p-3 shadow-card text-[12px] space-y-1">
                <div className="font-medium text-foreground">{hovered.shipmentId}</div>
                <div className="text-muted-foreground">P(delay): {hovered.risk}</div>
                <div className="text-muted-foreground">SLA Breach: {(hovered.slaBreachProb * 100).toFixed(0)}%</div>
                <div className="text-muted-foreground">Top feature: {hovered.topFeature}</div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            <div className="border border-border bg-card rounded-lg p-4 space-y-3">
              <div className="text-[13px] font-medium text-foreground">Incident Summary</div>
              <div className="space-y-2 text-[12px]">
                <div><span className="text-muted-foreground">Root cause:</span> <span className="text-foreground">{selectedIncident.rootCause}</span></div>
                <div><span className="text-muted-foreground">Trigger:</span> <span className="text-foreground">{selectedIncident.triggerTime}</span></div>
                <div><span className="text-muted-foreground">Blast radius:</span> <span className="text-foreground">{selectedIncident.blastRadius} shipments</span></div>
                <div><span className="text-muted-foreground">SLA Impact:</span> <span className="text-foreground">{selectedIncident.slaImpact}</span></div>
              </div>
            </div>

            <div className="border border-border bg-card rounded-lg p-4 space-y-3">
              <div className="text-[13px] font-medium text-foreground">Action Taken</div>
              <div className="text-[12px] text-foreground">Carrier swap executed — CAR-11 assigned</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-[12px]">
                  <span className="text-destructive">Before: 47 breaches</span>
                  <span className="text-muted-foreground mx-1">→</span>
                  <span className="text-success">After: 0 breaches</span>
                </div>
              </div>
              <button className="text-[12px] text-primary hover:underline">View Blockchain Record →</button>
            </div>

            <div className="flex gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-[11px] text-muted-foreground">&gt;0.8</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-warning" />
                <span className="text-[11px] text-muted-foreground">0.5–0.8</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-[11px] text-muted-foreground">&lt;0.5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
