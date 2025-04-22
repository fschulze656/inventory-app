import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import store from './app/redux/store';
import App from './app/App';
import { AuthProvider, AlertProvider, WebSocketProvider } from './app/02_Providers';

dayjs.extend(utc);

const root = createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <AlertProvider>
      <AuthProvider>
        <WebSocketProvider url={`wss://${window.location.hostname}`}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <App />
          </LocalizationProvider>
        </WebSocketProvider>
      </AuthProvider>
    </AlertProvider>
  </Provider>
);
