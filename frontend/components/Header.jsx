import { useState } from 'react';

/**
 * Header Component - Clean, modern navigation for Purl
 * Features:
 * - Purl branding with cat emoji
 * - Domain display (purl.cat)
 * - Navigation menu (mobile responsive)
 * - Always online status indicator
 * - Futuristic white design matching the app theme
 */
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Left section - Logo and branding */}
        <div className="header-brand">
          <div className="brand-logo">
            <span className="brand-icon">🐱</span>
            <h1 className="brand-name">Purl</h1>
          </div>
          <div className="brand-domain">purl.cat</div>
        </div>

        {/* Center section - Navigation (desktop) */}
        <nav className="header-nav desktop-nav">
          <a href="#home" className="nav-link active">Home</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#connect" className="nav-link">Connect</a>
        </nav>

        {/* Right section - Status and mobile menu */}
        <div className="header-actions">
          <div className="connection-status">
            <div className="status-dot connected"></div>
            <span className="status-text">
              Online
            </span>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span className={`menu-icon ${isMobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile navigation menu */}
      <nav className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <a href="#home" className="nav-link active" onClick={toggleMobileMenu}>
          🏠 Home
        </a>
        <a href="#about" className="nav-link" onClick={toggleMobileMenu}>
          ℹ️ About
        </a>
        <a href="#features" className="nav-link" onClick={toggleMobileMenu}>
          ⚡ Features
        </a>
        <a href="#connect" className="nav-link" onClick={toggleMobileMenu}>
          🔗 Connect
        </a>
      </nav>
    </header>
  );
};

export default Header;
