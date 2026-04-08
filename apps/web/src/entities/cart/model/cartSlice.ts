import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartLine } from './types';

const CART_KEY = 'parfumbox_cart';

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CartLine[]) : [];
  } catch {
    return [];
  }
}

type CartState = {
  items: CartLine[];
};

const initialState: CartState = {
  items: loadCart(),
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addOne(state, action: PayloadAction<Omit<CartLine, 'quantity'> & { quantity?: number }>) {
      const q = action.payload.quantity ?? 1;
      const existing = state.items.find((i) => i.productId === action.payload.productId);
      if (existing) {
        existing.quantity += q;
      } else {
        state.items.push({
          productId: action.payload.productId,
          slug: action.payload.slug,
          name: action.payload.name,
          price: action.payload.price,
          imageUrl: action.payload.imageUrl,
          quantity: q,
        });
      }
    },
    setQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const line = state.items.find((i) => i.productId === action.payload.productId);
      if (!line) return;
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter((i) => i.productId !== action.payload.productId);
      } else {
        line.quantity = action.payload.quantity;
      }
    },
    removeLine(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addOne, setQuantity, removeLine, clearCart } = cartSlice.actions;

export function persistCart(items: CartLine[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}
