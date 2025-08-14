/**
 * TilePreviewService - Efficient On-Demand Message Loading
 * 
 * Handles tile preview requests with intelligent batching, caching, and rate limiting
 * to prevent server overload when many users click tiles simultaneously.
 * 
 * Features:
 * - Request batching (multiple tile clicks = single API call)
 * - Smart caching with TTL
 * - Rate limiting protection
 * - Automatic retry with exponential backoff
 * - Request deduplication
 */

class TilePreviewService {
  constructor() {
    this.cache = new Map(); // conversationId -> { data, timestamp, ttl }
    this.pendingRequests = new Map(); // conversationId -> Promise
    this.requestQueue = new Set(); // conversationIds to batch
    this.batchTimeout = null;
    this.rateLimitCooldown = false;
    
    // Configuration
    this.config = {
      BATCH_DELAY: 500, // Wait 500ms to batch requests
      CACHE_TTL: 300000, // 5 minutes cache
      MAX_BATCH_SIZE: 10, // Max conversations per API call
      RATE_LIMIT_COOLDOWN: 30000, // 30 seconds cooldown on rate limit
      MAX_RETRIES: 3,
      BASE_RETRY_DELAY: 1000 // 1 second base delay
    };
  }

  /**
   * Get conversation preview messages (public API)
   */
  async getConversationPreview(conversationId) {
    // Check cache first
    const cached = this._getCached(conversationId);
    if (cached) {
      console.log(`⚡ [TilePreview] Using cached data for ${conversationId}`);
      return cached;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(conversationId)) {
      console.log(`⏳ [TilePreview] Request already pending for ${conversationId}`);
      return await this.pendingRequests.get(conversationId);
    }

    // Add to batch queue
    return this._queueRequest(conversationId);
  }

  /**
   * Queue request for batching
   */
  _queueRequest(conversationId) {
    this.requestQueue.add(conversationId);
    
    // Create pending promise
    const pendingPromise = new Promise((resolve, reject) => {
      // Store resolve/reject for this conversation
      if (!this.pendingPromises) {
        this.pendingPromises = new Map();
      }
      this.pendingPromises.set(conversationId, { resolve, reject });
    });
    
    this.pendingRequests.set(conversationId, pendingPromise);

    // Schedule batch processing
    this._scheduleBatch();

    return pendingPromise;
  }

  /**
   * Schedule batch processing with debouncing
   */
  _scheduleBatch() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this._processBatch();
    }, this.config.BATCH_DELAY);
  }

  /**
   * Process batched requests
   */
  async _processBatch() {
    if (this.requestQueue.size === 0 || this.rateLimitCooldown) {
      return;
    }

    const conversationIds = Array.from(this.requestQueue).slice(0, this.config.MAX_BATCH_SIZE);
    this.requestQueue.clear();

    console.log(`📦 [TilePreview] Processing batch of ${conversationIds.length} requests`);

    try {
      const results = await this._fetchBatchedPreviews(conversationIds);
      this._handleBatchSuccess(conversationIds, results);
    } catch (error) {
      this._handleBatchError(conversationIds, error);
    }
  }

  /**
   * Fetch batched previews from server (using existing ElizaOS memory API)
   */
  async _fetchBatchedPreviews(conversationIds, retryCount = 0) {
    const agentId = 'b850bc30-45f8-0041-a00a-83df46d8555d';
    
    try {
      console.log(`🌐 [TilePreview] Fetching batch of ${conversationIds.length} conversations`);
      
      // Use existing ElizaOS memory API with room filter
      const results = {};
      
      // Process conversations in smaller sub-batches to avoid overwhelming the API
      const subBatchSize = 3;
      for (let i = 0; i < conversationIds.length; i += subBatchSize) {
        const subBatch = conversationIds.slice(i, i + subBatchSize);
        
        // Fetch each conversation individually using existing API
        for (const conversationId of subBatch) {
          try {
            const url = `http://localhost:3000/api/memory/${agentId}/memories?roomId=${encodeURIComponent(conversationId)}&limit=4&includeEmbedding=false`;
            
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept': 'application/json'
              }
            });

            if (response.status === 429) {
              console.warn('🚨 [TilePreview] Rate limited! Enabling cooldown');
              this.rateLimitCooldown = true;
              setTimeout(() => {
                this.rateLimitCooldown = false;
                console.log('✅ [TilePreview] Rate limit cooldown ended');
              }, this.config.RATE_LIMIT_COOLDOWN);
              
              throw new Error('Rate limited');
            }

            if (response.ok) {
              const data = await response.json();
              const memories = data.data?.memories || [];
              

              
              // Transform to preview format
              const messages = memories
                .filter(memory => memory.content?.text) // Only memories with text content
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .slice(0, 4)
                .map(memory => {
                  // Detect message type from multiple sources
                  let messageType = 'agent'; // default
                  let sender = 'Purl'; // default
                  
                  // Check various type indicators
                  if (memory.type === 'user_message' || 
                      memory.content?.type === 'user' ||
                      memory.content?.source === 'user' ||
                      memory.entityId !== agentId) {
                    messageType = 'user';
                    sender = 'User';
                  } else if (memory.type === 'agent_response' ||
                            memory.content?.type === 'agent' ||
                            memory.content?.source === 'agent_response' ||
                            memory.content?.thought ||
                            memory.content?.plan ||
                            memory.entityId === agentId) {
                    messageType = 'agent';
                    sender = 'Purl';
                  }
                  
                  const content = String(memory.content?.text || memory.content?.content || '').slice(0, 100);
                  
                  return {
                    type: messageType,
                    content,
                    timestamp: memory.createdAt,
                    sender
                  };
                });

              results[conversationId] = {
                messages,
                source: 'server',
                conversationId
              };
              
              console.log(`✅ [TilePreview] Loaded ${messages.length} messages for ${conversationId}`);
            } else {
              console.warn(`⚠️ [TilePreview] Failed to load ${conversationId}: ${response.status}`);
              results[conversationId] = { messages: [], error: `HTTP ${response.status}` };
            }
            
            // Small delay between individual requests to be gentle on the API
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } catch (error) {
            console.warn(`⚠️ [TilePreview] Error loading ${conversationId}:`, error.message);
            results[conversationId] = { messages: [], error: error.message };
          }
        }
        
        // Longer delay between sub-batches
        if (i + subBatchSize < conversationIds.length) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      console.log(`✅ [TilePreview] Batch completed: ${Object.keys(results).length} conversations processed`);
      return results;
      
    } catch (error) {
      // Retry with exponential backoff
      if (retryCount < this.config.MAX_RETRIES && !this.rateLimitCooldown) {
        const delay = this.config.BASE_RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`🔄 [TilePreview] Retrying batch in ${delay}ms (attempt ${retryCount + 1}/${this.config.MAX_RETRIES})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this._fetchBatchedPreviews(conversationIds, retryCount + 1);
      }
      
      throw error;
    }
  }

  /**
   * Handle successful batch response
   */
  _handleBatchSuccess(conversationIds, results) {
    for (const conversationId of conversationIds) {
      const preview = results[conversationId] || { messages: [], error: 'No data found' };
      
      // Cache the result
      this._setCached(conversationId, preview);
      
      // Resolve pending promise
      const pending = this.pendingPromises?.get(conversationId);
      if (pending) {
        pending.resolve(preview);
        this.pendingPromises.delete(conversationId);
      }
      
      // Clean up pending request
      this.pendingRequests.delete(conversationId);
    }
  }

  /**
   * Handle batch error
   */
  _handleBatchError(conversationIds, error) {
    console.error('❌ [TilePreview] Batch failed:', error);
    
    for (const conversationId of conversationIds) {
      // Fallback to localStorage
      const fallbackData = this._loadFromLocalStorage(conversationId);
      
      if (fallbackData.messages.length > 0) {
        this._setCached(conversationId, fallbackData);
      }
      
      // Resolve with fallback data
      const pending = this.pendingPromises?.get(conversationId);
      if (pending) {
        pending.resolve(fallbackData);
        this.pendingPromises.delete(conversationId);
      }
      
      // Clean up pending request
      this.pendingRequests.delete(conversationId);
    }
  }

  /**
   * Load fallback data from localStorage
   */
  _loadFromLocalStorage(conversationId) {
    try {
      const conversationLogs = JSON.parse(localStorage.getItem('purl_conversation_logs') || '[]');
      const messages = conversationLogs
        .filter(log => log.conversationId === conversationId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .slice(0, 4)
        .map(msg => ({
          type: msg.type,
          content: String(msg.content).slice(0, 100),
          timestamp: msg.timestamp,
          sender: msg.type === 'user' ? 'User' : 'Purl'
        }));

      return {
        messages,
        source: 'localStorage',
        cached: true
      };
    } catch (error) {
      return {
        messages: [],
        source: 'fallback',
        error: error.message
      };
    }
  }

  /**
   * Cache management
   */
  _getCached(conversationId) {
    const cached = this.cache.get(conversationId);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(conversationId);
      return null;
    }
    
    return cached.data;
  }

  _setCached(conversationId, data) {
    this.cache.set(conversationId, {
      data,
      timestamp: Date.now(),
      ttl: this.config.CACHE_TTL
    });
    
    // Cleanup old entries periodically
    if (this.cache.size > 100) {
      this._cleanupCache();
    }
  }

  _cleanupCache() {
    const now = Date.now();
    for (const [id, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(id);
      }
    }
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      queuedRequests: this.requestQueue.size,
      rateLimitCooldown: this.rateLimitCooldown
    };
  }

  /**
   * Clear all caches and pending requests
   */
  clearAll() {
    this.cache.clear();
    this.pendingRequests.clear();
    this.requestQueue.clear();
    if (this.pendingPromises) {
      this.pendingPromises.clear();
    }
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
  }
}

// Create singleton instance
export const tilePreviewService = new TilePreviewService();

export default tilePreviewService;
