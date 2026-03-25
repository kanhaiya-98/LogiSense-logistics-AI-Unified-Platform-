/**
 * API client — uses mock data for all list/query endpoints,
 * and calls the FastAPI backend only for Gemini-powered AI features.
 *
 * To deploy: set VITE_API_URL to your backend URL (Railway / Render).
 * If the AI backend is unreachable, AI features fall back gracefully.
 */

import {
  carriers, warehouses, shipments, riskEvents, decisions,
  pendingApprovals, activityFeed, agents, generateCascadeNodes,
  blockchainLog, blockchainStats,
} from './mockData';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── tiny fetch wrapper that throws only on non-ok ──────────────────────────
async function post<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${endpoint}`);
  return res.json();
}

// ── simulate realistic async delay (100–250ms) ─────────────────────────────
const delay = (ms = 150) => new Promise(r => setTimeout(r, ms));

// ── mock state for mutations ───────────────────────────────────────────────
let _carriers = [...carriers];
let _shipments = [...shipments];
let _riskEvents = [...riskEvents];
let _pendingApprovals = [...pendingApprovals];
let _decisions = [...decisions];

// ═══════════════════════════════════════════════════════════════════════════
// Shipments
// ═══════════════════════════════════════════════════════════════════════════
export async function getShipments() {
  await delay();
  return _shipments;
}

export async function rescoreShipment(id: string, _incident_id: string) {
  await delay(300);
  _shipments = _shipments.map(s =>
    s.id === id ? { ...s, anomalyScore: parseFloat((Math.random() * 0.3).toFixed(2)), status: 'IN_TRANSIT' as const } : s
  );
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// Carriers
// ═══════════════════════════════════════════════════════════════════════════
export async function getCarriers() {
  await delay();
  return _carriers;
}

export async function getCarrierReliability() {
  await delay();
  return _carriers.map(c => ({ carrier_id: c.id, name: c.name, reliability: c.onTimeRate, score: c.score, status: c.status }));
}

export async function swapCarrier(carrier_id: string, new_carrier_id: string) {
  await delay(400);
  _shipments = _shipments.map(s =>
    s.carrier === carrier_id ? { ...s, carrier: new_carrier_id } : s
  );
  _decisions = [
    {
      id: `DEC-${String(_decisions.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      action: `Carrier swap ${carrier_id} → ${new_carrier_id}`,
      shipmentIds: 'Multiple',
      hash: Math.random().toString(36).slice(2, 14) + '...',
      merkleBatch: `BATCH-${String(_decisions.length + 10).padStart(3, '0')}`,
      tier: 'Tier 2',
      executedBy: 'HITL (Operator)',
    },
    ..._decisions,
  ];
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// Warehouses
// ═══════════════════════════════════════════════════════════════════════════
export async function getWarehouses() {
  await delay();
  return warehouses;
}

// ═══════════════════════════════════════════════════════════════════════════
// Inventory
// ═══════════════════════════════════════════════════════════════════════════
export async function getInventory() {
  await delay();
  const { warehouseInventory, skuForecasts, transfers } = await import('./mockData');
  return { warehouseInventory, skuForecasts, transfers };
}

export async function generateRebalanceTransfers(_warehouse_id: string, _sku: string) {
  await delay(800);
  return {
    transfers: [
      { id: 'TRF-NEW', sku: _sku, units: Math.floor(Math.random() * 3000) + 500, from: 'WH-03 Bangalore', to: _warehouse_id || 'WH-01 Mumbai', vehicle: 'Rail freight', cost: '₹2,400', co2: '0.4t', eta: '3 days' },
    ],
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Decisions & Blockchain
// ═══════════════════════════════════════════════════════════════════════════
export async function getRecentDecisions() {
  await delay();
  return _decisions;
}

export async function getBlockchainLog() {
  await delay();
  return blockchainLog;
}

export async function getBlockchainStats() {
  await delay();
  return blockchainStats;
}

export async function verifyDecisionOnChain(decision_id: string) {
  await delay(600);
  return { verified: true, decision_id, txHash: '0x' + Math.random().toString(16).slice(2, 42), network: 'Polygon Amoy' };
}

// ═══════════════════════════════════════════════════════════════════════════
// Agent status & activity
// ═══════════════════════════════════════════════════════════════════════════
export async function getAgentStatus() {
  await delay();
  return {
    observer: 'active',
    reasoner: 'active',
    actor: 'active',
    active_anomalies: 3,
    agents,
  };
}

export async function triggerNetworkScan() {
  await delay(1200);
  return { message: 'Network scan triggered', anomalies_detected: Math.floor(Math.random() * 5) };
}

export async function getActivityFeed() {
  await delay();
  return activityFeed;
}

// ═══════════════════════════════════════════════════════════════════════════
// Risk
// ═══════════════════════════════════════════════════════════════════════════
export async function getRiskEvents() {
  await delay();
  return _riskEvents;
}

export async function getCascadeNodes() {
  await delay();
  return generateCascadeNodes();
}

export async function analyzeRiskScenario(scenario: string) {
  // Try AI backend first, fall back to smart mock
  try {
    const res = await post<{ event: any }>('/api/risk/analyze', { scenario });
    const newEvent = res.event;
    _riskEvents = [newEvent, ..._riskEvents];
    return newEvent;
  } catch {
    // Graceful fallback — generate a mock event so the UI still works
    const mockEvent = {
      id: `RISK-${String(_riskEvents.length + 1).padStart(2, '0')}`,
      title: scenario.slice(0, 60) + (scenario.length > 60 ? '…' : ''),
      severity: 'MEDIUM' as const,
      source: 'Gemini AI (offline fallback)',
      affectedShipments: Math.floor(Math.random() * 15) + 3,
      corridors: 'Analysis unavailable — AI backend offline',
      recommendation: 'Please check AI backend connectivity or review manually',
    };
    _riskEvents = [mockEvent, ..._riskEvents];
    return mockEvent;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Decisions (HITL)
// ═══════════════════════════════════════════════════════════════════════════
export async function getPendingCards() {
  await delay();
  return _pendingApprovals.filter(p => p.status === 'pending');
}

export async function resolveCard(incident_id: string, action: string, notes?: string) {
  await delay(400);
  _pendingApprovals = _pendingApprovals.map(p =>
    p.id === incident_id ? { ...p, status: action === 'approve' ? 'approved' as const : 'rejected' as const } : p
  );
  return { success: true, incident_id, action, notes };
}

export async function runDecision(payload: any) {
  await delay(800);
  return { success: true, decision_id: `DEC-${Date.now()}`, payload };
}

// ═══════════════════════════════════════════════════════════════════════════
// ZenETA (Gemini AI)
// ═══════════════════════════════════════════════════════════════════════════
export async function predictETA(payload: any) {
  try {
    return await post('/api/eta/predict', payload);
  } catch {
    const base = Math.floor(Math.random() * 48) + 6;
    return { p50: base, p90: base + 6, p99: base + 14, explanation: 'AI backend offline — using statistical fallback estimates.' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ZenRTO (Gemini AI)
// ═══════════════════════════════════════════════════════════════════════════
export async function scoreOrderRTO(payload: any) {
  try {
    return await post('/api/rto/score', payload);
  } catch {
    const score = parseFloat((Math.random() * 0.9).toFixed(2));
    const level = score > 0.8 ? 'CRITICAL' : score > 0.6 ? 'HIGH' : score > 0.4 ? 'MEDIUM' : 'LOW';
    return {
      rto_score: score,
      risk_level: level,
      action: level === 'CRITICAL' ? 'COD rejected — prepaid offered' : level === 'HIGH' ? 'WhatsApp confirmation sent' : 'Proceed',
      explanation: 'AI backend offline — using heuristic scoring.',
      shap_features: { pincode_rto_rate: 0.3, address_completeness: 0.25, order_value: 0.2, customer_history: 0.15, time_of_day: 0.1 },
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Explainability (Gemini AI)
// ═══════════════════════════════════════════════════════════════════════════
export async function generateCounterfactual(features: any, current_prediction: string) {
  try {
    return await post('/api/explain/counterfactual', { features, current_prediction });
  } catch {
    return {
      counterfactual: `To change prediction from "${current_prediction}", the top adjustments would be: reduce carrier drift by 0.15, improve on-time rate to above 85%, and clear warehouse congestion below 70%.`,
      changes: [
        { feature: 'carrier_drift', current: features.carrier_drift ?? 0.12, target: 0.02, impact: 'HIGH' },
        { feature: 'on_time_rate', current: features.on_time_rate ?? 0.75, target: 0.86, impact: 'HIGH' },
        { feature: 'warehouse_load', current: features.warehouse_load ?? 88, target: 70, impact: 'MEDIUM' },
      ],
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Chat (Gemini AI)
// ═══════════════════════════════════════════════════════════════════════════
export async function chat(message: string, context: any = {}) {
  try {
    return await post<{ reply: string }>('/api/chat/', { message, context });
  } catch {
    // Smart local fallback responses
    const m = message.toLowerCase();
    if (m.includes('carrier') || m.includes('car-07')) {
      return { reply: 'CAR-07 (FastTrack Logistics) is currently CRITICAL with a reliability score of 34/100. I recommend executing a carrier swap to CAR-02 (Blue Dart) or CAR-06 (Xpressbees) for the 47 affected shipments.' };
    }
    if (m.includes('warehouse') || m.includes('wh-01') || m.includes('mumbai')) {
      return { reply: 'WH-01 Mumbai is at 92% capacity — CRITICAL. Recommend redirecting 12 incoming shipments to WH-04 Pune which is at 41% capacity. Estimated congestion relief: 15% within 2 hours.' };
    }
    if (m.includes('risk') || m.includes('cyclone') || m.includes('strike')) {
      return { reply: 'There are 3 active risk events: Cyclone Biparjoy (HIGH) affecting 23 shipments on the Mumbai-Ahmedabad corridor, a Port Strike at JNPT (HIGH) affecting 8 shipments, and a Monsoon Alert (MEDIUM) on the Mumbai-Nashik corridor.' };
    }
    if (m.includes('sla') || m.includes('breach')) {
      return { reply: 'The AI system has prevented 47 SLA breaches in the last 24 hours. Current SLA compliance rate is 96.2%. The Observer agent detected 3 anomalies in the last scan, all routed to the HITL decision queue.' };
    }
    return { reply: 'I\'m LogiSense AI. I can help you with carrier performance, warehouse congestion, shipment risk analysis, ETA predictions, and supply chain decisions. What would you like to know? (Note: AI backend is currently offline — connect to backend for full Gemini responses.)' };
  }
}

// ── Unified api object (for backwards compatibility with useApi.ts hooks) ─
export const api = {
  getShipments,
  getShipment: async (id: string) => { await delay(); return _shipments.find(s => s.id === id) ?? null; },
  rescoreShipment,
  getCarriers,
  getCarrierReliability,
  swapCarrier,
  getWarehouses,
  getInventory,
  generateRebalanceTransfers,
  predictETA,
  scoreOrderRTO,
  runDecision,
  getPendingCards,
  resolveCard,
  getRecentDecisions,
  getBlockchainLog,
  getBlockchainStats,
  verifyDecisionOnChain,
  getAgentStatus,
  triggerNetworkScan,
  getActivityFeed,
  getRiskEvents,
  getCascadeNodes,
  analyzeRiskScenario,
  generateCounterfactual,
  chat,
};
