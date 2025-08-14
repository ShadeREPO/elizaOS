/**
 * Footer Component - Clean, informative footer for Purl
 * Features:
 * - Domain branding (purl.cat)
 * - Social links and contact info
 * - Copyright and version info
 * - Responsive design
 * - Dark/Light theme support
 */
const Footer = ({ theme = 'dark' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`app-footer ${theme === 'light' ? 'light' : ''}`}>
      <div className="footer-container">
        {/* Main footer content */}
        <div className="footer-content">
          {/* Left section - Branding */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="brand-icon">
                <pre className="ascii-cat-mini">{`
  /\\_/\\  
 ( o.o ) 
  > ^ <  `}</pre>
              </div>
              <span className="brand-text">Purl</span>
            </div>
            <div className="footer-domain">purl.cat</div>
            <p className="footer-tagline">
              My cat, transformed into digital consciousness
            </p>
          </div>

          {/* Center section - Essential Links */}
          <div className="footer-links">
            <div className="link-group">
              <h4>Navigation</h4>
              <a href="/about">About</a>
              <a href="/docs">Documentation</a>
              <a href="/logs">Chat Logs</a>
            </div>
            <div className="link-group">
              <h4>Connect</h4>
              <a href="https://x.com/futurepurl" target="_blank" rel="noopener noreferrer">Twitter/X</a>
              <a href="/chat">Chat with Purl</a>
              <a href="/terminal">Live Terminal</a>
            </div>
          </div>

          {/* Right section - Status */}
          <div className="footer-status">
            <div className="status-item">
              <span className="status-label">Version</span>
              <span className="status-value">v1.0.0</span>
            </div>
            <div className="status-item">
              <span className="status-label">Status</span>
              <div className="status-indicator">
                <div className="status-dot connected"></div>
                <span className="status-value">Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section - Copyright */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <span>© {currentYear} Purl.cat - My cat's digital consciousness</span>
          </div>
          <div className="footer-info">
            <span>Built on Solana, with Grok</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
