import { useState, useCallback, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getConfig } from '../utils/config.js';

/**
 * Clean ElizaOS Socket.IO Hook - Minimal Logging, Production Ready
 */
function useElizaSocketIO(agentId, userId) {
  // Only log in development
  const isDev = process.env.NODE_ENV === 'development';
  const log = isDev ? console.log : () => {};
  const logError = isDev ? console.error : () => {};
  // Core state
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const [agentReady, setAgentReady] = useState(false);
  const [error, setError] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  
  // Refs
  const socketRef = useRef(null);
  const roomId = useRef(null);
  const lastMessageTime = useRef(0);
  
  const BASE_URL = getConfig().BASE_URL;
  
  // Generate UUID
  const generateUUID = useCallback(() => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }, []);
  
  // Create a new channel for the session
  const createChannel = useCallback(async () => {
    try {
      log('🏗️ Creating new channel for session...');
      
      const response = await fetch(`${BASE_URL}/api/messaging/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': getConfig().API_KEY || ''
        },
        body: JSON.stringify({
          name: `Chat Session ${sessionId?.slice(0, 8) || 'New'}`,
          serverId: '00000000-0000-0000-0000-000000000000', // Default server ID
          description: 'Chat channel for ElizaOS session',
          type: 'text'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const channelId = data.data?.channel?.id;
        if (channelId) {
          log('✅ Channel created successfully:', channelId);
          roomId.current = channelId;
          return channelId;
        } else {
          logError('❌ Channel created but no ID returned');
          return null;
        }
      } else {
        logError('❌ Failed to create channel:', response.status);
        return null;
      }
    } catch (err) {
      logError('❌ Error creating channel:', err.message);
      return null;
    }
  }, [BASE_URL, sessionId]);
  
  // Add agent to channel after it's created
  const addAgentToChannel = useCallback(async (channelId) => {
    try {
      log('🤖 Adding agent to channel:', channelId);
      
      const response = await fetch(`${BASE_URL}/api/messaging/central-channels/${channelId}/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': getConfig().API_KEY || ''
        },
        body: JSON.stringify({
          agentId: agentId
        })
      });
      
      if (response.ok) {
        log('✅ Agent added to channel successfully via central-channels');
        setAgentReady(true);
        return true;
      } else {
        logError('❌ Failed to add agent to channel:', response.status);
        // Fallback: Set agent as ready anyway
        setAgentReady(true);
        return false;
      }
    } catch (err) {
      logError('❌ Error adding agent to channel:', err.message);
      // Fallback: Set agent as ready anyway
      setAgentReady(true);
      return false;
    }
  }, [agentId, BASE_URL]);
  
  // Initialize Socket.IO connection
  const initializeSocket = useCallback((channelId) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    // Create Socket.IO connection
    socketRef.current = io(BASE_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 3,
      timeout: 15000,
      transports: ['polling', 'websocket'],
      upgrade: true,
      forceNew: true
    });
    
    const socket = socketRef.current;
    roomId.current = channelId;
    
      // Connection established
      socket.on('connect', () => {
        log('✅ Connected to ElizaOS');
        setSocketReady(true);
        
        // Join room
        const joinPayload = {
          type: 1,
          payload: {
            roomId: roomId.current,
            entityId: userId
          }
        };
        
        socket.emit('message', joinPayload);
        log('🏠 Joined room:', roomId.current);
        
        // Sessions API handles agent participation automatically
        setAgentReady(true);
      });
    
    // Connection errors
    socket.on('connect_error', (error) => {
      setError(`Connection failed: ${error.message}`);
      setSocketReady(false);
    });
    
    // Disconnection
    socket.on('disconnect', () => {
      setSocketReady(false);
      if (socket.connected) {
        socket.connect();
      }
    });
    
          // Message broadcasts
      socket.on('messageBroadcast', (data) => {
        // Check if agent response
        const isFromAgent = (
          data.senderId === agentId ||
          data.authorId === agentId ||
          data.senderName === 'Eliza' ||
          data.source === 'agent_response'
        );
        
        if (isFromAgent) {
          setIsThinking(false);
          
          const agentMessage = {
            id: data.id || generateUUID(),
            content: data.text || data.content || data.message,
            authorId: data.senderId || data.authorId || agentId,
            isAgent: true,
            createdAt: new Date(data.createdAt || Date.now()),
            metadata: {
              thought: data.thought,
              actions: data.actions,
              realTime: true
            }
          };
          
          setMessages(prev => {
            const withoutThinking = prev.filter(msg => !msg.isThinking);
            return [...withoutThinking, agentMessage];
          });
          
          setAgentReady(true);
        }
      });
    
          // Fallback: Agent ready after 3 seconds, and retry adding to channel
      setTimeout(() => {
        if (!agentReady && socket.connected && roomId.current) {
          log('⏰ Fallback: Setting agent as ready');
          setAgentReady(true);
        }
      }, 3000);
    
  }, [agentId, userId, generateUUID]);
  
  // Create session
  const createAgentSession = useCallback(async () => {
    try {
      const sessionResponse = await fetch(`${BASE_URL}/api/messaging/sessions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': getConfig().API_KEY || ''
        },
        body: JSON.stringify({
          agentId: agentId,
          userId: userId,
          metadata: {
            platform: 'web',
            interface: 'purl-chat-app'
          }
        })
      });
      
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        return sessionData.sessionId;
      }
      return null;
    } catch (err) {
      return null;
    }
  }, [agentId, userId]);
  
  // Start connection
  const startConnection = useCallback(async () => {
    if (!agentId || !userId) {
      setError('Missing required parameters');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Step 1: Create session
      const sessionId = await createAgentSession();
      if (!sessionId) {
        throw new Error('Failed to create session');
      }
      
      // Step 2: Create channel for the session
      const channelId = await createChannel();
      if (!channelId) {
        throw new Error('Failed to create channel');
      }
      
      // Step 3: Add agent to the channel
      const agentAdded = await addAgentToChannel(channelId);
      if (!agentAdded) {
        log('⚠️ Agent not added to channel, but continuing...');
      }
      
      setSessionInfo({ roomId: channelId, agentId, userId });
      setConnected(true);
      initializeSocket(channelId);
      
      return sessionId;
      
    } catch (err) {
      setError(err.message);
      setConnected(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [agentId, userId, initializeSocket, createAgentSession, createChannel, addAgentToChannel]);
  
  // Send message using Sessions API + Socket.IO
  const sendMessage = useCallback(async (content) => {
    if (!content?.trim()) return null;
    
    // Rate limiting
    const now = Date.now();
    if (now - lastMessageTime.current < 1000) {
      setError('Please wait 1 second between messages');
      return null;
    }
    lastMessageTime.current = now;
    
    try {
      setLoading(true);
      setError(null);
      
      if (!connected) {
        await startConnection();
      }
      
      // Add user message
      const userMessage = {
        id: generateUUID(),
        content: content.trim(),
        authorId: userId,
        isAgent: false,
        createdAt: new Date(),
        status: 'sending'
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Add thinking indicator
      setIsThinking(true);
      const thinkingMessage = {
        id: generateUUID(),
        content: 'Purl is thinking...',
        authorId: agentId,
        isAgent: true,
        createdAt: new Date(),
        isThinking: true
      };
      
      setMessages(prev => [...prev, thinkingMessage]);
      
      // Send via Socket.IO to the created channel
      if (roomId.current) {
        sendViaSocketIO(content.trim());
      } else {
        logError('❌ No channel available for messaging');
        setError('No channel available');
        return null;
      }
      
      // Fallback: Clear thinking after 20 seconds
      setTimeout(() => {
        if (isThinking) {
          setIsThinking(false);
          setMessages(prev => prev.filter(msg => !msg.isThinking));
        }
      }, 20000);
      
      return userMessage;
      
    } catch (err) {
      setError(err.message);
      setIsThinking(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [connected, agentId, userId, startConnection, generateUUID, isThinking]);
  
  // Helper function to send via Socket.IO (fallback)
  const sendViaSocketIO = useCallback((content) => {
    if (!socketRef.current?.connected) {
      throw new Error('Not connected');
    }
    
    const messagePayload = {
      type: 2,
      payload: {
        channelId: roomId.current,
        serverId: '00000000-0000-0000-0000-000000000000',
        senderId: userId,
        message: content,
        senderName: 'User',
        roomId: roomId.current
      }
    };
    
    socketRef.current.emit('message', messagePayload);
    log('📤 Message sent via Socket.IO (fallback)');
  }, [userId, roomId]);
  
  // End connection
  const endConnection = useCallback(async () => {
    try {
      if (socketRef.current?.connected && roomId.current) {
        const leavePayload = {
          type: 3,
          payload: {
            roomId: roomId.current,
            entityId: userId
          }
        };
        socketRef.current.emit('message', leavePayload);
      }
      
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      
    } catch (err) {
      // Silent cleanup
    } finally {
      setSessionId(null);
      setSessionInfo(null);
      setConnected(false);
      setSocketReady(false);
      setAgentReady(false);
      setMessages([]);
      setError(null);
      setIsThinking(false);
      roomId.current = null;
    }
  }, [userId]);
  
  // System message helper
  const addSystemMessage = useCallback((content, type = 'info') => {
    const systemMessage = {
      id: generateUUID(),
      content,
      authorId: 'system',
      isAgent: false,
      createdAt: new Date(),
      metadata: { systemType: type },
      isSystem: true
    };
    setMessages(prev => [...prev, systemMessage]);
  }, [generateUUID]);
  
  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);
  
  // Auto-start connection
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 2;
    
    const attemptConnection = async () => {
      try {
        await startConnection();
      } catch (err) {
        retryCount++;
        if (retryCount < maxRetries) {
          setTimeout(attemptConnection, 2000);
        } else {
          setError('Connection failed. Please refresh the page.');
        }
      }
    };
    
    attemptConnection();
    
    return () => {
      endConnection();
    };
  }, [startConnection, endConnection]);
  
  return {
    sessionId,
    sessionInfo,
    messages,
    loading,
    connected,
    socketReady,
    agentReady,
    isThinking,
    error,
    sendMessage,
    addSystemMessage,
    clearMessages,
    endSession: endConnection
  };
}

export default useElizaSocketIO;
