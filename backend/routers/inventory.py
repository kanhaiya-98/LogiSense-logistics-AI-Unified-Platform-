from fastapi import APIRouter
from zen.db.supabase import get_supabase
from pydantic import BaseModel
import os
import json
import google.generativeai as genai

router = APIRouter()

class RebalanceRequest(BaseModel):
    warehouse_id: str
    sku: str

@router.get("/")
async def get_inventory():
    """Retrieve full inventory and transfers state."""
    db = get_supabase()
    if not db: return {"inventory": [], "transfers": []}
    
    inv_res = db.table("inventory").select("*").execute()
    trf_res = db.table("transfers").select("*").execute()
    
    return {
        "inventory": inv_res.data or [],
        "transfers": trf_res.data or []
    }

@router.post("/rebalance")
async def generate_rebalance(req: RebalanceRequest):
    """Use Gemini to generate a synthetic transfer plan."""
    db = get_supabase()
    if not db: return {"error": "DB not connected"}
    
    res = db.table("inventory").select("*").eq("warehouse_id", req.warehouse_id).eq("sku", req.sku).single().execute()
    if not res.data: return {"error": "SKU not found"}
    
    inv = res.data
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key: return {"error": "API Key not set"}
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")
    prompt = f"""
    Warehouse {req.warehouse_id} has a {inv['status']} of {req.sku}.
    Current stock: {inv['current_stock']}, Safety stock: {inv['safety_stock']}.
    Forecast 7d: {inv['forecast_7d']}.
    Generate a rebalance transfer plan to fix this.
    Return ONLY JSON:
    {{"id": "TRF-NEW", "sku": "{req.sku}", "units": 100, "from_warehouse": "WH-02", "to_warehouse": "{req.warehouse_id}", "vehicle": "LTV", "cost": "₹1500", "co2": "0.1t", "eta_text": "Next Day", "status": "planned"}}
    """
    
    try:
        response = await model.generate_content_async(prompt, generation_config=genai.GenerationConfig(response_mime_type="application/json"))
        transfer = json.loads(response.text)
        db.table("transfers").insert(transfer).execute()
        return transfer
    except Exception as e:
        return {"error": str(e)}
