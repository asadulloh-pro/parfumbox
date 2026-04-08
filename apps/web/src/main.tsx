import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from '@/app/providers/AppProviders';
import { App } from '@/app/App';
import '@/app/styles/index.css';
import { getTelegramWebApp } from '@/shared/lib/telegram';

const twa = getTelegramWebApp();
if (twa) {
  twa.ready();
  twa.expand();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
