# ElizaOS Sessions API Integration Guide

This document explains the clean, modern ElizaOS Sessions API integration we've implemented for the Purl frontend. This follows the official ElizaOS documentation recommendations for web integration.

## 🎯 What We Built

A complete Sessions API integration that replaces complex websocket-only approaches with:

- **useElizaChat Hook** (`/hooks/useElizaChat.js`) - Clean state management for ElizaOS integration
- **ElizaChatSessionsAPI Component** (`/components/ElizaChatSessionsAPI.jsx`) - Modern React chat interface
- **Sessions API + Socket.IO** - Recommended ElizaOS integration pattern
- **Automatic session management** - No manual channel/server management
- **Real-time messaging** - Bidirectional communication via Socket.IO

## 📋 Features

### ✅ Sessions API Benefits
- **Simple Integration**: Just provide agent and user IDs
- **Persistent State**: Conversation state maintained by ElizaOS
- **No Channel Management**: ElizaOS handles rooms and channels automatically
- **Scalable**: Works with multiple agents and users

### ✅ Real-time Messaging
- **Socket.IO Integration**: Bidirectional real-time communication
- **Message Broadcasting**: Automatic message delivery via `messageBroadcast` events
- **Connection Management**: Automatic reconnection and error handling

### ✅ User Experience
- **Clean Interface**: Modern chat UI with typing indicators
- **Status Indicators**: Connection, session, and real-time status
- **Error Handling**: Graceful fallbacks and error messages
- **Mobile Responsive**: Works on all device sizes

## 🔧 How It Works

### 1. Session Creation Flow
```
Frontend → POST /api/messaging/sessions → ElizaOS creates session → Returns sessionId
```

### 2. Real-time Connection Flow
```
Frontend → Socket.IO connect → Join session room → Listen for messageBroadcast events
```

### 3. Message Flow
```
User types → POST /api/messaging/sessions/{sessionId}/messages → Agent processes → Response via Socket.IO messageBroadcast
```

## 🚀 Usage

### Available Routes
- **`/chat`** - New Sessions API integration (recommended)
- **`/chat-simple`** - Direct API integration (fallback)
- **`/chat-original`** - Complex legacy implementation (reference)

### Prerequisites
1. **ElizaOS running** on `localhost:3000`
2. **At least one agent** configured in ElizaOS
3. **Socket.IO enabled** in ElizaOS (default)

### Testing the Integration

#### Step 1: Test ElizaOS Connection
```bash
# From frontend directory
node test-sessions-api.js
```

This will test:
- ✅ ElizaOS server connection
- ✅ Agents API availability
- ✅ Sessions API functionality
- ✅ Message sending capability
- ✅ Socket.IO endpoint availability

#### Step 2: Start Frontend
```bash
# From frontend directory
npm run dev
```

#### Step 3: Test Chat Interface
1. Navigate to `http://localhost:5173/chat`
2. The interface will automatically:
   - Connect to ElizaOS server
   - Fetch available agents
   - Create a session
   - Initialize real-time messaging
3. Start chatting with your agent!

## 🏗️ Architecture

### useElizaChat Hook API
```javascript
const {
  // State
  sessionId,        // Current ElizaOS session ID
  messages,         // Array of chat messages
  loading,          // Loading state for operations
  connected,        // Connection status to ElizaOS
  error,           // Error messages
  socketReady,     // Socket.IO connection status
  
  // Actions
  startSession,    // Create new ElizaOS session
  sendMessage,     // Send message to agent
  addSystemMessage, // Add system/status messages
  clearMessages,   // Clear chat history
  disconnect       // Clean up connections
} = useElizaChat(agentId, userId);
```

### Message Object Structure
```javascript
{
  id: "unique-id",
  type: "user" | "agent" | "system",
  content: "Message text",
  timestamp: Date,
  status: "sending" | "delivered" | "error", // For user messages
  metadata: {
    messageId: "eliza-message-id",
    realTime: true, // If received via Socket.IO
    // ... other metadata
  }
}
```

## 🔍 Debugging

### Connection Issues
1. **ElizaOS not running**
   ```bash
   # Check if ElizaOS is running
   curl http://localhost:3000/
   ```

2. **No agents available**
   ```bash
   # Check agents API
   curl http://localhost:3000/api/agents
   ```

3. **Sessions API failing**
   ```bash
   # Test session creation
   node test-sessions-api.js
   ```

### Message Issues
1. **Messages not sending**
   - Check browser console for API errors
   - Verify session is created successfully
   - Check ElizaOS logs for processing errors

2. **No real-time responses**
   - Check Socket.IO connection in browser dev tools
   - Verify messageBroadcast events are being received
   - Check that agent is responding to messages

### Browser Developer Tools
Open browser dev tools and check:
- **Console**: Look for connection and API errors
- **Network**: Verify API calls are successful
- **WebSocket**: Check Socket.IO connection status

## ⚙️ Configuration

### Environment Variables
```javascript
// In components or hooks
const BASE_URL = 'http://localhost:3000'; // Change if ElizaOS runs elsewhere
```

### ElizaOS Configuration
Ensure your ElizaOS configuration includes:
- Sessions API enabled (default)
- Socket.IO enabled (default)
- At least one agent configured
- CORS configured for your frontend domain

## 🔄 Migration from Legacy Chat

### What Changed
- ❌ **Old**: Complex websocket-only implementation with fallbacks
- ✅ **New**: Clean Sessions API + Socket.IO integration
- ❌ **Old**: Manual channel and room management
- ✅ **New**: Automatic session management by ElizaOS
- ❌ **Old**: 40+ state variables and complex error handling
- ✅ **New**: Simple hook-based state management

### Migration Steps
1. **Replace** old chat components with `ElizaChatSessionsAPI`
2. **Use** `useElizaChat` hook for state management
3. **Remove** complex websocket logic and fallbacks
4. **Test** with the new integration

## 📊 Performance Benefits

The Sessions API approach provides:
- **Faster connection**: Direct session creation vs complex channel setup
- **Less memory usage**: Simplified state management
- **Fewer network requests**: Efficient API design
- **Better reliability**: ElizaOS manages complexity
- **Easier debugging**: Clear API boundaries

## 🛠️ Troubleshooting Common Issues

### 1. "No agents available"
**Solution**: Check ElizaOS agent configuration
```bash
# Check ElizaOS logs for agent initialization
# Ensure at least one agent is properly configured
```

### 2. "Session creation failed"
**Solution**: Check ElizaOS Sessions API
```bash
# Test session creation manually
curl -X POST http://localhost:3000/api/messaging/sessions \
  -H "Content-Type: application/json" \
  -d '{"agentId":"your-agent-id","userId":"test-user"}'
```

### 3. "Messages not being delivered"
**Solution**: Check Socket.IO connection
```javascript
// In browser console, check for Socket.IO events
// Should see 'messageBroadcast' events when agent responds
```

### 4. "Real-time messaging not working"
**Solution**: Verify Socket.IO setup
```bash
# Check if Socket.IO endpoint responds
curl http://localhost:3000/socket.io/
# Should return a Socket.IO handshake response
```

## 🎨 Customization

### Theming
The chat component supports dark/light themes:
```jsx
<ElizaChatSessionsAPI theme="dark" />  // or "light"
```

### Styling
Modify `/components/SimpleElizaChat.css` for custom appearance:
- Message bubble colors and styles
- Layout and spacing
- Animation timings
- Mobile responsive breakpoints

### Functionality
Extend the `useElizaChat` hook for:
- Custom message types
- File upload support
- Message persistence
- Advanced error handling

## 📚 Additional Resources

- [ElizaOS Documentation](https://github.com/ai16z/eliza)
- [Sessions API Reference](https://github.com/ai16z/eliza/docs/api/sessions)
- [Socket.IO Documentation](https://socket.io/docs/)

## 🎉 Success!

You now have a clean, modern, and reliable ElizaOS integration using the recommended Sessions API approach. This provides a solid foundation for building advanced chat experiences with ElizaOS agents.

For questions or issues, check the browser console, run the test script, and refer to the ElizaOS documentation for agent configuration.
