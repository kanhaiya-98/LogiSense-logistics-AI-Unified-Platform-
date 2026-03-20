import os
import asyncio
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict

from zen.db.supabase import get_supabase
import google.generativeai as genai
import json

router = APIRouter()

class ScanResult(BaseModel):
    anomalies: int
    events_generated: int

@router.get("/status")
async def get_agent_status():
    """Returns the current status of the LogiSense Observer & Reasoner."""
    db = get_supabase()
    active_anomalies = 0
    if db:
        res = db.table("anomaly_events").select("id").eq("resolved", False).execute()
        active_anomalies = len(res.data) if res.data else 0
        
    return {
        "observer": "active",
        "reasoner": "active",
        "actor": "active",
        "active_anomalies": active_anomalies,
        "mode": "gemini-powered"
    }

@router.post("/trigger-scan", response_model=ScanResult)
async def trigger_scan():
    """
    Simulates the Observer agent scanning the network to find anomalies.
    Uses Gemini to generate synthetic, realistic logistics anomalies based on probability.
    Writes the anomalies to `anomaly_events` and broadcasts via `agent_events`.
    """
    db = get_supabase()
    if not db:
        return ScanResult(anomalies=0, events_generated=0)

    prompt = """
    You are the LogiSense AI Observer Agent. Scan the simulated Indian logistics network and detect 1-3 new critical or high-severity anomalies.
    Make them realistic (e.g. carrier delays, weather disruptions, warehouse bottlenecks, route blockages).
    Return ONLY a JSON array of objects with the following keys:
    `incident_id` (string like INC-004), `shipment_id` (string like SHP-0045, optional), `carrier_id` (string like CAR-03), `severity` (HIGH or CRITICAL), `anomaly_score` (0.7 to 0.99), `description` (1 sentence explanation), `cascade_risk` (0.1 to 0.9).
    Example: [{"incident_id":"INC-123", "shipment_id": "SHP-0012", "carrier_id":"CAR-05", "severity":"CRITICAL", "anomaly_score":0.92, "description":"Shadowfax check-in delay > 8h due to vehicle breakdown on NH48.", "cascade_risk": 0.85}]
    """
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return ScanResult(anomalies=0, events_generated=0)
        
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    try:
        response = await model.generate_content_async(prompt, generation_config=genai.GenerationConfig(response_mime_type="application/json"))
        anomalies = json.loads(response.text)
        
        events_written = 0
        for anomaly in anomalies:
            # 1. Write to Anomaly Events table
            db.table("anomaly_events").upsert(anomaly).execute()
            
            # 2. Write to Agent Events for UI Realtime Feed
            event = {
                "event_type": "anomaly",
                "message": anomaly["description"],
                "severity": "critical" if anomaly["severity"] == "CRITICAL" else "warning",
                "metadata": {"incident_id": anomaly["incident_id"], "score": anomaly["anomaly_score"]}
            }
            db.table("agent_events").insert(event).execute()
            events_written += 1
            
        return ScanResult(anomalies=len(anomalies), events_generated=events_written)
        
    except Exception as e:
        print(f"Error in trigger_scan: {e}")
        return ScanResult(anomalies=0, events_generated=0)
