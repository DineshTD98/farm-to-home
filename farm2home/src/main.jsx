import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import { store } from './redux/store';
import './index.css'
import './i18n';
import App from './App.jsx'
import OneSignal from 'react-onesignal';
import { LanguageProvider } from './context/LanguageContext';

// Initialize OneSignal and Render App
const startApp = async () => {
  try {
    await OneSignal.init({
      appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
    });
    console.log('[OneSignal] Initialized successfully');

    // Optionally request notification permission early
    await OneSignal.Notifications.requestPermission();
  } catch (error) {
    console.error('OneSignal Init Error:', error);
  } finally {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <Provider store={store}>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </Provider>
      </StrictMode>
    );
  }
};

startApp();
