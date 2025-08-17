import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { getConfig } from '../utils/config.js';

/**
 * Debounce utility for preventing rapid successive API calls
 */
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * ElizaOS Memories Hook - Fetch and manage agent memories for public viewing
 * 
 * This hook interfaces with the ElizaOS Memory API to fetch agent memories/conversations
 * for creating a "backroom terminal" public chat log experience.
 * 
 * Features:
 * - Fetch all agent memories from ElizaOS API
 * - Filter by channel, room, or time period
 * - Real-time updates when new memories are created
 * - Format memories for public terminal display
 * - Privacy controls and content filtering
 */

function useElizaMemories(agentId) {
  // Debug: Track hook instances
  React.useEffect(() => {
    // Hook instance created
    return () => {
      // Hook instance destroyed
      // OPTIMIZATION: Clean up cache on unmount to prevent memory leaks
      setRequestCache(new Map());
      setMemories([]);
      setConversations([]);
    };
  }, [agentId]);

  // Get configuration for rate limiting and scalability
  const config = getConfig();
  
  // EMERGENCY: Rate limit protection - disable polling if rate limited
  const [rateLimitProtection, setRateLimitProtection] = useState(false);
  
  // Core state
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Filter state
  const [channelFilter, setChannelFilter] = useState(null);
  const [roomFilter, setRoomFilter] = useState(null);
  const [includeEmbedding, setIncludeEmbedding] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null); // NEW: Filter by conversation
  
  // Conversation grouping
  const [conversations, setConversations] = useState([]); // NEW: List of conversations
  
  // Pagination and real-time
  const [totalMemories, setTotalMemories] = useState(0);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true); // Enable by default for live experience
  const [pollInterval, setPollInterval] = useState(config.MEMORIES_POLL_INTERVAL); // Use config-based interval
  
  // Performance and scalability state
  const [lastChangeTime, setLastChangeTime] = useState(Date.now());
  const [consecutiveEmptyPolls, setConsecutiveEmptyPolls] = useState(0);
  const [requestCache, setRequestCache] = useState(new Map());
  const [isUserActive, setIsUserActive] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalRequests: 0,
    cacheHits: 0,
    averageResponseTime: 0
  });
  
  // Rate limiting and error recovery state
  const [rateLimitBackoff, setRateLimitBackoff] = useState(0); // Backoff time in ms
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [lastErrorTime, setLastErrorTime] = useState(null);
  const [isCircuitBreakerOpen, setIsCircuitBreakerOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  
  const BASE_URL = config.BASE_URL;
  
  /**
   * Calculate exponential backoff delay for rate limiting
   */
  const calculateBackoffDelay = useCallback((errorCount) => {
    const baseDelay = config.EXPONENTIAL_BACKOFF_BASE; // Use config-based base delay
    const maxDelay = config.EXPONENTIAL_BACKOFF_MAX; // Use config-based max delay
    const exponentialDelay = Math.min(baseDelay * Math.pow(2, errorCount), maxDelay);
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
    return Math.floor(exponentialDelay + jitter);
  }, [config]);
  
  /**
   * Check if we should skip request due to rate limiting or circuit breaker
   */
  const shouldSkipRequest = useCallback(() => {
    const now = Date.now();
    
    // Circuit breaker - if too many consecutive errors, open circuit for a while
    if (isCircuitBreakerOpen) {
      const circuitOpenTime = 300000; // 5 minutes
      if (lastErrorTime && (now - lastErrorTime) < circuitOpenTime) {
        console.log('🚫 [Rate Limit] Circuit breaker is OPEN, skipping request');
        return true;
      } else {
        // Try to close circuit breaker after timeout
        console.log('🔄 [Rate Limit] Attempting to close circuit breaker');
        setIsCircuitBreakerOpen(false);
        setConsecutiveErrors(0);
      }
    }
    
    // Rate limit backoff - if we're in backoff period, skip request
    if (rateLimitBackoff > 0 && lastErrorTime && (now - lastErrorTime) < rateLimitBackoff) {
      const remainingBackoff = rateLimitBackoff - (now - lastErrorTime);
      console.log(`⏳ [Rate Limit] Still in backoff period, ${Math.round(remainingBackoff/1000)}s remaining`);
      return true;
    }
    
    // Too many pending requests - prevent flooding
    if (pendingRequests >= config.MAX_CONCURRENT_REQUESTS) {
      console.log('🚫 [Rate Limit] Too many pending requests, skipping');
      return true;
    }
    
    return false;
  }, [isCircuitBreakerOpen, rateLimitBackoff, lastErrorTime, pendingRequests, config]);
  
  /**
   * Handle API errors with appropriate backoff and circuit breaker logic
   */
  const handleApiError = useCallback((error, response) => {
    const now = Date.now();
    setLastErrorTime(now);
    
    if (response && response.status === 429) {
      // Rate limit error - implement exponential backoff
      const newErrorCount = consecutiveErrors + 1;
      const backoffDelay = calculateBackoffDelay(newErrorCount);
      
      setConsecutiveErrors(newErrorCount);
      setRateLimitBackoff(backoffDelay);
      
      console.warn(`🚫 [Rate Limit] 429 error detected! Backoff for ${Math.round(backoffDelay/1000)}s (attempt ${newErrorCount})`);
      
      // Open circuit breaker if too many consecutive rate limit errors
      if (newErrorCount >= config.CIRCUIT_BREAKER_THRESHOLD) {
        setIsCircuitBreakerOpen(true);
        console.error('⚡ [Circuit Breaker] OPENED due to too many rate limit errors');
      }
      
      return `Rate limited. Backing off for ${Math.round(backoffDelay/1000)} seconds. Try again later.`;
    } else {
      // Other errors - still count but with different handling
      setConsecutiveErrors(prev => prev + 1);
      
      if (consecutiveErrors >= 10) {
        setIsCircuitBreakerOpen(true);
        console.error('⚡ [Circuit Breaker] OPENED due to too many consecutive errors');
      }
      
      return error.message;
    }
  }, [consecutiveErrors, calculateBackoffDelay, config]);
  
  /**
   * Reset error state on successful request
   */
  const resetErrorState = useCallback(() => {
    if (consecutiveErrors > 0 || rateLimitBackoff > 0) {
      console.log('✅ [Rate Limit] Request successful, resetting error state');
      setConsecutiveErrors(0);
      setRateLimitBackoff(0);
      setIsCircuitBreakerOpen(false);
    }
  }, [consecutiveErrors, rateLimitBackoff]);
  
  /**
   * Generate cache key for request deduplication
   */
  const generateCacheKey = useCallback((options = {}) => {
    return `${agentId}-${options.tableName || 'messages'}-${options.channelId || ''}-${options.roomId || ''}`;
  }, [agentId]);
  
  /**
   * Calculate adaptive poll interval based on activity and rate limiting
   * Optimized for 200+ concurrent users to prevent server overload
   */
  const calculateAdaptivePollInterval = useCallback(() => {
    const timeSinceLastChange = Date.now() - lastChangeTime;
    const baseInterval = config.MEMORIES_POLL_INTERVAL; // Use config-based interval
    const maxInterval = baseInterval * 30; // 30x the base interval for maximum
    
    // If circuit breaker is open, use much longer interval
    if (isCircuitBreakerOpen) {
      return maxInterval;
    }
    
    // If we're in rate limit backoff, use longer interval
    if (rateLimitBackoff > 0 || consecutiveErrors > 0) {
      const errorFactor = Math.min(consecutiveErrors + 1, 8); // Increased factor
      return Math.min(baseInterval * errorFactor * 3, maxInterval); // Tripled backoff
    }
    
    // If no changes for a while, slow down polling significantly
    if (consecutiveEmptyPolls > 2) { // Trigger slowdown sooner
      const slowdownFactor = Math.min(consecutiveEmptyPolls, 20); // Increased slowdown
      return Math.min(baseInterval * slowdownFactor, maxInterval);
    }
    
    // If user is inactive, use much longer interval
    if (!isUserActive) {
      return Math.min(baseInterval * 5, maxInterval); // Increased from 3x to 5x
    }
    
    // Recent activity - still be conservative to handle high load
    if (timeSinceLastChange < 120000) { // Last 2 minutes (doubled)
      return 45000; // 45 seconds minimum (more than doubled)
    }
    
    return baseInterval;
  }, [lastChangeTime, consecutiveEmptyPolls, isUserActive, isCircuitBreakerOpen, rateLimitBackoff, consecutiveErrors, config]);

  /**
   * Generate a log number for terminal display
   */
  const generateLogNumber = useCallback((timestamp, id) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    
    // Use first 3 chars of ID as suffix
    const suffix = id.substring(0, 3).toUpperCase();
    
    return `PURL-${year}${month}${day}-${hour}${minute}${second}-${suffix}`;
  }, []);
  
  /**
   * Format memory as a terminal line
   */
  const formatAsTerminalLine = useCallback((memory, isAgentMessage) => {
    const timestamp = new Date(memory.createdAt).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    const author = isAgentMessage ? 'PURL' : 'USER';
    const content = memory.content.text.substring(0, 100) + (memory.content.text.length > 100 ? '...' : '');
    
    return `[${timestamp}] ${author}: ${content}`;
  }, []);

  /**
   * Format memories for terminal/backroom display
   */
  const formatMemoriesForTerminal = useCallback((memoriesData) => {
    return memoriesData
      .filter(memory => {
        // Filter out system messages and keep only user/agent conversations
        if (!memory.content || !memory.content.text) return false;
        
        // Filter out private or sensitive content
        const text = memory.content.text.toLowerCase();
        if (text.includes('private') || text.includes('confidential')) return false;
        
        return true;
      })
      .map(memory => {
        // Determine message type based on content
        const isAgentMessage = memory.content.source === 'agent_response' || 
                              memory.content.thought || 
                              memory.content.plan;
        
        // Create terminal log entry
        return {
          id: memory.id,
          timestamp: new Date(memory.createdAt),
          entityId: memory.entityId,
          agentId: memory.agentId,
          roomId: memory.roomId,
          
          // Terminal display data
          type: isAgentMessage ? 'agent' : 'user',
          content: memory.content.text,
          thought: memory.content.thought || null,
          plan: memory.content.plan || null,
          actions: memory.content.actions || [],
          source: memory.content.source || 'unknown',
          inReplyTo: memory.content.inReplyTo || null,
          
          // Attachments - extract from content.attachments (Eliza format) or fallback to memory.attachments
          attachments: (memory.content && memory.content.attachments) || memory.attachments || [],
          
          // Metadata including attachments
          metadata: {
            agentId: memory.agentId,
            entityId: memory.entityId,
            attachments: (memory.content && memory.content.attachments) || memory.attachments || [],
            agentAction: memory.content.agentAction || null,
            thought: memory.content.thought || null
          },
          
          // Terminal formatting
          logNumber: generateLogNumber(memory.createdAt, memory.id),
          terminalLine: formatAsTerminalLine(memory, isAgentMessage),
          isPublic: true, // All fetched memories are public
          
          // Metadata for filtering/searching
          searchText: `${memory.content.text} ${memory.content.thought || ''} ${memory.content.plan || ''}`.toLowerCase(),
          channelId: memory.roomId, // Use roomId as channelId for consistency
        };
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Newest first
  }, [generateLogNumber, formatAsTerminalLine]);

  /**
   * Group memories by conversation/room for conversation selector
   */
  const groupMemoriesByConversation = useCallback((memoriesData) => {
    // Grouping conversations by roomId
    const conversationMap = new Map();
    
    memoriesData.forEach((memory, index) => {
      const conversationId = memory.roomId || memory.channelId || 'unknown';
      // Processing memory for conversation grouping
      
      if (!conversationMap.has(conversationId)) {
        // Find first and last message timestamps
        const conversationMemories = memoriesData.filter(m => 
          (m.roomId || m.channelId || 'unknown') === conversationId
        );
        
        const timestamps = conversationMemories.map(m => new Date(m.timestamp));
        const startTime = new Date(Math.min(...timestamps));
        const endTime = new Date(Math.max(...timestamps));
        
        // Create conversation preview
        const userMessages = conversationMemories.filter(m => m.type === 'user');
        const agentMessages = conversationMemories.filter(m => m.type === 'agent');
        const firstUserMessage = userMessages[0]?.content || '';
        
        conversationMap.set(conversationId, {
          id: conversationId,
          roomId: conversationId,
          startTime,
          endTime,
          messageCount: conversationMemories.length,
          userMessageCount: userMessages.length,
          agentMessageCount: agentMessages.length,
          preview: firstUserMessage.substring(0, 50) + (firstUserMessage.length > 50 ? '...' : ''),
          isActive: (new Date() - endTime) < 300000, // Active if last message within 5 minutes
          logNumber: generateLogNumber(startTime.getTime(), conversationId),
          memories: conversationMemories
        });
      }
    });
    
    // Convert to array and sort by start time (newest first)
    const result = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    
    // Conversation grouping completed
    
    return result;
  }, [generateLogNumber]);

  /**
   * Fetch agent memories from ElizaOS API with caching and performance optimization
   */
  const fetchMemories = useCallback(async (options = {}) => {
    if (!agentId) {
      setError('Agent ID is required');
      return;
    }
    
    // Check if we should skip this request due to rate limiting or circuit breaker
    if (shouldSkipRequest()) {
      return; // Silently skip - error state is already set appropriately
    }
    
    const startTime = performance.now();
    const cacheKey = generateCacheKey(options);
    const now = Date.now();
    
    // Check cache first (use config-based cache timeout)
    const cached = requestCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < config.CACHE_TTL) {
      // console.log('💾 [Memories] Using cached response for:', cacheKey); // Disabled to reduce spam
      setPerformanceMetrics(prev => ({
        ...prev,
        cacheHits: prev.cacheHits + 1
      }));
      return cached.data;
    }
    
    try {
      setLoading(true);
      setError(null);
      setPendingRequests(prev => prev + 1); // Track pending requests
      
      // Fetching memories from API (reduced logging)
      
      // Build query parameters
      const params = new URLSearchParams({
        tableName: options.tableName || 'messages',
        includeEmbedding: options.includeEmbedding || includeEmbedding || false
      });
      
      if (options.channelId || channelFilter) {
        params.append('channelId', options.channelId || channelFilter);
      }
      
      if (options.roomId || roomFilter) {
        params.append('roomId', options.roomId || roomFilter);
      }
      
      const url = `${BASE_URL}/api/memory/${agentId}/memories?${params.toString()}`;
      // API request prepared
      
      // Build headers with API key for production
      const headers = {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br', // OPTIMIZATION: Enable compression
        'Accept': 'application/json'
      };
      
      // Add API key for production
      if (config.API_KEY) {
        headers['X-API-Key'] = config.API_KEY;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        const error = new Error(`Failed to fetch memories: ${response.status} - ${errorData.message || errorData.error?.message || 'Unknown error'}`);
        
        // EMERGENCY: Rate limit protection - disable polling if 429 errors
        if (response.status === 429) {
          console.error('🚨 [EMERGENCY] Rate limit hit! Disabling polling for 5 minutes');
          setRateLimitProtection(true);
          setTimeout(() => {
            console.log('🔄 [Recovery] Re-enabling polling after rate limit cooldown');
            setRateLimitProtection(false);
          }, 300000); // 5 minutes
        }
        
        // Handle rate limiting and other errors with appropriate backoff
        const errorMessage = handleApiError(error, response);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      // Only log API response every 10th request
      // Raw API response received
      
      if (data.success && data.data && data.data.memories) {
        const memoriesData = data.data.memories;
        // Only log fetch count every 10th request
        // Memories fetched successfully
        
        // Reset error state on successful request
        resetErrorState();
        
        // Process and format memories for terminal display
        const formattedMemories = formatMemoriesForTerminal(memoriesData);
        
        // Group memories by conversation/room for conversation selector
        const conversationGroups = groupMemoriesByConversation(formattedMemories);
        
        const previousMemoryCount = memories.length;
        const previousConversationCount = conversations.length;
        const hasNewData = formattedMemories.length > previousMemoryCount || conversationGroups.length > previousConversationCount;
        
        // Update cache with enhanced cleanup
        setRequestCache(prev => {
          const newCache = new Map(prev);
          newCache.set(cacheKey, {
            data: { memories: formattedMemories, conversations: conversationGroups },
            timestamp: now
          });
          
          // OPTIMIZATION: Enhanced cache cleanup to prevent memory leaks
          if (newCache.size > 8) { // Reduced from 10 to 8 for better memory management
            // Remove oldest entries until we're back to 5 entries
            const entries = Array.from(newCache.entries())
              .sort((a, b) => a[1].timestamp - b[1].timestamp);
            
            const toRemove = entries.slice(0, newCache.size - 5);
            toRemove.forEach(([key]) => newCache.delete(key));
            
            // Cache cleanup completed
          }
          
          return newCache;
        });
        
        setMemories(formattedMemories);
        setConversations(conversationGroups);
        setTotalMemories(memoriesData.length);
        setLastUpdated(new Date());
        
        // Update activity tracking
        if (hasNewData) {
          setLastChangeTime(now);
          setConsecutiveEmptyPolls(0);
          // New data detected - fast polling mode
        } else {
          setConsecutiveEmptyPolls(prev => prev + 1);
          // No new data found
        }
        
        // Update performance metrics
        const responseTime = performance.now() - startTime;
        setPerformanceMetrics(prev => ({
          totalRequests: prev.totalRequests + 1,
          cacheHits: prev.cacheHits,
          averageResponseTime: (prev.averageResponseTime * prev.totalRequests + responseTime) / (prev.totalRequests + 1)
        }));
        
        // Only log processing details every 10th request
        if (performanceMetrics.totalRequests % 10 === 0) {
          // Memories and conversations processed successfully
        }
        
        // Log if we found new data
        // New data detected and processed
        
      } else {
        console.error('❌ [Memories] Invalid response format:', data);
        setError('Invalid response format from memories API');
      }
      
    } catch (err) {
      console.error('❌ [Memories] Error fetching memories:', err);
      setError(err.message);
      setMemories([]);
    } finally {
      setLoading(false);
      setPendingRequests(prev => Math.max(0, prev - 1)); // Decrease pending requests counter
    }
  }, [agentId, channelFilter, roomFilter, includeEmbedding]); // OPTIMIZATION: Removed changing dependencies to prevent infinite re-renders
  
  /**
   * Debounced fetch memories to prevent rapid successive calls
   * OPTIMIZATION: 2 second debounce to reduce server load, use ref to avoid dependency
   */
  const debouncedFetchMemories = useMemo(
    () => debounce(() => fetchMemoriesRef.current(), 2000),
    []
  );
  
  /**
   * Refresh memories (manual refresh) - OPTIMIZATION: Use ref to avoid dependency
   */
  const refreshMemories = useCallback(() => {
    // Manual refresh triggered
    return fetchMemoriesRef.current();
  }, []);
  
  /**
   * Filter memories by channel
   */
  const filterByChannel = useCallback((channelId) => {
    setChannelFilter(channelId);
  }, []);
  
  /**
   * Filter memories by room
   */
  const filterByRoom = useCallback((roomId) => {
    setRoomFilter(roomId);
  }, []);
  
  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setChannelFilter(null);
    setRoomFilter(null);
    setSelectedConversation(null);
  }, []);
  
  /**
   * Select a specific conversation to view
   */
  const selectConversation = useCallback((conversationId) => {
    // Selecting conversation
    setSelectedConversation(conversationId);
  }, []);
  
  /**
   * Get filtered memories based on selected conversation
   */
  const getFilteredMemories = useCallback(() => {
    if (!selectedConversation) {
      return memories; // Return all memories if no conversation selected
    }
    
    return memories.filter(memory => 
      (memory.roomId || memory.channelId) === selectedConversation
    );
  }, [memories, selectedConversation]);
  
  /**
   * Enable/disable real-time polling
   */
  const toggleRealTime = useCallback((enabled) => {
    setRealTimeEnabled(enabled);
    // Real-time polling toggled
  }, []);
  
  // Auto-fetch memories on mount and when agentId changes
  useEffect(() => {
    if (agentId) {
      // console.log('🚀 [Memories] Auto-fetching memories for agent:', agentId); // Disabled to reduce spam
      fetchMemories();
    }
  }, [agentId, fetchMemories]);
  
  // OPTIMIZATION: Periodic cache cleanup to prevent memory buildup
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setRequestCache(prev => {
        const now = Date.now();
        const cleanCache = new Map();
        
        // Only keep entries from the last 10 minutes
        const maxAge = 600000; // 10 minutes
        
        for (const [key, value] of prev.entries()) {
          if (now - value.timestamp < maxAge) {
            cleanCache.set(key, value);
          }
        }
        
        if (cleanCache.size !== prev.size) {
          // Periodic cache cleanup completed
        }
        
        return cleanCache;
      });
    }, 300000); // Run every 5 minutes
    
    return () => clearInterval(cleanupInterval);
  }, []);
  
  // User activity detection
  useEffect(() => {
    let activityTimer;
    
    const handleUserActivity = () => {
      setIsUserActive(true);
      clearTimeout(activityTimer);
      activityTimer = setTimeout(() => {
        setIsUserActive(false);
        // User inactive - slower polling
      }, 300000); // 5 minutes of inactivity
    };
    
    // Listen for user activity
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    
    // Initialize
    handleUserActivity();
    
    return () => {
      clearTimeout(activityTimer);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
    };
  }, []);

  // Adaptive real-time polling for new memories
  useEffect(() => {
    if (!realTimeEnabled || !agentId || rateLimitProtection) return;
    
    const adaptiveInterval = calculateAdaptivePollInterval();
    // Only log polling info every 5th interval to reduce spam
    if (performanceMetrics.totalRequests % 5 === 0) {
      // Starting adaptive polling
    }
    
    const interval = setInterval(() => {
      // Only log refresh details occasionally to reduce spam
      if (performanceMetrics.totalRequests % 20 === 0) {
        // Adaptive refresh triggered
      }
      // OPTIMIZATION: Use debounced fetch to prevent rapid calls during high activity
      debouncedFetchMemories();
    }, adaptiveInterval);
    
    return () => {
      // console.log('🛑 [Memories] Stopping adaptive polling'); // Disabled to reduce spam
      clearInterval(interval);
    };
  }, [realTimeEnabled, agentId, rateLimitProtection]); // OPTIMIZATION: Fixed infinite re-render by removing changing dependencies
  
  // OPTIMIZATION: Use ref to avoid stale closure issues
  const fetchMemoriesRef = useRef(fetchMemories);
  fetchMemoriesRef.current = fetchMemories;

  // Re-fetch when filters change
  useEffect(() => {
    if (agentId && (channelFilter || roomFilter)) {
      // Filters changed, refreshing data
      fetchMemoriesRef.current();
    }
  }, [channelFilter, roomFilter, agentId]); // OPTIMIZATION: Use ref to avoid dependency on fetchMemories
  
  return {
    // Data
    memories,
    totalMemories,
    lastUpdated,
    conversations, // NEW: Grouped conversations
    selectedConversation, // NEW: Currently selected conversation
    
    // State
    loading,
    error,
    realTimeEnabled,
    
    // Performance and scalability
    performanceMetrics,
    isUserActive,
    consecutiveEmptyPolls,
    pollInterval: calculateAdaptivePollInterval(), // Dynamic poll interval
    
    // Rate limiting and error recovery state (for debugging/UI)
    rateLimitBackoff,
    consecutiveErrors,
    isCircuitBreakerOpen,
    pendingRequests,
    
    // Filters
    channelFilter,
    roomFilter,
    includeEmbedding,
    
    // Actions
    fetchMemories,
    debouncedFetchMemories, // OPTIMIZATION: Debounced version for high-frequency calls
    refreshMemories,
    filterByChannel,
    filterByRoom,
    clearFilters,
    toggleRealTime,
    setIncludeEmbedding,
    setPollInterval,
    selectConversation, // NEW: Select conversation
    getFilteredMemories, // NEW: Get filtered memories
    
    // Utils
    formatAsTerminalLine,
    generateLogNumber
  };
}

export default useElizaMemories;
