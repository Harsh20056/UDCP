import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { setupMockAdapter } from './api/mock/mockAdapter.js';

// Install mock adapter before anything renders
setupMockAdapter();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
