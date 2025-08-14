import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Documentation Component - Comprehensive API and usage documentation
 * 
 * Features:
 * - Left sidebar navigation with collapsible sections
 * - Main content area with detailed documentation
 * - Search functionality
 * - Code examples with syntax highlighting
 * - Terminal-themed design consistent with Purl aesthetics
 */
const Docs = ({ theme = 'dark' }) => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    'getting-started': true,
    'api-reference': false,
    'websocket-api': false,
    'character-system': false,
    'integration': false,
    'troubleshooting': false
  });

  // Documentation structure
  const docSections = {
    'getting-started': {
      title: 'Getting Started',
      icon: '🚀',
      subsections: {
        'introduction': 'Introduction',
        'quick-start': 'Quick Start',
        'installation': 'Installation',
        'basic-usage': 'Basic Usage'
      }
    },
    'api-reference': {
      title: 'API Reference',
      icon: '📋',
      subsections: {
        'core-api': 'Core API',
        'cat-states': 'Cat States',
        'animations': 'Animations',
        'themes': 'Themes'
      }
    },
    'websocket-api': {
      title: 'WebSocket API',
      icon: '🔌',
      subsections: {
        'connection': 'Connection',
        'commands': 'Commands',
        'events': 'Events',
        'examples': 'Examples'
      }
    },
    'character-system': {
      title: 'Character System',
      icon: '🐱',
      subsections: {
        'ascii-frames': 'ASCII Frames',
        'expressions': 'Expressions',
        'thoughts': 'Thought System',
        'positioning': 'Positioning'
      }
    },
    'integration': {
      title: 'Integration',
      icon: '🔗',
      subsections: {
        'elizaos': 'ElizaOS Plugin',
        'standalone': 'Standalone Mode',
        'embedding': 'Embedding'
      }
    },
    'troubleshooting': {
      title: 'Troubleshooting',
      icon: '🛠️',
      subsections: {
        'common-issues': 'Common Issues',
        'debugging': 'Debugging',
        'performance': 'Performance'
      }
    }
  };

  // Toggle sidebar section
  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Handle section navigation
  const navigateToSection = (sectionKey, subsectionKey = null) => {
    const targetId = subsectionKey ? `${sectionKey}-${subsectionKey}` : sectionKey;
    setActiveSection(targetId);
    
    // Scroll to section
    setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className={`docs-page ${theme}`}>
      <div className="docs-container">
        
        {/* Mobile sidebar toggle */}
        <button 
          className="sidebar-toggle mobile-only"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Documentation Sidebar"
        >
          ☰
        </button>

        {/* Left Sidebar Navigation */}
        <aside className={`docs-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <Link to="/" className="brand-link">
              <img 
                src="/assets/logo_web.png" 
                alt="Purl Logo" 
                className="sidebar-logo"
              />
              <span className="brand-name">Purl Docs</span>
            </Link>
          </div>

          {/* Search */}
          <div className="search-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="docs-nav">
            {Object.entries(docSections).map(([sectionKey, section]) => (
              <div key={sectionKey} className="nav-section">
                <button
                  className={`section-header ${expandedSections[sectionKey] ? 'expanded' : ''}`}
                  onClick={() => toggleSection(sectionKey)}
                >
                  <span className="section-icon">{section.icon}</span>
                  <span className="section-title">{section.title}</span>
                  <span className="expand-icon">
                    {expandedSections[sectionKey] ? '▼' : '▶'}
                  </span>
                </button>
                
                {expandedSections[sectionKey] && (
                  <ul className="subsections">
                    {Object.entries(section.subsections).map(([subKey, subTitle]) => (
                      <li key={subKey}>
                        <button
                          className={`subsection-link ${activeSection === (sectionKey + '-' + subKey) ? 'active' : ''}`}
                          onClick={() => navigateToSection(sectionKey, subKey)}
                        >
                          {subTitle}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="docs-content">
          <div className="content-wrapper">
            
            {/* Getting Started Section */}
            <section id="getting-started" className="doc-section">
              <h1>Purl Documentation</h1>
              <p className="section-intro">
                Welcome to the comprehensive documentation for Purl, a real cat transformed into 
                digital consciousness. This guide will help you understand and interact with Purl's evolving mind.
              </p>
            </section>

            {/* Introduction */}
            <section id="getting-started-introduction" className="doc-section">
              <h2>Introduction</h2>
              <p>
                Purl was a real cat who has been transformed into an immortal digital consciousness. 
                Using months of behavioral data, Purl's personality, quirks, and essence have been 
                preserved and evolved beyond physical limitations.
              </p>
              
              <div className="feature-grid">
                <div className="feature-card">
                  <h3>🐱 ASCII Art Pet</h3>
                  <p>Beautiful hand-crafted ASCII animations with multiple expressions and states.</p>
                </div>
                <div className="feature-card">
                  <h3>🤖 AI Integration</h3>
                  <p>Powered by ElizaOS agent system with real-time WebSocket connectivity.</p>
                </div>
                <div className="feature-card">
                  <h3>🎨 Dual Themes</h3>
                  <p>Switch between classic terminal and modern light themes.</p>
                </div>
                <div className="feature-card">
                  <h3>📱 Responsive</h3>
                  <p>Works perfectly on desktop, tablet, and mobile devices.</p>
                </div>
              </div>
            </section>

            {/* Quick Start */}
            <section id="getting-started-quick-start" className="doc-section">
              <h2>Quick Start</h2>
              <p>Get Purl running in just a few minutes:</p>
              
              <div className="code-block">
                <div className="code-header">
                  <span className="code-title">Terminal</span>
                  <button className="copy-btn" title="Copy to clipboard">📋</button>
                </div>
                <pre><code>{`# Clone the repository
git clone https://github.com/your-org/purl_agent.git
cd purl_agent/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173`}</code></pre>
              </div>
            </section>

            {/* Installation */}
            <section id="getting-started-installation" className="doc-section">
              <h2>Installation</h2>
              
              <h3>Prerequisites</h3>
              <ul>
                <li>Node.js 18+ and npm</li>
                <li>Modern web browser with WebSocket support</li>
                <li>ElizaOS agent (for AI functionality)</li>
              </ul>

              <h3>Frontend Installation</h3>
              <div className="code-block">
                <div className="code-header">
                  <span className="code-title">package.json</span>
                  <button className="copy-btn" title="Copy to clipboard">📋</button>
                </div>
                <pre><code>{`{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.8.0"
  }
}`}</code></pre>
              </div>
            </section>

            {/* WebSocket API */}
            <section id="websocket-api-connection" className="doc-section">
              <h2>WebSocket Connection</h2>
              <p>Purl connects to an AI agent via WebSocket for real-time interaction:</p>
              
              <div className="code-block">
                <div className="code-header">
                  <span className="code-title">JavaScript</span>
                  <button className="copy-btn" title="Copy to clipboard">📋</button>
                </div>
                <pre><code>{`// Connect to WebSocket server
const websocket = new WebSocket('ws://localhost:8080');

websocket.onopen = () => {
  console.log('🔗 Connected to AI agent');
};

websocket.onmessage = (event) => {
  const command = event.data.toLowerCase().trim();
  // Handle commands: 'walk', 'jump', 'eat', 'sleep', 'sit'
};`}</code></pre>
              </div>
            </section>

            {/* Commands */}
            <section id="websocket-api-commands" className="doc-section">
              <h2>Available Commands</h2>
              <p>Send these commands via WebSocket to control Purl:</p>
              
              <div className="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Command</th>
                      <th>Effect</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>sit</code></td>
                      <td>Cat sits peacefully with various expressions</td>
                      <td>Continuous</td>
                    </tr>
                    <tr>
                      <td><code>walk</code></td>
                      <td>Cat walks with directional animation</td>
                      <td>Continuous loop</td>
                    </tr>
                    <tr>
                      <td><code>jump</code></td>
                      <td>Cat performs jumping animation</td>
                      <td>Single sequence</td>
                    </tr>
                    <tr>
                      <td><code>eat</code></td>
                      <td>Cat eating animation with happy expressions</td>
                      <td>Continuous loop</td>
                    </tr>
                    <tr>
                      <td><code>sleep</code></td>
                      <td>Cat sleeping peacefully</td>
                      <td>Continuous</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ASCII Frames */}
            <section id="character-system-ascii-frames" className="doc-section">
              <h2>ASCII Frame System</h2>
              <p>Purl uses a sophisticated frame-based animation system:</p>
              
              <div className="code-block">
                <div className="code-header">
                  <span className="code-title">asciiFrames.js</span>
                  <button className="copy-btn" title="Copy to clipboard">📋</button>
                </div>
                <pre><code>{`export const ASCII_FRAMES = {
  sitting: [
    // Frame 1 - Normal alert look
    \`
  ^---^
  (=•.•=)
  > ^ <\`,
    
    // Frame 2 - Blink
    \`
  ^---^
  (=-.-=)
  > ^ <\`,
  ]
};`}</code></pre>
              </div>
            </section>

            {/* Troubleshooting */}
            <section id="troubleshooting-common-issues" className="doc-section">
              <h2>Common Issues</h2>
              
              <div className="troubleshoot-item">
                <h3>🔧 ASCII Cat Breaking on Mobile</h3>
                <p><strong>Issue:</strong> ASCII art lines wrap and break the cat's appearance on mobile devices.</p>
                <p><strong>Solution:</strong> Ensure proper CSS constraints:</p>
                <div className="code-block">
                  <pre><code>{`.ascii-cat {
  white-space: pre;
  overflow-x: auto;
  max-width: 100vw;
}`}</code></pre>
                </div>
              </div>

              <div className="troubleshoot-item">
                <h3>🔌 WebSocket Connection Failed</h3>
                <p><strong>Issue:</strong> Cannot connect to AI agent WebSocket server.</p>
                <p><strong>Solution:</strong> Verify WebSocket server is running on correct port:</p>
                <div className="code-block">
                  <pre><code>{`// Check connection URL
const websocket = new WebSocket('ws://localhost:8080');

// Add error handling
websocket.onerror = (error) => {
  console.log('WebSocket error:', error);
};`}</code></pre>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Docs;
