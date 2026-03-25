// ===== CARRIERS =====
export interface Carrier {
  id: string;
  name: string;
  score: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  onTimeRate: number;
  checkinResponsiveness: number;
  delayMagnitude: number;
  loadAcceptanceRate: number;
  driftVelocity: number;
  projection72h: string;
  sparkline: number[];
}

export const carriers: Carrier[] = [
  { id: 'CAR-01', name: 'Delhivery', score: 87, status: 'HEALTHY', onTimeRate: 0.87, checkinResponsiveness: 0.92, delayMagnitude: 1.2, loadAcceptanceRate: 0.94, driftVelocity: 0.01, projection72h: 'Stable', sparkline: [85, 86, 87, 86, 88, 87, 87] },
  { id: 'CAR-02', name: 'Blue Dart', score: 91, status: 'HEALTHY', onTimeRate: 0.91, checkinResponsiveness: 0.95, delayMagnitude: 0.8, loadAcceptanceRate: 0.96, driftVelocity: 0.005, projection72h: 'Stable', sparkline: [90, 91, 90, 91, 92, 91, 91] },
  { id: 'CAR-03', name: 'DTDC', score: 79, status: 'WARNING', onTimeRate: 0.79, checkinResponsiveness: 0.81, delayMagnitude: 2.1, loadAcceptanceRate: 0.85, driftVelocity: -0.02, projection72h: 'Declining', sparkline: [83, 82, 81, 80, 79, 79, 79] },
  { id: 'CAR-04', name: 'Ecom Express', score: 83, status: 'HEALTHY', onTimeRate: 0.83, checkinResponsiveness: 0.88, delayMagnitude: 1.5, loadAcceptanceRate: 0.90, driftVelocity: 0.01, projection72h: 'Stable', sparkline: [82, 83, 82, 83, 84, 83, 83] },
  { id: 'CAR-05', name: 'Shadowfax', score: 76, status: 'WARNING', onTimeRate: 0.76, checkinResponsiveness: 0.78, delayMagnitude: 2.4, loadAcceptanceRate: 0.82, driftVelocity: -0.015, projection72h: 'Watch', sparkline: [80, 79, 78, 77, 76, 76, 76] },
  { id: 'CAR-06', name: 'Xpressbees', score: 88, status: 'HEALTHY', onTimeRate: 0.88, checkinResponsiveness: 0.91, delayMagnitude: 1.0, loadAcceptanceRate: 0.93, driftVelocity: 0.008, projection72h: 'Stable', sparkline: [86, 87, 87, 88, 88, 88, 88] },
  { id: 'CAR-07', name: 'FastTrack Logistics', score: 34, status: 'CRITICAL', onTimeRate: 0.61, checkinResponsiveness: 0.42, delayMagnitude: 5.8, loadAcceptanceRate: 0.55, driftVelocity: -0.12, projection72h: 'Critical Decline', sparkline: [58, 52, 48, 44, 40, 37, 34] },
  { id: 'CAR-08', name: 'Rivigo', score: 82, status: 'HEALTHY', onTimeRate: 0.82, checkinResponsiveness: 0.86, delayMagnitude: 1.6, loadAcceptanceRate: 0.89, driftVelocity: 0.005, projection72h: 'Stable', sparkline: [81, 82, 81, 82, 82, 82, 82] },
];

// ===== WAREHOUSES =====
export interface Warehouse {
  id: string;
  city: string;
  load: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  throughput: number[];
  forecast: string;
  inboundQueue: number;
  x: number;
  y: number;
}

export const warehouses: Warehouse[] = [
  { id: 'WH-01', city: 'Mumbai', load: 92, status: 'CRITICAL', throughput: [78, 82, 85, 88, 90, 91, 92], forecast: 'Projected to hit 95% in 45min', inboundQueue: 24, x: 180, y: 340 },
  { id: 'WH-02', city: 'Delhi', load: 78, status: 'WARNING', throughput: [65, 68, 70, 73, 75, 77, 78], forecast: 'Projected to hit 85% in 1h 40min', inboundQueue: 15, x: 210, y: 130 },
  { id: 'WH-03', city: 'Bangalore', load: 45, status: 'HEALTHY', throughput: [42, 43, 44, 44, 45, 45, 45], forecast: 'Stable at current levels', inboundQueue: 6, x: 210, y: 420 },
  { id: 'WH-04', city: 'Pune', load: 41, status: 'HEALTHY', throughput: [38, 39, 40, 40, 41, 41, 41], forecast: 'Stable at current levels', inboundQueue: 4, x: 195, y: 350 },
];

// ===== AQI =====
export interface AQIData {
  city: string;
  aqi: number;
  status: 'Good' | 'Moderate' | 'Poor' | 'Hazardous';
}

export const aqiData: AQIData[] = [
  { city: 'Delhi', aqi: 280, status: 'Poor' },
  { city: 'Mumbai', aqi: 142, status: 'Moderate' },
  { city: 'Bangalore', aqi: 78, status: 'Good' },
  { city: 'Chennai', aqi: 95, status: 'Moderate' },
  { city: 'Pune', aqi: 110, status: 'Moderate' },
];

// ===== SHIPMENTS =====
export type ShipmentStatus = 'IN_TRANSIT' | 'DELAYED' | 'AT_RISK' | 'DELIVERED';

export interface Shipment {
  id: string;
  origin: string;
  destination: string;
  carrier: string;
  status: ShipmentStatus;
  eta: string;
  slaDeadline: string;
  anomalyScore: number;
  lastUpdate: string;
  p50: number;
  p90: number;
  p99: number;
}

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];
const statuses: ShipmentStatus[] = ['IN_TRANSIT', 'DELAYED', 'AT_RISK', 'DELIVERED'];
const carrierIds = carriers.map(c => c.id);

function generateShipments(count: number): Shipment[] {
  const shipments: Shipment[] = [];
  for (let i = 1; i <= count; i++) {
    const origin = cities[i % cities.length];
    let dest = cities[(i + 3) % cities.length];
    if (dest === origin) dest = cities[(i + 5) % cities.length];
    const isCar07 = i <= 47;
    const carrier = isCar07 ? 'CAR-07' : carrierIds[i % carrierIds.length];
    const status: ShipmentStatus = isCar07
      ? (i <= 15 ? 'AT_RISK' : i <= 35 ? 'DELAYED' : 'IN_TRANSIT')
      : statuses[i % 4];
    const anomaly = isCar07 ? 0.65 + Math.random() * 0.35 : Math.random() * 0.5;
    const hoursAgo = Math.floor(Math.random() * 48);
    const etaHours = Math.floor(Math.random() * 72) + 6;
    const slaHours = etaHours + Math.floor(Math.random() * 12);

    shipments.push({
      id: `SHP-${String(i).padStart(4, '0')}`,
      origin,
      destination: dest,
      carrier,
      status,
      eta: `${etaHours}h`,
      slaDeadline: `${slaHours}h`,
      anomalyScore: parseFloat(anomaly.toFixed(2)),
      lastUpdate: `${hoursAgo > 0 ? hoursAgo + 'h ago' : 'Just now'}`,
      p50: etaHours - 2,
      p90: etaHours + 4,
      p99: etaHours + 10,
    });
  }
  return shipments;
}

export const shipments = generateShipments(50);

// ===== ACTIVITY FEED =====
export interface ActivityItem {
  id: number;
  message: string;
  time: string;
  type: 'critical' | 'warning' | 'info' | 'success';
}

export const activityFeed: ActivityItem[] = [
  { id: 1, message: 'CAR-07 flagged CRITICAL — reliability score 34/100', time: '3s ago', type: 'critical' },
  { id: 2, message: 'Carrier swap executed: CAR-11 assigned to 47 shipments', time: '12s ago', type: 'success' },
  { id: 3, message: 'SLA breach counter: 47 → 0 breaches prevented', time: '14s ago', type: 'success' },
  { id: 4, message: 'Merkle root anchored to Polygon — Batch #12', time: '2min ago', type: 'info' },
  { id: 5, message: 'WH-01 Mumbai congestion alert — 92% capacity', time: '4min ago', type: 'warning' },
  { id: 6, message: 'AQI Delhi auto-triggered CARBON_FIRST policy', time: '8min ago', type: 'warning' },
  { id: 7, message: 'ETA re-estimation complete for Delhi corridor', time: '11min ago', type: 'info' },
  { id: 8, message: '62-shipment reroute approved via HITL — CARBON option', time: '15min ago', type: 'success' },
  { id: 9, message: 'Red Team stress test: 85% viability confirmed', time: '18min ago', type: 'info' },
  { id: 10, message: 'Observer Agent scan complete — 3 anomalies detected', time: '22min ago', type: 'warning' },
];

// ===== AGENTS =====
export interface AgentStatus {
  name: string;
  status: 'Active' | 'Idle' | 'Processing';
  lastRun: string;
  action: string;
}

export const agents: AgentStatus[] = [
  { name: 'Observer', status: 'Active', lastRun: '3s ago', action: 'Scanning carrier telemetry' },
  { name: 'Reasoner', status: 'Processing', lastRun: '12s ago', action: 'Evaluating cascade risk for CAR-07' },
  { name: 'Actor', status: 'Active', lastRun: '14s ago', action: 'Executing carrier swap' },
  { name: 'Learner', status: 'Idle', lastRun: '2min ago', action: 'Awaiting next feedback cycle' },
];

// ===== DECISIONS =====
export interface Decision {
  id: string;
  timestamp: string;
  action: string;
  shipmentIds: string;
  hash: string;
  merkleBatch: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  executedBy: string;
}

export const decisions: Decision[] = [
  { id: 'DEC-001', timestamp: '2024-03-24 14:32:01', action: 'Carrier swap CAR-07 → CAR-11', shipmentIds: 'SHP-0001..0047', hash: 'a3f8c2d1e5b7...9k4m', merkleBatch: 'BATCH-012', tier: 'Tier 2', executedBy: 'HITL (Operator)' },
  { id: 'DEC-002', timestamp: '2024-03-24 14:28:15', action: '62-shipment reroute — Delhi corridor', shipmentIds: 'SHP-0100..0162', hash: 'b7e2f1a8c3d9...2j7n', merkleBatch: 'BATCH-011', tier: 'Tier 2', executedBy: 'HITL (Operator)' },
  { id: 'DEC-003', timestamp: '2024-03-24 14:15:44', action: 'WH-01 overflow redirect to WH-04', shipmentIds: 'SHP-0200..0212', hash: 'c1d5e8f2a7b3...8p2q', merkleBatch: 'BATCH-010', tier: 'Tier 1', executedBy: 'Auto (Agent)' },
  { id: 'DEC-004', timestamp: '2024-03-24 13:58:22', action: 'ETA recalculation — monsoon delay', shipmentIds: 'SHP-0050..0065', hash: 'd9a3b7c1e5f8...4r6s', merkleBatch: 'BATCH-009', tier: 'Tier 1', executedBy: 'Auto (Agent)' },
  { id: 'DEC-005', timestamp: '2024-03-24 13:42:11', action: 'CARBON_FIRST policy activation', shipmentIds: 'ALL', hash: 'e5f1a2b8c3d7...1t9u', merkleBatch: 'BATCH-008', tier: 'Tier 1', executedBy: 'Auto (Agent)' },
];

// ===== PENDING APPROVALS =====
export interface PendingApproval {
  id: string;
  title: string;
  stressTest: string;
  worstCase: string;
  options: {
    type: string;
    costDelta: string;
    etaDelta: string;
    co2Delta: string;
    slaRisk: string;
    recommended: boolean;
  }[];
  status: 'pending' | 'approved' | 'rejected';
}

export const pendingApprovals: PendingApproval[] = [
  {
    id: 'APR-001',
    title: '62-Shipment Reroute — Delhi Corridor',
    stressTest: '85% viable',
    worstCase: '3 shipments +2hrs · 12% probability',
    options: [
      { type: 'COST', costDelta: '-₹12,400', etaDelta: '+45min', co2Delta: '+1.2kg', slaRisk: '4%', recommended: false },
      { type: 'SPEED', costDelta: '+₹2,100', etaDelta: 'On time', co2Delta: '+2.1kg', slaRisk: '1%', recommended: false },
      { type: 'CARBON', costDelta: '+₹800', etaDelta: '+20min', co2Delta: '-2.4kg', slaRisk: '2%', recommended: true },
    ],
    status: 'pending',
  },
  {
    id: 'APR-002',
    title: 'Carrier Swap — CAR-07 Critical Failure',
    stressTest: '92% viable',
    worstCase: '5 shipments +1hr · 8% probability',
    options: [
      { type: 'COST', costDelta: '-₹8,200', etaDelta: '+30min', co2Delta: '+0.8kg', slaRisk: '3%', recommended: false },
      { type: 'SPEED', costDelta: '+₹4,500', etaDelta: 'On time', co2Delta: '+1.5kg', slaRisk: '0.5%', recommended: false },
      { type: 'CARBON', costDelta: '+₹1,200', etaDelta: '+15min', co2Delta: '-1.8kg', slaRisk: '1%', recommended: true },
    ],
    status: 'pending',
  },
  {
    id: 'APR-003',
    title: 'WH-01 Overflow Redirect — 12 Shipments to WH-04',
    stressTest: '78% viable',
    worstCase: '2 shipments +3hrs · 18% probability',
    options: [
      { type: 'COST', costDelta: '-₹3,100', etaDelta: '+1hr', co2Delta: '+0.5kg', slaRisk: '6%', recommended: false },
      { type: 'SPEED', costDelta: '+₹1,800', etaDelta: '+15min', co2Delta: '+1.0kg', slaRisk: '2%', recommended: true },
      { type: 'CARBON', costDelta: '+₹600', etaDelta: '+30min', co2Delta: '-0.9kg', slaRisk: '3%', recommended: false },
    ],
    status: 'pending',
  },
];

// ===== FEATURES =====
export interface Feature {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const features: Feature[] = [
  { id: 'F1', name: 'Anomaly Detection', description: 'Real-time carrier and shipment anomaly scoring using ensemble ML models', icon: 'AlertTriangle' },
  { id: 'F2', name: 'Cascade Failure', description: 'Force-directed tree analysis of multi-hop failure propagation', icon: 'GitBranch' },
  { id: 'F3', name: 'Carrier Intelligence', description: 'Bayesian reliability scoring with drift detection and 72h projection', icon: 'Truck' },
  { id: 'F4', name: 'Warehouse Congestion', description: 'ARIMA-based warehouse load forecasting with overflow prediction', icon: 'Warehouse' },
  { id: 'F5', name: 'Red Team Stress Testing', description: 'Monte Carlo simulation of worst-case scenarios before execution', icon: 'Shield' },
  { id: 'F6', name: 'HITL Decision Engine', description: 'Human-in-the-loop with Pareto options and tiered autonomy', icon: 'UserCheck' },
  { id: 'F7', name: 'ETA Re-Estimation', description: 'Dynamic ETA recalculation with p50/p90/p99 confidence intervals', icon: 'Clock' },
  { id: 'F8', name: 'XAI Engine', description: 'SHAP attribution, counterfactual analysis, and calibration monitoring', icon: 'Brain' },
  { id: 'F9', name: 'Blockchain Audit', description: 'Tamper-proof decision logging with Merkle tree anchoring on Polygon', icon: 'Link' },
  { id: 'F10', name: 'Outcome Learning', description: 'Continuous model retraining with MLflow versioning and drift detection', icon: 'TrendingUp' },
  { id: 'F11', name: 'Geopolitical Risk', description: 'Weather, port strikes, and geopolitical event monitoring via GDELT/NewsAPI', icon: 'Globe' },
  { id: 'F12', name: 'RTO Fraud Detection', description: 'COD fraud scoring with PIN-code-level RTO rate analysis', icon: 'ShieldAlert' },
  { id: 'F13', name: 'Inventory Rebalancing', description: '3-agent crew for demand forecasting, strategy, and transfer orchestration', icon: 'Package' },
];

// ===== SLA CHART DATA =====
export const slaChartData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  breaches: Math.floor(Math.random() * 8),
  prevented: Math.floor(Math.random() * 15) + 5,
}));

// ===== RTO ORDERS =====
export interface RTOOrder {
  id: string;
  customer: string;
  pinCode: string;
  rtoScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  action: string;
  pincodeRtoRate: number;
  addressCompleteness: number;
  orderValue: string;
}

export const rtoOrders: RTOOrder[] = [
  { id: 'ORD-5501', customer: 'Raj ***', pinCode: '110001', rtoScore: 0.23, riskLevel: 'LOW', action: 'Proceed', pincodeRtoRate: 0.12, addressCompleteness: 0.95, orderValue: 'LOW' },
  { id: 'ORD-5502', customer: 'Priya ***', pinCode: '400001', rtoScore: 0.45, riskLevel: 'MEDIUM', action: 'Monitor', pincodeRtoRate: 0.18, addressCompleteness: 0.78, orderValue: 'MEDIUM' },
  { id: 'ORD-5503', customer: 'Amit ***', pinCode: '560001', rtoScore: 0.67, riskLevel: 'MEDIUM', action: 'WhatsApp sent', pincodeRtoRate: 0.22, addressCompleteness: 0.65, orderValue: 'HIGH' },
  { id: 'ORD-5504', customer: 'Neha ***', pinCode: '226001', rtoScore: 0.87, riskLevel: 'HIGH', action: 'Held for review', pincodeRtoRate: 0.31, addressCompleteness: 0.40, orderValue: 'HIGH' },
  { id: 'ORD-5505', customer: 'Vikram ***', pinCode: '302001', rtoScore: 0.92, riskLevel: 'HIGH', action: 'WhatsApp sent', pincodeRtoRate: 0.35, addressCompleteness: 0.38, orderValue: 'MEDIUM' },
  { id: 'ORD-5506', customer: 'Sania ***', pinCode: '500001', rtoScore: 0.96, riskLevel: 'CRITICAL', action: 'COD rejected — prepaid offered', pincodeRtoRate: 0.42, addressCompleteness: 0.25, orderValue: 'HIGH' },
  { id: 'ORD-5507', customer: 'Karan ***', pinCode: '110092', rtoScore: 0.34, riskLevel: 'LOW', action: 'Proceed', pincodeRtoRate: 0.14, addressCompleteness: 0.88, orderValue: 'LOW' },
  { id: 'ORD-5508', customer: 'Meera ***', pinCode: '600001', rtoScore: 0.55, riskLevel: 'MEDIUM', action: 'WhatsApp sent', pincodeRtoRate: 0.20, addressCompleteness: 0.60, orderValue: 'MEDIUM' },
  { id: 'ORD-5509', customer: 'Arjun ***', pinCode: '700001', rtoScore: 0.78, riskLevel: 'HIGH', action: 'WhatsApp sent', pincodeRtoRate: 0.28, addressCompleteness: 0.45, orderValue: 'HIGH' },
  { id: 'ORD-5510', customer: 'Divya ***', pinCode: '380001', rtoScore: 0.41, riskLevel: 'MEDIUM', action: 'Monitor', pincodeRtoRate: 0.16, addressCompleteness: 0.72, orderValue: 'LOW' },
];

// ===== RISK EVENTS =====
export interface RiskEvent {
  id: string;
  title: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  source: string;
  affectedShipments: number;
  corridors: string;
  recommendation: string;
}

export const riskEvents: RiskEvent[] = [
  { id: 'RISK-01', title: 'Cyclone Biparjoy — Gujarat coast', severity: 'HIGH', source: 'OpenWeatherMap', affectedShipments: 23, corridors: 'Mumbai-Ahmedabad, Surat-Rajkot', recommendation: 'Reroute via inland corridor' },
  { id: 'RISK-02', title: 'Monsoon Alert — Mumbai-Nashik corridor', severity: 'MEDIUM', source: 'OpenWeatherMap', affectedShipments: 11, corridors: 'Mumbai-Nashik, Mumbai-Pune', recommendation: 'Add 4hr buffer to ETAs' },
  { id: 'RISK-03', title: 'Port Strike — JNPT Mumbai', severity: 'HIGH', source: 'GDELT', affectedShipments: 8, corridors: 'Mumbai port operations', recommendation: 'Divert to Mundra port' },
];

// ===== RETURN CASES =====
export interface ReturnCase {
  id: string;
  orderId: string;
  damageClass: 'NONE' | 'MINOR' | 'MAJOR' | 'TOTAL_LOSS';
  routing: string;
}

export const returnCases: ReturnCase[] = [
  { id: 'RET-01', orderId: 'ORD-4401', damageClass: 'NONE', routing: '→ Refurbishment' },
  { id: 'RET-02', orderId: 'ORD-4402', damageClass: 'MINOR', routing: '→ Refurbishment' },
  { id: 'RET-03', orderId: 'ORD-4403', damageClass: 'MAJOR', routing: '→ Full Refund' },
  { id: 'RET-04', orderId: 'ORD-4404', damageClass: 'TOTAL_LOSS', routing: '→ Liquidation' },
  { id: 'RET-05', orderId: 'ORD-4405', damageClass: 'NONE', routing: '→ Refurbishment' },
];

// ===== CASCADE NODES =====
export interface CascadeNode {
  id: string;
  shipmentId: string;
  risk: number;
  slaBreachProb: number;
  topFeature: string;
  x: number;
  y: number;
}

export function generateCascadeNodes(): CascadeNode[] {
  const nodes: CascadeNode[] = [];
  for (let i = 0; i < 47; i++) {
    nodes.push({
      id: `node-${i}`,
      shipmentId: `SHP-${String(i + 1).padStart(4, '0')}`,
      risk: parseFloat((0.3 + Math.random() * 0.7).toFixed(2)),
      slaBreachProb: parseFloat((Math.random() * 0.9).toFixed(2)),
      topFeature: ['carrier_drift', 'warehouse_load', 'eta_lag', 'aqi_flag', 'on_time_rate'][i % 5],
      x: 100 + (i % 8) * 90 + (Math.random() * 30 - 15),
      y: 80 + Math.floor(i / 8) * 80 + (Math.random() * 20 - 10),
    });
  }
  return nodes;
}

// ===== INVENTORY SKUs =====
export interface SKUForecast {
  sku: string;
  region: string;
  forecast: number[];
  alert?: string;
}

export const skuForecasts: SKUForecast[] = [
  { sku: 'SKU-441', region: 'Maharashtra', forecast: [120, 130, 145, 180, 280, 350, 420], alert: '3× Diwali spike detected 4 days out' },
  { sku: 'SKU-89', region: 'Delhi NCR', forecast: [200, 210, 215, 220, 225, 230, 235] },
  { sku: 'SKU-204', region: 'Karnataka', forecast: [90, 88, 92, 95, 93, 90, 91] },
  { sku: 'SKU-112', region: 'Tamil Nadu', forecast: [150, 155, 160, 158, 162, 165, 170] },
  { sku: 'SKU-337', region: 'Gujarat', forecast: [75, 78, 80, 82, 85, 88, 90] },
];

export interface WarehouseInventory {
  warehouse: string;
  skus: { sku: string; current: number; safetyStock: number; status: 'surplus' | 'deficit' | 'ok' }[];
}

export const warehouseInventory: WarehouseInventory[] = [
  { warehouse: 'WH-01 Mumbai', skus: [
    { sku: 'SKU-441', current: 500, safetyStock: 800, status: 'deficit' },
    { sku: 'SKU-89', current: 300, safetyStock: 200, status: 'surplus' },
    { sku: 'SKU-204', current: 150, safetyStock: 150, status: 'ok' },
  ]},
  { warehouse: 'WH-02 Delhi', skus: [
    { sku: 'SKU-441', current: 200, safetyStock: 300, status: 'deficit' },
    { sku: 'SKU-89', current: 450, safetyStock: 250, status: 'surplus' },
    { sku: 'SKU-112', current: 180, safetyStock: 180, status: 'ok' },
  ]},
  { warehouse: 'WH-03 Bangalore', skus: [
    { sku: 'SKU-204', current: 400, safetyStock: 200, status: 'surplus' },
    { sku: 'SKU-337', current: 100, safetyStock: 120, status: 'deficit' },
    { sku: 'SKU-441', current: 150, safetyStock: 150, status: 'ok' },
  ]},
  { warehouse: 'WH-04 Pune', skus: [
    { sku: 'SKU-441', current: 100, safetyStock: 400, status: 'deficit' },
    { sku: 'SKU-89', current: 200, safetyStock: 150, status: 'surplus' },
    { sku: 'SKU-112', current: 90, safetyStock: 100, status: 'deficit' },
  ]},
];

// ===== TRANSFERS =====
export interface Transfer {
  id: string;
  sku: string;
  units: number;
  from: string;
  to: string;
  vehicle: string;
  cost: string;
  co2: string;
  eta: string;
}

export const transfers: Transfer[] = [
  { id: 'TRF-01', sku: 'SKU-441', units: 5000, from: 'WH-03 Bangalore', to: 'WH-04 Pune', vehicle: 'Return-leg truck', cost: '₹4,200', co2: '0.8t', eta: '4 days before spike' },
  { id: 'TRF-02', sku: 'SKU-89', units: 2000, from: 'WH-02 Delhi', to: 'WH-01 Mumbai', vehicle: 'Rail freight', cost: '₹1,800', co2: '0.3t', eta: '2 days' },
];

// ===== BLOCKCHAIN LOG =====
export interface BlockchainEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  hash: string;
  prevHash: string;
  batch: string;
  verified: boolean;
}

export const blockchainLog: BlockchainEntry[] = [
  { id: 'BLK-012', timestamp: '2026-03-25 19:32:01', action: 'Carrier swap CAR-07 → CAR-11 (47 shipments)', actor: 'HITL Operator', hash: 'a3f8c2d1e5b70f92', prevHash: 'b7e2f1a8c3d94d81', batch: 'BATCH-012', verified: true },
  { id: 'BLK-011', timestamp: '2026-03-25 19:28:15', action: '62-shipment reroute — Delhi corridor | CARBON policy', actor: 'HITL Operator', hash: 'b7e2f1a8c3d94d81', prevHash: 'c1d5e8f2a7b32a64', batch: 'BATCH-011', verified: true },
  { id: 'BLK-010', timestamp: '2026-03-25 19:15:44', action: 'WH-01 overflow → WH-04 redirect (12 shipments)', actor: 'Auto (Observer)', hash: 'c1d5e8f2a7b32a64', prevHash: 'd9a3b7c1e5f81c57', batch: 'BATCH-010', verified: true },
  { id: 'BLK-009', timestamp: '2026-03-25 18:58:22', action: 'ETA recalculation — monsoon delay (15 shipments)', actor: 'Auto (Reasoner)', hash: 'd9a3b7c1e5f81c57', prevHash: 'e5f1a2b8c3d73b29', batch: 'BATCH-009', verified: true },
  { id: 'BLK-008', timestamp: '2026-03-25 18:42:11', action: 'CARBON_FIRST policy activation — all routes', actor: 'Auto (Actor)', hash: 'e5f1a2b8c3d73b29', prevHash: 'f2a8b3c7d1e94a18', batch: 'BATCH-008', verified: true },
  { id: 'BLK-007', timestamp: '2026-03-25 18:21:55', action: 'AQI Delhi > 250 — carbon surcharge applied', actor: 'Auto (Observer)', hash: 'f2a8b3c7d1e94a18', prevHash: '1a2b3c4d5e6f7a8b', batch: 'BATCH-007', verified: true },
  { id: 'BLK-006', timestamp: '2026-03-25 17:55:30', action: 'Red Team stress test — 85% viability confirmed', actor: 'System', hash: '1a2b3c4d5e6f7a8b', prevHash: '2b3c4d5e6f7a8b9c', batch: 'BATCH-006', verified: true },
];

export const blockchainStats = {
  total_blocks: 12,
  verified_blocks: 12,
  pending_verification: 0,
  last_merkle_root: '0x7f3a...dc91',
  network: 'Polygon Amoy (Testnet)',
  total_decisions_anchored: 47,
};
