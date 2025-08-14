import { useState, useCallback, useEffect, useRef } from 'react';
import { getConfig } from '../utils/config.js';
import { authenticatedPost, authenticatedGet, buildApiUrl, handleApiResponse } from '../utils/api.js';

/**
 * ElizaOS Sessions API Hook - Official Implementation
 * 
 * This hook follows the official ElizaOS Sessions API documentation exactly.
 * It provides a simplified interface that eliminates channel management complexity.
 * 
 * Based on: https://docs.elizaos.ai/api/sessions-api-guide
 */

function useElizaSession(agentId, userId) {
  // Core session state
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  
  // Polling state for checking new messages
  const pollingRef = useRef(null);
  
  // Rate limiting
  const lastMessageTime = useRef(0);
  
  // Thinking timeout to handle slow responses
  const thinkingTimeoutRef = useRef(null);
  
  const BASE_URL = getConfig().BASE_URL;
  
  /**
   * Create a new session with the agent
   * Following official documentation pattern
   */
  const startSession = useCallback(async () => {
    if (!agentId || !userId) {
      setError('Agent ID and User ID are required');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 [Sessions API] Creating session with official API...');
      console.log('   Agent ID:', agentId);
      console.log('   User ID:', userId);
      
      // Official Sessions API call - exact from documentation
      const url = buildApiUrl('/api/messaging/sessions');
      const requestData = {
        agentId: agentId,
        userId: userId,
        metadata: {
          platform: 'web',
          username: 'user',
          interface: 'purl-chat-app'
        }
      };
      
      const response = await authenticatedPost(url, requestData);
      const sessionData = await handleApiResponse(response, 'Session creation');
      const newSessionId = sessionData.sessionId;
      
      console.log('✅ [Sessions API] Session created successfully:', newSessionId);
      console.log('📋 [Sessions API] Session data:', sessionData);
      
      setSessionId(newSessionId);
      setSessionInfo(sessionData);
      setConnected(true);
      
      // Start polling for messages
      startPolling(newSessionId);
      
      return newSessionId;
      
    } catch (err) {
      console.error('❌ [Sessions API] Failed to create session:', err);
      setError(err.message);
      setConnected(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [agentId, userId]);
  
  /**
   * Poll for new messages using Sessions API
   * Simple polling instead of WebSocket for reliability
   */
  const startPolling = useCallback((sessionId) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    
    console.log('🔄 [Sessions API] Starting message polling for session:', sessionId);
    
    // Poll every 10 seconds for EMERGENCY rate limit protection
    // EMERGENCY: Increased from 3s to 10s to prevent rate limiting
    pollingRef.current = setInterval(async () => {
      try {
        console.log('📊 [Sessions API] Polling for new messages...');
        const url = buildApiUrl(`/api/messaging/sessions/${sessionId}/messages`);
        const response = await authenticatedGet(url);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📨 [Sessions API] Polling response:', data);
          
          if (data.messages && Array.isArray(data.messages)) {
            // Process and update messages - only add agent messages from polling
            // User messages are already added immediately in sendMessage()
            setMessages(prev => {
              const existingIds = new Set(prev.map(m => m.id));
              const newAgentMessages = data.messages
                .filter(msg => !existingIds.has(msg.id))
                .filter(msg => {
                  // Only include agent messages from polling
                  const isFromAgent = msg.authorId === agentId || msg.senderId === agentId;
                  console.log('🔍 [Sessions API] Checking message:', { 
                    id: msg.id, 
                    authorId: msg.authorId, 
                    senderId: msg.senderId, 
                    agentId, 
                    isFromAgent 
                  });
                  return isFromAgent;
                })
                .map(msg => ({
                  id: msg.id,
                  content: msg.content || msg.text,
                  authorId: msg.authorId || msg.senderId,
                  isAgent: true,
                  createdAt: new Date(msg.createdAt),
                  metadata: msg.metadata || {}
                }));
              
              if (newAgentMessages.length > 0) {
                console.log(`🤖 [Sessions API] Found ${newAgentMessages.length} new agent messages via polling`);
                console.log('📄 [Sessions API] Agent messages:', newAgentMessages);
                console.log('💭 [Sessions API] Removing thinking indicator and adding agent responses');
                
                // Clear thinking timeout since we got a response
                if (thinkingTimeoutRef.current) {
                  clearTimeout(thinkingTimeoutRef.current);
                  thinkingTimeoutRef.current = null;
                }
                
                // Remove thinking indicator and add real agent responses
                const withoutThinking = prev.filter(msg => !msg.isThinking);
                const newState = [...withoutThinking, ...newAgentMessages];
                console.log('✅ [Sessions API] Messages updated, thinking indicator removed');
                return newState;
              }
              return prev;
            });
          }
        } else {
          console.error('❌ [Sessions API] Polling failed:', response.status, response.statusText);
        }
      } catch (err) {
        console.error('❌ [Sessions API] Polling error:', err);
      }
    }, 10000); // EMERGENCY: Changed from 3000ms to 10000ms for rate limit protection
  }, [agentId]);
  
  /**
   * Send a message using the Sessions API
   * Following official documentation pattern
   */
  const sendMessage = useCallback(async (content) => {
    if (!content?.trim()) {
      return null;
    }
    
    // Rate limiting - prevent spam and reduce server load
    const now = Date.now();
    const timeSinceLastMessage = now - lastMessageTime.current;
    const minInterval = 2000; // 2 seconds minimum between messages for scalability
    
    if (timeSinceLastMessage < minInterval) {
      const waitTime = Math.ceil((minInterval - timeSinceLastMessage) / 1000);
      setError(`Please wait ${waitTime} seconds before sending another message`);
      return null;
    }
    
    lastMessageTime.current = now;
    
    try {
      setLoading(true);
      setError(null);
      
      // Ensure we have a session
      const currentSessionId = sessionId || await startSession();
      if (!currentSessionId) {
        throw new Error('No active session available');
      }
      
      console.log('📤 [Sessions API] Sending message...');
      
      // Add user message immediately
      const userMessage = {
        id: Date.now() + Math.random(),
        content: content.trim(),
        authorId: userId,
        isAgent: false,
        createdAt: new Date(),
        metadata: {},
        status: 'sending'
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Add thinking indicator
      const thinkingMessage = {
        id: Date.now() + Math.random() + 0.1,
        content: 'Eliza is thinking...',
        authorId: agentId,
        isAgent: true,
        createdAt: new Date(),
        metadata: {
          typing: true
        },
        isThinking: true,
        status: 'thinking'
      };
      
      console.log('💭 [Sessions API] Adding thinking indicator:', thinkingMessage);
      setMessages(prev => {
        const newMessages = [...prev, thinkingMessage];
        console.log('💭 [Sessions API] Updated messages with thinking:', newMessages);
        return newMessages;
      });
      
      // Set a timeout to handle slow responses (30 seconds)
      if (thinkingTimeoutRef.current) {
        clearTimeout(thinkingTimeoutRef.current);
      }
      
      thinkingTimeoutRef.current = setTimeout(() => {
        console.log('⏰ [Sessions API] Thinking timeout reached, agent may be slow');
        setMessages(prev => {
          const hasThinking = prev.some(msg => msg.isThinking);
          if (hasThinking) {
            // Update thinking message to show it's taking longer
            return prev.map(msg => 
              msg.isThinking 
                ? { ...msg, content: 'Eliza is taking a bit longer...' }
                : msg
            );
          }
          return prev;
        });
      }, 30000);
      
      // Official Sessions API call - exact from documentation
      const messageResponse = await fetch(
        `${BASE_URL}/api/messaging/sessions/${currentSessionId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip, deflate, br', // OPTIMIZATION: Enable compression
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            content: content.trim(),
            metadata: {
              userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              timestamp: new Date().toISOString()
            }
          })
        }
      );
      
      if (!messageResponse.ok) {
        const errorData = await messageResponse.json().catch(() => ({ message: 'Unknown error' }));
        
        if (messageResponse.status === 404) {
          // Session not found - create a new one (from documentation)
          console.log('⚠️ [Sessions API] Session not found, creating new session...');
          await startSession();
          return null;
        }
        
        throw new Error(`Message sending failed: ${messageResponse.status} - ${errorData.message || 'Unknown error'}`);
      }
      
      const agentResponse = await messageResponse.json();
      
      console.log('✅ [Sessions API] Message sent successfully');
      console.log('📋 [Sessions API] Agent response:', agentResponse);
      
      // Update user message status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'delivered' }
            : msg
        )
      );
      
      // Check if we got an immediate response
      if (agentResponse.content) {
        // Check if this is actually from the agent or just echoing the user message
        const isFromAgent = (
          agentResponse.authorId === agentId || 
          agentResponse.senderId === agentId ||
          (agentResponse.authorId !== userId && agentResponse.senderId !== userId)
        );
        
        console.log('🔍 [Sessions API] Immediate response check:', {
          content: agentResponse.content,
          authorId: agentResponse.authorId,
          senderId: agentResponse.senderId,
          expectedAgentId: agentId,
          userId: userId,
          isFromAgent: isFromAgent
        });
        
        if (isFromAgent) {
          console.log('📝 [Sessions API] Adding immediate agent response');
          
          // Clear thinking timeout since we got an immediate response
          if (thinkingTimeoutRef.current) {
            clearTimeout(thinkingTimeoutRef.current);
            thinkingTimeoutRef.current = null;
          }
          
          const immediateAgentMessage = {
            id: agentResponse.id || (Date.now() + Math.random()),
            content: agentResponse.content,
            authorId: agentResponse.authorId || agentId,
            isAgent: true,
            createdAt: new Date(agentResponse.createdAt || Date.now()),
            metadata: {
              thought: agentResponse.metadata?.thought,
              actions: agentResponse.metadata?.actions,
              direct: true
            }
          };
          
          // Remove thinking indicators and add the response
          setMessages(prev => {
            const withoutThinking = prev.filter(msg => !msg.isThinking);
            return [...withoutThinking, immediateAgentMessage];
          });
        } else {
          // This is likely a user message echo, ignore it but KEEP thinking indicator
          console.log('📝 [Sessions API] Received user message echo in immediate response, ignoring but keeping thinking indicator');
          // Don't remove thinking indicator here - wait for real agent response via polling
        }
      }
      
      return agentResponse;
      
    } catch (err) {
      console.error('❌ [Sessions API] Failed to send message:', err);
      setError(err.message);
      
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
  }, [sessionId, agentId, userId, startSession]);
  
  /**
   * Get message history from the session
   * Following documentation pattern
   */
  const getMessages = useCallback(async (options = {}) => {
    if (!sessionId) {
      console.warn('[Sessions API] No session ID available for message retrieval');
      return { messages: [], hasMore: false };
    }
    
    try {
      console.log('📥 [Sessions API] Retrieving message history...');
      
      const queryParams = new URLSearchParams();
      if (options.limit) queryParams.append('limit', options.limit.toString());
      if (options.before) queryParams.append('before', options.before);
      if (options.after) queryParams.append('after', options.after);
      
      const response = await fetch(
        `${BASE_URL}/api/messaging/sessions/${sessionId}/messages?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Accept-Encoding': 'gzip, deflate, br', // OPTIMIZATION: Enable compression
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to retrieve messages: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ [Sessions API] Message history retrieved:', data);
      
      return data;
      
    } catch (err) {
      console.error('❌ [Sessions API] Failed to retrieve messages:', err);
      return { messages: [], hasMore: false };
    }
  }, [sessionId]);
  
  /**
   * End the current session
   * Following documentation pattern
   */
  const endSession = useCallback(async () => {
    if (!sessionId) {
      return;
    }
    
    try {
      console.log('🔚 [Sessions API] Ending session...');
      
      await fetch(
        `${BASE_URL}/api/messaging/sessions/${sessionId}`,
        {
          method: 'DELETE',
          headers: {
            'Accept-Encoding': 'gzip, deflate, br' // OPTIMIZATION: Enable compression
          }
        }
      );
      
      console.log('✅ [Sessions API] Session ended successfully');
      
    } catch (err) {
      console.error('❌ [Sessions API] Failed to end session:', err);
    } finally {
      // Clean up local state
      setSessionId(null);
      setSessionInfo(null);
      setConnected(false);
      setMessages([]);
      setError(null);
      
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
  }, [sessionId]);
  
  /**
   * Add a system message for UI feedback
   */
  const addSystemMessage = useCallback((content, type = 'info') => {
    const systemMessage = {
      id: Date.now() + Math.random(),
      content,
      authorId: 'system',
      isAgent: false,
      createdAt: new Date(),
      metadata: { systemType: type },
      isSystem: true
    };
    
    setMessages(prev => [...prev, systemMessage]);
  }, []);
  
  /**
   * Clear messages (for UI)
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);
  
  // Auto-start session on mount if we have required params
  useEffect(() => {
    if (agentId && userId && !sessionId && !loading && !connected) {
      console.log('🚀 [Sessions API] Auto-starting session...');
      startSession();
    }
  }, [agentId, userId, sessionId, loading, connected, startSession]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (thinkingTimeoutRef.current) {
        clearTimeout(thinkingTimeoutRef.current);
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
    error,
    
    // Actions
    startSession,
    sendMessage,
    getMessages,
    endSession,
    addSystemMessage,
    clearMessages
  };
}

export default useElizaSession;
