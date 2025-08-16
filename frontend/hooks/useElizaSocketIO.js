import { useState, useCallback, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getConfig } from '../utils/config.js';

/**
 * Clean ElizaOS Socket.IO Hook - Minimal Logging, Production Ready
 * Configured for Purl Agent (40608b6b-63b6-0e2c-b819-9d9850d060ec)
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
  const [lastAgentAction, setLastAgentAction] = useState(null); // Track agent's last response action
  
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
          name: `Purl Chat ${sessionId?.slice(0, 8) || 'New'}`,
          serverId: '00000000-0000-0000-0000-000000000000', // Default server ID
          description: 'Chat channel for Purl agent session',
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

  // Check for agent actions via API as fallback
  const checkForAgentActions = useCallback(async () => {
    try {
      if (!roomId.current) return;
      
      log('🔍 Checking for agent actions via API...');
      
      // Check the channel for recent agent activity
      const response = await fetch(`${BASE_URL}/api/messaging/central-channels/${roomId.current}/messages`, {
        method: 'GET',
        headers: {
          'X-API-Key': getConfig().API_KEY || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const messages = data.data?.messages || [];
        
        // Look for recent agent messages or actions
        const recentAgentMessages = messages.filter(msg => 
          msg.senderId === agentId || 
          msg.authorId === agentId ||
          msg.senderName === 'Purl'
        ).slice(-5); // Last 5 messages
        
        if (recentAgentMessages.length > 0) {
          const latestAgentMessage = recentAgentMessages[recentAgentMessages.length - 1];
          
          // Check if this message contains action information
          if (latestAgentMessage.action || latestAgentMessage.responseAction || latestAgentMessage.agentAction) {
            const agentAction = latestAgentMessage.action || latestAgentMessage.responseAction || latestAgentMessage.agentAction;
            log('🤖 Agent action found via API fallback:', agentAction);
            
            // Clear thinking state
            setIsThinking(false);
            setLastAgentAction(agentAction);
            
            // Handle the action
            let actionMessage = null;
            switch (agentAction) {
              case 'IGNORE':
                actionMessage = "Purl has chosen to ignore your message. They might be busy or not interested in this topic right now.";
                break;
              case 'GENERATE_IMAGE':
                actionMessage = "Purl is generating an image for you...";
                break;
              case 'UPDATE_CONTACT':
                actionMessage = "Purl is updating contact information...";
                break;
              case 'MUTE_ROOM':
                actionMessage = "Purl has muted this conversation.";
                break;
              case 'NONE':
                actionMessage = "Purl received your message but chose not to respond.";
                break;
              default:
                actionMessage = `Purl took action: ${agentAction}`;
                break;
            }
            
            const systemActionMessage = {
              id: generateUUID(),
              content: actionMessage,
              authorId: 'system',
              isAgent: false,
              createdAt: new Date(),
              metadata: { 
                systemType: 'agent_action',
                agentAction: agentAction,
                realTime: false,
                source: 'api_fallback'
              },
              isSystem: true
            };
            
            setMessages(prev => {
              const withoutThinking = prev.filter(msg => !msg.isThinking);
              return [...withoutThinking, systemActionMessage];
            });
            
            setAgentReady(true);
          }
        }
      }
    } catch (err) {
      logError('❌ Error checking for agent actions:', err.message);
    }
  }, [BASE_URL, agentId, generateUUID]);

  // Check for ElizaOS specific actions via API
  const checkForElizaOSActions = useCallback(async () => {
    try {
      if (!roomId.current) return;
      
      log('🔍 Checking for ElizaOS actions via API...');
      
      // Check the channel for recent agent activity
      const response = await fetch(`${BASE_URL}/api/messaging/central-channels/${roomId.current}/messages`, {
        method: 'GET',
        headers: {
          'X-API-Key': getConfig().API_KEY || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const messages = data.data?.messages || [];
        
        // Look for recent agent messages or actions
        const recentAgentMessages = messages.filter(msg => 
          msg.senderId === agentId || 
          msg.authorId === agentId ||
          msg.senderName === 'Purl' ||
          msg.source === 'agent_response' ||
          msg.type === 'agent_action'
        ).slice(-10); // Last 10 messages for better coverage
        
        if (recentAgentMessages.length > 0) {
          const latestAgentMessage = recentAgentMessages[recentAgentMessages.length - 1];
          
          // Check for ElizaOS action patterns
          const hasAction = latestAgentMessage.action || 
                           latestAgentMessage.responseAction || 
                           latestAgentMessage.agentAction ||
                           latestAgentMessage.actions ||
                           latestAgentMessage.type === 'agent_action' ||
                           latestAgentMessage.metadata?.action;
          
          if (hasAction) {
            const agentAction = latestAgentMessage.action || 
                               latestAgentMessage.responseAction || 
                               latestAgentMessage.agentAction ||
                               latestAgentMessage.actions?.[0] ||
                               latestAgentMessage.metadata?.action;
            
            log('🤖 ElizaOS action found via API:', agentAction);
            
            // Clear thinking state
            setIsThinking(false);
            setLastAgentAction(agentAction);
            
            // Handle the action
            let actionMessage = null;
            switch (agentAction) {
              case 'IGNORE':
                actionMessage = "Purl has chosen to ignore your message. They might be busy or not interested in this topic right now.";
                break;
              case 'GENERATE_IMAGE':
                actionMessage = "Purl is generating an image for you...";
                break;
              case 'UPDATE_CONTACT':
                actionMessage = "Purl is updating contact information...";
                break;
              case 'MUTE_ROOM':
                actionMessage = "Purl has muted this conversation.";
                break;
              case 'NONE':
                actionMessage = "Purl received your message but chose not to respond.";
                break;
              case 'REPLY':
                // For REPLY actions, check if there's actual content
                if (latestAgentMessage.content || latestAgentMessage.text || latestAgentMessage.message) {
                  log('💬 ElizaOS REPLY action with content - no need for action message');
                  return; // Don't show action message for REPLY with content
                }
                break;
              default:
                actionMessage = `Purl took action: ${agentAction}`;
                break;
            }
            
            if (actionMessage) {
              const systemActionMessage = {
                id: generateUUID(),
                content: actionMessage,
                authorId: 'system',
                isAgent: false,
                createdAt: new Date(),
                metadata: { 
                  systemType: 'agent_action',
                  agentAction: agentAction,
                  realTime: false,
                  source: 'elizaos_api_check'
                },
                isSystem: true
              };
              
              setMessages(prev => {
                const withoutThinking = prev.filter(msg => !msg.isThinking);
                return [...withoutThinking, systemActionMessage];
              });
            }
            
            setAgentReady(true);
          }
        }
      }
    } catch (err) {
      logError('❌ Error checking for ElizaOS actions:', err.message);
    }
  }, [BASE_URL, agentId, generateUUID]);
  
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
        log('📡 Message broadcast received:', data);
        
        // Check if agent response
        const isFromAgent = (
          data.senderId === agentId ||
          data.authorId === agentId ||
          data.senderName === 'Purl' ||
          data.source === 'agent_response'
        );
        
        if (isFromAgent) {
          // Always clear thinking state when agent responds
          setIsThinking(false);
          
          // Extract agent's response action from the data
          const agentAction = data.action || data.responseAction || data.agentAction;
          if (agentAction) {
            setLastAgentAction(agentAction);
            log('🤖 Agent action detected:', agentAction);
          }
          
          // Handle different response actions
          if (agentAction === 'IGNORE') {
            // Agent chose to ignore - show ignore message
            const ignoreMessage = {
              id: generateUUID(),
              content: "Purl has chosen to ignore your message. They might be busy or not interested in this topic right now.",
              authorId: 'system',
              isAgent: false,
              createdAt: new Date(),
              metadata: { 
                systemType: 'agent_ignore',
                agentAction: 'IGNORE',
                realTime: true
              },
              isSystem: true
            };
            
            setMessages(prev => {
              const withoutThinking = prev.filter(msg => !msg.isThinking);
              return [...withoutThinking, ignoreMessage];
            });
            
            setAgentReady(true);
            return; // Don't add regular agent message for ignore
          }
          
          // For other actions, show appropriate messages
          let actionMessage = null;
          switch (agentAction) {
            case 'GENERATE_IMAGE':
              actionMessage = "Purl is generating an image for you...";
              break;
            case 'UPDATE_CONTACT':
              actionMessage = "Purl is updating contact information...";
              break;
            case 'MUTE_ROOM':
              actionMessage = "Purl has muted this conversation.";
              break;
            case 'NONE':
              actionMessage = "Purl received your message but chose not to respond.";
              break;
            default:
              // For REPLY or undefined actions, proceed with normal message
              break;
          }
          
          if (actionMessage) {
            const systemActionMessage = {
              id: generateUUID(),
              content: actionMessage,
              authorId: 'system',
              isAgent: false,
              createdAt: new Date(),
              metadata: { 
                systemType: 'agent_action',
                agentAction: agentAction,
                realTime: true
              },
              isSystem: true
            };
            
            setMessages(prev => {
              const withoutThinking = prev.filter(msg => !msg.isThinking);
              return [...withoutThinking, systemActionMessage];
            });
            
            setAgentReady(true);
            return; // Don't add regular agent message for action-only responses
          }
          
          // Regular agent reply message
          const agentMessage = {
            id: data.id || generateUUID(),
            content: data.text || data.content || data.message,
            authorId: data.senderId || data.authorId || agentId,
            isAgent: true,
            createdAt: new Date(data.createdAt || Date.now()),
            metadata: {
              thought: data.thought,
              actions: data.actions,
              agentAction: agentAction,
              attachments: data.attachments || [], // Include attachments for images and files
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

      // Listen for agent action events specifically
      socket.on('agentAction', (data) => {
        log('🤖 Agent action event received:', data);
        
        // Clear thinking state immediately
        setIsThinking(false);
        
        const agentAction = data.action || data.responseAction || data.agentAction;
        if (agentAction) {
          setLastAgentAction(agentAction);
          
          // Handle the action based on type
          let actionMessage = null;
          switch (agentAction) {
            case 'IGNORE':
              actionMessage = "Purl has chosen to ignore your message. They might be busy or not interested in this topic right now.";
              break;
            case 'GENERATE_IMAGE':
              actionMessage = "Purl is generating an image for you...";
              break;
            case 'UPDATE_CONTACT':
              actionMessage = "Purl is updating contact information...";
              break;
            case 'MUTE_ROOM':
              actionMessage = "Purl has muted this conversation.";
              break;
            case 'NONE':
              actionMessage = "Purl received your message but chose not to respond.";
              break;
            default:
              actionMessage = `Purl took action: ${agentAction}`;
              break;
          }
          
          const systemActionMessage = {
            id: generateUUID(),
            content: actionMessage,
            authorId: 'system',
            isAgent: false,
            createdAt: new Date(),
            metadata: { 
              systemType: 'agent_action',
              agentAction: agentAction,
              realTime: true
            },
            isSystem: true
          };
          
          setMessages(prev => {
            const withoutThinking = prev.filter(msg => !msg.isThinking);
            return [...withoutThinking, systemActionMessage];
          });
          
          setAgentReady(true);
        }
      });

      // Listen for agent response events
      socket.on('agentResponse', (data) => {
        log('🤖 Agent response event received:', data);
        
        // Clear thinking state
        setIsThinking(false);
        
        const agentAction = data.action || data.responseAction || data.agentAction;
        if (agentAction) {
          setLastAgentAction(agentAction);
        }
        
        // Handle the response
        if (data.content || data.text || data.message) {
          const agentMessage = {
            id: data.id || generateUUID(),
            content: data.text || data.content || data.message,
            authorId: data.senderId || data.authorId || agentId,
            isAgent: true,
            createdAt: new Date(data.createdAt || Date.now()),
            metadata: {
              thought: data.thought,
              actions: data.actions,
              agentAction: agentAction,
              realTime: true
            }
          };
          
          setMessages(prev => {
            const withoutThinking = prev.filter(msg => !msg.isThinking);
            return [...withoutThinking, agentMessage];
          });
        }
        
        setAgentReady(true);
      });

      // Listen for any message events that might contain agent actions
      socket.on('message', (data) => {
        log('📨 General message event received:', data);
        
        // Check if this contains agent action information
        if (data.agentAction || data.responseAction || data.action) {
          log('🤖 Agent action found in general message:', data);
          
          // Clear thinking state
          setIsThinking(false);
          
          const agentAction = data.agentAction || data.responseAction || data.action;
          setLastAgentAction(agentAction);
          
          // Handle the action
          let actionMessage = null;
          switch (agentAction) {
            case 'IGNORE':
              actionMessage = "Purl has chosen to ignore your message. They might be busy or not interested in this topic right now.";
              break;
            case 'GENERATE_IMAGE':
              actionMessage = "Purl is generating an image for you...";
              break;
            case 'UPDATE_CONTACT':
              actionMessage = "Purl is updating contact information...";
              break;
            case 'MUTE_ROOM':
              actionMessage = "Purl has muted this conversation.";
              break;
            case 'NONE':
              actionMessage = "Purl received your message but chose not to respond.";
              break;
            default:
              actionMessage = `Purl took action: ${agentAction}`;
              break;
          }
          
          const systemActionMessage = {
            id: generateUUID(),
            content: actionMessage,
            authorId: 'system',
            isAgent: false,
            createdAt: new Date(),
            metadata: { 
              systemType: 'agent_action',
              agentAction: agentAction,
              realTime: true
            },
            isSystem: true
          };
          
          setMessages(prev => {
            const withoutThinking = prev.filter(msg => !msg.isThinking);
            return [...withoutThinking, systemActionMessage];
          });
          
          setAgentReady(true);
        }
      });

      // Debug: Listen for all events to see what's actually being received
      socket.onAny((eventName, ...args) => {
        log('🔍 Socket event received:', eventName, args);
        
        // Check if any of the args contain agent action information
        args.forEach((arg, index) => {
          if (arg && typeof arg === 'object') {
            if (arg.agentAction || arg.responseAction || arg.action) {
              log('🤖 Agent action found in event args:', eventName, index, arg);
              
              // Clear thinking state
              setIsThinking(false);
              
              const agentAction = arg.agentAction || arg.responseAction || arg.action;
              setLastAgentAction(agentAction);
              
              // Handle the action
              let actionMessage = null;
              switch (agentAction) {
                case 'IGNORE':
                  actionMessage = "Purl has chosen to ignore your message. They might be busy or not interested in this topic right now.";
                  break;
                case 'GENERATE_IMAGE':
                  actionMessage = "Purl is generating an image for you...";
                  break;
                case 'UPDATE_CONTACT':
                  actionMessage = "Purl is updating contact information...";
                  break;
                case 'MUTE_ROOM':
                  actionMessage = "Purl has muted this conversation.";
                  break;
                case 'NONE':
                  actionMessage = "Purl received your message but chose not to respond.";
                  break;
                default:
                  actionMessage = `Purl took action: ${agentAction}`;
                  break;
              }
              
              const systemActionMessage = {
                id: generateUUID(),
                content: actionMessage,
                authorId: 'system',
                isAgent: false,
                createdAt: new Date(),
                metadata: { 
                  systemType: 'agent_action',
                  agentAction: agentAction,
                  realTime: true,
                  source: `socket_event_${eventName}`
                },
                isSystem: true
              };
              
              setMessages(prev => {
                const withoutThinking = prev.filter(msg => !msg.isThinking);
                return [...withoutThinking, systemActionMessage];
              });
              
              setAgentReady(true);
            }
          }
        });
      });

      // ElizaOS specific action events based on documentation
      socket.on('actionExecuted', (data) => {
        log('🤖 ElizaOS action executed event:', data);
        
        // Clear thinking state immediately
        setIsThinking(false);
        
        const agentAction = data.action || data.actionName || data.type;
        if (agentAction) {
          setLastAgentAction(agentAction);
          log('🤖 ElizaOS action detected:', agentAction);
          
          // Handle the action based on ElizaOS action types
          let actionMessage = null;
          switch (agentAction) {
            case 'IGNORE':
              actionMessage = "Purl has chosen to ignore your message. They might be busy or not interested in this topic right now.";
              break;
            case 'GENERATE_IMAGE':
              actionMessage = "Purl is generating an image for you...";
              break;
            case 'UPDATE_CONTACT':
              actionMessage = "Purl is updating contact information...";
              break;
            case 'MUTE_ROOM':
              actionMessage = "Purl has muted this conversation.";
              break;
            case 'NONE':
              actionMessage = "Purl received your message but chose not to respond.";
              break;
            case 'REPLY':
              // For REPLY actions, we expect a message to follow
              log('💬 ElizaOS REPLY action - expecting message to follow');
              break;
            default:
              actionMessage = `Purl took action: ${agentAction}`;
              break;
          }
          
          if (actionMessage) {
            const systemActionMessage = {
              id: generateUUID(),
              content: actionMessage,
              authorId: 'system',
              isAgent: false,
              createdAt: new Date(),
              metadata: { 
                systemType: 'agent_action',
                agentAction: agentAction,
                realTime: true,
                source: 'elizaos_action_executed'
              },
              isSystem: true
            };
            
            setMessages(prev => {
              const withoutThinking = prev.filter(msg => !msg.isThinking);
              return [...withoutThinking, systemActionMessage];
            });
          }
          
          setAgentReady(true);
        }
      });

      // Listen for ElizaOS agent response events
      socket.on('agentResponse', (data) => {
        log('🤖 ElizaOS agent response event:', data);
        
        // Clear thinking state
        setIsThinking(false);
        
        // Check for action information in the response
        const agentAction = data.action || data.responseAction || data.agentAction || data.actions?.[0];
        if (agentAction) {
          setLastAgentAction(agentAction);
          log('🤖 Agent action in response:', agentAction);
        }
        
                 // Handle the response content
         if (data.content || data.text || data.message) {
           const agentMessage = {
             id: data.id || generateUUID(),
             content: data.text || data.content || data.message,
             authorId: data.senderId || data.authorId || agentId,
             isAgent: true,
             createdAt: new Date(data.createdAt || Date.now()),
             metadata: {
               thought: data.thought,
               actions: data.actions,
               agentAction: agentAction,
               attachments: data.attachments || [], // Include attachments
               realTime: true,
               source: 'elizaos_agent_response'
             }
           };
          
          setMessages(prev => {
            const withoutThinking = prev.filter(msg => !msg.isThinking);
            return [...withoutThinking, agentMessage];
          });
        }
        
        setAgentReady(true);
      });

      // Listen for ElizaOS message events that might contain action data
      socket.on('elizaosMessage', (data) => {
        log('📨 ElizaOS message event:', data);
        
        // Check if this contains action information
        if (data.action || data.responseAction || data.agentAction || data.actions) {
          log('🤖 Agent action found in ElizaOS message:', data);
          
          // Clear thinking state
          setIsThinking(false);
          
          const agentAction = data.action || data.responseAction || data.agentAction || data.actions?.[0];
          setLastAgentAction(agentAction);
          
          // Handle the action
          let actionMessage = null;
          switch (agentAction) {
            case 'IGNORE':
              actionMessage = "Purl has chosen to ignore your message. They might be busy or not interested in this topic right now.";
              break;
            case 'GENERATE_IMAGE':
              actionMessage = "Purl is generating an image for you...";
              break;
            case 'UPDATE_CONTACT':
              actionMessage = "Purl is updating contact information...";
              break;
            case 'MUTE_ROOM':
              actionMessage = "Purl has muted this conversation.";
              break;
            case 'NONE':
              actionMessage = "Purl received your message but chose not to respond.";
              break;
            default:
              actionMessage = `Purl took action: ${agentAction}`;
              break;
          }
          
          const systemActionMessage = {
            id: generateUUID(),
            content: actionMessage,
            authorId: 'system',
            isAgent: false,
            createdAt: new Date(),
            metadata: { 
              systemType: 'agent_action',
              agentAction: agentAction,
              realTime: true,
              source: 'elizaos_message'
            },
            isSystem: true
          };
          
          setMessages(prev => {
            const withoutThinking = prev.filter(msg => !msg.isThinking);
            return [...withoutThinking, systemActionMessage];
          });
          
          setAgentReady(true);
        }
      });

      // Listen for action status responses
      socket.on('actionStatusResponse', (data) => {
        log('🤖 Action status response received:', data);
        
        if (data.action || data.responseAction || data.agentAction || data.actions) {
          // Clear thinking state
          setIsThinking(false);
          
          const agentAction = data.action || data.responseAction || data.agentAction || data.actions?.[0];
          setLastAgentAction(agentAction);
          
          // Handle the action
          let actionMessage = null;
          switch (agentAction) {
            case 'IGNORE':
              actionMessage = "Purl has chosen to ignore your message. They might be busy or not interested in this topic right now.";
              break;
            case 'GENERATE_IMAGE':
              actionMessage = "Purl is generating an image for you...";
              break;
            case 'UPDATE_CONTACT':
              actionMessage = "Purl is updating contact information...";
              break;
            case 'MUTE_ROOM':
              actionMessage = "Purl has muted this conversation.";
              break;
            case 'NONE':
              actionMessage = "Purl received your message but chose not to respond.";
              break;
            case 'REPLY':
              // For REPLY actions, check if there's actual content
              if (data.content || data.text || data.message) {
                log('💬 ElizaOS REPLY action with content - no need for action message');
                return; // Don't show action message for REPLY with content
              }
              break;
            default:
              actionMessage = `Purl took action: ${agentAction}`;
              break;
          }
          
          if (actionMessage) {
            const systemActionMessage = {
              id: generateUUID(),
              content: actionMessage,
              authorId: 'system',
              isAgent: false,
              createdAt: new Date(),
              metadata: { 
                systemType: 'agent_action',
                agentAction: agentAction,
                realTime: true,
                source: 'action_status_response'
              },
              isSystem: true
            };
            
            setMessages(prev => {
              const withoutThinking = prev.filter(msg => !msg.isThinking);
              return [...withoutThinking, systemActionMessage];
            });
          }
          
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

      // Fallback: Check for agent actions if thinking state persists
      const actionCheckInterval = setInterval(() => {
        if (isThinking && roomId.current) {
          log('🔍 Checking for agent actions...');
          checkForAgentActions();
        }
      }, 3000); // Check every 3 seconds for faster response

      // Additional ElizaOS action checking
      const elizaosActionCheckInterval = setInterval(() => {
        if (isThinking && roomId.current) {
          log('🔍 ElizaOS specific action check...');
          checkForElizaOSActions();
          
          // Also emit a request for action status
          socket.emit('requestActionStatus', {
            channelId: roomId.current,
            agentId: agentId,
            userId: userId
          });
        }
      }, 2000); // Check every 2 seconds for ElizaOS actions

      // Cleanup intervals on disconnect
      socket.on('disconnect', () => {
        clearInterval(actionCheckInterval);
        clearInterval(elizaosActionCheckInterval);
      });
    
                 }, [agentId, userId, generateUUID, checkForAgentActions, checkForElizaOSActions]);
  
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
      
                    // Fallback: Clear thinking after 8 seconds and show action detection message
        setTimeout(() => {
          if (isThinking) {
            log('⏰ Thinking timeout - checking for ElizaOS actions...');
            setIsThinking(false);
            setMessages(prev => prev.filter(msg => !msg.isThinking));
            
            // Add a message indicating we're checking for actions
            const timeoutMessage = {
              id: generateUUID(),
              content: "Purl seems to be taking their time... Checking for any actions they might have taken.",
              authorId: 'system',
              isAgent: false,
              createdAt: new Date(),
              metadata: { 
                systemType: 'timeout_check',
                realTime: false
              },
              isSystem: true
            };
            
            setMessages(prev => [...prev, timeoutMessage]);
            
            // Trigger both action checks
            setTimeout(() => {
              checkForAgentActions();
              checkForElizaOSActions();
            }, 500);
          }
        }, 8000);
      
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
    lastAgentAction, // Expose the last agent action
    sendMessage,
    addSystemMessage,
    clearMessages,
    endSession: endConnection
  };
}

export default useElizaSocketIO;
