import os
import json
import logging
from typing import Dict, Any, List
import google.generativeai as genai
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

class ETAResult(BaseModel):
    p50_hours: float
    p90_hours: float
    p99_hours: float
    sla_breach_prob: float
    explanation: str
    confidence: str

def get_gemini_model():
    return genai.GenerativeModel('gemini-2.5-flash')

async def gemini_eta_predict(
    origin: str,
    destination: str,
    carrier_id: str,
    distance_km: float,
    weather_flag: bool,
    hour_of_day: int,
    day_of_week: int
) -> ETAResult:
    
    if not api_key:
        logger.warning("No Gemini API key, returning mock ETA prediction.")
        base_eta = distance_km / 40.0 # roughly 40km/h average
        return ETAResult(
            p50_hours=round(base_eta, 1),
            p90_hours=round(base_eta * 1.3, 1),
            p99_hours=round(base_eta * 1.6, 1),
            sla_breach_prob=0.15,
            explanation="Mock ETA calculation running without Gemini API.",
            confidence="LOW"
        )

    prompt = f"""
    You are an advanced Logistics ETA Prediction AI (replacing XGBoost).
    Predict delivery time percentiles for a shipment:
    - Route: {origin} to {destination}
    - Carrier: {carrier_id}
    - Distance: {distance_km} km
    - Weather Flag (Rain/Storm): {weather_flag}
    - Dispatch Hour: {hour_of_day}, Day of week: {day_of_week}
    
    Return EXACTLY AND ONLY a JSON object that matches the structure below.
    `p50_hours` is the median expected delivery time.
    `p90_hours` is the 90th percentile (slower).
    `p99_hours` is the 99th percentile (worst case).
    `sla_breach_prob` is the probability (0.0 to 1.0) of breaching a standard 72h SLA.
    `confidence` is HIGH, MEDIUM, or LOW based on route complexity.
    `explanation` is a 1-sentence reason for this prediction.
    
    Example response structure:
    {{
      "p50_hours": 32.5,
      "p90_hours": 41.2,
      "p99_hours": 58.0,
      "sla_breach_prob": 0.08,
      "confidence": "HIGH",
      "explanation": "Standard route with minimal weather risk, but historical carrier slight delays."
    }}
    """
    
    model = get_gemini_model()
    try:
        response = await model.generate_content_async(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        data = json.loads(response.text)
        return ETAResult(**data)
    except Exception as e:
        logger.error(f"Gemini ETA Error: {e}")
        base_eta = distance_km / 40.0
        return ETAResult(
            p50_hours=round(base_eta, 1),
            p90_hours=round(base_eta * 1.3, 1),
            p99_hours=round(base_eta * 1.6, 1),
            sla_breach_prob=0.15,
            explanation="Error generating ETA, falling back to heuristics.",
            confidence="LOW"
        )
