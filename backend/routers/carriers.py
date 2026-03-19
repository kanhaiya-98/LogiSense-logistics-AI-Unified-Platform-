from fastapi import APIRouter
from zen.db.supabase import get_supabase
from pydantic import BaseModel

router = APIRouter()

class SwapRequest(BaseModel):
    new_carrier_id: str

@router.get("/")
async def get_carriers():
    """List all carriers."""
    db = get_supabase()
    if not db: return []
    res = db.table("carriers").select("*").execute()
    return res.data or []

@router.get("/reliability")
async def get_carrier_reliability():
    """Get summarized carrier reliability scores."""
    db = get_supabase()
    if not db: return []
    res = db.table("carriers").select("id, name, score, status").execute()
    return res.data or []

@router.post("/{carrier_id}/swap")
async def swap_carrier(carrier_id: str, req: SwapRequest):
    """
    Execute a carrier swap for shipments currently assigned to carrier_id.
    """
    import uuid
    import datetime
    
    db = get_supabase()
    if not db: return {"error": "DB not connected"}
    
    # 1. Update shipments table
    db.table("shipments").update({"carrier_id": req.new_carrier_id}).eq("carrier_id", carrier_id).execute()
    
    # 2. Log decision
    decision_id = f"DEC-{str(uuid.uuid4())[:8].upper()}"
    decision = {
        "decision_id": decision_id,
        "decision_type": "CARRIER_SWAP",
        "agent": "Actor (UI Triggered)",
        "action": f"Carrier swap {carrier_id} -> {req.new_carrier_id}",
        "shipment_ids": "Bulk update",
        "sha256_hash": "pending",
        "tier": "Tier 2",
        "executed_by": "HITL (Operator)",
        "on_chain": False
    }
    db.table("decisions").insert(decision).execute()
    
    # 3. Log agent event for realtime feed
    db.table("agent_events").insert({
        "event_type": "swap",
        "message": f"Carrier swap executed: {req.new_carrier_id} assigned to recover shipments from {carrier_id}",
        "severity": "success"
    }).execute()
    
    return {"status": "success", "decision_id": decision_id}
