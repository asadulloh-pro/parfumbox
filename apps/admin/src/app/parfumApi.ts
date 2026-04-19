import { createApi, fetchBaseQuery, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { logout } from '../features/auth/authSlice';
import { getParfumApiBaseUrl } from './apiBase';
import { normalizePaginated, type PaginatedResult } from './paginationNormalize';

const baseUrl = getParfumApiBaseUrl();

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

export type SizePreset = {
  id: string;
  slug: string;
  label: string;
  grams: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductSizeOption = {
  id: string;
  presetId: string;
  label: string;
  grams: number;
  priceUzs: number;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  priceUzs: number;
  sizes: ProductSizeOption[] | null;
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
  unitPriceUzs: number;
  titleSnapshot: string;
  sizeId: string | null;
  sizeLabelSnapshot: string | null;
  gramsSnapshot: number | null;
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
  subtotalUzs: number;
  totalUzs: number;
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

export type { PaginatedResult };

export type AdminOrdersQuery = {
  page: number;
  pageSize: number;
  status?: OrderStatus;
  createdFrom?: string;
  createdTo?: string;
};

export type AdminNotificationKind = 'ORDER_CREATED' | 'ORDER_UPDATED';

export type AdminNotificationItem = {
  id: string;
  kind: AdminNotificationKind;
  orderId: string;
  read: boolean;
  createdAt: string;
};

export const parfumApi = createApi({
  reducerPath: 'parfumApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Product', 'Order', 'User', 'Stats', 'Notification', 'SizePreset'],
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
    getSizePresets: build.query<PaginatedResult<SizePreset>, { page: number; pageSize: number }>({
      query: ({ page, pageSize }) => ({
        url: '/admin/size-presets',
        params: { page, pageSize },
      }),
      transformResponse: (response: unknown, _m, arg) =>
        normalizePaginated<SizePreset>(response, { page: arg.page, pageSize: arg.pageSize }),
      providesTags: (result) =>
        result?.items?.length
          ? [
              ...result.items.map((p) => ({ type: 'SizePreset' as const, id: p.id })),
              { type: 'SizePreset', id: 'LIST' },
            ]
          : [{ type: 'SizePreset', id: 'LIST' }],
    }),
    createSizePreset: build.mutation<
      SizePreset,
      { slug: string; label: string; grams: number; sortOrder?: number }
    >({
      query: (body) => ({
        url: '/admin/size-presets',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'SizePreset', id: 'LIST' }],
    }),
    updateSizePreset: build.mutation<
      SizePreset,
      { id: string; body: Partial<{ slug: string; label: string; grams: number; sortOrder: number }> }
    >({
      query: ({ id, body }) => ({
        url: `/admin/size-presets/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'SizePreset', id },
        { type: 'SizePreset', id: 'LIST' },
      ],
    }),
    deleteSizePreset: build.mutation<{ ok: true }, string>({
      query: (id) => ({
        url: `/admin/size-presets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'SizePreset', id: 'LIST' }],
    }),
    getProducts: build.query<PaginatedResult<Product>, { page: number; pageSize: number }>({
      query: ({ page, pageSize }) => ({
        url: '/products',
        params: { page, pageSize },
      }),
      transformResponse: (response: unknown, _m, arg) =>
        normalizePaginated<Product>(response, { page: arg.page, pageSize: arg.pageSize }),
      providesTags: (result) =>
        result?.items?.length
          ? [
              ...result.items.map((p) => ({ type: 'Product' as const, id: p.id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    createProduct: build.mutation<
      Product,
      {
        title: string;
        description?: string;
        priceUzs: number;
        sizes?: Array<{ presetId: string; priceUzs: number }>;
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
          priceUzs: number;
          sizes: Array<{ presetId: string; priceUzs: number }> | [];
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
    getOrders: build.query<PaginatedResult<AdminOrder>, AdminOrdersQuery>({
      query: ({ page, pageSize, status, createdFrom, createdTo }) => {
        const params: Record<string, string | number> = { page, pageSize };
        if (status) params.status = status;
        if (createdFrom) params.createdFrom = createdFrom;
        if (createdTo) params.createdTo = createdTo;
        return { url: '/admin/orders', params };
      },
      transformResponse: (response: unknown, _m, arg) =>
        normalizePaginated<AdminOrder>(response, { page: arg.page, pageSize: arg.pageSize }),
      providesTags: (result) =>
        result?.items?.length
          ? [
              ...result.items.map((o) => ({ type: 'Order' as const, id: o.id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),
    getAdminOrder: build.query<AdminOrder, string>({
      query: (id) => `/admin/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Order', id }],
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
      ],
    }),
    getUsers: build.query<PaginatedResult<TelegramUser>, { page: number; pageSize: number }>({
      query: ({ page, pageSize }) => ({
        url: '/admin/users',
        params: { page, pageSize },
      }),
      transformResponse: (response: unknown, _m, arg) =>
        normalizePaginated<TelegramUser>(response, { page: arg.page, pageSize: arg.pageSize }),
      providesTags: (result) =>
        result?.items?.length
          ? [
              ...result.items.map((u) => ({ type: 'User' as const, id: u.id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),
    getNotifications: build.query<AdminNotificationItem[], void>({
      query: () => ({
        url: '/admin/notifications',
        params: { limit: 50 },
      }),
      providesTags: [{ type: 'Notification', id: 'LIST' }],
    }),
    markNotificationRead: build.mutation<{ ok: true }, string>({
      query: (id) => ({
        url: `/admin/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),
    markAllNotificationsRead: build.mutation<{ marked: number }, void>({
      query: () => ({
        url: '/admin/notifications/read-all',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetDashboardStatsQuery,
  useGetSizePresetsQuery,
  useCreateSizePresetMutation,
  useUpdateSizePresetMutation,
  useDeleteSizePresetMutation,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetOrdersQuery,
  useGetAdminOrderQuery,
  useUpdateOrderStatusMutation,
  useGetUsersQuery,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = parfumApi;
