import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

type SessionSlice = { token: string | null };

export type AdminOrderRow = {
  id: string;
  userId: string;
  status: string;
  paymentMethod: string;
  total: string;
  deliveryPhone: string;
  deliveryAddress: string;
  deliveryComment: string | null;
  createdAt: string;
  user: {
    id: string;
    telegramId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  items: Array<{
    id: string;
    quantity: number;
    priceSnapshot: string;
    product: {
      id: string;
      name: string;
      slug: string;
      imageUrl: string | null;
    };
  }>;
};

export type ClientRow = {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  orderCount: number;
};

export type ProductRow = {
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

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? '',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as { session: SessionSlice }).session.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Order', 'Client', 'Product'],
  endpoints: (build) => ({
    login: build.mutation<{ accessToken: string }, { apiKey: string }>({
      query: (body) => ({
        url: '/api/admin/login',
        method: 'POST',
        body,
      }),
    }),
    getOrders: build.query<
      { items: AdminOrderRow[]; total: number },
      { skip?: number; take?: number; status?: string }
    >({
      query: (params) => ({
        url: '/api/admin/orders',
        params: {
          skip: params.skip ?? 0,
          take: params.take ?? 20,
          ...(params.status ? { status: params.status } : {}),
        },
      }),
      providesTags: ['Order'],
    }),
    getOrder: build.query<AdminOrderRow, string>({
      query: (id) => `/api/admin/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Order', id }],
    }),
    patchOrder: build.mutation<
      AdminOrderRow,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/api/admin/orders/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Order'],
    }),
    getClients: build.query<
      { items: ClientRow[]; total: number },
      { skip?: number; take?: number }
    >({
      query: (params) => ({
        url: '/api/admin/clients',
        params: {
          skip: params.skip ?? 0,
          take: params.take ?? 20,
        },
      }),
      providesTags: ['Client'],
    }),
    getClient: build.query<
      ClientRow & {
        recentOrders: Array<{
          id: string;
          status: string;
          total: string;
          createdAt: string;
        }>;
      },
      string
    >({
      query: (id) => `/api/admin/clients/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Client', id }],
    }),
    getProducts: build.query<ProductRow[], void>({
      query: () => '/api/admin/products',
      providesTags: ['Product'],
    }),
    createProduct: build.mutation<
      ProductRow,
      {
        slug: string;
        name: string;
        description?: string;
        price: string;
        currency?: string;
        imageUrl?: string;
        volumeMl?: number;
        stock?: number;
        isActive?: boolean;
      }
    >({
      query: (body) => ({
        url: '/api/admin/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: build.mutation<
      ProductRow,
      { id: string; patch: Partial<{
        slug: string;
        name: string;
        description: string;
        price: string;
        currency: string;
        imageUrl: string;
        volumeMl: number;
        stock: number;
        isActive: boolean;
      }> }
    >({
      query: ({ id, patch }) => ({
        url: `/api/admin/products/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: build.mutation<ProductRow, string>({
      query: (id) => ({
        url: `/api/admin/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  usePatchOrderMutation,
  useGetClientsQuery,
  useGetClientQuery,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = adminApi;
