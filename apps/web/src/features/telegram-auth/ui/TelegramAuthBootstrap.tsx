import { useEffect } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { setToken } from '@/entities/session/model/sessionSlice';
import {
  useLoginDevMutation,
  useLoginTelegramMutation,
} from '@/shared/api/parfumApi';
import { getTelegramWebApp } from '@/shared/lib/telegram';

export function TelegramAuthBootstrap() {
  const dispatch = useAppDispatch();
  const [loginTelegram] = useLoginTelegramMutation();
  const [loginDev] = useLoginDevMutation();

  useEffect(() => {
    const run = async () => {
      const twa = getTelegramWebApp();
      if (twa?.initData) {
        try {
          const res = await loginTelegram({ initData: twa.initData }).unwrap();
          dispatch(setToken(res.accessToken));
          return;
        } catch {
          /* fall through to dev login in development */
        }
      }

      if (import.meta.env.DEV) {
        try {
          const res = await loginDev().unwrap();
          dispatch(setToken(res.accessToken));
        } catch {
          /* dev server may not have AUTH_DEV_BYPASS */
        }
      }
    };
    void run();
  }, [dispatch, loginDev, loginTelegram]);

  return null;
}
