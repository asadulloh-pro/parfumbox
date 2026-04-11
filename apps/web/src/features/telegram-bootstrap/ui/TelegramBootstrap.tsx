import { init, isTMA, themeParams } from '@telegram-apps/sdk';
import { type ReactNode, useEffect } from 'react';

/**
 * Initializes the Telegram Mini Apps SDK and binds theme CSS variables when supported.
 * In a normal browser there are no launch params — skip SDK init and rely on brand CSS tokens.
 */
export function TelegramBootstrap({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!isTMA()) {
      return;
    }

    const destroy = init();
    try {
      if (themeParams.mountSync.isAvailable()) {
        themeParams.mountSync();
      }
      if (themeParams.bindCssVars.isAvailable()) {
        themeParams.bindCssVars();
      }
    } catch {
      /* Unsupported bridge — brand tokens still apply */
    }
    return destroy;
  }, []);

  return children;
}
