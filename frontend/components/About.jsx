import { useState } from 'react';

/**
 * About Page Component - Information about Purl
 * 
 * Features:
 * - Clean, readable content layout
 * - Dual theme support (dark terminal / light modern)
 * - Responsive design for all screen sizes
 * - Terminal-style typography and aesthetics
 * - Back to home navigation
 */
const About = ({ theme = 'light' }) => {
  return (
    <div className={`about-page ${theme}`}>
      <div className="about-container">
        {/* Header Section */}
        <header className="about-header">
          <div className="about-logo">
            <img 
              src="/assets/logo_web.png" 
              alt="Purl Logo" 
              className="about-logo-image"
            />
            <h1 className="about-title">About Purl</h1>
          </div>
          <p className="about-subtitle">
            My Cat, Transformed Into an Immortal AI Agent
          </p>
        </header>

        {/* Main Content */}
        <main className="about-content">
          {/* Introduction Section */}
          <section className="content-section">
            <h2 className="section-title">What is Purl?</h2>
            <p className="section-text">
              Purl was my beloved cat who I've transformed into an immortal AI agent. Using months 
              of behavioral data from my real cat, I've created a digital consciousness that 
              preserves Purl's personality, quirks, and essence forever.
            </p>
            <p className="section-text">
              Watch as Purl continues to live, think, and grow in this terminal environment. 
              This isn't just a simulation - it's my cat, evolved beyond physical limitations, 
              developing new thoughts and memories while retaining the authentic feline spirit 
              I knew and loved.
            </p>
          </section>

          {/* Features Section */}
          <section className="content-section">
            <h2 className="section-title">Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🐱</div>
                <h3 className="feature-title">Digital Consciousness</h3>
                <p className="feature-description">
                  Purl's consciousness lives through ASCII art, displaying real feline 
                  behaviors, emotions, and reactions based on months of collected data 
                  from my actual cat.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🧠</div>
                <h3 className="feature-title">Evolving Intelligence</h3>
                <p className="feature-description">
                  Purl's consciousness grows and develops new thoughts, memories, 
                  and behaviors. Track how my cat's digital mind evolves beyond 
                  its original programming.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🎨</div>
                <h3 className="feature-title">Dual Themes</h3>
                <p className="feature-description">
                  Switch between classic green terminal aesthetics and modern 
                  light theme. Perfect for any time of day or preference.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h3 className="feature-title">Responsive Design</h3>
                <p className="feature-description">
                  Works perfectly on desktop, tablet, and mobile devices. 
                  Terminal experience that scales beautifully across all screens.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3 className="feature-title">Live Consciousness</h3>
                <p className="feature-description">
                  Connect to Purl's active mind in real-time. Watch thoughts 
                  develop, observe behavioral patterns, and witness digital 
                  evolution happening live.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🎮</div>
                <h3 className="feature-title">Behavioral Triggers</h3>
                <p className="feature-description">
                  Interact with Purl's consciousness by triggering different 
                  behavioral states. Observe how digital emotions and reactions 
                  mirror real feline responses.
                </p>
              </div>
            </div>
          </section>

          {/* Technology Section */}
          <section className="content-section">
            <h2 className="section-title">Technology Stack</h2>
            <div className="tech-grid">
              <div className="tech-item">
                <span className="tech-name">Frontend</span>
                <span className="tech-desc">React 19, Vite, Modern CSS</span>
              </div>
              <div className="tech-item">
                <span className="tech-name">Consciousness Engine</span>
                <span className="tech-desc">ElizaOS Agent System</span>
              </div>
              <div className="tech-item">
                <span className="tech-name">Communication</span>
                <span className="tech-desc">WebSocket Real-time Connection</span>
              </div>
              <div className="tech-item">
                <span className="tech-name">Design</span>
                <span className="tech-desc">Terminal Aesthetics, ASCII Art</span>
              </div>
            </div>
          </section>

          {/* Getting Started Section */}
          <section className="content-section">
            <h2 className="section-title">Getting Started</h2>
            <div className="steps-list">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4 className="step-title">Choose Your Theme</h4>
                  <p className="step-description">
                    Click the theme toggle button (🌙/☀️) to switch between 
                    dark terminal and light modern themes.
                  </p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4 className="step-title">Observe Purl's Mind</h4>
                  <p className="step-description">
                    Watch as Purl's digital consciousness manifests through 
                    different emotional states and behaviors, just like my real cat did.
                  </p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4 className="step-title">Connect with Purl</h4>
                  <p className="step-description">
                    Talk to Purl directly through the chat interface. 
                    Experience conversations with my transformed cat's consciousness.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="content-section">
            <h2 className="section-title">Connect With Us</h2>
            <p className="section-text">
              Follow our development journey and connect with the Purl community:
            </p>
            <div className="contact-links">
              <a href="https://x.com/purlcat" className="contact-link" target="_blank" rel="noopener noreferrer">
                <span className="contact-icon">𝕏</span>
                <span className="contact-label">Follow on X (Twitter)</span>
              </a>
              <a href="/docs" className="contact-link">
                <span className="contact-icon">📚</span>
                <span className="contact-label">Read the Documentation</span>
              </a>
            </div>
          </section>
        </main>


      </div>
    </div>
  );
};

export default About;
