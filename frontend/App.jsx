import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChatDataProvider } from './contexts/ChatDataContext.jsx';
import { ElizaMemoriesProvider } from './contexts/ElizaMemoriesContext.jsx';
import CatDisplay from './components/CatDisplay.jsx';
import TerminalHeader from './components/TerminalHeader.jsx';
import Footer from './components/Footer.jsx';
import BottomNavigation from './components/BottomNavigation.jsx';
import FloatingChatButton from './components/FloatingChatButton.jsx';
import MaintenancePage from './components/MaintenancePage.jsx';

import About from './components/About.jsx';
import Docs from './components/Docs.jsx';
import AgentChat from './components/AgentChat.jsx';
import AgentChatSocket from './components/AgentChatSocket.jsx';
import ConversationLogs from './components/ConversationLogs.jsx';
import Terminal from './components/Terminal.jsx';

/**
 * Main Purl App Component - Digital Cat Consciousness Terminal
 * 
 * An immersive digital consciousness experience featuring Purl, a real cat 
 * transformed into an immortal AI agent. Experience includes:
 * - Full screen ASCII art cat with multiple animation states and expressions
 * - WebSocket integration for AI agent control
 * - Dual theme support (dark terminal / light modern)
 * - Always-on immersive terminal interface
 * - Debug mode for developers and testing
 * - Integration with ElizaOS agent system
 */
function PurlApp() {
  // Check for maintenance mode from environment variables
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';
  
  // Theme state for consistent theming across components
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('purl-theme') || localStorage.getItem('purl-fullscreen-theme');
    return savedTheme || 'light'; // Default to light theme
  });

  // Theme change handler
  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
    // Keep both localStorage keys in sync for backward compatibility
    localStorage.setItem('purl-theme', newTheme);
    localStorage.setItem('purl-fullscreen-theme', newTheme);
  };

  // Apply theme classes to body for proper CSS targeting
  useEffect(() => {
    document.body.className = document.body.className.replace(/\b(light|dark)\b/g, '').trim();
    document.body.classList.add(currentTheme);
  }, [currentTheme]);

  // If maintenance mode is enabled, show only the maintenance page
  if (isMaintenanceMode) {
    return (
      <ElizaMemoriesProvider agentId="40608b6b-63b6-0e2c-b819-9d9850d060ec">
        <ChatDataProvider agentId="40608b6b-63b6-0e2c-b819-9d9850d060ec">
          <div className="purl-app maintenance-mode">
            <MaintenancePage theme={currentTheme} />
          </div>
        </ChatDataProvider>
      </ElizaMemoriesProvider>
    );
  }

  return (
            <ElizaMemoriesProvider agentId="40608b6b-63b6-0e2c-b819-9d9850d060ec">
          <ChatDataProvider agentId="40608b6b-63b6-0e2c-b819-9d9850d060ec">
        <Router>
        <div className="purl-app fullscreen-mode">
        {/* Terminal Header - Navigation and branding */}
        <TerminalHeader theme={currentTheme} onThemeChange={handleThemeChange} />
        
        {/* Route-based Content */}
        <Routes>
          {/* Home Route - Terminal with Cat */}
          <Route path="/" element={
            <main className="app-main fullscreen-main">
              <CatDisplay 
                onThemeChange={handleThemeChange}
                initialTheme={currentTheme}
              />
            </main>
          } />
          
          {/* Agent Chat - Real-time Socket.IO Implementation (PRIMARY) */}
          <Route path="/chat" element={
            <main className="app-main chat-main">
              <AgentChatSocket theme={currentTheme} />
              <Footer theme={currentTheme} />
            </main>
          } />
          
          {/* Agent Chat API - Sessions API Implementation (ALTERNATIVE) */}
          <Route path="/chat-api" element={
            <main className="app-main chat-main">
              <AgentChat theme={currentTheme} />
              <Footer theme={currentTheme} />
            </main>
          } />
          
          {/* Conversation Logs Route */}
          <Route path="/logs" element={
            <main className="app-main logs-main">
              <ConversationLogs theme={currentTheme} />
              <Footer theme={currentTheme} />
            </main>
          } />
          
          {/* Terminal Route - Backroom Surveillance Feed */}
          <Route path="/terminal" element={
            <main className="app-main terminal-main">
              <Terminal theme={currentTheme} />
            </main>
          } />
          
          {/* About Route */}
          <Route path="/about" element={
            <main className="app-main about-main">
              <About theme={currentTheme} />
              <Footer theme={currentTheme} />
            </main>
          } />
          
          {/* Docs Route */}
          <Route path="/docs" element={
            <main className="app-main docs-main">
              <Docs theme={currentTheme} />
              <Footer theme={currentTheme} />
            </main>
          } />
        </Routes>
        
        {/* Bottom Navigation - Mobile Only */}
        <BottomNavigation theme={currentTheme} onThemeChange={handleThemeChange} />
        
        {/* Floating Chat Button - Mobile Only */}
        <FloatingChatButton theme={currentTheme} />

        {/* Hidden title for SEO and accessibility */}
        <h1 style={{ 
          position: 'absolute', 
          left: '-9999px', 
          visibility: 'hidden' 
        }}>
          Purl - AI Virtual Pet Terminal | purl.cat
        </h1>
        </div>
        </Router>
      </ChatDataProvider>
    </ElizaMemoriesProvider>
  );
}

export default PurlApp;
