export type JwtPayload = {
  sub: string;
  /** Present for Telegram user tokens */
  telegramId?: string;
  /** Omitted or `user` for storefront; `admin` for staff JWT */
  role?: 'user' | 'admin';
};
