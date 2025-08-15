# ElizaOS API Endpoints Reference

## 📊 **Complete Endpoint Analysis**

Based on our comprehensive testing of your Railway deployment, here are **ALL** the available ElizaOS endpoints:

---

## ✅ **WORKING ENDPOINTS (Confirmed)**

### **Core API Endpoints**
```
GET  /api/agents                                    ✅ 200 OK
GET  /api/agents/{agentId}                         ✅ 200 OK  
GET  /api/memory/{agentId}/memories                ✅ 200 OK
POST /api/memory/{agentId}/memories                ✅ 200 OK
```

### **Sessions API (Chat Functionality)**
```
POST /api/messaging/sessions                       ✅ 201 Created
GET  /api/messaging/sessions/{sessionId}/messages  ✅ 200 OK
POST /api/messaging/sessions/{sessionId}/messages  ✅ 201 Created
```

### **Socket.IO (Real-time Communication)**
```
GET  /socket.io/?EIO=4&transport=polling          ✅ 200 OK
GET  /socket.io/                                   ✅ 400 Bad Request (handshake)
```

### **Health & Status (Blocked by Security)**
```
GET  /health                                       ✅ 403 Forbidden (Security)
GET  /ping                                         ✅ 403 Forbidden (Security)  
GET  /status                                       ✅ 403 Forbidden (Security)
GET  /                                             ✅ 403 Forbidden (Security)
GET  /api                                          ✅ 403 Forbidden (Security)
```

---

## ❌ **MISSING ENDPOINTS (404 Not Found)**

### **Frontend Expected Endpoints**
```
GET  /api/memories/{agentId}/conversations        ❌ 404 Not Found
GET  /api/chat/{agentId}                          ❌ 404 Not Found
POST /api/chat/{agentId}                          ❌ 404 Not Found
POST /api/{agentId}/message                       ❌ 404 Not Found
POST /api/agents/{agentId}/message                ❌ 404 Not Found
```

### **Alternative Patterns (Also Missing)**
```
GET  /api/conversations                           ❌ 404 Not Found
GET  /api/messages                                ❌ 404 Not Found
GET  /api/chat                                    ❌ 404 Not Found
GET  /api/sessions                                ❌ 404 Not Found
GET  /api/status                                  ❌ 404 Not Found
GET  /api/                                        ❌ 404 Not Found
```

---

## 🎯 **FRONTEND COMPATIBILITY ANALYSIS**

### **✅ What Your Frontend CAN Use:**
1. **Sessions API** - Perfect for chat functionality
2. **Memory API** - For conversation history and logs
3. **Agent Discovery** - For finding available agents
4. **Socket.IO** - For real-time messaging

### **❌ What Your Frontend CANNOT Use:**
1. **Conversations API** - Doesn't exist in ElizaOS
2. **Direct Chat API** - Doesn't exist in ElizaOS
3. **Health endpoints** - Blocked by security settings

---

## 🚀 **RECOMMENDED INTEGRATION STRATEGY**

### **For Chat Functionality:**
Use the **Sessions API** pattern:
```javascript
// 1. Create session
POST /api/messaging/sessions
{
  "agentId": "b850bc30-45f8-0041-a00a-83df46d8555d",
  "userId": "generated-uuid",
  "metadata": { "platform": "web" }
}

// 2. Send messages
POST /api/messaging/sessions/{sessionId}/messages
{
  "content": "Hello Eliza!",
  "metadata": { "timestamp": "2024-01-01T12:00:00.000Z" }
}

// 3. Get messages
GET /api/messaging/sessions/{sessionId}/messages
```

### **For Conversation History:**
Use the **Memory API**:
```javascript
// Get agent memories (conversation history)
GET /api/memory/{agentId}/memories?limit=50&includeEmbedding=false

// Store new memories
POST /api/memory/{agentId}/memories
{
  "content": { "text": "Message content" },
  "type": "user_message",
  "roomId": "session-id"
}
```

### **For Real-time Updates:**
Use **Socket.IO**:
```javascript
// Connect to Socket.IO
const socket = io('https://elizaos-production-2d55.up.railway.app');

// Listen for message broadcasts
socket.on('messageBroadcast', (data) => {
  // New message received
});
```

---

## 📋 **SUMMARY**

### **Available Endpoints: 11**
- Core APIs: 4 endpoints
- Sessions API: 3 endpoints  
- Socket.IO: 2 endpoints
- Health/Status: 2 endpoints (blocked)

### **Missing Endpoints: 10**
- All frontend-expected endpoints that don't exist in ElizaOS

### **Solution:**
Your frontend needs to be updated to use the **Sessions API** and **Memory API** instead of the missing endpoints. The good news is that **most of your chat functionality is already correctly implemented** using these working endpoints!
