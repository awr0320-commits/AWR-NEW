import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { WardrobeProvider } from './context/WardrobeContext';
import { LanguageProvider } from './context/LanguageContext';
import { FeatureGuideProvider } from './context/FeatureGuideContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Default to a dummy client ID if not provided, just so the app doesn't crash on load. 
// It will fail during actual login if invalid.
const GOOGLE_CLIENT_ID = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id';

import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <LanguageProvider>
          <FeatureGuideProvider>
            <WardrobeProvider>
              <App />
            </WardrobeProvider>
          </FeatureGuideProvider>
        </LanguageProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
