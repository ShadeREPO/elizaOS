import { createRoot } from 'react-dom/client';
import React from 'react';
import PurlApp from './App.jsx';
import './index.css';

/**
 * Standalone Purl App Entry Point
 * 
 * This is the main entry point for running Purl as a standalone React application
 * outside of the ElizaOS dashboard. This allows for independent development and testing.
 */

// Apply light mode for standalone app (opposite of ElizaOS dashboard)
React.useEffect = React.useEffect || (() => {});

function StandalonePurlApp() {
  // Apply light mode styling
  React.useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  }, []);

  return <PurlApp />;
}

// Initialize the standalone application
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<StandalonePurlApp />);
} else {
  console.error('Root element not found! Make sure your HTML has a div with id="root"');
}
