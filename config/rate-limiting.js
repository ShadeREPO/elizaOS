/**
 * Rate Limiting Configuration for High-Load Scenarios
 * Optimized for 200+ concurrent users
 */

// Environment-based configuration with sensible defaults
const getRateLimitConfig = () => {
  return {
    // API rate limiting (requests per minute per IP)
    api: {
      windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
      max: parseInt(process.env.API_RATE_LIMIT_REQUESTS) || 300, // 300 requests per minute per IP
      standardHeaders: true,
      legacyHeaders: false,
      // Skip rate limiting for local development
      skip: (req) => {
        if (process.env.NODE_ENV === 'development') {
          return req.ip === '127.0.0.1' || req.ip === '::1';
        }
        return false;
      },
      // Custom message for rate limiting
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 'You can try again in 1 minute.'
      },
      // Rate limit handler
      handler: (req, res) => {
        console.warn(`[SECURITY] Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many requests from this IP, please try again later.',
          retryAfter: Math.ceil(60), // seconds
        });
      }
    },

    // Memory API specific limits (more restrictive)
    memory: {
      windowMs: parseInt(process.env.MEMORY_API_RATE_LIMIT_WINDOW_MS) || 60000,
      max: parseInt(process.env.MEMORY_API_RATE_LIMIT_REQUESTS) || 120, // 120 requests per minute
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        if (process.env.NODE_ENV === 'development') {
          return req.ip === '127.0.0.1' || req.ip === '::1';
        }
        return false;
      },
      handler: (req, res) => {
        console.warn(`[SECURITY] Memory API rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
          error: 'Memory API rate limit exceeded',
          message: 'Too many memory requests from this IP, please try again later.',
          retryAfter: Math.ceil(60),
        });
      }
    },

    // WebSocket connection limits
    websocket: {
      maxConnectionsPerIP: parseInt(process.env.WS_MAX_CONNECTIONS_PER_IP) || 10,
      messageRateLimit: parseInt(process.env.WS_MESSAGE_RATE_LIMIT) || 30, // messages per minute
      windowMs: 60000, // 1 minute window
    },

    // Frontend polling configuration
    frontend: {
      pollInterval: parseInt(process.env.FRONTEND_POLL_INTERVAL) || 60000, // 60 seconds
      cacheTimeout: parseInt(process.env.FRONTEND_CACHE_TTL) || 30000, // 30 seconds
      maxConcurrentRequests: parseInt(process.env.FRONTEND_MAX_CONCURRENT) || 3,
    },

    // Circuit breaker settings
    circuitBreaker: {
      threshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD) || 10,
      timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT) || 300000, // 5 minutes
    }
  };
};

// High-load optimized configuration preset
const getHighLoadConfig = () => {
  return {
    api: {
      windowMs: 60000,
      max: 500, // Increased for high load
      standardHeaders: true,
      legacyHeaders: false,
    },
    memory: {
      windowMs: 60000,
      max: 200, // Increased for high load
      standardHeaders: true,
      legacyHeaders: false,
    },
    frontend: {
      pollInterval: 90000, // Slower polling for high load
      cacheTimeout: 45000, // Longer cache for high load
      maxConcurrentRequests: 2, // Fewer concurrent requests
    }
  };
};

// Development configuration (more lenient)
const getDevelopmentConfig = () => {
  return {
    api: {
      windowMs: 60000,
      max: 1000, // Very high limit for development
      standardHeaders: true,
      legacyHeaders: false,
      skip: () => true, // Skip rate limiting in development
    },
    memory: {
      windowMs: 60000,
      max: 500,
      standardHeaders: true,
      legacyHeaders: false,
      skip: () => true,
    },
    frontend: {
      pollInterval: 30000, // Faster polling in development
      cacheTimeout: 10000, // Shorter cache in development
      maxConcurrentRequests: 5,
    }
  };
};

module.exports = {
  getRateLimitConfig,
  getHighLoadConfig,
  getDevelopmentConfig,
};

