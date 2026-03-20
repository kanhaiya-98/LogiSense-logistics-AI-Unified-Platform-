from fastapi import APIRouter
from zen.db.supabase import get_supabase

router = APIRouter()

@router.get("/recent")
async def get_recent_decisions():
    db = get_supabase()
    if not db: return []
    res = db.table("decisions").select("*").order("created_at", desc=True).limit(20).execute()
    return res.data or []
