import { configureStore } from '@reduxjs/toolkit';
import { sessionSlice } from '@/entities/session/model/sessionSlice';
import { cartSlice, persistCart } from '@/entities/cart/model/cartSlice';
import { parfumApi } from '@/shared/api/parfumApi';

export const store = configureStore({
  reducer: {
    session: sessionSlice.reducer,
    cart: cartSlice.reducer,
    [parfumApi.reducerPath]: parfumApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(parfumApi.middleware),
});

store.subscribe(() => {
  persistCart(store.getState().cart.items);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
