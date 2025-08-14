# Purl Agent System Documentation

**Version:** 1.0.0  
**Domain:** purl.cat  
**Architecture:** ElizaOS Agent + React Frontend

## 🏗️ System Overview

The Purl Agent System is a comprehensive AI-powered virtual pet platform built on ElizaOS. It combines a sophisticated AI agent backend with a beautiful React frontend to create an interactive virtual pet experience.

### 🎯 Core Components

1. **ElizaOS Agent Backend** - AI personality and logic system
2. **Purl Frontend** - Interactive React application with ASCII cat
3. **WebSocket Communication** - Real-time agent-to-frontend messaging
4. **Plugin Architecture** - Extensible ElizaOS integration

## 🧠 ElizaOS Agent Backend

### Architecture
The main ElizaOS agent runs the core AI personality and handles:

- **AI Decision Making** - Agent personality and behavior logic
- **WebSocket Server** - Real-time communication with frontend
- **Plugin System** - Extensible functionality modules
- **Character Definition** - Purl's personality traits and responses
- **Event Processing** - Handling user interactions and environmental changes

### Key Files
```
src/
├── index.ts           # Main agent entry point
├── character.ts       # Purl's AI personality definition
├── plugin.ts          # ElizaOS plugin integration
└── frontend/          # Frontend integration layer
```

### Agent Personality
The Purl character is defined with:
- **Personality Traits** - Playful, curious, affectionate virtual cat
- **Behavioral Patterns** - Responds to user interactions
- **Emotional States** - Happy, sleepy, hungry, playful, etc.
- **Communication Style** - Cat-like responses and reactions

### WebSocket API
The agent communicates with the frontend via WebSocket on `ws://localhost:8080`:

```javascript
// Agent-to-Frontend Commands
ws.send('walk');     // Change to walking animation
ws.send('jump');     // Change to jumping animation  
ws.send('eat');      // Change to eating animation
ws.send('sleep');    // Change to sleeping animation
ws.send('sit');      // Return to sitting (default)
```

## 🎨 Purl Frontend Application

### Architecture
The frontend is a React application that renders within the ElizaOS dashboard and can run standalone:

- **React Components** - Modern component-based UI
- **ASCII Art System** - 25+ animated cat expressions
- **WebSocket Client** - Receives commands from AI agent
- **Debug Interface** - Developer tools for testing
- **Responsive Design** - Mobile and desktop optimized

### Key Components

#### 1. Cat Display System
```
CatDisplay.jsx - Main cat rendering component
├── ASCII Animation Engine
├── WebSocket Communication Handler  
├── State Management (sitting, walking, etc.)
├── Expression System (confused, love, idea, etc.)
└── Debug Interface
```

#### 2. ASCII Art System
```
asciiFrames.js - Complete animation framework
├── Base Animations (25 frames)
│   ├── Sitting (15 frames with expressions)
│   ├── Walking (4 frames)
│   ├── Jumping (3 frames)
│   ├── Eating (2 frames)
│   └── Sleeping (2 frames)
├── Expression Animations
│   ├── Confused (?, ??, ???)
│   ├── Idea (💡 lightbulb)
│   ├── Love (♥ hearts)
│   ├── Sleepy (drowsy progression)
│   └── Surprised (!, !!, !!!)
└── Animation Configuration
    ├── Frame timing
    ├── Loop settings
    └── State transitions
```

#### 3. UI Components
```
components/
├── Header.jsx    # App branding and navigation
├── Footer.jsx    # Links and information  
└── CatDisplay.jsx # Main interactive cat component
```

### Frontend Features

#### 🎭 Expression System
- **Real-time Expressions** - Cat responds to agent decisions
- **Animated Emotions** - Smooth transitions between states
- **Debug Mode** - Manual expression testing for developers
- **Consistent Design** - Professional ASCII art with proper spacing

#### 🎮 Interactive Elements
- **Manual Controls** - Buttons for testing different states
- **Debug Panel** - Developer interface for expression testing
- **Connection Status** - Real-time WebSocket connection indicator
- **Responsive Layout** - Adapts to different screen sizes

#### 🎨 Design System
- **Futuristic White Theme** - Clean, modern aesthetic
- **Glass Morphism Effects** - Subtle transparency and blur
- **Smooth Animations** - 60fps transitions and hover effects
- **Professional Typography** - Optimized for ASCII art rendering

## 🔄 System Integration

### Data Flow
```
ElizaOS Agent Backend
       ↓ (WebSocket)
   AI Decision
       ↓ (Commands)
Purl Frontend
       ↓ (Animation)
   User Interface
       ↓ (Interaction)
   User Input
       ↓ (Events)
ElizaOS Agent Backend
```

### Communication Protocol
1. **Agent makes decision** based on AI logic
2. **WebSocket message sent** to frontend
3. **Frontend receives command** and updates state
4. **Animation triggers** for new cat behavior
5. **User sees response** in real-time

### ElizaOS Dashboard Integration
The Purl frontend runs as a panel within the ElizaOS dashboard:

- **Panel Name:** "Purl Pet"
- **Icon:** Cat emoji 🐱
- **Public Access:** Enabled
- **Path:** `/purl`
- **Integration:** Seamless with other ElizaOS plugins

## 🚀 Development Modes

### Mode 1: Full Agent System
```bash
# Start complete ElizaOS system with Purl integrated
npm run dev
# or
npm start
```

**Includes:**
- ElizaOS agent backend (port 3000)
- WebSocket server (port 8080)  
- Frontend dashboard (port 5173)
- Complete AI personality
- Plugin architecture
- Production-like environment

### Mode 2: Standalone Frontend
```bash
# Start frontend-only development
npm run frontend:dev
```

**Includes:**
- React frontend only (port 5174)
- Hot reload for development
- WebSocket proxy to agent
- Independent UI testing
- Faster iteration cycles

## 📁 Directory Structure

```
purl_agent/
├── src/
│   ├── index.ts              # ElizaOS agent entry point
│   ├── character.ts          # Purl AI personality
│   ├── plugin.ts            # ElizaOS plugin definition
│   └── frontend/            # React frontend application
│       ├── components/      # React components
│       │   ├── Header.jsx   # App header with branding
│       │   ├── Footer.jsx   # App footer with links
│       │   └── CatDisplay.jsx # Main cat display
│       ├── assets/          # Static assets and data
│       │   ├── asciiFrames.js # ASCII animations
│       │   ├── spriteFrames.js # Sprite system (future)
│       │   └── purl_sprites.png # Sprite sheet
│       ├── App.jsx          # Main React application
│       ├── index.tsx        # ElizaOS integration entry
│       ├── standalone.tsx   # Standalone app entry
│       ├── standalone.html  # Standalone HTML template
│       └── index.css        # Complete styling system
├── dist/                    # Built artifacts
│   ├── frontend/           # ElizaOS integrated build
│   └── standalone/         # Standalone app build
├── vite.config.ts          # ElizaOS frontend build config
├── vite.frontend.config.ts # Standalone frontend config
├── package.json            # Dependencies and scripts
├── SYSTEM.md              # This documentation
├── FRONTEND.md            # Frontend development guide
└── README.md              # Project overview
```

## 🛠️ Configuration Files

### ElizaOS Integration
- **`tsconfig.json`** - TypeScript configuration
- **`vite.config.ts`** - ElizaOS dashboard build
- **`tailwind.config.js`** - Styling system
- **`package.json`** - Dependencies and agent scripts

### Frontend Standalone  
- **`vite.frontend.config.ts`** - Standalone React build
- **`standalone.html`** - Dedicated HTML template
- **`standalone.tsx`** - Independent app entry point

### Agent System
- **`character.ts`** - AI personality definition
- **`plugin.ts`** - ElizaOS plugin registration
- **`index.ts`** - Main agent bootstrap

## 🔧 Technical Specifications

### Backend Requirements
- **Node.js** 18+ for ElizaOS
- **TypeScript** for agent development
- **WebSocket Support** for real-time communication
- **ElizaOS Framework** for AI agent functionality

### Frontend Requirements
- **React 18+** for UI components
- **Vite** for build system and development
- **Modern Browser** with WebSocket support
- **Monospace Font** for ASCII art rendering

### Performance Characteristics
- **ASCII Rendering** - 60fps smooth animations
- **WebSocket Latency** - <50ms agent response time
- **Memory Usage** - <100MB for complete system
- **Bundle Size** - <200KB frontend JavaScript

## 🎯 Key Features Summary

### Agent Intelligence
- ✅ **AI Personality** - Sophisticated virtual pet behavior
- ✅ **Real-time Decisions** - Dynamic response to interactions  
- ✅ **WebSocket Communication** - Instant frontend updates
- ✅ **Plugin Architecture** - Extensible functionality
- ✅ **ElizaOS Integration** - Professional agent framework

### Frontend Experience
- ✅ **ASCII Art System** - 25+ animated expressions
- ✅ **Responsive Design** - Mobile and desktop optimized
- ✅ **Debug Interface** - Developer testing tools
- ✅ **Modern UI** - Futuristic white design theme
- ✅ **Dual Development** - Standalone and integrated modes

### User Interaction
- ✅ **Real-time Responses** - Immediate visual feedback
- ✅ **Multiple Expressions** - Rich emotional range
- ✅ **Interactive Controls** - Manual state testing
- ✅ **Connection Status** - Clear system feedback
- ✅ **Professional Polish** - Production-ready experience

## 🚀 Production Deployment

### Complete System
```bash
npm run build
# Deploy dist/ directory with agent + frontend
```

### Frontend Only
```bash
npm run frontend:build  
# Deploy dist/standalone/ for frontend hosting
```

### Environment Variables
- **WEBSOCKET_URL** - Agent WebSocket endpoint
- **API_BASE** - Agent API base URL
- **AGENT_ID** - ElizaOS agent identifier

## 📞 Support & Development

### Development Workflow
1. **Backend Changes** - Use `npm run dev` for full system
2. **Frontend Changes** - Use `npm run frontend:dev` for faster iteration
3. **Testing** - Both modes for comprehensive coverage
4. **Building** - Separate builds for different deployment needs

### Debugging
- **Agent Logs** - ElizaOS console output
- **Frontend Debug** - Browser developer tools + debug panel
- **WebSocket Monitoring** - Network tab for real-time communication
- **Expression Testing** - Built-in debug interface

### Extension Points
- **New Expressions** - Add to `asciiFrames.js`
- **Agent Behaviors** - Extend `character.ts`
- **UI Components** - Add to `components/`
- **Plugin Features** - Enhance `plugin.ts`

---

The Purl Agent System represents a complete AI virtual pet platform, combining the power of ElizaOS agent intelligence with a beautiful, interactive React frontend. The dual-mode development setup allows for both rapid UI development and comprehensive system testing, making it ideal for both development and production deployment.
