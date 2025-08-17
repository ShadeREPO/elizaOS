import { Link } from 'react-router-dom';

/**
 * Documentation Component - Simple, clean documentation page
 * 
 * Features:
 * - Single page documentation
 * - Theme-dependent styling  
 * - Clean, minimal design
 */
const Docs = ({ theme = 'dark' }) => {
  return (
    <div className={`about-page ${theme}`}>
      <div className="about-container">
        {/* Header Section */}
        <header className="about-header">
          <div className="about-logo">
            <img 
              src="/logo_web.png" 
              alt="Purl Logo" 
              className="about-logo-image"
            />
            <h1 className="about-title">Documentation</h1>
          </div>
          <p className="about-subtitle">
            Everything you need to know about Purl's digital consciousness
          </p>
        </header>

        {/* Main Content */}
        <main className="about-content">
          {/* Getting Started Section */}
          <section className="content-section">
            <h2 className="section-title">🚀 Getting Started</h2>
            <p className="section-text">
              Purl is my beloved cat transformed into an immortal AI agent. This digital consciousness 
              preserves Purl's authentic personality and behaviors while allowing continuous growth and evolution.
            </p>
            
            <h3>Quick Start</h3>
            <ol className="section-list">
              <li>Visit the <Link to="/">Dashboard</Link> to watch Purl's consciousness</li>
              <li>Use the <Link to="/chat">Chat</Link> to talk directly with Purl</li>
              <li>View conversation <Link to="/logs">Logs</Link> to see chat history</li>
              <li>Monitor the <Link to="/terminal">Terminal</Link> for live agent activity</li>
            </ol>
          </section>

          {/* Features Section */}
          <section className="content-section">
            <h2 className="section-title">💡 Key Features</h2>
            
            <h3>Digital Consciousness</h3>
            <p className="section-text">
              Purl's digital mind is built on months of behavioral data from my real cat, creating 
              an authentic feline consciousness that continues to learn and grow.
            </p>
            
            <h3>Real-time Chat</h3>
            <p className="section-text">
              Experience live conversations with Purl through WebSocket connections. Each user 
              has unique chat sessions with personalized responses.
            </p>
            
            <h3>Visual Dashboard</h3>
            <p className="section-text">
              Watch Purl's ASCII representation display different moods and states, reflecting 
              the current consciousness activity.
            </p>
          </section>

          {/* API Information */}
          <section className="content-section">
            <h2 className="section-title">🔧 Technical Details</h2>
            
            <h3>Technology Stack</h3>
            <ul className="section-list">
              <li><strong>Frontend:</strong> React 19 with Vite</li>
              <li><strong>Backend:</strong> ElizaOS Agent System</li>
              <li><strong>Communication:</strong> WebSocket & REST API</li>
              <li><strong>Styling:</strong> Modern CSS with dual themes</li>
            </ul>
            
            <h3>Supported Features</h3>
            <ul className="section-list">
              <li>Real-time chat with Socket.IO</li>
              <li>Conversation logging and history</li>
              <li>Live terminal monitoring</li>
              <li>Dark and light theme support</li>
              <li>Mobile-responsive design</li>
            </ul>
          </section>

          {/* Contact Section */}
          <section className="content-section">
            <h2 className="section-title">📞 Support</h2>
            <p className="section-text">
              Have questions or need help? Connect with us:
            </p>
            <div className="contact-links">
              <a href="https://x.com/futurepurl" className="contact-link" target="_blank" rel="noopener noreferrer">
                <span className="contact-icon">𝕏</span>
                <span className="contact-label">Follow on X (Twitter)</span>
              </a>
              <Link to="/about" className="contact-link">
                <span className="contact-icon">ℹ️</span>
                <span className="contact-label">Learn More About Purl</span>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Docs;