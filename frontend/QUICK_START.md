# Quick Start Guide - ElizaOS Sessions API Integration

## 🚀 Getting Started

We've successfully integrated ElizaOS Sessions API into your Purl frontend! Here's how to test it:

### Prerequisites
1. **ElizaOS must be running** on `localhost:3000`
2. **At least one agent** configured in ElizaOS

### Step 1: Test ElizaOS Connection
```bash
# From the frontend directory
cd frontend
node test-sessions-api.js
```

This will verify:
- ✅ ElizaOS server is running
- ✅ Agents API is working
- ✅ Sessions API is functional
- ✅ Message sending works
- ✅ Socket.IO is available

### Step 2: Start Frontend Development Server
```bash
# From the root project directory
npm run frontend:dev
```

This will:
- Start the frontend on `http://localhost:5174`
- Auto-open your browser
- Proxy API calls to ElizaOS on port 3000

### Step 3: Test the Chat Interface

1. Navigate to `http://localhost:5174/chat`
2. The interface will automatically:
   - Connect to ElizaOS server
   - Fetch available agents
   - Create a session using Sessions API
   - Initialize real-time messaging via Socket.IO
3. Start chatting with your agent!

## 🎯 What's New

### Routes Available
- **`/chat`** - New Sessions API integration (recommended)
- **`/chat-simple`** - Direct API integration (fallback)
- **`/chat-original`** - Complex legacy implementation (reference)
- **`/`** - Home with virtual pet
- **`/logs`** - Conversation logs
- **`/about`** - About page

### Key Features
- ✅ **Sessions API Integration** - No manual channel management
- ✅ **Real-time Messaging** - Via Socket.IO messageBroadcast events
- ✅ **Clean State Management** - Using useElizaChat hook
- ✅ **Automatic Session Creation** - Just provide agent and user IDs
- ✅ **Error Handling** - Graceful fallbacks and status messages
- ✅ **Mobile Responsive** - Works on all devices

## 🔧 Troubleshooting

### Common Issues

#### 1. "Invalid UUID format for agentId or userId"
**Solution**: Fixed! Our integration now automatically generates proper UUIDs
- ElizaOS Sessions API requires both agentId and userId to be in UUID v4 format
- Our integration automatically converts non-UUID agent IDs to proper UUIDs
- User IDs are generated as proper UUIDs on component initialization
- Check browser console for UUID conversion messages

#### 2. "ElizaOS server not responding"
**Solution**: Make sure ElizaOS is running
```bash
# Start ElizaOS (from ElizaOS directory)
bun start
# or
npm start
```

#### 2. "No agents available"
**Solution**: Check ElizaOS agent configuration
- Ensure at least one agent is configured in your ElizaOS setup
- Check ElizaOS logs for agent initialization errors

#### 3. "Sessions API failed"
**Solution**: Verify ElizaOS configuration
```bash
# Test manually
curl -X POST http://localhost:3000/api/messaging/sessions \
  -H "Content-Type: application/json" \
  -d '{"agentId":"your-agent-id","userId":"test-user"}'
```

#### 4. "Build errors when starting ElizaOS"
**Solution**: The ElizaOS build process is separate from frontend development
- Use `npm run frontend:dev` for frontend development
- The main ElizaOS build is for the backend/agent system

## 🔍 Development Tools

### Browser Console
Open developer tools to see:
- Connection status logs
- API call responses
- Socket.IO event messages
- Any error messages

### Test Script Output
The test script provides detailed information:
```bash
cd frontend
node test-sessions-api.js
```

Example output:
```
🚀 ElizaOS Sessions API Test Suite
=====================================

🔄 Testing connection to ElizaOS server...
✅ ElizaOS server is running

🔄 Testing agents API...
✅ Agents API working
✅ Found agents:
   1. MyAgent (ID: agent-123)

🔄 Testing Sessions API...
✅ Sessions API working
🔗 Session created: session-456

🔄 Testing message sending...
✅ Message sending working

🔄 Testing Socket.IO availability...
✅ Socket.IO endpoint available

📊 Test Results Summary
========================
Connection: ✅ PASS
Agents API: ✅ PASS
Sessions API: ✅ PASS
Message Sending: ✅ PASS
Socket.IO: ✅ PASS

🎉 All core tests passed! Your ElizaOS setup is ready for the frontend.
```

## 🎨 Customization

### Themes
The chat supports dark/light themes (automatically matches your app theme):
```jsx
<ElizaChatSessionsAPI theme="dark" />  // or "light"
```

### API Endpoints
To change the ElizaOS server URL, update:
```javascript
// In hooks/useElizaChat.js
const BASE_URL = 'http://localhost:3000'; // Change if needed
```

## 📚 Technical Details

### Architecture
- **useElizaChat Hook**: Manages Sessions API and Socket.IO connections
- **ElizaChatSessionsAPI Component**: React chat interface
- **Sessions API**: Creates and manages conversations
- **Socket.IO**: Real-time bidirectional messaging

### Message Flow
1. User types message
2. Send via POST `/api/messaging/sessions/{sessionId}/messages`
3. ElizaOS processes message
4. Agent response sent via Socket.IO `messageBroadcast` event
5. Frontend receives and displays response

### Error Handling
- Connection failures: Automatic retry with exponential backoff
- Session creation errors: Clear error messages with retry options
- Message sending errors: Status indicators and retry capability
- Socket.IO disconnections: Automatic reconnection attempts

## 🎉 Success!

You now have a modern, clean ElizaOS Sessions API integration! The chat interface provides:

- **Reliable messaging** using the recommended Sessions API
- **Real-time responses** via Socket.IO
- **Clean state management** with React hooks
- **Professional UI** with status indicators and error handling
- **Mobile responsive design** that works everywhere

Happy chatting with your ElizaOS agents! 🤖✨
