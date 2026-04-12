import { isTMA, retrieveRawInitData } from '@telegram-apps/sdk';
import { type ReactNode, useEffect } from 'react';
import { useExchangeTelegramMutation } from '../../app/parfumApi';
import { useAppDispatch } from '../../app/hooks';
import { setCredentials } from '../auth/authSlice';

/**
 * After Telegram SDK init, exchanges Web App initData for an API JWT (or applies dev token).
 */
export function UserSessionBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const [exchangeTelegram] = useExchangeTelegramMutation();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const devJwt = import.meta.env.VITE_DEV_JWT as string | undefined;
      if (!isTMA() && import.meta.env.DEV && devJwt?.trim()) {
        dispatch(
          setCredentials({
            accessToken: devJwt.trim(),
            expiresAtMs: Date.now() + 86400_000 * 7,
            user: null,
          }),
        );
        return;
      }

      if (!isTMA()) {
        return;
      }

      try {
        const initDataRaw = retrieveRawInitData();
        if (!initDataRaw) {
          return;
        }
        const res = await exchangeTelegram({ initDataRaw }).unwrap();
        if (cancelled) return;
        dispatch(
          setCredentials({
            accessToken: res.accessToken,
            expiresIn: res.expiresIn,
            user: res.user,
          }),
        );
      } catch {
        /* Invalid/expired initData or API unreachable */
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [dispatch, exchangeTelegram]);

  return children;
}
