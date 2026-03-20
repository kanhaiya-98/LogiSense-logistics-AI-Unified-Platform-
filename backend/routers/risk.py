from fastapi import APIRouter
from zen.db.supabase import get_supabase
from pydantic import BaseModel
import os
import json
import google.generativeai as genai
import random

router = APIRouter()

class AnalyzeRiskRequest(BaseModel):
    scenario: str

@router.get("/events")
async def get_risk_events():
    db = get_supabase()
    if not db: return []
    res = db.table("risk_events").select("*").order("created_at", desc=True).execute()
    return res.data or []

@router.post("/analyze")
async def analyze_risk(req: AnalyzeRiskRequest):
    """Use Gemini to evaluate a custom user risk scenario."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key: return {"error": "API key missing"}
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    prompt = f"""
    You are a Logistics Risk Analyst AI. Given the following user scenario or news event:
    "{req.scenario}"
    
    Analyze the potential impact on the Indian logistics network.
    Return ONLY a valid JSON object:
    {{
      "id": "RISK-GEN",
      "title": "Short title describing the event",
      "severity": "HIGH", "MEDIUM", or "LOW",
      "source": "AI Analysis",
      "affected_shipments": 25,
      "corridors": "e.g. Mumbai to Delhi",
      "recommendation": "1 sentence mitigation action"
    }}
    """
    
    try:
        res = await model.generate_content_async(prompt, generation_config=genai.GenerationConfig(response_mime_type="application/json"))
        data = json.loads(res.text)
        
        db = get_supabase()
        if db:
            db.table("risk_events").insert(data).execute()
        
        return data
    except Exception as e:
        return {"error": str(e)}

@router.get("/cascade")
async def get_cascade_nodes():
    nodes = []
    features = ['carrier_drift', 'warehouse_load', 'eta_lag', 'aqi_flag', 'on_time_rate']
    for i in range(47):
        nodes.append({
            "id": f"node-{i}",
            "shipmentId": f"SHP-{str(i + 1).zfill(4)}",
            "risk": round(0.3 + random.random() * 0.7, 2),
            "slaBreachProb": round(random.random() * 0.9, 2),
            "topFeature": features[i % 5],
            "x": 100 + (i % 8) * 90 + (random.random() * 30 - 15),
            "y": 80 + (i // 8) * 80 + (random.random() * 20 - 10),
        })
    return nodes
