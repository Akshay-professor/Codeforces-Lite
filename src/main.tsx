import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { Toaster } from 'sonner';
// import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
      <Toaster position="top-right" richColors />
    </StrictMode>,
  );
} else {
  console.error("Failed to find the root element with ID 'root'. React app cannot be mounted.");
}