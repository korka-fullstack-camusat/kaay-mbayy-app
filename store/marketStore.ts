import { create } from 'zustand';

interface MarketState {
  /* ── Nouveaux produits ── */
  hasNewProducts: boolean;
  lastSeenCount: number;
  signalNew: () => void;
  markSeen: (count: number) => void;

  /* ── Mise à jour commandes acheteur ── */
  hasOrderUpdate: boolean;
  /** { orderId: statut connu } — vide = première charge */
  lastOrderStatuses: Record<number, string>;
  /**
   * Appeler à chaque fetch des commandes acheteur.
   * Détecte si un statut est passé de 'pending' → autre chose.
   */
  checkOrderStatuses: (orders: Array<{ id: number; status: string }>) => void;
  /** Appeler quand l'utilisateur ouvre l'onglet "Mes commandes" */
  markOrdersSeen: (orders: Array<{ id: number; status: string }>) => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  /* Produits */
  hasNewProducts: false,
  lastSeenCount: -1,
  signalNew: () => set({ hasNewProducts: true }),
  markSeen: (count) => set({ hasNewProducts: false, lastSeenCount: count }),

  /* Commandes */
  hasOrderUpdate: false,
  lastOrderStatuses: {},

  checkOrderStatuses: (orders) => {
    const { lastOrderStatuses } = get();
    const isFirstLoad = Object.keys(lastOrderStatuses).length === 0;

    // Première charge → stocker sans badge
    if (isFirstLoad) {
      const initial: Record<number, string> = {};
      orders.forEach((o) => { initial[o.id] = o.status; });
      set({ lastOrderStatuses: initial });
      return;
    }

    // Vérifier si une commande est passée de 'pending' → autre statut
    const hasUpdate = orders.some(
      (o) => lastOrderStatuses[o.id] === 'pending' && o.status !== 'pending'
    );

    // Mettre à jour les statuts connus
    const updated: Record<number, string> = { ...lastOrderStatuses };
    orders.forEach((o) => { updated[o.id] = o.status; });

    set({ lastOrderStatuses: updated, ...(hasUpdate ? { hasOrderUpdate: true } : {}) });
  },

  markOrdersSeen: (orders) => {
    const statuses: Record<number, string> = {};
    orders.forEach((o) => { statuses[o.id] = o.status; });
    set({ hasOrderUpdate: false, lastOrderStatuses: statuses });
  },
}));
