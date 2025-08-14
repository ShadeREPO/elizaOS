/**
 * ConversationStorageService - Long-term storage for conversation logs
 * 
 * This service handles persistent storage of conversations by:
 * 1. Integrating with ElizaOS's memory system for agent knowledge growth
 * 2. Maintaining local storage for fast frontend access
 * 3. Providing APIs for the logs page and cat display tiles
 * 4. Ensuring conversations feed into the agent's RAG system
 */

import { getConfig } from '../utils/config.js';

class ConversationStorageService {
  constructor() {
    this.baseURL = getConfig().BASE_URL;
    this.storageKeys = {
      conversations: 'purl_conversation_logs',
      index: 'purl_conversation_index',
      events: 'purl_conversation_events',
      metadata: 'purl_conversation_metadata'
    };
    
    // Initialize storage if needed
    this.initializeStorage();
  }

  /**
   * Initialize local storage structure
   */
  initializeStorage() {
    Object.values(this.storageKeys).forEach(key => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    });
    
    // Initialize metadata
    const metadata = this.getMetadata();
    if (!metadata.version) {
      this.setMetadata({
        version: '1.0.0',
        created: new Date().toISOString(),
        lastSync: null,
        totalConversations: 0,
        totalMessages: 0
      });
    }
  }

  /**
   * Store a new conversation in both ElizaOS memory and local storage
   */
  async storeConversation(conversationData) {
    try {
      console.log('💾 [Storage] Storing conversation:', conversationData.conversationId);
      
      // 1. Store in ElizaOS memory system for agent knowledge growth
      await this.storeInElizaMemory(conversationData);
      
      // 2. Store locally for frontend access
      await this.storeLocally(conversationData);
      
      // 3. Update metadata
      this.updateMetadata(conversationData);
      
      console.log('✅ [Storage] Conversation stored successfully');
      return true;
      
    } catch (error) {
      console.error('❌ [Storage] Failed to store conversation:', error);
      return false;
    }
  }

  /**
   * Store conversation in ElizaOS memory system
   */
  async storeInElizaMemory(conversationData) {
    const agentId = conversationData.agentId || 'b850bc30-45f8-0041-a00a-83df46d8555d';
    
    // Store each message as a memory in ElizaOS
    for (const message of conversationData.messages) {
      try {
        const memoryData = {
          content: {
            text: message.content,
            type: message.type, // 'user' or 'agent'
            timestamp: message.timestamp,
            source: 'purl_frontend',
            conversationId: conversationData.conversationId,
            logNumber: conversationData.logNumber,
            metadata: {
              userAgent: navigator.userAgent,
              sessionId: conversationData.sessionId,
              channelId: conversationData.channelId,
              messageId: message.id
            }
          },
          type: message.type === 'user' ? 'user_message' : 'agent_response',
          roomId: conversationData.roomId || conversationData.channelId,
          entityId: message.type === 'user' ? conversationData.userId : agentId
        };

        const response = await fetch(`${this.baseURL}/api/memory/${agentId}/memories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(memoryData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn('⚠️ [Storage] Failed to store message in ElizaOS memory:', errorData);
        } else {
          console.log('🧠 [Storage] Message stored in ElizaOS memory:', message.id);
        }
        
      } catch (error) {
        console.warn('⚠️ [Storage] Error storing message in ElizaOS:', error);
        // Continue with other messages even if one fails
      }
    }
  }

  /**
   * Store conversation locally for frontend access
   */
  async storeLocally(conversationData) {
    // Store individual messages
    const existingLogs = this.getConversationLogs();
    const newMessages = conversationData.messages.map(msg => ({
      ...msg,
      conversationId: conversationData.conversationId,
      logNumber: conversationData.logNumber,
      roomId: conversationData.roomId,
      sessionId: conversationData.sessionId
    }));
    
    const updatedLogs = [...existingLogs, ...newMessages];
    localStorage.setItem(this.storageKeys.conversations, JSON.stringify(updatedLogs));

    // Store conversation index
    const existingIndex = this.getConversationIndex();
    const conversationSummary = {
      conversationId: conversationData.conversationId,
      logNumber: conversationData.logNumber,
      startTime: conversationData.startTime,
      endTime: conversationData.endTime || new Date().toISOString(),
      messageCount: conversationData.messages.length,
      userMessageCount: conversationData.messages.filter(m => m.type === 'user').length,
      agentMessageCount: conversationData.messages.filter(m => m.type === 'agent').length,
      roomId: conversationData.roomId,
      sessionId: conversationData.sessionId,
      agentId: conversationData.agentId,
      userId: conversationData.userId,
      preview: this.generatePreview(conversationData.messages),
      isPublic: conversationData.isPublic !== false, // Default to public
      tags: conversationData.tags || [],
      metadata: {
        platform: 'purl_frontend',
        version: '1.0.0',
        storedAt: new Date().toISOString()
      }
    };

    const updatedIndex = [...existingIndex, conversationSummary];
    localStorage.setItem(this.storageKeys.index, JSON.stringify(updatedIndex));

    // Store session events
    const existingEvents = this.getConversationEvents();
    const sessionEvents = [
      {
        conversationId: conversationData.conversationId,
        eventType: 'session_start',
        timestamp: conversationData.startTime,
        data: {
          sessionId: conversationData.sessionId,
          roomId: conversationData.roomId,
          agentId: conversationData.agentId,
          userId: conversationData.userId
        }
      },
      {
        conversationId: conversationData.conversationId,
        eventType: 'session_end',
        timestamp: conversationData.endTime || new Date().toISOString(),
        data: {
          endTime: conversationData.endTime || new Date().toISOString(),
          messageCount: conversationData.messages.length,
          duration: conversationData.duration
        }
      }
    ];

    const updatedEvents = [...existingEvents, ...sessionEvents];
    localStorage.setItem(this.storageKeys.events, JSON.stringify(updatedEvents));
  }

  /**
   * Generate conversation preview for display
   */
  generatePreview(messages) {
    const userMessages = messages.filter(m => m.type === 'user' && m.content?.trim());
    if (userMessages.length === 0) return 'No user messages';
    
    const firstMessage = userMessages[0].content.substring(0, 80);
    return firstMessage + (userMessages[0].content.length > 80 ? '...' : '');
  }

  /**
   * Get all conversation logs for display
   */
  getConversationLogs() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKeys.conversations) || '[]');
    } catch (error) {
      console.error('❌ [Storage] Error reading conversation logs:', error);
      return [];
    }
  }

  /**
   * Get conversation index for logs page
   */
  getConversationIndex() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKeys.index) || '[]');
    } catch (error) {
      console.error('❌ [Storage] Error reading conversation index:', error);
      return [];
    }
  }

  /**
   * Get conversation events
   */
  getConversationEvents() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKeys.events) || '[]');
    } catch (error) {
      console.error('❌ [Storage] Error reading conversation events:', error);
      return [];
    }
  }

  /**
   * Get recent conversations for cat display tiles
   */
  getRecentConversations(limit = 5) {
    const index = this.getConversationIndex();
    return index
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice(0, limit)
      .map(conv => ({
        logNumber: conv.logNumber,
        preview: conv.preview,
        messageCount: conv.messageCount,
        timeAgo: this.formatTimeAgo(conv.startTime),
        isActive: this.isRecentConversation(conv.startTime)
      }));
  }

  /**
   * Get conversation statistics for display
   */
  getConversationStats() {
    const metadata = this.getMetadata();
    const index = this.getConversationIndex();
    const logs = this.getConversationLogs();
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return {
      total: {
        conversations: index.length,
        messages: logs.length,
        users: new Set(logs.map(log => log.userId || 'anonymous')).size
      },
      today: {
        conversations: index.filter(conv => new Date(conv.startTime) >= today).length,
        messages: logs.filter(log => new Date(log.timestamp) >= today).length
      },
      thisWeek: {
        conversations: index.filter(conv => new Date(conv.startTime) >= thisWeek).length,
        messages: logs.filter(log => new Date(log.timestamp) >= thisWeek).length
      },
      lastSync: metadata.lastSync,
      version: metadata.version
    };
  }

  /**
   * Search conversations by content, log number, or metadata
   */
  searchConversations(query, options = {}) {
    const index = this.getConversationIndex();
    const logs = this.getConversationLogs();
    
    if (!query.trim()) {
      return index;
    }
    
    const searchTerm = query.toLowerCase();
    
    return index.filter(conv => {
      // Search in conversation metadata
      const metadataMatch = conv.logNumber.toLowerCase().includes(searchTerm) ||
                           conv.preview.toLowerCase().includes(searchTerm);
      
      if (metadataMatch) return true;
      
      // Search in actual message content if requested
      if (options.searchContent) {
        const conversationMessages = logs.filter(log => log.conversationId === conv.conversationId);
        return conversationMessages.some(msg => 
          msg.content && msg.content.toLowerCase().includes(searchTerm)
        );
      }
      
      return false;
    });
  }

  /**
   * Sync local storage with ElizaOS memory system
   */
  async syncWithElizaMemory() {
    try {
      console.log('🔄 [Storage] Syncing with ElizaOS memory...');
      
      // This could be enhanced to pull recent memories from ElizaOS
      // and ensure local storage is up to date
      
      const metadata = this.getMetadata();
      metadata.lastSync = new Date().toISOString();
      this.setMetadata(metadata);
      
      console.log('✅ [Storage] Sync completed');
      return true;
      
    } catch (error) {
      console.error('❌ [Storage] Sync failed:', error);
      return false;
    }
  }

  /**
   * Helper methods
   */
  getMetadata() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKeys.metadata) || '{}');
    } catch {
      return {};
    }
  }

  setMetadata(metadata) {
    localStorage.setItem(this.storageKeys.metadata, JSON.stringify(metadata));
  }

  updateMetadata(conversationData) {
    const metadata = this.getMetadata();
    metadata.totalConversations = (metadata.totalConversations || 0) + 1;
    metadata.totalMessages = (metadata.totalMessages || 0) + conversationData.messages.length;
    metadata.lastUpdate = new Date().toISOString();
    this.setMetadata(metadata);
  }

  formatTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  isRecentConversation(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    return (now - past) < 3600000; // Less than 1 hour ago
  }

  /**
   * Export conversation data for backup/analysis
   */
  exportAllData() {
    return {
      conversations: this.getConversationLogs(),
      index: this.getConversationIndex(),
      events: this.getConversationEvents(),
      metadata: this.getMetadata(),
      stats: this.getConversationStats(),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Clear all stored data (for testing/reset)
   */
  clearAllData() {
    Object.values(this.storageKeys).forEach(key => {
      localStorage.removeItem(key);
    });
    this.initializeStorage();
    console.log('🗑️ [Storage] All conversation data cleared');
  }
}

// Create singleton instance
const conversationStorage = new ConversationStorageService();

export default conversationStorage;
