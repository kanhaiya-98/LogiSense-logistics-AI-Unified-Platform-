# LogiSense AI Unified Platform 🚀

**An End-to-End AI Logistics OS combining Predictive Analytics (F1-F4), the Zen Platform (ZenDec, ZenRTO, ZenETA), and Advanced LangGraph Intelligence (F8-F10).**

## 🌐 Platform Architecture

The LogiSense Unified Platform operates via a synchronized Next.js frontend and a monolithic FastAPI backend serving multiple intelligent sub-agents that communicate over Redis and LangGraph.

| Module | Core Functionality | AI / ML Tech Stack |
|--------|--------------------|--------------------|
| **Observer (F1/F4)** | Real-time Anomaly Detection & Warehouse Load Polling | Isolation Forest, ARIMA(1,1,1) |
| **Reasoner (F2)** | Supply Chain Contagion Risk Analysis & Cascade Trees | Directed Acyclic Graph (DAG) BFS, LightGBM |
| **Actor (F3/F4)** | Autonomous Carrier Subbing, Rerouting & Intake Staggering | Kolmogorov–Smirnov Drift, Heuristics |
| **ZenDec (F6)** | Route & Carrier Decision Engine | TOPSIS optimization, AQI APIs, LLM Stress Test |
| **ZenRTO (F6)** | RTO Fraud Detection & Risk Scoring | LightGBM, SHAP, Twilio Connect |
| **ZenETA (F7)** | ETA Quantile Pediction | XGBoost (p50/p90/p99) |
| **F8 Explainability** | Actionable Transparency & Counterfactual Reasoning | SHAP Heatmaps, Risk Matrices, Plotly JS |
| **F9 Blockchain** | Auditable Logistics Ledger & Decision Immutability | Polygon-compatible Web3.py, Merkle Trees |
| **F10 Synthesis** | Decentralized Agentic Control Loop | LangGraph, Chat LLM State |

## ✨ Core Features (F1-F10)

1. **Feature 1 (Observer Agent):** A real-time monitoring agent that ingests a continuous stream of shipments via a WebSocket and detects anomalies (e.g., delays, route deviations) using an Isolation Forest anomaly detection model.
2. **Feature 2 (Reasoner Agent):** A cascade-analysis agent that evaluates how one delayed shipment impacts dependent shipments down the supply chain. It builds a Directed Acyclic Graph (DAG) and propagates delays to calculate multi-tier contagion risk.
3. **Feature 3 (Actor Agent):** An autonomous execution agent that acts on the Reasoner’s findings. It performs real-time carrier substitutions and subbing by evaluating alternative carriers based on cost, reliability, and SLA metrics. 
4. **Feature 4 (Warehouse Load & Intake Staggering):** Monitors warehouse congestion using ARIMA models to forecast intake loads. If a warehouse is over capacity, it delays or redirects incoming shipments to balance utilization, visualized via a live heatmap.
5. **Feature 5 (Machine Learning Predictive Models):** The foundation of predictive analytics inside LogiSense, training models on historical logistics data to predict exact congestion levels, ETA delays, and RTO probabilities.
6. **Feature 6 (ZenDec / ZenRTO):** The Zen Platform Decision Engine. Uses TOPSIS to rank and assign the best carrier routes while cross-referencing AQI data to minimize carbon impact. Also calculates the probability of Return-to-Origin (RTO) fraud using LightGBM.
7. **Feature 7 (ZenETA):** Advanced ETA Prediction. Utilizes XGBoost quantile regression to predict highly accurate delivery ETAs at the 50th, 90th, and 99th percentiles, ensuring tight SLA compliance.
8. **Feature 8 (ML Explainability):** Provides complete transparency into AI decisions using SHAP (SHapley Additive exPlanations). Generates interactive Heatmaps, Risk Matrices, and Waterfall charts so operators understand *why* a decision was made.
9. **Feature 9 (Blockchain Audit Ledger):** Anchors critical autonomous routing decisions onto a Polygon-compatible blockchain. Creates immutable, cryptographically verifiable Merkle tree logs for every action taken by the AI.
10. **Feature 10 (Agentic Synthesis):** A unified orchestration layer built on LangGraph. It links all disparate models and agents (Observer, Reasoner, Actor, Zen Platform, Explainability, and Blockchain) into a cohesive, decentralized state graph capable of complex multi-step reasoning.

## 🏗️ Repository Structure

```
LogiSense/
├── backend/
│   ├── agents/            # Legacy F1-F4 Agents (Observer, Reasoner, Actor)
│   ├── api/               # Unified FastAPI App (main.py router)
│   ├── features/          # New Intelligence Models
│   │   ├── explainability/ # F8 SHAP Heatmaps
│   │   ├── blockchain/     # F9 Auditing
│   │   └── synthesis/      # F10 LangGraph
│   ├── zen/               # The Zen Platform
│   │   ├── core/          # TOPSIS & Autonomy pipelines
│   │   ├── routers/       # Demand, ETA, RTO modular routers
│   │   └── services/      # Gemini, AQI, Waybills
│   ├── db/                # Supabase ORM layer
│   └── streams/           # Redis real-time Pub/Sub
│
└── frontend/
    └── src/
        ├── App.jsx        # Unified Tabbed Dashboard Router
        ├── components/
        │   ├── features/  # F8 SHAP Plotly Components
        │   ├── zen/       # IFrames and React Components for Zen
        │   └── ...        # Legacy React Components (Warehouse Map, Anomaly Badge)
```

## 🚀 Quick Start Guide

### 1. Requirements
Ensure you have Python 3.9+ and Node.js v18+.

### 2. Environment Variables
Copy `.env.example` to `backend/.env` and insert your Supabase and LLM API keys.

### 3. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Start the Unified API Server
```bash
# Export PYTHONPATH so feature modules resolve correctly 
PYTHONPATH=. python3 -m uvicorn api.main:app --reload --port 8000
```
API Documentation will be live at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 5. Start the React/Vite Dashboard
Open a second terminal window:
```bash
cd frontend
npm install
npm run dev
```
Dashboard will be live at: [http://localhost:5173](http://localhost:5173)

---
*Built with React, FastAPI, LightGBM, XGBoost, and LangGraph.*
