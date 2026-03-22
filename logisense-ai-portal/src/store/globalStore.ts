import { create } from 'zustand';

export type PolicyMode = 'BALANCED' | 'COST_FIRST' | 'SPEED_FIRST' | 'CARBON_FIRST';

interface GlobalState {
  policy: PolicyMode;
  setPolicy: (p: PolicyMode) => void;
  pendingApprovals: number;
  setPendingApprovals: (n: number) => void;
  wsConnected: boolean;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  policy: 'CARBON_FIRST',
  setPolicy: (policy) => set({ policy }),
  pendingApprovals: 3,
  setPendingApprovals: (pendingApprovals) => set({ pendingApprovals }),
  wsConnected: true,
}));
