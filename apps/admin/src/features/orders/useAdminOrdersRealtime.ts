import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { getParfumApiBaseUrl } from '../../app/apiBase';
import { useAppDispatch } from '../../app/hooks';
import { parfumApi } from '../../app/parfumApi';
import {
  type AdminNotificationNewPayload,
  showAdminNotificationToast,
} from '../notifications/showAdminNotificationToast';

export function useAdminOrdersRealtime(): void {
  const token = useSelector(
    (state: { auth: { accessToken: string | null } }) => state.auth.accessToken,
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!token) return;

    const apiBase = getParfumApiBaseUrl();
    const useRelativeProxy = apiBase.startsWith('/');
    const socket = io(useRelativeProxy ? '/admin' : `${apiBase}/admin`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      path: useRelativeProxy ? `${apiBase}/socket.io` : '/socket.io',
    });

    socket.on('orders:changed', () => {
      dispatch(
        parfumApi.util.invalidateTags([
          { type: 'Order', id: 'LIST' },
          'Stats',
        ]),
      );
    });

    socket.on('notifications:new', (payload: AdminNotificationNewPayload) => {
      dispatch(parfumApi.util.invalidateTags([{ type: 'Notification', id: 'LIST' }]));
      showAdminNotificationToast(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, token]);
}
