import { useState, useCallback, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

/**
 * ElizaOS Socket.IO Hook - Real-time WebSocket Implementation
 * 
 * This hook implements the official ElizaOS Socket.IO integration pattern
 * as documented in the Socket.IO Integration Guide.
 * 
 * Based on: ElizaOS NextJS Starter Socket.IO implementation
 */

// Official ElizaOS Socket.IO Events (from v4.x documentation)
const SOCKET_EVENTS = {
  // Client to Server
  JOIN: 'join',
  LEAVE: 'leave', 
  MESSAGE: 'message',
  REQUEST_WORLD_STATE: 'request-world-state',
  
  // Server to Client
  MESSAGE_BROADCAST: 'messageBroadcast',
  MESSAGE_COMPLETE: 'messageComplete',
  WORLD_STATE: 'world-state',
  LOG_ENTRY: 'logEntry',
  ERROR: 'error'
};

function useElizaSocketIO(agentId, userId) {
  // Core state
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const [error, setError] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  
  // Socket.IO connection
  const socketRef = useRef(null);
  const roomId = useRef(null);
  
  // Rate limiting
  const lastMessageTime = useRef(0);
  
  const BASE_URL = 'http://localhost:3000';
  
  /**
   * Generate UUID helper function
   */
  const generateUUID = useCallback(() => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }, []);
  
  /**
   * Initialize Socket.IO connection and event handlers
   */
  const initializeSocket = useCallback((channelId, currentSessionId) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    console.log('🔌 [Socket.IO] Connecting to ElizaOS server...');
    console.log('🔌 [Socket.IO] Server URL:', BASE_URL);
    console.log('🔌 [Socket.IO] Expected endpoint:', `${BASE_URL}/socket.io/`);
    
    // Create Socket.IO connection (v4.x official)
    // Start with polling first, then upgrade to websocket
    socketRef.current = io(BASE_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
      transports: ['polling', 'websocket'], // Polling first, then websocket
      upgrade: true,
      rememberUpgrade: false,
      forceNew: true // Force a new connection each time
    });
    
    const socket = socketRef.current;
    roomId.current = channelId; // Use channelId from Sessions API
    
    console.log('🏠 [Socket.IO] Will join room/channel:', channelId);
    
    // Connection established
    socket.on('connect', () => {
      console.log('✅ [Socket.IO] Connected to ElizaOS!');
      console.log('   - Socket ID:', socket.id);
      console.log('   - Transport:', socket.io.engine.transport.name);
      console.log('   - Ready state:', socket.connected);
      setSocketReady(true);
      
      // Join the room/channel using official ElizaOS Socket.IO API (structured format)
      const joinPayload = {
        type: 1, // ROOM_JOINING type from documentation
        payload: {
          roomId: roomId.current,
          entityId: userId
        }
      };
      
      console.log('🏠 [Socket.IO] Joining room using official API:');
      console.log('   - roomId:', roomId.current);
      console.log('   - agentId:', agentId);
      console.log('   - userId:', userId);
      console.log('   - Socket ID:', socket.id);
      console.log('   - Full payload:', joinPayload);
      
      socket.emit('message', joinPayload);
      console.log('✅ [Socket.IO] Join message emitted via "message" event');
    });
    
    // Transport upgrade (polling -> websocket)
    socket.io.on('upgrade', () => {
      console.log('🔄 [Socket.IO] Transport upgraded to:', socket.io.engine.transport.name);
    });
    
    // Connection state changes
    socket.on('connect_error', (error) => {
      console.error('❌ [Socket.IO] Connection error:', error);
      console.error('   - Error type:', error.type);
      console.error('   - Error description:', error.description);
      setError(`Socket.IO connection error: ${error.message}`);
      setSocketReady(false);
    });
    
    socket.on('disconnect', (reason, details) => {
      console.log('🔌 [Socket.IO] Disconnected:', reason);
      if (details) {
        console.log('   - Details:', details);
      }
      setSocketReady(false);
      
      if (reason === 'io server disconnect') {
        // Server forced disconnect, try to reconnect
        console.log('🔄 [Socket.IO] Server disconnect - attempting reconnect...');
        socket.connect();
      }
    });
    
    // Connection attempts
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 [Socket.IO] Reconnect attempt #${attemptNumber}`);
    });
    
    socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ [Socket.IO] Reconnected after ${attemptNumber} attempts`);
    });
    
    socket.on('reconnect_failed', () => {
      console.error('❌ [Socket.IO] Reconnection failed - max attempts reached');
      setError('Failed to reconnect to server');
    });
    
    // Listen for message broadcasts using official event name
    socket.on(SOCKET_EVENTS.MESSAGE_BROADCAST, (data) => {
      console.log('🎉 [Socket.IO] *** RECEIVED messageBroadcast EVENT ***');
      console.log('📨 [Socket.IO] Full broadcast data:', JSON.stringify(data, null, 2));
      
      // First, check if this is an agent response regardless of room
      const isFromAgent = (
        data.senderId === agentId ||
        data.authorId === agentId ||
        data.senderName === 'Eliza' ||
        data.source === 'agent_response' ||
        data.source_type === 'agent_response'
      );
      
      console.log('🤖 [Socket.IO] Is this from agent?', isFromAgent, {
        senderId: data.senderId,
        authorId: data.authorId,
        senderName: data.senderName,
        source: data.source,
        source_type: data.source_type,
        expectedAgentId: agentId
      });
      
      if (isFromAgent) {
        console.log('🎯 [Socket.IO] AGENT MESSAGE DETECTED! Processing regardless of room...');
        
        // If this is an agent message but we're not in the right room, auto-join
        const isForOurRoom = (
          data.roomId === roomId.current || 
          data.channelId === roomId.current ||
          data.roomId === sessionId ||
          data.channelId === sessionId
        );
        
        if (!isForOurRoom && (data.channelId || data.roomId)) {
          const correctChannel = data.channelId || data.roomId;
          console.log('🔄 [Auto-Fix] Agent message from different room, joining:', correctChannel);
          
          roomId.current = correctChannel;
          const autoJoinPayload = {
            type: 1, // ROOM_JOINING
            payload: {
              roomId: correctChannel,
              entityId: userId
            }
          };
          
          socketRef.current.emit('message', autoJoinPayload);
          console.log('🏠 [Auto-Fix] Sent auto-join for agent channel:', correctChannel);
        }
        
        // Process the agent message
        console.log('🤖 [Socket.IO] Processing agent response...');
        
        // Clear thinking state
        setIsThinking(false);
        
        // Add agent message
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
        
        console.log('➕ [Socket.IO] Adding agent message to UI:', agentMessage);
        
        setMessages(prev => {
          // Remove any existing thinking messages
          const withoutThinking = prev.filter(msg => !msg.isThinking);
          return [...withoutThinking, agentMessage];
        });
      } else {
        console.log('👤 [Socket.IO] Not an agent message, ignoring');
        console.log('   - Could be user echo or other message type');
      }
    });
    
    // Message processing complete (official event)
    socket.on(SOCKET_EVENTS.MESSAGE_COMPLETE, (data) => {
      console.log('✅ [Socket.IO] Message processing complete:', data);
      setIsThinking(false);
    });
    
    // Error handling (official event)
    socket.on(SOCKET_EVENTS.ERROR, (data) => {
      console.error('❌ [Socket.IO] Server error:', data);
      setError(`Server error: ${data.error || 'Unknown error'}`);
    });
    
    // World state updates (official event)
    socket.on(SOCKET_EVENTS.WORLD_STATE, (data) => {
      console.log('🌍 [Socket.IO] World state update:', data);
    });
    
    // Log entries (official event)
    socket.on(SOCKET_EVENTS.LOG_ENTRY, (data) => {
      console.log('📋 [Socket.IO] Log entry:', data);
    });
    
    // Room join confirmation (if server sends this)
    socket.on('joined', (data) => {
      console.log('✅ [Socket.IO] Room join confirmed:', data);
    });
    
    socket.on('join_error', (data) => {
      console.error('❌ [Socket.IO] Room join failed:', data);
      setError(`Failed to join room: ${data.message || 'Unknown error'}`);
    });
    
    // Generic success/acknowledgment responses
    socket.on('ack', (data) => {
      console.log('✅ [Socket.IO] Acknowledgment received:', data);
    });
    
    // Listen for any other message-related events the server might send
    socket.on('message_received', (data) => {
      console.log('📨 [Socket.IO] Message received confirmation:', data);
    });
    
    socket.on('message_error', (data) => {
      console.error('❌ [Socket.IO] Message error:', data);
      setError(`Message error: ${data.message || 'Unknown error'}`);
    });
    
    socket.on('room_error', (data) => {
      console.error('❌ [Socket.IO] Room error:', data);
      setError(`Room error: ${data.message || 'Unknown error'}`);
    });
    
    // Debug: Check if we're receiving generic 'message' events
    socket.on('message', (data) => {
      console.log('⚠️ [Socket.IO] Received generic "message" event:', data);
    });
    
    // Debug: Log if no messageBroadcast events are received after 10 seconds
    setTimeout(() => {
      console.log('⏰ [Socket.IO Debug] If you see this without any messageBroadcast events above,');
      console.log('   then the issue is: NOT RECEIVING messageBroadcast events at all');
      console.log('   Check: 1) Are we joined to the correct room? 2) Is the agent active in this room?');
    }, 10000);

    
    // Debug: Log ALL events (exact from documentation)
    if (process.env.NODE_ENV === 'development') {
      // For newer Socket.IO versions
      if (socket.onAny) {
        socket.onAny((eventName, ...args) => {
          console.log('🔍 [Socket.IO Event]:', eventName, args);
        });
      } else {
        // For older versions (exact from docs)
        const onevent = socket.onevent;
        socket.onevent = function(packet) {
          console.log('🔍 [Socket.IO Event]:', packet.data);
          onevent.call(socket, packet);
        };
      }
      
      // Log outgoing events
      const originalEmit = socket.emit;
      socket.emit = function() {
        console.log('📤 [EMIT] Event:', arguments[0], arguments[1]);
        return originalEmit.apply(socket, arguments);
      };
    }
    
  }, [agentId, userId, generateUUID, messages]);
  
  /**
   * Add agent to channel to ensure participation (CRITICAL FIX)
   */
  const addAgentToChannel = useCallback(async (channelId) => {
    try {
      console.log(`🔧 [Socket.IO] Adding agent to channel: ${channelId}`);
      
      // Step 1: Add agent to the central channel
      const addAgentResponse = await fetch(`${BASE_URL}/api/messaging/central-channels/${channelId}/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agentId
        })
      });
      
      if (addAgentResponse.ok) {
        console.log(`✅ [Socket.IO] Successfully added agent to channel: ${channelId}`);
        
        // Step 2: Verify channel participants
        try {
          const participantsResponse = await fetch(`${BASE_URL}/api/messaging/central-channels/${channelId}/participants`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (participantsResponse.ok) {
            const participantsData = await participantsResponse.json();
            console.log(`📋 [Socket.IO] Channel ${channelId} participants:`, participantsData);
            
            // Verify agent is now in participants
            if (participantsData.includes && participantsData.includes(agentId)) {
              console.log(`🎯 [Socket.IO] Confirmed: Agent is now participant in channel ${channelId}`);
              return true;
            } else if (participantsData.participants && participantsData.participants.includes(agentId)) {
              console.log(`🎯 [Socket.IO] Confirmed: Agent is now participant in channel ${channelId}`);
              return true;
            }
          }
        } catch (verifyErr) {
          console.log(`⚠️ [Socket.IO] Could not verify participants, but agent was added:`, verifyErr.message);
          return true; // Assume success if we can't verify
        }
        
        return true;
      } else {
        const errorData = await addAgentResponse.json().catch(() => ({ message: 'Unknown error' }));
        console.error(`❌ [Socket.IO] Failed to add agent to channel ${channelId}:`, addAgentResponse.status, errorData);
        return false;
      }
    } catch (err) {
      console.error(`❌ [Socket.IO] Error adding agent to channel ${channelId}:`, err);
      return false;
    }
  }, [agentId]);

  /**
   * Find and setup the correct channel with agent participation
   */
  const setupAgentChannel = useCallback(async () => {
    try {
      console.log('🔍 [Socket.IO] Setting up channel with agent participation...');
      
      // Try standard central channel patterns
      const possibleCentralChannels = [
        'central',                      // Global central channel
        'default',                      // Default channel
        'main',                         // Main channel
        'general',                      // General channel
        agentId                        // Agent ID as channel
      ];
      
      // Try each channel and ensure agent participation
      for (const channelId of possibleCentralChannels) {
        console.log(`🔍 [Socket.IO] Trying channel: ${channelId}`);
        
        // Add agent to this channel
        const agentAdded = await addAgentToChannel(channelId);
        
        if (agentAdded) {
          console.log(`✅ [Socket.IO] Successfully setup channel with agent participation: ${channelId}`);
          return channelId;
        }
      }
      
      // If no standard channel works, create a session-based channel
      console.log('🔄 [Socket.IO] No standard channel worked, creating session-based channel...');
      
      try {
        const sessionResponse = await fetch(`${BASE_URL}/api/messaging/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: agentId,
            userId: userId,
            metadata: { platform: 'web', interface: 'socket-agent-participation' }
          })
        });
        
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          const sessionChannelId = sessionData.sessionId;
          console.log('✅ [Sessions API] Created session-based channel:', sessionChannelId);
          
          // Try to add agent to this session-based channel too
          await addAgentToChannel(sessionChannelId);
          
          return sessionChannelId;
        }
      } catch (sessionErr) {
        console.error('❌ [Sessions API] Failed to create session-based channel:', sessionErr);
      }
      
      // Last resort: Use agent ID
      console.log('🔄 [Socket.IO] Last resort: using agent ID as channel');
      await addAgentToChannel(agentId);
      return agentId;
      
    } catch (err) {
      console.error('❌ [Socket.IO] Failed to setup agent channel:', err);
      return agentId; // Fallback to agent ID
    }
  }, [agentId, userId, addAgentToChannel]);

  /**
   * Start Socket.IO connection (Pure Socket.IO - No Sessions API)
   */
  const startConnection = useCallback(async () => {
    if (!agentId || !userId) {
      setError('Agent ID and User ID are required');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 [Socket.IO] Starting pure Socket.IO connection...');
      console.log('   Agent ID:', agentId);
      console.log('   User ID:', userId);
      
      // Setup channel with proper agent participation (CRITICAL FIX)
      const correctChannelId = await setupAgentChannel();
      
      console.log('🔗 [Socket.IO] Using discovered channel ID:', correctChannelId);
      
      // Set basic connection info
      setSessionInfo({ roomId: correctChannelId, agentId, userId });
      setConnected(true);
      
      // Initialize Socket.IO connection
      initializeSocket(correctChannelId, null);
      
      return correctChannelId;
      
    } catch (err) {
      console.error('❌ [Socket.IO] Failed to start connection:', err);
      setError(err.message);
      setConnected(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [agentId, userId, initializeSocket, setupAgentChannel]);
  
  /**
   * Send a message using pure Socket.IO
   */
  const sendMessage = useCallback(async (content) => {
    if (!content?.trim()) {
      return null;
    }
    
    // Rate limiting for scalability
    const now = Date.now();
    const timeSinceLastMessage = now - lastMessageTime.current;
    const minInterval = 2000; // 2 seconds minimum for high-load scenarios
    
    if (timeSinceLastMessage < minInterval) {
      const waitTime = Math.ceil((minInterval - timeSinceLastMessage) / 1000);
      setError(`Please wait ${waitTime} seconds before sending another message`);
      return null;
    }
    
    lastMessageTime.current = now;
    
    try {
      setLoading(true);
      setError(null);
      
      // Ensure we have a connection
      if (!connected) {
        console.log('🔄 [Socket.IO] No connection, starting...');
        await startConnection();
      }
      
      console.log('📤 [Socket.IO] Sending message via pure Socket.IO API...');
      
      // Add user message immediately to UI
      const userMessage = {
        id: generateUUID(),
        content: content.trim(),
        authorId: userId,
        isAgent: false,
        createdAt: new Date(),
        metadata: {},
        status: 'sending'
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Add thinking indicator
      setIsThinking(true);
      const thinkingMessage = {
        id: generateUUID(),
        content: 'Eliza is thinking...',
        authorId: agentId,
        isAgent: true,
        createdAt: new Date(),
        metadata: { typing: true },
        isThinking: true,
        status: 'thinking'
      };
      
      setMessages(prev => [...prev, thinkingMessage]);
      
      // Send message using official Socket.IO API
      if (!socketRef.current?.connected) {
        throw new Error('Socket.IO not connected');
      }
      
      // ElizaOS expects structured message format with type and payload
      // Based on server error: channelId, serverId (server_id), senderId (author_id), and message are required
      const messagePayload = {
        type: 2, // SEND_MESSAGE type from documentation
        payload: {
          channelId: roomId.current,           // Required: channelId
          serverId: '00000000-0000-0000-0000-000000000000', // Required: serverId (server_id)
          senderId: userId,                    // Required: senderId (author_id)
          message: content.trim(),             // Required: message
          senderName: 'User',
          roomId: roomId.current,
          messageId: userMessage.id,
          source: 'socket_chat',
          attachments: [],
          metadata: {
            userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timestamp: new Date().toISOString()
          }
        }
      };
      
      console.log('🔗 [Socket.IO] Emitting message with official format:', messagePayload);
      console.log('🔗 [Socket.IO] Current room ID:', roomId.current);
      console.log('🔗 [Socket.IO] Socket connected status:', socketRef.current.connected);
      console.log('🔗 [Socket.IO] Socket ID:', socketRef.current.id);
      
      socketRef.current.emit('message', messagePayload);
      console.log('✅ [Socket.IO] Message emitted successfully');
      
      // Update user message status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'delivered' }
            : msg
        )
      );
      
      return userMessage;
      
    } catch (err) {
      console.error('❌ [Socket.IO] Failed to send message:', err);
      setError(err.message);
      setIsThinking(false);
      
      // Update message status to error
      setMessages(prev => 
        prev.map(msg => 
          msg.status === 'sending' 
            ? { ...msg, status: 'error' }
            : msg
        )
      );
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [connected, agentId, userId, startConnection, generateUUID]);
  
  /**
   * End the current connection and disconnect
   */
  const endConnection = useCallback(async () => {
    try {
      console.log('🔚 [Socket.IO] Ending connection...');
      
      // Leave the room first if connected
      if (socketRef.current?.connected && roomId.current) {
        const leavePayload = {
          type: 3, // LEAVE type (assuming it follows the pattern)
          payload: {
            roomId: roomId.current,
            entityId: userId
          }
        };
        
        console.log('🚪 [Socket.IO] Leaving room:', leavePayload);
        socketRef.current.emit('message', leavePayload);
      }
      
      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      
      console.log('✅ [Socket.IO] Connection ended successfully');
      
    } catch (err) {
      console.error('❌ [Socket.IO] Failed to end connection:', err);
    } finally {
      // Clean up local state
      setSessionId(null);
      setSessionInfo(null);
      setConnected(false);
      setSocketReady(false);
      setMessages([]);
      setError(null);
      setIsThinking(false);
      roomId.current = null;
    }
  }, [agentId]);
  
  /**
   * Add a system message for UI feedback
   */
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
  
  /**
   * Clear messages (for UI)
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsThinking(false);
  }, []);
  
  // Auto-start connection on mount
  useEffect(() => {
    if (agentId && userId && !loading && !connected) {
      console.log('🚀 [Socket.IO] Auto-starting connection...');
      startConnection();
    }
  }, [agentId, userId, loading, connected, startConnection]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);
  
  return {
    // State
    sessionId,
    sessionInfo,
    messages,
    loading,
    connected,
    socketReady,
    isThinking,
    error,
    
    // Actions
    startConnection,
    sendMessage,
    endConnection,
    addSystemMessage,
    clearMessages
  };
}

export default useElizaSocketIO;
