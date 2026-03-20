from fastapi import APIRouter
from pydantic import BaseModel
import os
import google.generativeai as genai

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    context: dict = {}

@router.post("/")
async def chat_with_logisense(req: ChatRequest):
    """Simple Gemini-powered chat endpoint for LogiSense AI Assistant."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key: return {"reply": "API Key missing. Cannot connect to LogiSense AI."}
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    prompt = f"""
    You are LogiSense AI, an advanced logistics network assistant.
    The user is an operations manager using the LogiSense dashboard.
    
    Context from their current screen:
    {req.context}
    
    User message: {req.message}
    
    Respond helpfully, concisely, and professionally. Use logistics terminology (SLA, RTO, TAT, Milk Run, etc.) where appropriate.
    """
    
    try:
        res = await model.generate_content_async(prompt)
        return {"reply": res.text}
    except Exception as e:
        return {"reply": f"Sorry, I encountered an error: {str(e)}"}
