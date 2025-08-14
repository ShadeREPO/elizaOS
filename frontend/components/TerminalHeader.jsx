import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AngelIcon, DevilIcon } from './icons/Icons.jsx';

/**
 * TerminalHeader Component - Full Screen Terminal Navigation
 * 
 * Features:
 * - Site branding with logo and name
 * - Connection status indicator
 * - Navigation links (About, Docs)
 * - Social media icons (X/Twitter)
 * - Click-to-copy contract address
 * - Theme toggle button
 * - Dual theme support (dark terminal / light modern)
 * - Responsive mobile navigation with hamburger menu
 * - Touch-friendly interface for all mobile devices
 */
const TerminalHeader = ({ theme = 'dark', onThemeChange }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Example contract address - replace with actual address
  const contractAddress = "0x1234567890abcdef1234567890abcdef12345678";
  
  /**
   * Toggle mobile menu and handle body scroll
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  /**
   * Close mobile menu when clicking on a link
   */
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  /**
   * Handle body scroll lock when mobile menu is open
   */
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  /**
   * Close mobile menu when window is resized to desktop
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Copy contract address to clipboard
   */
  const copyContractAddress = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopySuccess(true);
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy contract address:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = contractAddress;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  /**
   * Format contract address for display (truncated)
   */
  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  /**
   * Toggle theme between dark and light
   */
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    // Save to localStorage (keeping compatibility with both keys)
    localStorage.setItem('purl-theme', newTheme);
    localStorage.setItem('purl-fullscreen-theme', newTheme);
    
    // Notify parent component
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  return (
    <header className={`terminal-header ${theme}`}>
      <div className="terminal-header-container">
        {/* Left Section - Logo, Site Name, and Connection Status */}
        <div className="header-brand">
          <Link to="/" className="brand-logo">
            <img 
              src="/logo_web.png" 
              alt="Purl Logo" 
              className="logo-image"
            />
            <span className="site-name">purl</span>
          </Link>
          
          {/* Connection Status */}
          <div className="header-connection-status">
            <div className="status-dot connected"></div>
            <span className="status-text">
              Online
            </span>
          </div>
        </div>

        {/* Center Section - Navigation Links (Desktop) */}
        <nav className="header-nav desktop-nav">
          <Link 
            to="/chat" 
            className="nav-link"
            title="Chat with Purl agent"
          >
            Chat
          </Link>
          <Link 
            to="/logs" 
            className="nav-link"
            title="View conversation logs"
          >
            Logs
          </Link>
          <Link 
            to="/terminal" 
            className="nav-link"
            title="Live agent surveillance feed"
          >
            Terminal
          </Link>
          <Link 
            to="/about" 
            className="nav-link"
            title="Learn more about Purl"
          >
            About
          </Link>
          <a 
            href="/docs" 
            className="nav-link"
            title="Documentation and guides"
          >
            Docs
          </a>
        </nav>

        {/* Right Section - Social, Contract & Mobile Menu */}
        <div className="header-actions">
          {/* Social Icons - Desktop Only */}
          <div className="social-links desktop-only">
            <a 
              href="https://x.com/futurepurl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              title="Follow us on X (Twitter)"
              aria-label="X (Twitter)"
            >
              {/* X (Twitter) Icon */}
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                className="social-icon"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>

          {/* Contract Address & Theme Toggle - Desktop Only */}
          <div className="contract-section desktop-only">
            <button
              onClick={copyContractAddress}
              className={`contract-btn ${copySuccess ? 'copied' : ''}`}
              title={copySuccess ? 'Copied!' : 'Click to copy contract address'}
            >
              <span className="contract-label">CA:</span>
              <span className="contract-address">
                {formatAddress(contractAddress)}
              </span>
              {copySuccess && (
                <span className="copy-success">✓</span>
              )}
            </button>
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="header-theme-toggle"
              title={`Switch to ${theme === 'dark' ? 'Angel (Light)' : 'Devil (Dark)'} Theme`}
              aria-label={`Switch to ${theme === 'dark' ? 'angel light' : 'devil dark'} theme`}
            >
              {theme === 'dark' ? <AngelIcon size={18} /> : <DevilIcon size={18} />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`mobile-menu-btn ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <span className="hamburger">
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-nav-overlay"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Menu */}
      <nav className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''} ${theme}`}>
        <div className="mobile-nav-content">
          {/* Mobile Navigation Links */}
          <div className="mobile-nav-links">
            <Link 
              to="/" 
              className="mobile-nav-link"
              onClick={closeMobileMenu}
              title="Go to home"
            >
              <span className="nav-icon">🏠</span>
              <span>Home</span>
            </Link>
            <Link 
              to="/chat" 
              className="mobile-nav-link"
              onClick={closeMobileMenu}
              title="Chat with Purl agent"
            >
              <span className="nav-icon">💬</span>
              <span>Chat</span>
            </Link>
            <Link 
              to="/logs" 
              className="mobile-nav-link"
              onClick={closeMobileMenu}
              title="View conversation logs"
            >
              <span className="nav-icon">📋</span>
              <span>Logs</span>
            </Link>
            <Link 
              to="/terminal" 
              className="mobile-nav-link"
              onClick={closeMobileMenu}
              title="Live agent surveillance feed"
            >
              <span className="nav-icon">🖥️</span>
              <span>Terminal</span>
            </Link>
            <Link 
              to="/about" 
              className="mobile-nav-link"
              onClick={closeMobileMenu}
              title="Learn more about Purl"
            >
              <span className="nav-icon">ℹ️</span>
              <span>About</span>
            </Link>
            <a 
              href="/docs" 
              className="mobile-nav-link"
              onClick={closeMobileMenu}
              title="Documentation and guides"
            >
              <span className="nav-icon">📚</span>
              <span>Docs</span>
            </a>
          </div>

          {/* Mobile Social & Contract Section */}
          <div className="mobile-nav-footer">
            {/* Social Links */}
            <div className="mobile-social-links">
              <a 
                href="https://x.com/futurepurl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mobile-social-link"
                title="Follow us on X (Twitter)"
                aria-label="X (Twitter)"
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  className="social-icon"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>Follow on X</span>
              </a>
            </div>

            {/* Contract Address & Theme Toggle */}
            <div className="mobile-contract-section">
              <button
                onClick={copyContractAddress}
                className={`mobile-contract-btn ${copySuccess ? 'copied' : ''}`}
                title={copySuccess ? 'Copied!' : 'Click to copy contract address'}
              >
                <span className="contract-label">Contract Address:</span>
                <span className="contract-address">
                  {formatAddress(contractAddress)}
                </span>
                {copySuccess && (
                  <span className="copy-success">✓ Copied!</span>
                )}
              </button>
              
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="mobile-theme-toggle"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
              >
                <span className="theme-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
                <span className="theme-label">
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </span>
              </button>
            </div>

            {/* Connection Status */}
            <div className="mobile-connection-status">
              <div className="status-dot connected"></div>
              <span className="status-text">
                Connected to Purl
              </span>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default TerminalHeader;
