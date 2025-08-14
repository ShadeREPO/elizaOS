/**
 * Configuration Management for PURL Agent Frontend
 * 
 * This module provides centralized configuration management for the frontend,
 * including rate limiting, performance optimization, and scalability settings.
 * 
 * Features:
 * - Environment-based configuration
 * - High-load mode for 200+ concurrent users
 * - Rate limiting and circuit breaker settings
 * - Performance optimization parameters
 */

// Default configuration values
const DEFAULT_CONFIG = {
  // API Configuration  
  BASE_URL: import.meta.env.MODE === 'production' 
    ? (import.meta.env.VITE_API_URL || 'https://your-elizaos-api.railway.app') // Production API URL
    : 'http://localhost:3000',
    
  // Production API Key (required for production)
  API_KEY: import.meta.env.VITE_API_KEY || null,
  
  // Rate Limiting & Performance - EMERGENCY CONSERVATIVE SETTINGS
  MEMORIES_POLL_INTERVAL: 60000, // 60 seconds (VERY conservative for rate limit protection)
  CACHE_TTL: 300000, // 5 minute cache timeout (much longer)
  MAX_CONCURRENT_REQUESTS: 1, // EMERGENCY: Only 1 concurrent request per client
  MESSAGE_MIN_INTERVAL: 3000, // Minimum 3 seconds between messages
  
  // Exponential Backoff Settings
  EXPONENTIAL_BACKOFF_BASE: 2000, // 2 seconds base delay
  EXPONENTIAL_BACKOFF_MAX: 120000, // 2 minutes maximum delay
  
  // Circuit Breaker Settings
  CIRCUIT_BREAKER_THRESHOLD: 5, // Open circuit after 5 consecutive errors
  
  // High Load Mode Settings (for 200+ users)
  HIGH_LOAD_MODE: {
    MEMORIES_POLL_INTERVAL: 60000, // 1 minute in high load
    CACHE_TTL: 300000, // 5 minutes cache in high load
    MAX_CONCURRENT_REQUESTS: 2, // Reduce concurrent requests
    MESSAGE_MIN_INTERVAL: 2000, // 2 seconds between messages
    EXPONENTIAL_BACKOFF_BASE: 5000, // 5 seconds base delay
    EXPONENTIAL_BACKOFF_MAX: 300000, // 5 minutes maximum delay
  }
};

// Environment-specific overrides
const ENVIRONMENT_CONFIG = {
  development: {
    MEMORIES_POLL_INTERVAL: 15000, // Faster polling in dev
    CACHE_TTL: 30000, // Shorter cache in dev
  },
  production: {
    MEMORIES_POLL_INTERVAL: 45000, // Slower polling in production
    CACHE_TTL: 120000, // Longer cache in production
    MAX_CONCURRENT_REQUESTS: 2, // More conservative in production
  }
};

// Global state for high-load mode
let isHighLoadMode = false;
let currentConfig = { ...DEFAULT_CONFIG };

/**
 * Get current environment
 */
function getEnvironment() {
  return import.meta.env.MODE || 'development';
}

/**
 * Initialize configuration based on environment
 */
function initializeConfig() {
  const env = getEnvironment();
  const envConfig = ENVIRONMENT_CONFIG[env] || {};
  
  // Merge default config with environment-specific config
  currentConfig = {
    ...DEFAULT_CONFIG,
    ...envConfig
  };
  
  console.log(`🔧 [Config] Initialized for ${env} environment`);
  console.log(`🔧 [Config] Poll interval: ${currentConfig.MEMORIES_POLL_INTERVAL}ms`);
  console.log(`🔧 [Config] Cache TTL: ${currentConfig.CACHE_TTL}ms`);
  
  return currentConfig;
}

/**
 * Get current configuration
 */
export function getConfig() {
  return { ...currentConfig };
}

/**
 * Check if high-load mode is enabled
 */
export function isHighLoadModeEnabled() {
  return isHighLoadMode;
}

/**
 * Enable high-load mode for better scalability with 200+ users
 */
export function enableHighLoadMode() {
  isHighLoadMode = true;
  
  // Apply high-load settings
  currentConfig = {
    ...currentConfig,
    ...DEFAULT_CONFIG.HIGH_LOAD_MODE
  };
  
  console.log('🚀 [Config] HIGH LOAD MODE ENABLED');
  console.log(`🚀 [Config] Poll interval increased to: ${currentConfig.MEMORIES_POLL_INTERVAL}ms`);
  console.log(`🚀 [Config] Cache TTL increased to: ${currentConfig.CACHE_TTL}ms`);
  console.log(`🚀 [Config] Max concurrent requests reduced to: ${currentConfig.MAX_CONCURRENT_REQUESTS}`);
  
  return currentConfig;
}

/**
 * Disable high-load mode and return to normal settings
 */
export function disableHighLoadMode() {
  isHighLoadMode = false;
  
  // Restore normal settings
  const env = getEnvironment();
  const envConfig = ENVIRONMENT_CONFIG[env] || {};
  
  currentConfig = {
    ...DEFAULT_CONFIG,
    ...envConfig
  };
  
  console.log('⚡ [Config] High load mode DISABLED, returning to normal settings');
  console.log(`⚡ [Config] Poll interval restored to: ${currentConfig.MEMORIES_POLL_INTERVAL}ms`);
  console.log(`⚡ [Config] Cache TTL restored to: ${currentConfig.CACHE_TTL}ms`);
  
  return currentConfig;
}

/**
 * Update specific configuration values
 */
export function updateConfig(updates) {
  currentConfig = {
    ...currentConfig,
    ...updates
  };
  
  console.log('🔧 [Config] Configuration updated:', updates);
  return currentConfig;
}

/**
 * Reset configuration to defaults
 */
export function resetConfig() {
  isHighLoadMode = false;
  return initializeConfig();
}

/**
 * Get performance recommendations based on current load
 */
export function getPerformanceRecommendations(metrics = {}) {
  const recommendations = [];
  
  if (metrics.totalRequests > 1000 && !isHighLoadMode) {
    recommendations.push({
      type: 'warning',
      message: 'Consider enabling High Load Mode for better scalability',
      action: 'enableHighLoadMode'
    });
  }
  
  if (metrics.averageResponseTime > 5000) {
    recommendations.push({
      type: 'error',
      message: 'High response times detected. Check server performance.',
      action: 'checkServer'
    });
  }
  
  if (metrics.cacheHitRate < 0.3) {
    recommendations.push({
      type: 'info',
      message: 'Low cache hit rate. Consider increasing cache TTL.',
      action: 'increaseCacheTTL'
    });
  }
  
  return recommendations;
}

/**
 * Export configuration constants for direct access
 */
export const CONFIG_CONSTANTS = {
  ENVIRONMENTS: Object.keys(ENVIRONMENT_CONFIG),
  DEFAULT_POLL_INTERVAL: DEFAULT_CONFIG.MEMORIES_POLL_INTERVAL,
  HIGH_LOAD_POLL_INTERVAL: DEFAULT_CONFIG.HIGH_LOAD_MODE.MEMORIES_POLL_INTERVAL,
  MIN_POLL_INTERVAL: 5000, // Minimum 5 seconds
  MAX_POLL_INTERVAL: 300000, // Maximum 5 minutes
};

// Initialize configuration on module load
initializeConfig();

// Export default configuration object
export default {
  getConfig,
  isHighLoadModeEnabled,
  enableHighLoadMode,
  disableHighLoadMode,
  updateConfig,
  resetConfig,
  getPerformanceRecommendations,
  CONFIG_CONSTANTS
};
