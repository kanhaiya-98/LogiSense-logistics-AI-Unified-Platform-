from fastapi import APIRouter
from zen.db.supabase import get_supabase
from pydantic import BaseModel
import time

router = APIRouter()

class VerifyRequest(BaseModel):
    decision_id: str

@router.get("/log")
async def get_blockchain_log():
    db = get_supabase()
    if not db: return []
    res = db.table("decisions").select("*").eq("on_chain", True).order("created_at", desc=True).limit(50).execute()
    return res.data or []

@router.get("/stats")
async def get_blockchain_stats():
    db = get_supabase()
    if not db: return {}
    res = db.table("decisions").select("id", count="exact").eq("on_chain", True).execute()
    count = res.count if hasattr(res, 'count') and res.count else (len(res.data) if res.data else 0)
    
    return {
        "total_anchored": count,
        "batches": max(1, count // 10),
        "last_anchor": "12m ago",
        "network": "Polygon Mumbai",
        "status": "Healthy"
    }

@router.post("/verify")
async def verify_decision(req: VerifyRequest):
    """Simulates blockchain verification delay."""
    time.sleep(1.5)
    db = get_supabase()
    if not db: return {"valid": False}
    
    res = db.table("decisions").select("*").eq("decision_id", req.decision_id).single().execute()
    if res.data:
        return {"valid": True, "hash": res.data.get("sha256_hash", "0x00")}
    return {"valid": False}
