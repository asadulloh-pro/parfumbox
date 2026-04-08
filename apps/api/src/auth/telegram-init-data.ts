import { createHmac, timingSafeEqual } from 'crypto';

export type TelegramWebAppUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

export function validateTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds: number,
): { valid: false } | { valid: true; user: TelegramWebAppUser; authDate: number } {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) {
    return { valid: false };
  }

  const authDateRaw = params.get('auth_date');
  const authDate = authDateRaw ? parseInt(authDateRaw, 10) : 0;
  if (!authDate || Number.isNaN(authDate)) {
    return { valid: false };
  }

  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > maxAgeSeconds) {
    return { valid: false };
  }

  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computed = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  try {
    const a = Buffer.from(computed, 'hex');
    const b = Buffer.from(hash, 'hex');
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { valid: false };
    }
  } catch {
    return { valid: false };
  }

  const userRaw = params.get('user');
  if (!userRaw) {
    return { valid: false };
  }

  let user: TelegramWebAppUser;
  try {
    user = JSON.parse(userRaw) as TelegramWebAppUser;
  } catch {
    return { valid: false };
  }

  if (!user?.id) {
    return { valid: false };
  }

  return { valid: true, user, authDate };
}
