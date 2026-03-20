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

class RTOResult(BaseModel):
    score: float
    risk_level: str
    top_factors: List[Dict[str, Any]]
    action: str
    savings_estimate_rs: float

def get_gemini_model():
    return genai.GenerativeModel('gemini-2.5-flash')

async def gemini_rto_score(
    buyer_rto_history: float,
    buyer_order_count: int,
    pincode_rto_rate: float,
    is_fraud_pincode: bool,
    order_value: float,
    address_score: float,
    hour_of_day: int,
    day_of_week: int,
    payment_method: str,
    device_type: str,
) -> RTOResult:
    
    if not api_key:
        logger.warning("No Gemini API key, returning mock RTO score.")
        return RTOResult(
            score=0.45, risk_level="MEDIUM", action="MONITOR", savings_estimate_rs=0,
            top_factors=[{"feature": "pincode_rto_rate", "shap": 0.15, "direction": "positive"}]
        )

    prompt = f"""
    You are a logistics RTO (Return to Origin) and Fraud risk scoring AI.
    Calculate the risk of the following order being returned or fake:
    - Pincode RTO rate: {pincode_rto_rate:.2f}
    - Is fraud pincode zone: {is_fraud_pincode}
    - Buyer historical RTO rate: {buyer_rto_history:.2f}
    - Buyer total past orders: {buyer_order_count}
    - Order value: ₹{order_value:.2f}
    - Address completeness score (0-1): {address_score:.2f}
    - Payment method: {payment_method}
    - Device type: {device_type}
    - Hour of day: {hour_of_day}, Day of week (0-6): {day_of_week}
    
    Return EXACTLY AND ONLY a JSON object that matches the structure below.
    `score` must be between 0.0 and 1.0. 
    `risk_level` must be LOW, MEDIUM, HIGH, or CRITICAL.
    `action` must be one of: APPROVE, MONITOR, SEND_WHATSAPP_CONFIRMATION, HOLD, REJECT_COD.
    For `top_factors`, provide exactly 4 features contributing to the score with a `shap` impact value (-1.0 to 1.0) and `direction` (positive or negative). Positive means increases risk.
    `savings_estimate_rs` is estimated money saved if we prevent RTO.
    
    Example response structure:
    {{
      "score": 0.85,
      "risk_level": "HIGH",
      "action": "SEND_WHATSAPP_CONFIRMATION",
      "savings_estimate_rs": 250,
      "top_factors": [
        {{"feature": "is_fraud_pincode", "shap": 0.35, "direction": "positive"}},
        {{"feature": "address_score", "shap": -0.10, "direction": "negative"}}
      ]
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
        return RTOResult(**data)
    except Exception as e:
        logger.error(f"Gemini RTO Error: {e}")
        return RTOResult(
            score=0.5, risk_level="MEDIUM", action="MONITOR", savings_estimate_rs=0,
            top_factors=[]
        )
