import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from "react-router";

// PWA Service Worker Registration
import { registerSW } from 'virtual:pwa-register';

// Register service worker for offline functionality
const updateSW = registerSW({
  onNeedRefresh() {
    // Optional: Show update available notification
    console.log('App update available');
    if (confirm('New app version available. Reload to update?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
    // Optional: Show offline ready notification
  },
  onRegistered(r) {
    console.log('Service Worker registered:', r);
  },
  onRegisterError(error) {
    console.error('Service Worker registration error:', error);
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/picklist-pwa">
      <App />
    </BrowserRouter>,
  </StrictMode>,
);
