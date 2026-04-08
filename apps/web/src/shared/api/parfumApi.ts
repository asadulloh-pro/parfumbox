import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { apiBaseUrl } from '@/shared/config/env';

type SessionSlice = { token: string | null };

export type ProductDto = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: string;
  currency: string;
  imageUrl: string | null;
  volumeMl: number | null;
  stock: number | null;
  isActive: boolean;
  createdAt: string;
};

export type OrderItemDto = {
  id: string;
  quantity: number;
  priceSnapshot: string;
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  };
};

export type OrderDto = {
  id: string;
  status: string;
  paymentMethod: string;
  total: string;
  deliveryPhone: string;
  deliveryAddress: string;
  deliveryComment: string | null;
  createdAt: string;
  items: OrderItemDto[];
};

export const parfumApi = createApi({
  reducerPath: 'parfumApi',
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as { session: SessionSlice }).session.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Product', 'Order'],
  endpoints: (build) => ({
    getProducts: build.query<ProductDto[], void>({
      query: () => ({ url: '/api/products' }),
      providesTags: ['Product'],
    }),
    getProductBySlug: build.query<ProductDto, string>({
      query: (slug) => ({ url: `/api/products/${encodeURIComponent(slug)}` }),
      providesTags: (_r, _e, slug) => [{ type: 'Product', id: slug }],
    }),
    loginTelegram: build.mutation<
      { accessToken: string; user: { id: string; telegramId: string } },
      { initData: string }
    >({
      query: (body) => ({
        url: '/api/auth/telegram',
        method: 'POST',
        body,
      }),
    }),
    loginDev: build.mutation<
      { accessToken: string; user: { id: string; telegramId: string } },
      { telegramId?: string } | void
    >({
      query: (arg) => ({
        url: '/api/auth/dev',
        method: 'POST',
        headers: arg && typeof arg === 'object' && arg.telegramId
          ? { 'X-Dev-Telegram-Id': arg.telegramId }
          : {},
      }),
    }),
    getOrders: build.query<OrderDto[], void>({
      query: () => ({ url: '/api/orders' }),
      providesTags: ['Order'],
    }),
    createOrder: build.mutation<
      OrderDto,
      {
        items: { productId: string; quantity: number }[];
        paymentMethod: 'cod' | 'bank_transfer';
        deliveryPhone: string;
        deliveryAddress: string;
        deliveryComment?: string;
      }
    >({
      query: (body) => ({
        url: '/api/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useLoginTelegramMutation,
  useLoginDevMutation,
  useGetOrdersQuery,
  useCreateOrderMutation,
} = parfumApi;
