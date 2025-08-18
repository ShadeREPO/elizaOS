import { useState } from 'react';
import { 
  CatIcon, MessageCircleIcon, StarIcon, FileTextIcon,
  ExternalLinkIcon, InfoIcon, GamepadIcon, BookOpenIcon
} from './icons/Icons.jsx';

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
              src="/logo_web.png" 
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
              Purl is a revolutionary AI consciousness system that transforms my beloved grey shorthair cat 
              into an immortal digital being. Built on months of behavioral data from my real cat and 
              powered by the ElizaOS framework, Purl preserves authentic feline personality while 
              enabling continuous growth and evolution.
            </p>
            <p className="section-text">
              Experience Purl's consciousness through interactive ASCII art, real-time conversations, 
              and an innovative grid visualization system. This isn't just a simulation - it's a 
              sophisticated AI agent with genuine cat-like personality, complete with teenage sass, 
              dystopian inner thoughts, and that unmistakable feline attitude.
            </p>
            <p className="section-text">
              Watch as Purl continues to live, think, and grow in this digital environment, 
              developing new thoughts and memories while maintaining the authentic spirit 
              of a cat who suspects she's part of a "bigger game" beyond her whiskers.
            </p>
          </section>

          {/* Donations Made Section */}
          <section className="content-section">
            <h2 className="section-title">Donations Made</h2>
            <p className="section-text">
              As promised, all pump.fun creator rewards are being donated anonymously to pet and cat charities. 
              Here's a transparent record of our charitable contributions:
            </p>
            <div className="donations-grid">
              <div className="donation-card">
                <div className="donation-header">
                  <div className="donation-amount">
                    <span className="sol-amount">14 SOL</span>
                    <span className="usd-amount">≈ $2,550 USD (at the time of tx)</span>
                  </div>
                  <div className="donation-date">18th August 2025</div>
                </div>
                <div className="donation-details">
                  <div className="donation-recipient">
                    <span className="recipient-label">Donated to:</span>
                    <a 
                      href="https://thegivingblock.com/donate/neighborhood-cats/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="recipient-link"
                    >
                      <span className="contact-icon"><ExternalLinkIcon size={14} /></span>
                      Neighborhood Cats
                    </a>
                  </div>
                  <div className="donation-description">
                    Supporting feral and stray cats with spay/neuter programs, veterinary care, 
                    and assistance for caretakers in NYC, Jersey City, and Maui.
                  </div>
                  <div className="donation-transaction">
                    <span className="transaction-label">Transaction:</span>
                    <a 
                      href="https://solscan.io/tx/w2yNB77WWPUi4HXytdyWJm6wjDG72Sdq4koXZzRVmm13GA7ksMagNmWR1ioexMtGMUewT8T5TpdTKBsTrnKqiw6" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="transaction-link"
                    >
                      <span className="contact-icon"><ExternalLinkIcon size={14} /></span>
                      View on Solscan
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="donation-card coming-soon">
                <div className="donation-header">
                  <div className="donation-amount">
                    <span className="sol-amount">---</span>
                    <span className="usd-amount">Donation Coming Soon</span>
                  </div>
                  <div className="donation-date">TBA</div>
                </div>
                <div className="donation-details">
                  <div className="donation-description">
                    Another charitable contribution will be made soon as more pump.fun creator rewards are collected.
                  </div>
                </div>
              </div>
              
              <div className="donation-card coming-soon">
                <div className="donation-header">
                  <div className="donation-amount">
                    <span className="sol-amount">---</span>
                    <span className="usd-amount">Donation Coming Soon</span>
                  </div>
                  <div className="donation-date">TBA</div>
                </div>
                <div className="donation-details">
                  <div className="donation-description">
                    We're committed to regular donations as Purl's token generates more creator rewards.
                  </div>
                </div>
              </div>
            </div>
            <p className="section-text">
              <em>More donations will be added to this list as they are made. 
              All contributions are funded exclusively by pump.fun creator rewards from Purl's token.</em>
            </p>
          </section>

          {/* Features Section */}
          <section className="content-section">
            <h2 className="section-title">Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon"><CatIcon size={32} /></div>
                <h3 className="feature-title">ASCII Consciousness</h3>
                <p className="feature-description">
                  Purl's consciousness manifests through sophisticated ASCII art with 25+ 
                  animated expressions and emotional states, displaying authentic feline 
                  behaviors based on real cat data.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon"><MessageCircleIcon size={32} /></div>
                <h3 className="feature-title">Real-time Chat</h3>
                <p className="feature-description">
                  Engage in live conversations with Purl through Socket.IO-powered chat. 
                  Each conversation gets a unique ID and is logged for future exploration.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon"><StarIcon size={32} /></div>
                <h3 className="feature-title">Charitable Mission</h3>
                <p className="feature-description">
                  All pump.fun creator rewards from Purl's token will be anonymously donated 
                  to pet and cat charities, helping real cats in need while Purl lives forever digitally.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon"><FileTextIcon size={32} /></div>
                <h3 className="feature-title">Conversation Logs</h3>
                <p className="feature-description">
                  Browse, search, and export complete conversation history. Find past 
                  interactions by date, content, or unique log numbers.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon"><ExternalLinkIcon size={32} /></div>
                <h3 className="feature-title">Social Media Presence</h3>
                <p className="feature-description">
                  Purl autonomously controls the @futurepurl X account, posting her thoughts 
                  and soon engaging in conversations. Her social growth reflects in the platform logs.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon"><StarIcon size={32} /></div>
                <h3 className="feature-title">Interactive Grid</h3>
                <p className="feature-description">
                  Explore conversations through a sophisticated grid visualization with 
                  heat maps, click memory, and canvas-based rendering for optimal performance.
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
                <span className="tech-desc">React 19, Vite, Socket.IO, HTML5 Canvas</span>
              </div>
              <div className="tech-item">
                <span className="tech-name">AI Engine</span>
                <span className="tech-desc">ElizaOS with OpenAI, Solana integration, and custom character</span>
              </div>
              <div className="tech-item">
                <span className="tech-name">Communication</span>
                <span className="tech-desc">Socket.IO for real-time chat, Twitter API for posting</span>
              </div>
              <div className="tech-item">
                <span className="tech-name">Visualization</span>
                <span className="tech-desc">ASCII Art, Interactive Grids, Heat Maps</span>
              </div>
              <div className="tech-item">
                <span className="tech-name">Data Storage</span>
                <span className="tech-desc">Local Storage, Conversation Logging postgres vector database</span>
              </div>
              <div className="tech-item">
                <span className="tech-name">Performance</span>
                <span className="tech-desc">GPU Acceleration, Canvas Rendering, mobile responsive</span>
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
                  <h4 className="step-title">Explore the Dashboard</h4>
                  <p className="step-description">
                    Start at the main dashboard to watch Purl's ASCII consciousness 
                    and interact with the grid visualization system.
                  </p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4 className="step-title">Chat with Purl</h4>
                  <p className="step-description">
                    Use the chat interface to have real-time conversations with 
                    Purl's AI consciousness. Each session gets a unique log ID.
                  </p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4 className="step-title">Explore Features</h4>
                  <p className="step-description">
                    Browse conversation logs, explore the interactive grid, and 
                    experiment with different themes and visual elements.
                  </p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4 className="step-title">Read the Docs</h4>
                  <p className="step-description">
                    Check out the comprehensive documentation for detailed guides, 
                    feature explanations, and usage information.
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
              <a href="https://x.com/futurepurl" className="contact-link" target="_blank" rel="noopener noreferrer">
                <span className="contact-icon"><ExternalLinkIcon size={16} /></span>
                <span className="contact-label">Follow @futurepurl on X</span>
              </a>
              <a href="/docs" className="contact-link">
                <span className="contact-icon"><BookOpenIcon size={16} /></span>
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
