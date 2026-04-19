import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { adminTheme } from './app/theme';
import { store } from './app/store';
import App from './app/App';
import './i18n';
import { DatesProviderBridge } from './i18n/DatesProviderBridge';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <MantineProvider theme={adminTheme}>
        <DatesProviderBridge>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </DatesProviderBridge>
      </MantineProvider>
    </Provider>
  </StrictMode>,
);
