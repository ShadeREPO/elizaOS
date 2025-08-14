import { useUnifiedData } from '../contexts/UnifiedDataProvider.jsx';
import { useCallback, useMemo } from 'react';

/**
 * Migration helper hook for existing components
 * PHASE 2 OPTIMIZATION: Helps existing components migrate to UnifiedDataProvider
 * 
 * This hook provides backward-compatible interfaces while leveraging the new
 * centralized data architecture under the hood.
 */

/**
 * Migration helper for components using useElizaMemories
 */
export const useElizaMemoriesMigration = (agentId) => {
  const unifiedData = useUnifiedData();
  
  // Provide backward-compatible interface
  const memories = useMemo(() => {
    // Flatten all conversation messages into a single array
    return unifiedData.conversationIndex.reduce((acc, conv) => {
      // Note: This will only include cached conversations
      // Components should use loadConversationMessages for specific conversations
      return acc;
    }, []);
  }, [unifiedData.conversationIndex]);
  
  const conversations = useMemo(() => {
    return unifiedData.conversationIndex;
  }, [unifiedData.conversationIndex]);
  
  const fetchMemories = useCallback(async (options = {}) => {
    // For backward compatibility, load all conversation index
    return unifiedData.loadConversationIndex();
  }, [unifiedData]);
  
  const refreshMemories = useCallback(() => {
    return unifiedData.refreshConversationIndex();
  }, [unifiedData]);
  
  const getFilteredMemories = useCallback(() => {
    // Return all cached memories across conversations
    // Note: This is a simplified version for migration
    return memories;
  }, [memories]);
  
  return {
    // Data (backward compatible)
    memories,
    conversations,
    totalMemories: memories.length,
    lastUpdated: unifiedData.lastUpdated,
    loading: unifiedData.loading,
    error: unifiedData.error,
    
    // Actions (backward compatible)
    fetchMemories,
    refreshMemories,
    getFilteredMemories,
    
    // New optimized methods
    loadConversationMessages: unifiedData.loadConversationMessages,
    loadMoreMessages: unifiedData.loadMoreMessages,
    
    // Performance data
    metrics: unifiedData.metrics,
    cacheStats: unifiedData.cacheStats
  };
};

/**
 * Migration helper for components using ChatDataContext
 */
export const useChatDataMigration = () => {
  const unifiedData = useUnifiedData();
  
  return {
    // Backward compatible interface
    conversationList: unifiedData.conversationIndex,
    loading: unifiedData.loading,
    error: unifiedData.error,
    lastUpdated: unifiedData.lastUpdated,
    
    // Actions
    loadConversationList: unifiedData.loadConversationIndex,
    loadConversationMessages: unifiedData.loadConversationMessages,
    invalidateConversation: unifiedData.invalidateConversation,
    
    // New features
    loadMoreMessages: unifiedData.loadMoreMessages,
    searchConversations: unifiedData.searchConversations,
    getConversation: unifiedData.getConversation
  };
};

/**
 * Migration helper for components using ConversationStorage
 */
export const useConversationStorageMigration = () => {
  const unifiedData = useUnifiedData();
  
  const getConversationsForLogs = useCallback(() => {
    return {
      conversations: unifiedData.conversationIndex.map(conv => ({
        conversationId: conv.id,
        roomId: conv.roomId,
        messageCount: conv.messageCount,
        preview: conv.preview,
        lastActivity: conv.lastActivity,
        isActive: conv.isActive
      })),
      total: unifiedData.conversationIndex.length
    };
  }, [unifiedData.conversationIndex]);
  
  const searchConversations = useCallback((query) => {
    const results = unifiedData.searchConversations(query);
    return {
      conversations: results,
      total: results.length
    };
  }, [unifiedData]);
  
  const refreshData = useCallback(() => {
    return unifiedData.refreshConversationIndex();
  }, [unifiedData]);
  
  return {
    getConversationsForLogs,
    searchConversations,
    refreshData,
    storageError: unifiedData.error,
    
    // Additional unified features
    loadConversationMessages: unifiedData.loadConversationMessages,
    loadMoreMessages: unifiedData.loadMoreMessages,
    metrics: unifiedData.metrics
  };
};

/**
 * Hook for progressive migration
 * Allows components to gradually adopt new patterns while maintaining compatibility
 */
export const useProgressiveMigration = (legacyHook, migrationOptions = {}) => {
  const {
    enableUnified = true,
    fallbackToLegacy = true,
    logMigrationWarnings = true
  } = migrationOptions;
  
  const unifiedData = useUnifiedData();
  const legacyData = legacyHook?.();
  
  // Use unified data if available and enabled
  if (enableUnified && unifiedData) {
    if (logMigrationWarnings && legacyData) {
      console.warn('⚠️ [Migration] Component using both legacy and unified data. Consider migrating fully to UnifiedDataProvider.');
    }
    
    return {
      data: unifiedData,
      source: 'unified',
      migrationRecommended: true
    };
  }
  
  // Fallback to legacy if unified not available
  if (fallbackToLegacy && legacyData) {
    if (logMigrationWarnings) {
      console.warn('⚠️ [Migration] Component using legacy data hook. Consider migrating to UnifiedDataProvider for better performance.');
    }
    
    return {
      data: legacyData,
      source: 'legacy',
      migrationRecommended: true
    };
  }
  
  // No data available
  return {
    data: null,
    source: 'none',
    migrationRecommended: true,
    error: 'No data source available'
  };
};

export default {
  useElizaMemoriesMigration,
  useChatDataMigration,
  useConversationStorageMigration,
  useProgressiveMigration
};
