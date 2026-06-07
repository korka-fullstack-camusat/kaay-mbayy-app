import { create } from 'zustand';

interface Product {
  id: number;
  seller_id: number;
  kind: string;
  crop: string;
  location: string;
  qty_kg: number;
  price_xof_per_kg: number;
  stars: number;
  description?: string;
  is_verified: boolean;
  is_active: boolean;
  seller_name?: string;
}

interface CartItem {
  product: Product;
  qty: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalXof: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addToCart: (product) => {
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id ? { ...i, qty: i.qty + 10 } : i
          ),
        };
      }
      return { items: [...state.items, { product, qty: 10 }] };
    });
  },

  removeFromCart: (productId) => {
    set((state) => {
      const existing = state.items.find((i) => i.product.id === productId);
      if (!existing || existing.qty <= 10) {
        return { items: state.items.filter((i) => i.product.id !== productId) };
      }
      return {
        items: state.items.map((i) =>
          i.product.id === productId ? { ...i, qty: i.qty - 10 } : i
        ),
      };
    });
  },

  clearCart: () => set({ items: [] }),

  totalItems: () => get().items.reduce((s, i) => s + i.qty, 0),

  totalXof: () =>
    get().items.reduce((s, i) => s + i.product.price_xof_per_kg * i.qty, 0),
}));
