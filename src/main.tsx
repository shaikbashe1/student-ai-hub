import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';
import './index.css';

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN as string,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}

if (typeof window !== 'undefined' && import.meta.env.VITE_GA4_MEASUREMENT_ID) {
  const gid = import.meta.env.VITE_GA4_MEASUREMENT_ID as string;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gid}`;
  document.head.appendChild(script);
  const w = window as Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };
  w.dataLayer = w.dataLayer ?? [];
  w.gtag = function(...args: unknown[]) { w.dataLayer!.push(args); };
  w.gtag('js', new Date());
  w.gtag('config', gid);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
