import { createApi, fetchBaseQuery, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { logout } from '../features/auth/authSlice';

const baseUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: { accessToken: string | null } }).auth
      .accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn = async (args, api, extraOptions) => {
  const hadToken = Boolean(
    (api.getState() as { auth: { accessToken: string | null } }).auth.accessToken,
  );
  const result = await rawBaseQuery(args, api, extraOptions);
  const err = result.error as FetchBaseQueryError | undefined;
  if (err && err.status === 401 && hadToken) {
    api.dispatch(logout());
  }
  return result;
};

export type LoginResponse = {
  accessToken: string;
  expiresIn: number;
};

export type DashboardStats = {
  totals: {
    productCount: number;
    ordersInRange: number;
    newUsersInRange: number;
  };
  series: Array<{ date: string; orders: number; newUsers: number }>;
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

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string | null;
  quantity: number;
  unitPriceCents: number;
  titleSnapshot: string;
};

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type AdminOrder = {
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
  user: {
    id: string;
    telegramId: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    birthDate: string | null;
  };
};

export type TelegramUser = {
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

export const parfumApi = createApi({
  reducerPath: 'parfumApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Product', 'Order', 'User', 'Stats'],
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, { email: string; password: string }>({
      query: (body) => ({
        url: '/admin/auth/login',
        method: 'POST',
        body,
      }),
    }),
    getDashboardStats: build.query<
      DashboardStats,
      { from: string; to: string }
    >({
      query: ({ from, to }) => ({
        url: '/admin/stats',
        params: { from, to },
      }),
      providesTags: ['Stats'],
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
    createProduct: build.mutation<
      Product,
      {
        title: string;
        description?: string;
        priceCents: number;
        images?: string[];
        stock?: number;
      }
    >({
      query: (body) => ({ url: '/admin/products', method: 'POST', body }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, 'Stats'],
    }),
    updateProduct: build.mutation<
      Product,
      {
        id: string;
        body: Partial<{
          title: string;
          description: string;
          priceCents: number;
          images: string[];
          stock: number | null;
        }>;
      }
    >({
      query: ({ id, body }) => ({
        url: `/admin/products/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
        'Stats',
      ],
    }),
    deleteProduct: build.mutation<{ ok: true }, string>({
      query: (id) => ({ url: `/admin/products/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
        'Stats',
      ],
    }),
    getOrders: build.query<AdminOrder[], void>({
      query: () => '/admin/orders',
      providesTags: (result) =>
        result
          ? [
              ...result.map((o) => ({ type: 'Order' as const, id: o.id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),
    updateOrderStatus: build.mutation<
      { id: string; status: OrderStatus; updatedAt: string },
      { id: string; status: OrderStatus }
    >({
      query: ({ id, status }) => ({
        url: `/admin/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
        'Stats',
      ],
    }),
    getUsers: build.query<TelegramUser[], void>({
      query: () => '/admin/users',
      providesTags: (result) =>
        result
          ? [
              ...result.map((u) => ({ type: 'User' as const, id: u.id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetDashboardStatsQuery,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetUsersQuery,
} = parfumApi;
