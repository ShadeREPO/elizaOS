# Purl - AI Virtual Pet Agent System

**🐱 Meet Purl, your AI-powered virtual pet companion**

[![ElizaOS](https://img.shields.io/badge/Built%20with-ElizaOS-blue.svg)](https://elizaos.dev)
[![React](https://img.shields.io/badge/Frontend-React-61dafb.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6.svg)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🌟 Overview

Purl is a comprehensive AI virtual pet platform that combines sophisticated agent intelligence with beautiful interactive frontend design. Built on the ElizaOS framework, Purl features an ASCII art cat with rich expressions, real-time AI personality, and a modern React interface.

**🌐 Domain:** [purl.cat](https://purl.cat)

### ✨ Key Features

- **🧠 AI Agent Personality** - Sophisticated virtual pet behavior powered by ElizaOS
- **🎭 Rich ASCII Expressions** - 25+ animated frames with emotions (confused, love, idea, sleepy, surprised)
- **⚡ Real-time Communication** - WebSocket-based agent-to-frontend messaging
- **🎨 Modern UI Design** - Futuristic white theme with glass morphism effects
- **📱 Responsive Experience** - Optimized for mobile and desktop
- **🔧 Developer Tools** - Debug mode with expression testing interface
- **🚀 Dual Development** - Standalone frontend + integrated ElizaOS dashboard

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Purl Agent System                        │
├─────────────────────────────────────────────────────────────┤
│  ElizaOS Agent Backend     │     Purl React Frontend        │
│  ├─ AI Personality         │     ├─ ASCII Cat Display       │
│  ├─ WebSocket Server       │     ├─ Animation Engine        │
│  ├─ Plugin Architecture    │     ├─ Expression System       │
│  └─ Character Definition   │     └─ Debug Interface         │
├─────────────────────────────────────────────────────────────┤
│              WebSocket Communication (ws://localhost:8080)   │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Option 1: Complete Agent System (Recommended)
```bash
# Clone and setup
git clone <repository>
cd purl_agent
npm install

# Start ElizaOS agent with integrated frontend
npm run dev
# Access: http://localhost:5173 (ElizaOS Dashboard)
```

### Option 2: Standalone Frontend Development
```bash
# Start frontend-only for UI development
npm run frontend:dev
# Access: http://localhost:5174 (Standalone Purl App)
```

### Option 3: Production Mode
```bash
# Start production agent system
npm start
```

## 🎮 Available Commands

### Agent System
- `npm run dev` - Start ElizaOS development server with hot reload
- `npm start` - Start production agent system
- `npm run build` - Build complete system (agent + frontend)

### Frontend Development
- `npm run frontend:dev` - Start standalone frontend (port 5174)
- `npm run frontend:build` - Build standalone frontend
- `npm run frontend:preview` - Preview frontend build

### Testing & Quality
- `npm test` - Run all tests (component + e2e)
- `npm run lint` - Format code with Prettier
- `npm run type-check` - TypeScript type checking

## 🎭 ASCII Cat Expressions

Purl features a sophisticated ASCII art system with animated expressions:

### Base Animations
- **Sitting** (15 frames) - Default state with idle animations
- **Walking** (4 frames) - Directional movement
- **Jumping** (3 frames) - Excited bouncing
- **Eating** (2 frames) - Feeding time
- **Sleeping** (2 frames) - Peaceful rest

### Emotional Expressions
- **🤔 Confused** - Animated question marks (?, ??, ???)
- **💡 Idea** - Lightbulb moment with sparkles
- **❤️ Love** - Heart eyes with floating hearts
- **😪 Sleepy** - Progressive drowsiness
- **😲 Surprised** - Escalating exclamations (!, !!, !!!)

## 🔧 WebSocket API

The agent communicates with the frontend via WebSocket commands:

```javascript
// Connect to agent
const ws = new WebSocket('ws://localhost:8080');

// Send commands to control Purl
ws.send('walk');    // Cat walks around
ws.send('jump');    // Cat jumps excitedly  
ws.send('eat');     // Cat eating animation
ws.send('sleep');   // Cat sleeps peacefully
ws.send('sit');     // Return to default state
```

## 📁 Project Structure

```
purl_agent/
├── src/
│   ├── index.ts              # ElizaOS agent entry point
│   ├── character.ts          # Purl AI personality definition
│   ├── plugin.ts            # ElizaOS plugin integration
│   └── frontend/            # Complete React frontend
│       ├── components/      # React components
│       ├── assets/          # ASCII frames & sprites
│       ├── App.jsx          # Main Purl application
│       ├── index.tsx        # ElizaOS integration
│       ├── standalone.tsx   # Standalone app entry
│       └── index.css        # Complete styling system
├── dist/                    # Built artifacts
├── vite.config.ts          # ElizaOS build configuration
├── vite.frontend.config.ts # Standalone frontend config
├── SYSTEM.md               # Complete system documentation
├── FRONTEND.md             # Frontend development guide
└── README.md               # This file
```

## 🛠️ Development Workflow

### For Frontend/UI Development
1. **Start standalone frontend:** `npm run frontend:dev`
2. **Open:** http://localhost:5174
3. **Develop** with hot reload and immediate feedback
4. **Test expressions** using the debug panel (⚙️ button)

### For Agent/Backend Development  
1. **Start complete system:** `npm run dev`
2. **Open:** http://localhost:5173 (ElizaOS Dashboard)
3. **Access Purl** via "Purl Pet" panel
4. **Test WebSocket** communication and AI responses

### For Production Testing
1. **Build system:** `npm run build`
2. **Start production:** `npm start`
3. **Verify** complete functionality

## 🎯 Debug Features

### Expression Testing (Debug Mode)
- Click the ⚙️ button to open debug panel
- Test individual expressions and animations
- Switch between ASCII and sprite rendering
- Manual frame control for precise testing
- Resume automatic animations

### Development Tools
- **WebSocket connection monitor** - Real-time status
- **Frame counter** - Current animation frame
- **State indicator** - Current cat behavior
- **Expression grid** - Quick expression testing

## 📚 Documentation

- **[SYSTEM.md](SYSTEM.md)** - Complete system architecture and integration
- **[FRONTEND.md](FRONTEND.md)** - Frontend development guide and workflows
- **[README.md](README.md)** - This overview and quick start guide

## 🎨 Design Philosophy

### Visual Design
- **Futuristic White Theme** - Clean, modern aesthetic
- **Glass Morphism** - Subtle transparency and blur effects
- **Responsive Layout** - Mobile-first design approach
- **ASCII Art Focus** - Monospace font optimization

### User Experience
- **Immediate Feedback** - Real-time responses to interactions
- **Personality-Driven** - AI agent controls cat behavior
- **Progressive Enhancement** - Works from simple to complex interactions
- **Developer-Friendly** - Comprehensive debugging tools

## 🤝 Contributing

### Development Setup
1. **Fork and clone** the repository
2. **Install dependencies:** `npm install`
3. **Start development:** `npm run frontend:dev` or `npm run dev`
4. **Make changes** and test thoroughly
5. **Submit pull request** with clear description

### Code Style
- **TypeScript** for agent backend
- **JSX/React** for frontend components
- **Prettier** for code formatting
- **ESLint** for code quality

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🌐 Links

- **Website:** [purl.cat](https://purl.cat)
- **ElizaOS:** [elizaos.dev](https://elizaos.dev)
- **Documentation:** [SYSTEM.md](SYSTEM.md)
- **Frontend Guide:** [FRONTEND.md](FRONTEND.md)

---

**Built with ❤️ using ElizaOS and React**

*Purl - Where AI meets virtual companionship* 🐱✨