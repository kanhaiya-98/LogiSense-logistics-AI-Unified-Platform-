"""
LogiSense AI Backend — Standalone FastAPI
==========================================
Only requires GEMINI_API_KEY (+ GEMINI_MODEL optional).
All non-AI endpoints return rich mock data so the frontend works
100% without Supabase, Redis, or any other service.

Environment variables:
  GEMINI_API_KEY   (required for AI features)
  GEMINI_MODEL     (optional, default: gemini-2.0-flash)
  PORT             (optional, default: 8000)

Deploy on Railway / Render / Fly.io — just set GEMINI_API_KEY.
"""

import os, hashlib, json, random, time, uuid
from datetime import datetime, timedelta
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── Gemini SDK ─────────────────────────────────────────────
try:
    from google import genai as _genai
    from google.genai import types as _types
    GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    if GEMINI_KEY:
        _client = _genai.Client(api_key=GEMINI_KEY)
    else:
        _client = None
except ImportError:
    _client = None
    GEMINI_KEY = ""
    GEMINI_MODEL = "gemini-2.0-flash"


# ── App setup ──────────────────────────────────────────────
app = FastAPI(
    title="LogiSense AI Platform",
    description="End-to-end AI logistics OS — Risk, ETA, RTO, Chat & Blockchain",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Gemini helper ──────────────────────────────────────────
def gemini(prompt: str, system: str = "") -> str:
    if not _client:
        raise RuntimeError("GEMINI_API_KEY not configured")
    contents = []
    if system:
        contents.append(system + "\n\n" + prompt)
    else:
        contents.append(prompt)
    response = _client.models.generate_content(model=GEMINI_MODEL, contents=contents)
    return response.text.strip()

# ── In-memory state (resets on restart — fine for demo) ────
_risk_events: list[dict] = [
    {"id": "RISK-01", "title": "Cyclone Biparjoy — Gujarat coast", "severity": "HIGH",
     "source": "OpenWeatherMap", "affected_shipments": 23,
     "corridors": "Mumbai-Ahmedabad, Surat-Rajkot", "recommendation": "Reroute via inland corridor"},
    {"id": "RISK-02", "title": "Monsoon Alert — Mumbai-Nashik corridor", "severity": "MEDIUM",
     "source": "OpenWeatherMap", "affected_shipments": 11,
     "corridors": "Mumbai-Nashik, Mumbai-Pune", "recommendation": "Add 4hr buffer to ETAs"},
    {"id": "RISK-03", "title": "Port Strike — JNPT Mumbai", "severity": "HIGH",
     "source": "GDELT", "affected_shipments": 8,
     "corridors": "Mumbai port operations", "recommendation": "Divert to Mundra port"},
]

_blockchain_log: list[dict] = [
    {"id": "BLK-012", "timestamp": "2026-03-25 19:32:01", "action": "Carrier swap CAR-07→CAR-11 (47 shipments)", "actor": "HITL Operator", "hash": "a3f8c2d1e5b70f92", "prev_hash": "b7e2f1a8c3d94d81", "batch": "BATCH-012", "verified": True},
    {"id": "BLK-011", "timestamp": "2026-03-25 19:28:15", "action": "62-shipment reroute — Delhi corridor", "actor": "HITL Operator", "hash": "b7e2f1a8c3d94d81", "prev_hash": "c1d5e8f2a7b32a64", "batch": "BATCH-011", "verified": True},
    {"id": "BLK-010", "timestamp": "2026-03-25 19:15:44", "action": "WH-01 overflow → WH-04 redirect", "actor": "Auto (Observer)", "hash": "c1d5e8f2a7b32a64", "prev_hash": "d9a3b7c1e5f81c57", "batch": "BATCH-010", "verified": True},
]

# ─────────────────────────────────────────────────────────────
# Pydantic request models
# ─────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    context: dict = {}

class RiskAnalysisRequest(BaseModel):
    scenario: str

class ETARequest(BaseModel):
    origin: str = "Mumbai"
    destination: str = "Delhi"
    carrier: str = "CAR-01"
    distance_km: float = 1400
    weather_score: float = 0.8
    warehouse_load: float = 0.6
    aqi: float = 150
    historical_delay_hrs: float = 2.0

class RTORequest(BaseModel):
    order_id: str = "ORD-001"
    customer_name: str = "Customer"
    pincode: str = "110001"
    address_completeness: float = 0.85
    order_value: str = "MEDIUM"
    payment_mode: str = "COD"
    pincode_rto_rate: float = 0.15
    customer_order_count: int = 3

class CounterfactualRequest(BaseModel):
    features: dict
    current_prediction: str

# ─────────────────────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "LogiSense AI Backend",
        "gemini_ready": _client is not None,
        "model": GEMINI_MODEL if _client else None,
    }

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# ─────────────────────────────────────────────────────────────
# Chat — Gemini conversational logistics assistant
# ─────────────────────────────────────────────────────────────
LOGISTICS_SYSTEM = """You are LogiSense AI, an expert logistics intelligence assistant.
You help operators understand carrier performance, warehouse congestion, shipment risk,
ETA predictions, and supply-chain decisions. Be concise and data-driven. Keep responses
under 150 words unless depth is needed. Always refer to real logistics concepts."""

@app.post("/api/chat/")
def chat(req: ChatRequest):
    try:
        reply = gemini(req.message, LOGISTICS_SYSTEM)
    except Exception as e:
        # Smart fallback
        m = req.message.lower()
        if "carrier" in m or "car-07" in m:
            reply = "CAR-07 (FastTrack Logistics) is CRITICAL — reliability score 34/100. Recommend swapping 47 shipments to CAR-02 (Blue Dart) or CAR-06 (Xpressbees)."
        elif "warehouse" in m or "wh-01" in m:
            reply = "WH-01 Mumbai is at 92% capacity — CRITICAL. Redirect 12 incoming shipments to WH-04 Pune (41% load). Estimated relief: 15% within 2 hours."
        else:
            reply = f"I'm LogiSense AI. I can help with carrier performance, warehouse congestion, risk analysis, and ETA predictions. (AI offline: {str(e)[:60]})"
    return {"reply": reply}

# ─────────────────────────────────────────────────────────────
# Risk — AI analysis of custom scenarios
# ─────────────────────────────────────────────────────────────
@app.get("/api/risk/events")
def get_risk_events():
    return _risk_events

@app.post("/api/risk/analyze")
def analyze_risk(req: RiskAnalysisRequest):
    prompt = f"""Analyze this logistics risk scenario and respond in JSON:
Scenario: {req.scenario}

Return ONLY valid JSON with this exact structure:
{{
  "id": "RISK-AUTO",
  "title": "Short event title (max 60 chars)",
  "severity": "HIGH" or "MEDIUM" or "LOW",
  "source": "Gemini AI",
  "affected_shipments": <number 1-50>,
  "corridors": "Affected route corridors",
  "recommendation": "Specific actionable recommendation"
}}"""
    try:
        raw = gemini(prompt)
        # Extract JSON from response
        start = raw.find('{')
        end = raw.rfind('}') + 1
        event = json.loads(raw[start:end])
        event["id"] = f"RISK-{len(_risk_events) + 1:02d}"
        _risk_events.insert(0, event)
        return {"event": event}
    except Exception as e:
        # Fallback mock event
        fallback = {
            "id": f"RISK-{len(_risk_events) + 1:02d}",
            "title": req.scenario[:60],
            "severity": "MEDIUM",
            "source": "Gemini AI (parse error)",
            "affected_shipments": random.randint(5, 20),
            "corridors": "Under analysis",
            "recommendation": "Manual review recommended",
        }
        _risk_events.insert(0, fallback)
        return {"event": fallback}

@app.get("/api/risk/cascade")
def get_cascade():
    nodes = []
    for i in range(47):
        nodes.append({
            "id": f"node-{i}",
            "shipmentId": f"SHP-{i+1:04d}",
            "risk": round(0.3 + random.random() * 0.7, 2),
            "slaBreachProb": round(random.random() * 0.9, 2),
            "topFeature": ["carrier_drift","warehouse_load","eta_lag","aqi_flag","on_time_rate"][i % 5],
            "x": 100 + (i % 8) * 90,
            "y": 80 + (i // 8) * 80,
        })
    return nodes

# ─────────────────────────────────────────────────────────────
# ETA Prediction — Gemini quantile regression
# ─────────────────────────────────────────────────────────────
@app.post("/api/eta/predict")
def predict_eta(req: ETARequest):
    prompt = f"""You are an ETA prediction model for Indian logistics.

Shipment details:
- Route: {req.origin} → {req.destination} ({req.distance_km} km)
- Carrier: {req.carrier}
- Weather score (0-1, higher=better): {req.weather_score}
- Warehouse load at destination (0-1): {req.warehouse_load}
- AQI at origin: {req.aqi}
- Historical avg delay for this route: {req.historical_delay_hrs} hours

Calculate ETA percentile predictions and return ONLY valid JSON:
{{
  "p50": <median ETA in hours>,
  "p90": <90th percentile ETA in hours>,
  "p99": <99th percentile ETA in hours>,
  "explanation": "Two sentence explanation of key delay factors"
}}"""
    try:
        raw = gemini(prompt)
        start = raw.find('{')
        end = raw.rfind('}') + 1
        result = json.loads(raw[start:end])
        return result
    except:
        base = req.distance_km / 60 + req.historical_delay_hrs
        return {
            "p50": round(base, 1),
            "p90": round(base * 1.3, 1),
            "p99": round(base * 1.7, 1),
            "explanation": f"Estimated based on {req.distance_km}km at average 60kmh with {req.historical_delay_hrs}h historical delay.",
        }

# ─────────────────────────────────────────────────────────────
# RTO Scoring — Gemini fraud detection
# ─────────────────────────────────────────────────────────────
@app.post("/api/rto/score")
def score_rto(req: RTORequest):
    prompt = f"""You are an RTO (Return to Origin) fraud detection model for Indian e-commerce.

Order details:
- Order ID: {req.order_id}
- Pincode: {req.pincode}
- Pincode RTO rate: {req.pincode_rto_rate:.0%}
- Address completeness: {req.address_completeness:.0%}
- Order value tier: {req.order_value}
- Payment mode: {req.payment_mode}
- Customer historical orders: {req.customer_order_count}

Predict RTO risk and return ONLY valid JSON:
{{
  "rto_score": <float 0.0-1.0>,
  "risk_level": "LOW" or "MEDIUM" or "HIGH" or "CRITICAL",
  "action": "Proceed" or "Monitor" or "WhatsApp confirmation sent" or "COD rejected — prepaid offered",
  "explanation": "Two sentence explanation",
  "shap_features": {{
    "pincode_rto_rate": <0-1 importance>,
    "address_completeness": <0-1 importance>,
    "order_value": <0-1 importance>,
    "customer_history": <0-1 importance>,
    "payment_mode": <0-1 importance>
  }}
}}"""
    try:
        raw = gemini(prompt)
        start = raw.find('{')
        end = raw.rfind('}') + 1
        result = json.loads(raw[start:end])
        return result
    except:
        score = req.pincode_rto_rate * 0.4 + (1 - req.address_completeness) * 0.35 + (0.2 if req.payment_mode == "COD" else 0.0) + 0.05
        score = min(0.99, max(0.01, score))
        level = "CRITICAL" if score > 0.8 else "HIGH" if score > 0.6 else "MEDIUM" if score > 0.4 else "LOW"
        return {
            "rto_score": round(score, 2),
            "risk_level": level,
            "action": "COD rejected — prepaid offered" if level == "CRITICAL" else "WhatsApp confirmation sent" if level in ["HIGH", "MEDIUM"] else "Proceed",
            "explanation": f"Pincode {req.pincode} has {req.pincode_rto_rate:.0%} RTO rate. Address completeness is {req.address_completeness:.0%}.",
            "shap_features": {"pincode_rto_rate": 0.35, "address_completeness": 0.30, "order_value": 0.15, "customer_history": 0.12, "payment_mode": 0.08},
        }

# ─────────────────────────────────────────────────────────────
# Explainability — Gemini counterfactual analysis
# ─────────────────────────────────────────────────────────────
@app.post("/api/explain/counterfactual")
def counterfactual(req: CounterfactualRequest):
    prompt = f"""You are an AI explainability engine for logistics decisions.
Current prediction: {req.current_prediction}
Feature values: {json.dumps(req.features, indent=2)}

Generate a counterfactual explanation: what minimal changes would flip the prediction?
Return ONLY valid JSON:
{{
  "counterfactual": "Clear explanation of what needs to change (2-3 sentences)",
  "changes": [
    {{"feature": "feature_name", "current": <value>, "target": <target_value>, "impact": "HIGH" or "MEDIUM" or "LOW"}},
    {{"feature": "feature_name", "current": <value>, "target": <target_value>, "impact": "HIGH" or "MEDIUM" or "LOW"}},
    {{"feature": "feature_name", "current": <value>, "target": <target_value>, "impact": "HIGH" or "MEDIUM" or "LOW"}}
  ]
}}"""
    try:
        raw = gemini(prompt)
        start = raw.find('{')
        end = raw.rfind('}') + 1
        return json.loads(raw[start:end])
    except:
        return {
            "counterfactual": f"To change prediction from '{req.current_prediction}', reduce carrier drift by 0.15 and improve on-time rate above 85%.",
            "changes": [
                {"feature": "carrier_drift", "current": req.features.get("carrier_drift", 0.12), "target": 0.02, "impact": "HIGH"},
                {"feature": "on_time_rate", "current": req.features.get("on_time_rate", 0.75), "target": 0.86, "impact": "HIGH"},
                {"feature": "warehouse_load", "current": req.features.get("warehouse_load", 88), "target": 70, "impact": "MEDIUM"},
            ],
        }

# ─────────────────────────────────────────────────────────────
# Blockchain
# ─────────────────────────────────────────────────────────────
@app.get("/api/blockchain/log")
def get_blockchain_log():
    return _blockchain_log

@app.get("/api/blockchain/stats")
def get_blockchain_stats():
    return {
        "total_blocks": len(_blockchain_log),
        "verified_blocks": sum(1 for b in _blockchain_log if b["verified"]),
        "pending_verification": 0,
        "last_merkle_root": "0x" + hashlib.sha256(str(time.time()).encode()).hexdigest()[:8],
        "network": "Polygon Amoy (Testnet)",
        "total_decisions_anchored": len(_blockchain_log) * 4,
    }

@app.post("/api/blockchain/verify")
def verify_on_chain(payload: dict):
    decision_id = payload.get("decision_id", "DEC-001")
    tx_hash = "0x" + hashlib.sha256(decision_id.encode()).hexdigest()[:40]
    entry = {
        "id": f"BLK-{len(_blockchain_log) + 1:03d}",
        "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        "action": f"Decision {decision_id} verified on-chain",
        "actor": "System",
        "hash": hashlib.sha256(decision_id.encode()).hexdigest()[:16],
        "prev_hash": _blockchain_log[0]["hash"] if _blockchain_log else "genesis",
        "batch": f"BATCH-{len(_blockchain_log) + 1:03d}",
        "verified": True,
    }
    _blockchain_log.insert(0, entry)
    return {"verified": True, "decision_id": decision_id, "txHash": tx_hash, "network": "Polygon Amoy"}

# ─────────────────────────────────────────────────────────────
# Agents / Network scan
# ─────────────────────────────────────────────────────────────
@app.get("/api/agents/status")
def agent_status():
    return {
        "observer": "active",
        "reasoner": "active",
        "actor": "active",
        "active_anomalies": 3,
        "last_scan": (datetime.utcnow() - timedelta(seconds=random.randint(3, 60))).isoformat(),
    }

@app.post("/api/agents/trigger-scan")
def trigger_scan():
    return {"message": "Network scan triggered", "anomalies_detected": random.randint(0, 5), "scan_id": str(uuid.uuid4())[:8]}

# ─────────────────────────────────────────────────────────────
# Decisions
# ─────────────────────────────────────────────────────────────
@app.get("/api/decisions/recent")
def recent_decisions():
    return [
        {"id": "DEC-001", "timestamp": "2026-03-25 19:32:01", "action": "Carrier swap CAR-07 → CAR-11", "shipmentIds": "SHP-0001..0047", "hash": "a3f8c2d1", "merkleBatch": "BATCH-012", "tier": "Tier 2", "executedBy": "HITL (Operator)"},
        {"id": "DEC-002", "timestamp": "2026-03-25 19:28:15", "action": "62-shipment reroute — Delhi corridor", "shipmentIds": "SHP-0100..0162", "hash": "b7e2f1a8", "merkleBatch": "BATCH-011", "tier": "Tier 2", "executedBy": "HITL (Operator)"},
        {"id": "DEC-003", "timestamp": "2026-03-25 19:15:44", "action": "WH-01 overflow redirect to WH-04", "shipmentIds": "SHP-0200..0212", "hash": "c1d5e8f2", "merkleBatch": "BATCH-010", "tier": "Tier 1", "executedBy": "Auto (Agent)"},
        {"id": "DEC-004", "timestamp": "2026-03-25 18:58:22", "action": "ETA recalculation — monsoon delay", "shipmentIds": "SHP-0050..0065", "hash": "d9a3b7c1", "merkleBatch": "BATCH-009", "tier": "Tier 1", "executedBy": "Auto (Agent)"},
        {"id": "DEC-005", "timestamp": "2026-03-25 18:42:11", "action": "CARBON_FIRST policy activation", "shipmentIds": "ALL", "hash": "e5f1a2b8", "merkleBatch": "BATCH-008", "tier": "Tier 1", "executedBy": "Auto (Agent)"},
    ]

@app.get("/api/demand/cards/pending")
def pending_cards():
    return [
        {"id": "APR-001", "title": "62-Shipment Reroute — Delhi Corridor", "stressTest": "85% viable", "worstCase": "3 shipments +2hrs · 12% probability",
         "options": [
             {"type": "COST", "costDelta": "-₹12,400", "etaDelta": "+45min", "co2Delta": "+1.2kg", "slaRisk": "4%", "recommended": False},
             {"type": "SPEED", "costDelta": "+₹2,100", "etaDelta": "On time", "co2Delta": "+2.1kg", "slaRisk": "1%", "recommended": False},
             {"type": "CARBON", "costDelta": "+₹800", "etaDelta": "+20min", "co2Delta": "-2.4kg", "slaRisk": "2%", "recommended": True},
         ], "status": "pending"},
        {"id": "APR-002", "title": "Carrier Swap — CAR-07 Critical Failure", "stressTest": "92% viable", "worstCase": "5 shipments +1hr · 8% probability",
         "options": [
             {"type": "COST", "costDelta": "-₹8,200", "etaDelta": "+30min", "co2Delta": "+0.8kg", "slaRisk": "3%", "recommended": False},
             {"type": "SPEED", "costDelta": "+₹4,500", "etaDelta": "On time", "co2Delta": "+1.5kg", "slaRisk": "0.5%", "recommended": False},
             {"type": "CARBON", "costDelta": "+₹1,200", "etaDelta": "+15min", "co2Delta": "-1.8kg", "slaRisk": "1%", "recommended": True},
         ], "status": "pending"},
    ]

@app.post("/api/demand/cards/{incident_id}/resolve")
def resolve_card(incident_id: str, payload: dict):
    return {"success": True, "incident_id": incident_id, "action": payload.get("action"), "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/demand/run")
def run_decision(payload: dict):
    return {"success": True, "decision_id": f"DEC-{int(time.time())}", "payload": payload}

# ─────────────────────────────────────────────────────────────
# Shipments, Carriers, Warehouses, Inventory
# (Rich mock data — no DB needed)
# ─────────────────────────────────────────────────────────────
CARRIERS = [
    {"id": "CAR-01", "carrier_id": "CAR-01", "name": "Delhivery", "score": 87, "status": "HEALTHY", "onTimeRate": 0.87, "loadAcceptanceRate": 0.94},
    {"id": "CAR-02", "carrier_id": "CAR-02", "name": "Blue Dart", "score": 91, "status": "HEALTHY", "onTimeRate": 0.91, "loadAcceptanceRate": 0.96},
    {"id": "CAR-03", "carrier_id": "CAR-03", "name": "DTDC", "score": 79, "status": "WARNING", "onTimeRate": 0.79, "loadAcceptanceRate": 0.85},
    {"id": "CAR-04", "carrier_id": "CAR-04", "name": "Ecom Express", "score": 83, "status": "HEALTHY", "onTimeRate": 0.83, "loadAcceptanceRate": 0.90},
    {"id": "CAR-05", "carrier_id": "CAR-05", "name": "Shadowfax", "score": 76, "status": "WARNING", "onTimeRate": 0.76, "loadAcceptanceRate": 0.82},
    {"id": "CAR-06", "carrier_id": "CAR-06", "name": "Xpressbees", "score": 88, "status": "HEALTHY", "onTimeRate": 0.88, "loadAcceptanceRate": 0.93},
    {"id": "CAR-07", "carrier_id": "CAR-07", "name": "FastTrack Logistics", "score": 34, "status": "CRITICAL", "onTimeRate": 0.61, "loadAcceptanceRate": 0.55},
    {"id": "CAR-08", "carrier_id": "CAR-08", "name": "Rivigo", "score": 82, "status": "HEALTHY", "onTimeRate": 0.82, "loadAcceptanceRate": 0.89},
]

CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Pune", "Hyderabad", "Kolkata", "Ahmedabad"]
STATUSES = ["IN_TRANSIT", "DELAYED", "AT_RISK", "DELIVERED"]

def gen_shipments(n: int = 50) -> list[dict]:
    out = []
    for i in range(1, n + 1):
        origin = CITIES[i % len(CITIES)]
        dest = CITIES[(i + 3) % len(CITIES)]
        if dest == origin:
            dest = CITIES[(i + 5) % len(CITIES)]
        carrier = "CAR-07" if i <= 47 else f"CAR-{(i % 8) + 1:02d}"
        status = ("AT_RISK" if i <= 15 else "DELAYED" if i <= 35 else "IN_TRANSIT") if i <= 47 else STATUSES[i % 4]
        eta = random.randint(6, 72)
        out.append({"id": f"SHP-{i:04d}", "origin": origin, "destination": dest, "carrier": carrier,
                     "status": status, "eta": f"{eta}h", "slaDeadline": f"{eta + random.randint(2, 12)}h",
                     "anomalyScore": round(0.65 + random.random() * 0.35 if i <= 47 else random.random() * 0.5, 2),
                     "lastUpdate": f"{random.randint(1, 48)}h ago", "p50": eta - 2, "p90": eta + 4, "p99": eta + 10})
    return out

_shipments_data = gen_shipments()

@app.get("/api/shipments/")
def get_shipments():
    return _shipments_data

@app.get("/api/shipments/{shipment_id}")
def get_shipment(shipment_id: str):
    s = next((x for x in _shipments_data if x["id"] == shipment_id), None)
    if not s:
        raise HTTPException(404, f"Shipment {shipment_id} not found")
    return s

@app.post("/api/shipments/{shipment_id}/rescore")
def rescore_shipment(shipment_id: str):
    for s in _shipments_data:
        if s["id"] == shipment_id:
            s["anomalyScore"] = round(random.random() * 0.3, 2)
            s["status"] = "IN_TRANSIT"
    return {"success": True}

@app.get("/api/carriers/")
def get_carriers():
    return CARRIERS

@app.get("/api/carriers/reliability")
def get_carrier_reliability():
    return [{"carrier_id": c["id"], "name": c["name"], "reliability": c["onTimeRate"], "score": c["score"], "status": c["status"]} for c in CARRIERS]

@app.post("/api/carriers/{carrier_id}/swap")
def swap_carrier(carrier_id: str, payload: dict):
    new_id = payload.get("new_carrier_id", "CAR-02")
    for s in _shipments_data:
        if s["carrier"] == carrier_id:
            s["carrier"] = new_id
    return {"success": True, "swapped_count": len([s for s in _shipments_data if s["carrier"] == new_id])}

@app.get("/api/warehouses/")
def get_warehouses():
    return [
        {"id": "WH-01", "city": "Mumbai", "load": 92, "status": "CRITICAL", "inboundQueue": 24, "forecast": "Projected 95% in 45min"},
        {"id": "WH-02", "city": "Delhi", "load": 78, "status": "WARNING", "inboundQueue": 15, "forecast": "Projected 85% in 1h 40min"},
        {"id": "WH-03", "city": "Bangalore", "load": 45, "status": "HEALTHY", "inboundQueue": 6, "forecast": "Stable"},
        {"id": "WH-04", "city": "Pune", "load": 41, "status": "HEALTHY", "inboundQueue": 4, "forecast": "Stable"},
    ]

@app.get("/api/inventory/")
def get_inventory():
    return {
        "warehouseInventory": [
            {"warehouse": "WH-01 Mumbai", "skus": [{"sku": "SKU-441", "current": 500, "safetyStock": 800, "status": "deficit"}, {"sku": "SKU-89", "current": 300, "safetyStock": 200, "status": "surplus"}]},
            {"warehouse": "WH-02 Delhi", "skus": [{"sku": "SKU-441", "current": 200, "safetyStock": 300, "status": "deficit"}, {"sku": "SKU-89", "current": 450, "safetyStock": 250, "status": "surplus"}]},
            {"warehouse": "WH-03 Bangalore", "skus": [{"sku": "SKU-204", "current": 400, "safetyStock": 200, "status": "surplus"}, {"sku": "SKU-337", "current": 100, "safetyStock": 120, "status": "deficit"}]},
            {"warehouse": "WH-04 Pune", "skus": [{"sku": "SKU-441", "current": 100, "safetyStock": 400, "status": "deficit"}, {"sku": "SKU-89", "current": 200, "safetyStock": 150, "status": "surplus"}]},
        ],
        "skuForecasts": [
            {"sku": "SKU-441", "region": "Maharashtra", "forecast": [120, 130, 145, 180, 280, 350, 420], "alert": "3× Diwali spike detected 4 days out"},
            {"sku": "SKU-89", "region": "Delhi NCR", "forecast": [200, 210, 215, 220, 225, 230, 235]},
            {"sku": "SKU-204", "region": "Karnataka", "forecast": [90, 88, 92, 95, 93, 90, 91]},
        ],
        "transfers": [
            {"id": "TRF-01", "sku": "SKU-441", "units": 5000, "from": "WH-03 Bangalore", "to": "WH-04 Pune", "vehicle": "Return-leg truck", "cost": "₹4,200", "co2": "0.8t", "eta": "4 days before spike"},
            {"id": "TRF-02", "sku": "SKU-89", "units": 2000, "from": "WH-02 Delhi", "to": "WH-01 Mumbai", "vehicle": "Rail freight", "cost": "₹1,800", "co2": "0.3t", "eta": "2 days"},
        ],
    }

@app.post("/api/inventory/rebalance")
def rebalance(payload: dict):
    sku = payload.get("sku", "SKU-441")
    warehouse_id = payload.get("warehouse_id", "WH-01")
    return {
        "transfers": [{"id": f"TRF-{int(time.time())}", "sku": sku, "units": random.randint(500, 3000), "from": "WH-03 Bangalore", "to": warehouse_id, "vehicle": "Express freight", "cost": "₹2,800", "co2": "0.5t", "eta": "3 days"}]
    }

# Routes API (legacy compat)
@app.post("/api/routes/score")
def routes_score(payload: dict):
    return {"success": True, "message": "Use /api/rto/score for RTO scoring"}

# ─────────────────────────────────────────────────────────────
# Run
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
