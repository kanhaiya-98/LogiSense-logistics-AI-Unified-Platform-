from fastapi import APIRouter
from zen.db.supabase import get_supabase
from pydantic import BaseModel

router = APIRouter()

class RescoreRequest(BaseModel):
    incident_id: str

@router.get("/")
async def list_shipments():
    """Returns all shipments from Supabase."""
    db = get_supabase()
    if not db:
        return []
    res = db.table("shipments").select("*").order("created_at", desc=True).limit(50).execute()
    return res.data or []

@router.get("/{shipment_id}")
async def get_shipment(shipment_id: str):
    """Returns a single shipment."""
    db = get_supabase()
    if not db:
        return {}
    res = db.table("shipments").select("*").eq("id", shipment_id).single().execute()
    return res.data or {}

@router.post("/{shipment_id}/rescore")
async def rescore_shipment(shipment_id: str, req: RescoreRequest):
    """
    Called from the Cascade Failure UI to simulate generating a new anomaly score
    or resolving an anomaly for a specific shipment using Gemini.
    """
    import os, json
    import google.generativeai as genai

    db = get_supabase()
    if not db:
        return {"error": "Database not connected"}

    # Fetch incident details
    res = db.table("anomaly_events").select("*").eq("incident_id", req.incident_id).single().execute()
    incident = res.data
    if not incident:
        return {"error": "Incident not found"}

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        # Fallback without Gemini
        new_score = max(0.0, incident.get("anomaly_score", 0.5) - 0.2)
        db.table("anomaly_events").update({"anomaly_score": new_score, "severity": "MEDIUM"}).eq("incident_id", req.incident_id).execute()
        return {"status": "rescored", "new_score": new_score, "severity": "MEDIUM"}

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    You are a logistics risk analyst. An operator has requested a rescore for the following anomaly:
    Incident ID: {incident['incident_id']}
    Description: {incident['description']}
    Current Severity: {incident['severity']}
    Current Score: {incident['anomaly_score']}
    
    Assume that 2 hours have passed and mitigation efforts have started. The situation is improving slightly.
    Generate a new anomaly score and severity.
    Output ONLY JSON in this format: {{"new_score": 0.45, "new_severity": "MEDIUM", "resolution_note": "Risk reduced due to carrier response."}}
    """
    
    try:
        response = await model.generate_content_async(prompt, generation_config=genai.GenerationConfig(response_mime_type="application/json"))
        data = json.loads(response.text)
        
        db.table("anomaly_events").update({
            "anomaly_score": data["new_score"],
            "severity": data["new_severity"],
            "description": data["resolution_note"]
        }).eq("incident_id", req.incident_id).execute()
        
        return data
        
    except Exception as e:
        return {"error": f"Gemini rescore failed: {e}"}
