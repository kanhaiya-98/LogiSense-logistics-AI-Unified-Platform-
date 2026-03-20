from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import json
import google.generativeai as genai

router = APIRouter()

class CounterfactualRequest(BaseModel):
    features: dict
    current_prediction: str

@router.post("/counterfactual")
async def generate_counterfactual(req: CounterfactualRequest):
    """Use Gemini to generate a counterfactual explanation based on current features."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key: return {"error": "API key missing"}
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    prompt = f"""
    You are a Logistics Explainability AI. 
    A decision model currently predicts: {req.current_prediction}
    Based on the following features:
    {json.dumps(req.features, indent=2)}
    
    What is the minimum change required in a single feature (or maximum two features) to flip this decision from FLAGGED to SAFE, or SAFE to FLAGGED? 
    Give a very short, specific 1-2 sentence plain english explanation of the recommended change.
    Return ONLY a valid JSON object:
    {{
      "closest_counterfactual_text": "Change on_time_rate from 61% to 73%...",
      "flipped_prediction": "SAFE",
      "suggested_features": {{"on_time_rate": 73}}
    }}
    """
    
    try:
        res = await model.generate_content_async(prompt, generation_config=genai.GenerationConfig(response_mime_type="application/json"))
        data = json.loads(res.text)
        return data
    except Exception as e:
        return {"error": str(e), "closest_counterfactual_text": "Could not generate counterfactual."}
