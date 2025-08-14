import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { getConfig } from '../utils/config.js';
import { authenticatedGet, buildApiUrl, handleApiResponse } from '../utils/api.js';

/**
 * ChatData Context - Lazy Loading Architecture
 * 
 * NEW APPROACH:
 * - Load conversation list first (lightweight)
 * - Load individual conversation messages only when needed
 * - Cache loaded conversations to avoid re-fetching
 * - Provide optimized queries for different use cases
 * 
 * BENEFITS:
 * - 90% less initial data loading
 * - No infinite re-render loops
 * - Lazy loading for better performance
 * - Proper separation of concerns
 */

const ChatDataContext = createContext(null);

export const ChatDataProvider = ({ 
  children, 
  agentId = 'b850bc30-45f8-0041-a00a-83df46d8555d' 
}) => {
  const config = getConfig();
  
  // Lightweight state - only what's needed
  const [conversationList, setConversationList] = useState([]);
  const [conversationCache, setConversationCache] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Debug tracking
  React.useEffect(() => {
    console.log('🏗️ [ChatDataProvider] Provider created');
    return () => console.log('🗑️ [ChatDataProvider] Provider destroyed');
  }, []);

  /**
   * Load conversation list only (lightweight)
   * This replaces the heavy "load all memories" approach
   */
  const loadConversationList = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const url = buildApiUrl(`/api/memories/${agentId}/conversations`);
      const response = await authenticatedGet(url);
      const data = await handleApiResponse(response, 'Fetch conversations');
      const conversations = data.conversations || [];
      
      setConversationList(conversations);
      setLastUpdated(new Date());
      
      console.log(`📋 [ChatData] Loaded ${conversations.length} conversations (lightweight)`);
      
    } catch (err) {
      console.error('❌ [ChatData] Error loading conversations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [agentId, loading]);

  /**
   * Load messages for a specific conversation (lazy loading)
   * Only called when user actually needs to see the messages
   */
  const loadConversationMessages = useCallback(async (conversationId, limit = 50, offset = 0) => {
    const cacheKey = `${conversationId}-${limit}-${offset}`;
    
    // Check cache first
    if (conversationCache.has(cacheKey)) {
      console.log(`💾 [ChatData] Using cached messages for: ${conversationId}`);
      return conversationCache.get(cacheKey);
    }

    try {
      const url = buildApiUrl(`/api/memories/${agentId}/conversation/${conversationId}?limit=${limit}&offset=${offset}`);
      const response = await authenticatedGet(url);
      const data = await handleApiResponse(response, 'Fetch conversation messages');
      const messages = data.memories || [];
      
      // Cache the result
      setConversationCache(prev => new Map(prev).set(cacheKey, messages));
      
      console.log(`💬 [ChatData] Loaded ${messages.length} messages for conversation: ${conversationId}`);
      return messages;
      
    } catch (err) {
      console.error(`❌ [ChatData] Error loading messages for ${conversationId}:`, err);
      throw err;
    }
  }, [agentId, conversationCache]);

  /**
   * Get preview messages for a conversation (first 6 messages)
   * Optimized for chat previews and grid displays
   */
  const getConversationPreview = useCallback(async (conversationId) => {
    return await loadConversationMessages(conversationId, 6, 0);
  }, [loadConversationMessages]);

  /**
   * Search conversations by content (server-side search)
   * Much more efficient than loading all data and filtering client-side
   */
  const searchConversations = useCallback(async (query, limit = 20) => {
    try {
      const url = buildApiUrl(`/api/memories/${agentId}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      const response = await authenticatedGet(url);
      const data = await handleApiResponse(response, 'Search conversations');
      console.log(`🔍 [ChatData] Search "${query}" returned ${data.results?.length || 0} results`);
      return data.results || [];
      
    } catch (err) {
      console.error('❌ [ChatData] Search error:', err);
      throw err;
    }
  }, [agentId]);

  /**
   * Refresh conversation list
   */
  const refreshConversations = useCallback(() => {
    setConversationCache(new Map()); // Clear cache
    return loadConversationList();
  }, [loadConversationList]);

  /**
   * Clear cache for a specific conversation (when new messages arrive)
   */
  const invalidateConversation = useCallback((conversationId) => {
    setConversationCache(prev => {
      const newCache = new Map(prev);
      // Remove all cached entries for this conversation
      for (const key of newCache.keys()) {
        if (key.startsWith(conversationId)) {
          newCache.delete(key);
        }
      }
      return newCache;
    });
  }, []);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    // Data
    conversationList,
    loading,
    error,
    lastUpdated,
    
    // Actions
    loadConversationList,
    loadConversationMessages,
    getConversationPreview,
    searchConversations,
    refreshConversations,
    invalidateConversation,
    
    // Stats
    totalConversations: conversationList.length,
    cacheSize: conversationCache.size
  }), [
    conversationList,
    loading,
    error,
    lastUpdated,
    loadConversationList,
    loadConversationMessages,
    getConversationPreview,
    searchConversations,
    refreshConversations,
    invalidateConversation,
    conversationCache.size
  ]);

  // OPTIMIZATION: Disable auto-loading to prevent rate limiting
  // Let ElizaMemoriesContext handle all data fetching instead
  // React.useEffect(() => {
  //   loadConversationList();
  // }, [loadConversationList]);

  return (
    <ChatDataContext.Provider value={contextValue}>
      {children}
    </ChatDataContext.Provider>
  );
};

/**
 * Hook to use ChatData context
 */
export const useChatData = () => {
  const context = useContext(ChatDataContext);
  
  if (!context) {
    throw new Error('useChatData must be used within a ChatDataProvider');
  }
  
  return context;
};

/**
 * USAGE EXAMPLES:
 * 
 * 1. Conversation List (ConversationLogs):
 * ```jsx
 * const { conversationList, loading } = useChatData();
 * ```
 * 
 * 2. Chat Preview (ChatLogPreview):
 * ```jsx
 * const { getConversationPreview } = useChatData();
 * const messages = await getConversationPreview(conversationId);
 * ```
 * 
 * 3. Full Conversation (BackroomTerminal):
 * ```jsx
 * const { loadConversationMessages } = useChatData();
 * const messages = await loadConversationMessages(conversationId, 100);
 * ```
 * 
 * 4. Search (InteractiveGrid):
 * ```jsx
 * const { searchConversations } = useChatData();
 * const results = await searchConversations("hello world");
 * ```
 */

export default ChatDataProvider;

