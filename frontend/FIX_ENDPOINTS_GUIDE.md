# 🔧 Frontend Endpoint Fix Guide

## 🎯 **Problem Identified**

Your frontend is calling endpoints that don't exist in ElizaOS production:

### ❌ **Frontend is Calling (404 Errors):**
- `/api/memories/{agentId}/conversations` 
- `/api/chat/{agentId}`
- `/api/agents/{agentId}/message`

### ✅ **ElizaOS Actually Has:**
- `/api/messaging/sessions` - **This is the correct way!**
- `/api/agents` - Agent discovery
- `/api/memory/{agentId}/memories` - Memory access
- `/socket.io/` - Real-time communication

## 🚀 **The Solution: Use Sessions API**

ElizaOS uses a **Sessions API pattern** for chat functionality. Here's how it works:

### 1. **Create a Session**
```javascript
POST /api/messaging/sessions
{
  "agentId": "b850bc30-45f8-0041-a00a-83df46d8555d",
  "userId": "generated-uuid",
  "metadata": { "platform": "web" }
}
```

### 2. **Send Messages to Session**
```javascript
POST /api/messaging/sessions/{sessionId}/messages
{
  "content": "Hello Eliza!",
  "metadata": { "timestamp": "2024-01-01T12:00:00.000Z" }
}
```

### 3. **Get Session Messages**
```javascript
GET /api/messaging/sessions/{sessionId}/messages
```

### 4. **Real-time Updates via Socket.IO**
```javascript
// Listen for messageBroadcast events
socket.on('messageBroadcast', (data) => {
  // New message received
});
```

## 🔧 **Files That Need Updates**

### 1. **ChatDataContext.jsx** - Update conversation loading
```javascript
// OLD (404 error):
const url = buildApiUrl(`/api/memories/${agentId}/conversations`);

// NEW (use memory API):
const url = buildApiUrl(`/api/memory/${agentId}/memories?limit=50`);
```

### 2. **AgentChat.jsx** - Already using Sessions API ✅
This file is already correctly implemented!

### 3. **useElizaSession.js** - Already using Sessions API ✅
This hook is already correctly implemented!

## 🎯 **Quick Fix Strategy**

### **Option 1: Use Existing Sessions API Components (Recommended)**
Your `/chat` route already uses the correct Sessions API. Just use that!

### **Option 2: Update ChatDataContext for Memory Access**
Update the conversation loading to use the memory API instead of the missing conversations endpoint.

### **Option 3: Create Missing Endpoints (Advanced)**
Add custom routes to ElizaOS to provide the missing endpoints.

## 🚀 **Immediate Action Plan**

1. **Test the existing `/chat` route** - It should work perfectly!
2. **Update ChatDataContext** to use memory API instead of conversations API
3. **Remove references** to the missing endpoints
4. **Use Sessions API** for all chat functionality

## 📊 **Current Status**

- ✅ **Sessions API**: Working perfectly
- ✅ **Socket.IO**: Working perfectly  
- ✅ **Memory API**: Working perfectly
- ✅ **Agent Discovery**: Working perfectly
- ❌ **Conversations API**: Missing (need to use memory API instead)
- ❌ **Direct Chat API**: Missing (need to use Sessions API instead)

The good news is that **most of your chat functionality is already correctly implemented** using the Sessions API!
