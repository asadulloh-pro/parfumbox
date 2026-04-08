import { ConfigProvider, theme } from 'antd';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@/app/store';
import { TelegramAuthBootstrap } from '@/features/telegram-auth/ui/TelegramAuthBootstrap';
import { getTelegramWebApp } from '@/shared/lib/telegram';

const twa = typeof window !== 'undefined' ? getTelegramWebApp() : undefined;
const dark = twa?.colorScheme === 'dark';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        <BrowserRouter>
          <TelegramAuthBootstrap />
          {children}
        </BrowserRouter>
      </ConfigProvider>
    </Provider>
  );
}
