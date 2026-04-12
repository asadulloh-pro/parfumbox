import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const STORAGE_KEY = 'pb_cart';

export type CartLine = {
  productId: string;
  quantity: number;
  title: string;
  unitPriceCents: number;
  imageUrl: string | null;
};

export type CartState = { items: CartLine[] };

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line): line is CartLine =>
        line &&
        typeof line === 'object' &&
        typeof (line as CartLine).productId === 'string' &&
        typeof (line as CartLine).quantity === 'number' &&
        typeof (line as CartLine).title === 'string' &&
        typeof (line as CartLine).unitPriceCents === 'number',
    );
  } catch {
    return [];
  }
}

function saveCart(items: CartLine[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const initialState: CartState = { items: loadCart() };

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addOrMergeLine(
      state,
      action: PayloadAction<{
        productId: string;
        title: string;
        unitPriceCents: number;
        imageUrl: string | null;
        quantity?: number;
      }>,
    ) {
      const qty = action.payload.quantity ?? 1;
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId,
      );
      if (existing) {
        existing.quantity += qty;
        existing.title = action.payload.title;
        existing.unitPriceCents = action.payload.unitPriceCents;
        existing.imageUrl = action.payload.imageUrl;
      } else {
        state.items.push({
          productId: action.payload.productId,
          quantity: qty,
          title: action.payload.title,
          unitPriceCents: action.payload.unitPriceCents,
          imageUrl: action.payload.imageUrl,
        });
      }
      saveCart(state.items);
    },
    setLineQuantity(
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) {
      const line = state.items.find(
        (i) => i.productId === action.payload.productId,
      );
      if (!line) return;
      if (action.payload.quantity < 1) {
        state.items = state.items.filter(
          (i) => i.productId !== action.payload.productId,
        );
      } else {
        line.quantity = action.payload.quantity;
      }
      saveCart(state.items);
    },
    removeLine(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
      saveCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      saveCart(state.items);
    },
  },
});

export const { addOrMergeLine, setLineQuantity, removeLine, clearCart } =
  cartSlice.actions;
