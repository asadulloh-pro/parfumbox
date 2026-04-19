import { AppRoot } from '@telegram-apps/telegram-ui';
import { type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ProfileLocaleSync } from '../../features/i18n/ProfileLocaleSync';
import { UserRealtimeBridge } from '../../features/realtime/UserRealtimeBridge';
import { UserSessionBootstrap } from '../../features/session/UserSessionBootstrap';
import { store } from '../store';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <UserSessionBootstrap>
        <ProfileLocaleSync />
        <UserRealtimeBridge />
        <BrowserRouter>
          <AppRoot>{children}</AppRoot>
        </BrowserRouter>
      </UserSessionBootstrap>
    </Provider>
  );
}
