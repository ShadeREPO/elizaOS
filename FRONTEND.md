# Purl Frontend Development Guide

This guide explains how to develop and run the Purl virtual pet frontend in different modes.

## 🏗️ Architecture Overview

The Purl project has two frontend modes:

1. **ElizaOS Integration Mode** - Runs within the ElizaOS agent dashboard
2. **Standalone Mode** - Runs as an independent React application

## 🚀 Development Workflows

### Option 1: Standalone Frontend Development (Recommended for UI work)

For developing the Purl interface independently:

```bash
# Start the standalone frontend (port 5174)
npm run frontend:dev

# Build standalone version
npm run frontend:build

# Preview built standalone version
npm run frontend:preview
```

**When to use:**
- Developing UI components and styling
- Testing ASCII animations and expressions
- Working on responsive design
- Fast iteration without agent dependencies

### Option 2: Full Agent System Development

For testing with the complete ElizaOS agent system:

```bash
# Start the complete agent system (includes frontend at port 5173)
npm run dev

# Or start agent system in production mode
npm start
```

**When to use:**
- Testing WebSocket communication with agents
- Integration testing with AI responses
- Plugin development
- Production deployment testing

## 📁 Frontend Structure

```
src/frontend/
├── components/           # React components
│   ├── Header.jsx       # App header with branding
│   ├── Footer.jsx       # App footer with links
│   └── CatDisplay.jsx   # Main cat display with animations
├── assets/              # Static assets
│   ├── asciiFrames.js   # ASCII cat animations
│   ├── spriteFrames.js  # Sprite animations (future)
│   └── purl_sprites.png # Sprite sheet image
├── App.jsx              # Main Purl application component
├── index.tsx            # ElizaOS integration entry point
├── standalone.tsx       # Standalone app entry point
├── standalone.html      # Standalone HTML template
└── index.css           # Complete styling system
```

## 🎯 Key Features

### ASCII Cat System
- **25+ animation frames** with expressions
- **Animated emotions** (confused, love, idea, sleepy, surprised)
- **Debug mode** for testing all expressions
- **Responsive ASCII rendering** with proper font handling

### WebSocket Integration
- **AI agent communication** via ws://localhost:8080
- **Real-time state updates** from external agents
- **Connection status indicators**
- **Automatic reconnection** handling

### Modern UI Design
- **Futuristic white theme** with glass morphism
- **Full-width header/footer** layout
- **Mobile-responsive** design
- **Smooth animations** and transitions

## 🔧 Configuration

### Standalone Mode
- **Port:** 5174
- **Hot reload:** Enabled
- **Auto-open browser:** Yes
- **WebSocket proxy:** Configured for localhost:8080
- **API proxy:** Configured for localhost:3000

### ElizaOS Integration Mode
- **Port:** 5173
- **ElizaOS plugin:** Integrated
- **Agent panel:** "Purl Pet" tab
- **Public access:** Enabled

## 🧪 Testing Features

### Expression Testing (Debug Mode)
1. Open the standalone frontend
2. Click the ⚙️ debug button
3. Test individual expressions:
   - 😊 Normal, 😴 Blink, 👉 Look Right/Left
   - 🤔 Confused (animated ?, ??, ???)
   - 💡 Idea (animated lightbulb)
   - ❤️ Love (animated hearts)
   - 😪 Sleepy (animated tiredness)
   - 😲 Surprised (animated exclamations)

### WebSocket Testing
```javascript
// Connect to test WebSocket commands
const ws = new WebSocket('ws://localhost:8080');

// Send commands to control the cat
ws.send('walk');    // Cat walks
ws.send('jump');    // Cat jumps
ws.send('eat');     // Cat eats
ws.send('sleep');   // Cat sleeps
ws.send('sit');     // Cat sits (default)
```

## 📱 Responsive Breakpoints

- **Desktop:** 1024px+ (full navigation, 3-column layout)
- **Tablet:** 768px-1023px (collapsed nav, 2-column layout)
- **Mobile:** <768px (mobile menu, single column)

## 🎨 Styling System

### CSS Variables
```css
--purl-white: #ffffff;
--purl-blue: #2563eb;
--purl-green: #10b981;
--purl-gray-*: /* Gray scale palette */
```

### Component Classes
- `.purl-app` - Main application container
- `.cat-display` - Cat display component
- `.ascii-cat` - ASCII art styling
- `.debug-panel` - Debug interface
- `.expression-grid` - Expression testing grid

## 🚀 Deployment

### Standalone Deployment
```bash
npm run frontend:build
# Deploy dist/standalone/ directory
```

### Agent System Deployment
```bash
npm run build
# Deploy complete dist/ directory with agent backend
```

## 🐛 Troubleshooting

### Common Issues

**Frontend won't start:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**WebSocket connection fails:**
- Ensure agent backend is running on port 8080
- Check firewall settings
- Verify proxy configuration in vite config

**ASCII art misaligned:**
- Check font loading in browser
- Verify monospace font fallbacks
- Test different zoom levels

### Development Tips

1. **Use standalone mode** for faster UI development
2. **Test expressions** using the debug panel
3. **Monitor WebSocket** connection in browser dev tools
4. **Check responsive** design on different screen sizes
5. **Validate ASCII** rendering across browsers

## 📞 Support

For development questions:
1. Check the debug console for errors
2. Verify WebSocket connection status
3. Test in standalone mode vs integrated mode
4. Review ASCII frame data in debug panel
