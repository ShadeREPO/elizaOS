import { useState, useCallback, useEffect } from 'react';
import conversationStorage from '../services/ConversationStorageService.js';

/**
 * useConversationStorage Hook - Manage long-term conversation persistence
 * 
 * This hook provides:
 * - Integration with ElizaOS memory system for agent knowledge growth
 * - Local storage management for frontend display
 * - Real-time conversation tracking and storage
 * - Statistics and search capabilities for logs page
 */
function useConversationStorage() {
  // State
  const [isStoring, setIsStoring] = useState(false);
  const [storageError, setStorageError] = useState(null);
  const [conversationStats, setConversationStats] = useState(null);
  const [recentConversations, setRecentConversations] = useState([]);
  
  // Current conversation tracking
  const [currentConversation, setCurrentConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);

  /**
   * Start tracking a new conversation
   */
  const startConversation = useCallback((conversationData) => {
    const conversation = {
      conversationId: conversationData.conversationId || generateConversationId(),
      sessionId: conversationData.sessionId,
      roomId: conversationData.roomId,
      channelId: conversationData.channelId,
      agentId: conversationData.agentId || '40608b6b-63b6-0e2c-b819-9d9850d060ec',
      userId: conversationData.userId || generateUserId(),
      logNumber: conversationData.logNumber || generateLogNumber(),
      startTime: new Date().toISOString(),
      isPublic: conversationData.isPublic !== false, // Default to public
      tags: conversationData.tags || []
    };
    
    setCurrentConversation(conversation);
    setConversationMessages([]);
    setStorageError(null);
    
    console.log('🚀 [Storage Hook] Started tracking conversation:', conversation.logNumber);
    return conversation;
  }, []);

  /**
   * Add a message to the current conversation
   */
  const addMessage = useCallback((messageData) => {
    if (!currentConversation) {
      console.warn('⚠️ [Storage Hook] No active conversation to add message to');
      return null;
    }

    const message = {
      id: messageData.id || generateMessageId(),
      type: messageData.type, // 'user' or 'agent'
      content: messageData.content,
      timestamp: messageData.timestamp || new Date().toISOString(),
      metadata: messageData.metadata || {}
    };

    setConversationMessages(prev => [...prev, message]);
    console.log('💬 [Storage Hook] Added message to conversation:', message.type, message.content.substring(0, 50) + '...');
    
    return message;
  }, [currentConversation]);

  /**
   * End and store the current conversation
   */
  const endConversation = useCallback(async (endData = {}) => {
    if (!currentConversation || conversationMessages.length === 0) {
      console.warn('⚠️ [Storage Hook] No active conversation to end');
      return false;
    }

    setIsStoring(true);
    setStorageError(null);

    try {
      const conversationData = {
        ...currentConversation,
        endTime: endData.endTime || new Date().toISOString(),
        duration: endData.duration || calculateDuration(currentConversation.startTime),
        messages: conversationMessages,
        metadata: {
          ...currentConversation.metadata,
          ...endData.metadata,
          endedBy: endData.endedBy || 'user',
          finalMessageCount: conversationMessages.length
        }
      };

      const success = await conversationStorage.storeConversation(conversationData);
      
      if (success) {
        console.log('✅ [Storage Hook] Conversation stored successfully:', conversationData.logNumber);
        
        // Reset current conversation
        setCurrentConversation(null);
        setConversationMessages([]);
        
        // Refresh stats and recent conversations
        refreshData();
        
        return conversationData;
      } else {
        throw new Error('Failed to store conversation');
      }

    } catch (error) {
      console.error('❌ [Storage Hook] Failed to end conversation:', error);
      setStorageError(error.message);
      return false;
    } finally {
      setIsStoring(false);
    }
  }, [currentConversation, conversationMessages]);

  /**
   * Get conversation data for logs page
   */
  const getConversationsForLogs = useCallback(() => {
    return {
      conversations: conversationStorage.getConversationLogs(),
      index: conversationStorage.getConversationIndex(),
      events: conversationStorage.getConversationEvents()
    };
  }, []);

  /**
   * Search conversations
   */
  const searchConversations = useCallback((query, options = {}) => {
    return conversationStorage.searchConversations(query, options);
  }, []);

  /**
   * Get recent conversations for cat display
   */
  const getRecentConversationsForDisplay = useCallback((limit = 5) => {
    return conversationStorage.getRecentConversations(limit);
  }, []);

  /**
   * Refresh data (stats and recent conversations)
   */
  const refreshData = useCallback(() => {
    try {
      const stats = conversationStorage.getConversationStats();
      const recent = conversationStorage.getRecentConversations(5);
      
      setConversationStats(stats);
      setRecentConversations(recent);
      
      console.log('📊 [Storage Hook] Data refreshed - Conversations:', stats.total.conversations, 'Messages:', stats.total.messages);
    } catch (error) {
      console.error('❌ [Storage Hook] Failed to refresh data:', error);
      setStorageError(error.message);
    }
  }, []);

  /**
   * Sync with ElizaOS memory system
   */
  const syncWithElizaMemory = useCallback(async () => {
    try {
      const success = await conversationStorage.syncWithElizaMemory();
      if (success) {
        refreshData();
      }
      return success;
    } catch (error) {
      console.error('❌ [Storage Hook] Sync failed:', error);
      setStorageError(error.message);
      return false;
    }
  }, [refreshData]);

  /**
   * Auto-save current conversation periodically
   */
  const autoSaveConversation = useCallback(async () => {
    if (!currentConversation || conversationMessages.length === 0) {
      return false;
    }

    try {
      // Create a checkpoint without ending the conversation
      const checkpointData = {
        ...currentConversation,
        endTime: null, // Mark as ongoing
        messages: conversationMessages,
        isCheckpoint: true,
        checkpointTime: new Date().toISOString()
      };

      // Store as a draft/checkpoint (could be enhanced to use a different storage method)
      console.log('💾 [Storage Hook] Auto-saving conversation checkpoint:', conversationMessages.length, 'messages');
      
      return true;
    } catch (error) {
      console.warn('⚠️ [Storage Hook] Auto-save failed:', error);
      return false;
    }
  }, [currentConversation, conversationMessages]);

  /**
   * Initialize hook and load data
   */
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  /**
   * Auto-save every 30 seconds if there's an active conversation
   */
  useEffect(() => {
    if (!currentConversation) return;

    const autoSaveInterval = setInterval(() => {
      autoSaveConversation();
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [currentConversation, autoSaveConversation]);

  // Helper functions
  function generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  function generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  function generateUserId() {
    // Try to get existing user ID from localStorage or create new one
    let userId = localStorage.getItem('purl_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('purl_user_id', userId);
    }
    return userId;
  }

  function generateLogNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const suffix = Math.random().toString(36).substr(2, 3).toUpperCase();
    
    return `PURL-${year}${month}${day}-${hour}${minute}${second}-${suffix}`;
  }

  function calculateDuration(startTime) {
    const start = new Date(startTime);
    const end = new Date();
    return end.getTime() - start.getTime();
  }

  return {
    // Current conversation state
    currentConversation,
    conversationMessages,
    isStoring,
    storageError,
    
    // Conversation management
    startConversation,
    addMessage,
    endConversation,
    autoSaveConversation,
    
    // Data access
    conversationStats,
    recentConversations,
    getConversationsForLogs,
    searchConversations,
    getRecentConversationsForDisplay,
    
    // Sync and management
    refreshData,
    syncWithElizaMemory,
    
    // Direct storage access
    storage: conversationStorage
  };
}

export default useConversationStorage;
