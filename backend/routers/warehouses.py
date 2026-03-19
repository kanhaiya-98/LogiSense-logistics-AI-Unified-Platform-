from fastapi import APIRouter
from zen.db.supabase import get_supabase

router = APIRouter()

@router.get("/")
async def get_warehouses():
    db = get_supabase()
    if not db: return []
    res = db.table("warehouses").select("*").execute()
    return res.data or []

@router.get("/{warehouse_id}")
async def get_warehouse(warehouse_id: str):
    db = get_supabase()
    if not db: return {}
    res = db.table("warehouses").select("*").eq("warehouse_id", warehouse_id).single().execute()
    return res.data or {}
