import { AppRoot } from '@telegram-apps/telegram-ui';
import { type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { UserSessionBootstrap } from '../../features/session/UserSessionBootstrap';
import { TelegramBootstrap } from '../../features/telegram-bootstrap/ui/TelegramBootstrap';
import { store } from '../store';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <TelegramBootstrap>
        <UserSessionBootstrap>
          <BrowserRouter>
            <AppRoot>{children}</AppRoot>
          </BrowserRouter>
        </UserSessionBootstrap>
      </TelegramBootstrap>
    </Provider>
  );
}
