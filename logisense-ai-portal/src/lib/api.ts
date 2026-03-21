// API client for fetching data from the FastAPI backend

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`;
    try {
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            console.error(`API Error ${response.status}: ${url}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (e) {
        console.error("API Request Failed:", e);
        throw e;
    }
  }

  // --- Shipments ---
  async getShipments() { return this.request('/api/shipments/'); }
  async getShipment(id: string) { return this.request(`/api/shipments/${id}`); }
  async rescoreShipment(id: string, incident_id: string) { return this.request(`/api/shipments/${id}/rescore`, { method: 'POST', body: JSON.stringify({ incident_id }) }); }

  // --- Carriers ---
  async getCarriers() { return this.request('/api/carriers/'); }
  async getCarrierReliability() { return this.request('/api/carriers/reliability'); }
  async swapCarrier(carrier_id: string, new_carrier_id: string) { return this.request(`/api/carriers/${carrier_id}/swap`, { method: 'POST', body: JSON.stringify({ new_carrier_id }) }); }

  // --- Warehouses & Inventory ---
  async getWarehouses() { return this.request('/api/warehouses/'); }
  async getInventory() { return this.request('/api/inventory/'); }
  async generateRebalanceTransfers(warehouse_id: string, sku: string) { return this.request('/api/inventory/rebalance', { method: 'POST', body: JSON.stringify({ warehouse_id, sku }) }); }

  // --- ZenETA ---
  async predictETA(payload: any) { return this.request('/api/eta/predict', { method: 'POST', body: JSON.stringify(payload) }); }

  // --- ZenRTO ---
  async scoreOrderRTO(payload: any) { return this.request('/api/routes/score', { method: 'POST', body: JSON.stringify(payload) }); }

  // --- ZenDec (Decision Engine) ---
  async runDecision(payload: any) { return this.request('/api/demand/run', { method: 'POST', body: JSON.stringify(payload) }); }
  async getPendingCards() { return this.request('/api/demand/cards/pending'); }
  async resolveCard(incident_id: string, action: string, notes?: string) { return this.request(`/api/demand/cards/${incident_id}/resolve`, { method: 'POST', body: JSON.stringify({ action, notes }) }); }

  // --- Decisions & Blockchain ---
  async getRecentDecisions() { return this.request('/api/decisions/recent'); }
  async getBlockchainLog() { return this.request('/api/blockchain/log'); }
  async getBlockchainStats() { return this.request('/api/blockchain/stats'); }
  async verifyDecisionOnChain(decision_id: string) { return this.request('/api/blockchain/verify', { method: 'POST', body: JSON.stringify({ decision_id }) }); }

  // --- Agents & Anomaly Feed ---
  async getAgentStatus() { return this.request('/api/agents/status'); }
  async triggerNetworkScan() { return this.request('/api/agents/trigger-scan', { method: 'POST' }); }
  
  // --- Risk ---
  async getRiskEvents() { return this.request('/api/risk/events'); }
  async getCascadeNodes() { return this.request('/api/risk/cascade'); }
  async analyzeRiskScenario(scenario: string) { return this.request('/api/risk/analyze', { method: 'POST', body: JSON.stringify({ scenario }) }); }

  // --- Explainability ---
  async generateCounterfactual(features: any, current_prediction: string) { return this.request('/api/explain/counterfactual', { method: 'POST', body: JSON.stringify({ features, current_prediction }) }); }

  // --- Chat ---
  async chat(message: string, context: any = {}) { return this.request('/api/chat/', { method: 'POST', body: JSON.stringify({ message, context }) }); }
}

export const api = new ApiClient();
