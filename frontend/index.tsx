import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import PurlApp from './App.jsx';

/**
 * Main application entry point
 * Simple setup for the Purl frontend with ElizaOS Sessions API integration
 */
function MainApp() {
  return <PurlApp />;
}

// Initialize the application
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<MainApp />);
} else {
  console.error('Root element not found');
}
