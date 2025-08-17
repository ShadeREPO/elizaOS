import { useState, useEffect, useCallback } from 'react';
import { useChatData } from '../contexts/ChatDataContext.jsx';

/**
 * Terminal Messages Hook - Lazy Loading for BackroomTerminal
 * 
 * Provides terminal-specific functionality:
 * - Load messages for selected conversation only
 * - Real-time polling for active conversation
 * - Terminal-specific formatting and filtering
 * - Efficient memory management
 */
export const useTerminalMessages = (selectedConversationId) => {
  const { loadConversationMessages, invalidateConversation } = useChatData();
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  /**
   * Load messages for the selected conversation
   */
  const loadMessages = useCallback(async (conversationId, limit = 100) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const conversationMessages = await loadConversationMessages(conversationId, limit);
      
      // Format messages for terminal display
      const formattedMessages = conversationMessages.map((msg, index) => ({
        ...msg,
        logNumber: `LOG_${String(index + 1).padStart(4, '0')}`,
        terminalLine: formatAsTerminalLine(msg),
        timestamp: new Date(msg.timestamp)
      }));

      setMessages(formattedMessages);
      console.log(`🖥️ [Terminal] Loaded ${formattedMessages.length} messages for conversation: ${conversationId}`);
      
    } catch (err) {
      console.error('❌ [Terminal] Error loading messages:', err);
      setError(err.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [loadConversationMessages]);

  /**
   * Format message for terminal display
   */
  const formatAsTerminalLine = (memory) => {
    const timestamp = new Date(memory.timestamp).toLocaleTimeString();
    const type = memory.type === 'user' ? 'USER' : 'AGENT';
    const content = memory.content || '';
    
    return `[${timestamp}] ${type}: ${content}`;
  };

  /**
   * Refresh messages for current conversation
   */
  const refreshMessages = useCallback(() => {
    if (selectedConversationId) {
      invalidateConversation(selectedConversationId);
      loadMessages(selectedConversationId);
    }
  }, [selectedConversationId, invalidateConversation, loadMessages]);

  /**
   * Toggle real-time updates
   */
  const toggleRealTime = useCallback(() => {
    setRealTimeEnabled(prev => !prev);
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    loadMessages(selectedConversationId);
  }, [selectedConversationId, loadMessages]);

  // Real-time polling (only for selected conversation)
  useEffect(() => {
    if (!realTimeEnabled || !selectedConversationId) return;

    const interval = setInterval(() => {
      refreshMessages();
    }, 30000); // Poll every 30 seconds for active conversation only

    return () => clearInterval(interval);
  }, [realTimeEnabled, selectedConversationId, refreshMessages]);

  return {
    messages,
    loading,
    error,
    realTimeEnabled,
    refreshMessages,
    toggleRealTime,
    totalMessages: messages.length
  };
};

export default useTerminalMessages;




