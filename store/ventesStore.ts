import { create } from 'zustand';

interface VentesState {
  hasNewOrders: boolean;
  lastSeenOrderCount: number;
  /** Appelé quand de nouvelles commandes sont détectées (user pas sur l'onglet) */
  signalNewOrder: () => void;
  /** Appelé quand l'utilisateur ouvre l'onglet Ventes → Commandes reçues */
  markOrdersSeen: (count: number) => void;
}

export const useVentesStore = create<VentesState>((set) => ({
  hasNewOrders: false,
  lastSeenOrderCount: -1,

  signalNewOrder: () => set({ hasNewOrders: true }),

  markOrdersSeen: (count) => set({ hasNewOrders: false, lastSeenOrderCount: count }),
}));
