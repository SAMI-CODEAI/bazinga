import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, setupInstallPrompt, setupOnlineListeners } from './lib/pwa'
import { toast } from 'sonner'

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  registerServiceWorker().then((registration) => {
    if (registration) {
      console.log('PWA ready');
    }
  });
}

// Setup install prompt listener
setupInstallPrompt(() => {
  console.log('App can be installed');
});

// Setup online/offline listeners
setupOnlineListeners(
  () => {
    toast.success('Back online!', {
      description: 'Your connection has been restored.',
      duration: 3000,
    });
  },
  () => {
    toast.warning('You are offline', {
      description: 'Some features may be limited.',
      duration: 5000,
    });
  }
);

createRoot(document.getElementById("root")!).render(<App />);

