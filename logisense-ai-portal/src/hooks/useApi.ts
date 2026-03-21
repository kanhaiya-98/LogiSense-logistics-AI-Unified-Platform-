import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// --- Global Queries --- //

export function useShipments() {
  return useQuery({
    queryKey: ['shipments'],
    queryFn: () => api.getShipments(),
  });
}

export function useCarriers() {
  return useQuery({
    queryKey: ['carriers'],
    queryFn: () => api.getCarriers(),
  });
}

export function useCarrierReliability() {
  return useQuery({
    queryKey: ['carrierReliability'],
    queryFn: () => api.getCarrierReliability(),
  });
}

export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: () => api.getWarehouses(),
  });
}

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: () => api.getInventory(),
  });
}

export function useRecentDecisions() {
  return useQuery({
    queryKey: ['recentDecisions'],
    queryFn: () => api.getRecentDecisions(),
  });
}

export function useBlockchainLog() {
  return useQuery({
    queryKey: ['blockchainLog'],
    queryFn: () => api.getBlockchainLog(),
  });
}

export function useBlockchainStats() {
  return useQuery({
    queryKey: ['blockchainStats'],
    queryFn: () => api.getBlockchainStats(),
  });
}

export function useRiskEvents() {
  return useQuery({
    queryKey: ['riskEvents'],
    queryFn: () => api.getRiskEvents(),
  });
}

export function useCascadeNodes() {
  return useQuery({
    queryKey: ['cascadeNodes'],
    queryFn: () => api.getCascadeNodes(),
  });
}

export function useChat() {
  return useMutation({
    mutationFn: (payload: { message: string, context?: any }) => api.chat(payload.message, payload.context),
  });
}

export function useAnalyzeRiskScenario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scenario: string) => api.analyzeRiskScenario(scenario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riskEvents'] });
    },
  });
}

export function useVerifyDecision() {
  return useMutation({
    mutationFn: (decision_id: string) => api.verifyDecisionOnChain(decision_id),
  });
}

export function usePendingCards() {
  return useQuery({
    queryKey: ['pendingCards'],
    queryFn: () => api.getPendingCards(),
  });
}

export function useAgentStatus() {
  return useQuery({
    queryKey: ['agentStatus'],
    queryFn: () => api.getAgentStatus(),
    refetchInterval: 30000, 
  });
}

// --- Mutations --- //

export function useRescoreShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, incident_id }: { id: string; incident_id: string }) => api.rescoreShipment(id, incident_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}

export function useSwapCarrier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ carrier_id, new_carrier_id }: { carrier_id: string; new_carrier_id: string }) => api.swapCarrier(carrier_id, new_carrier_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['recentDecisions'] });
    },
  });
}

export function useTriggerScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.triggerNetworkScan(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentStatus'] });
    },
  });
}

export function useRunDecision() {
  return useMutation({
    mutationFn: (payload: any) => api.runDecision(payload),
  });
}

export function useScoreRTO() {
  return useMutation({
    mutationFn: (payload: any) => api.scoreOrderRTO(payload),
  });
}

export function usePredictETA() {
  return useMutation({
    mutationFn: (payload: any) => api.predictETA(payload),
  });
}

export function useGenerateRebalance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ warehouse_id, sku }: { warehouse_id: string; sku: string }) => api.generateRebalanceTransfers(warehouse_id, sku),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useGenerateCounterfactual() {
  return useMutation({
    mutationFn: (payload: { features: any; current_prediction: string }) => api.generateCounterfactual(payload.features, payload.current_prediction),
  });
}
