import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
} from '@reduxjs/toolkit/query/react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { logout } from '../features/auth/authSlice';
import type { TelegramAuthUser } from '../features/auth/authSlice';

/**
 * API base URL. In dev, defaults to a same-origin path proxied by Vite to localhost:3000
 * so Telegram/ngrok tunnels work without a second tunnel. Override with VITE_API_BASE_URL.
 */
export function getParfumApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (import.meta.env.DEV) return '/_parfumbox-api';
  return 'http://localhost:3000';
}

const baseUrl = getParfumApiBaseUrl();

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (
      getState() as { auth: { accessToken: string | null } }
    ).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn = async (args, api, extraOptions) => {
  const hadToken = Boolean(
    (api.getState() as { auth: { accessToken: string | null } }).auth
      .accessToken,
  );
  const result = await rawBaseQuery(args, api, extraOptions);
  const err = result.error as FetchBaseQueryError | undefined;
  if (err && err.status === 401 && hadToken) {
    api.dispatch(logout());
  }
  return result;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  images: string[];
  stock: number | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string | null;
  quantity: number;
  unitPriceCents: number;
  titleSnapshot: string;
};

export type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotalCents: number;
  totalCents: number;
  deliveryPhone: string | null;
  deliveryFirstName: string | null;
  deliveryLastName: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export type UserProfile = {
  id: string;
  telegramId: string;
  telegramUsername: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  birthDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TelegramAuthResponse = {
  accessToken: string;
  expiresIn: number;
  user: TelegramAuthUser;
};

export const parfumApi = createApi({
  reducerPath: 'parfumApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Product', 'Order', 'UserProfile'],
  endpoints: (build) => ({
    exchangeTelegram: build.mutation<
      TelegramAuthResponse,
      { initDataRaw: string }
    >({
      query: (body) => ({
        url: '/auth/telegram',
        method: 'POST',
        body,
      }),
    }),
    getProducts: build.query<Product[], void>({
      query: () => '/products',
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({ type: 'Product' as const, id: p.id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    getProduct: build.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Product', id }],
    }),
    getMe: build.query<UserProfile, void>({
      query: () => '/users/me',
      providesTags: [{ type: 'UserProfile', id: 'ME' }],
    }),
    patchMe: build.mutation<
      UserProfile,
      Partial<{
        phone: string;
        firstName: string;
        lastName: string;
        birthDate: string;
      }>
    >({
      query: (body) => ({
        url: '/users/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'UserProfile', id: 'ME' }],
    }),
    listOrders: build.query<Order[], void>({
      query: () => '/orders',
      providesTags: (result) =>
        result
          ? [
              ...result.map((o) => ({ type: 'Order' as const, id: o.id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),
    getOrder: build.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Order', id }],
    }),
    createOrder: build.mutation<
      Order,
      {
        items: Array<{ productId: string; quantity: number }>;
        deliveryPhone?: string;
        deliveryFirstName?: string;
        deliveryLastName?: string;
        birthDate?: string;
      }
    >({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }, 'UserProfile'],
    }),
  }),
});

export const {
  useExchangeTelegramMutation,
  useGetProductsQuery,
  useGetProductQuery,
  useGetMeQuery,
  usePatchMeMutation,
  useListOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
} = parfumApi;
