import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker immediately to support offline caching and automatic Android/iOS installation prompts
if ('serviceWorker' in navigator) {
  const registerSW = () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[PWA] Service Worker registered successfully with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  };

  if (document.readyState === 'complete') {
    registerSW();
  } else {
    window.addEventListener('load', registerSW);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
