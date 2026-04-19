import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { io, type Socket } from 'socket.io-client';
import { getParfumApiBaseUrl } from '../../app/parfumApi';
import { useAppDispatch } from '../../app/hooks';
import { parfumApi } from '../../app/parfumApi';

type OrderUpdateEvent = {
  orderId: string;
  status: string;
  updatedAt: string;
  reason: 'created' | 'updated';
};

type ProductStockEvent = {
  productId: string;
  stock: number | null;
};

export function useUserOrdersRealtime(): void {
  const token = useSelector(
    (state: { auth: { accessToken: string | null } }) => state.auth.accessToken,
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!token) return;

    const apiBase = getParfumApiBaseUrl();
    const useRelativeProxy = apiBase.startsWith('/');
    const socket: Socket = io(useRelativeProxy ? '/user' : `${apiBase}/user`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      path: useRelativeProxy ? `${apiBase}/socket.io` : '/socket.io',
    });

    const onOrder = (ev: OrderUpdateEvent) => {
      dispatch(
        parfumApi.util.invalidateTags([
          { type: 'Order', id: 'LIST' },
          { type: 'Order', id: ev.orderId },
        ]),
      );
    };

    const onStock = (ev: ProductStockEvent) => {
      dispatch(
        parfumApi.util.invalidateTags([
          { type: 'Product', id: ev.productId },
          { type: 'Product', id: 'LIST' },
        ]),
      );
    };

    socket.on('order:update', onOrder);
    socket.on('product:stock', onStock);

    return () => {
      socket.off('order:update', onOrder);
      socket.off('product:stock', onStock);
      socket.disconnect();
    };
  }, [dispatch, token]);
}
