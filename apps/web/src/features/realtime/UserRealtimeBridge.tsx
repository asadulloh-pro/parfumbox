import { useUserOrdersRealtime } from './useUserOrdersRealtime';

/** Connects Socket.IO when a user JWT is present (Telegram mini app or dev JWT). */
export function UserRealtimeBridge(): null {
  useUserOrdersRealtime();
  return null;
}
