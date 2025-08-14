const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// Simple logger for production server
const logger = {
  info: (message) => console.log(`[INFO] ${new Date().toISOString()} ${message}`),
  warn: (message) => console.warn(`[WARN] ${new Date().toISOString()} ${message}`),
  error: (message, error) => console.error(`[ERROR] ${new Date().toISOString()} ${message}`, error || '')
};

/**
 * Production ElizaOS Server - API Only (No Dashboard)
 * Simple JavaScript version for easier deployment
 */

const app = express();

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`🚫 CORS blocked request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key', 'Accept', 'Accept-Encoding']
}));

// Rate limiting
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`🚨 Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Rate limit exceeded',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Rate limiters
const generalLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  'Too many requests, please try again later'
);

const apiLimiter = createRateLimiter(
  60000, // 1 minute
  20, // 20 requests per minute for API calls
  'API rate limit exceeded'
);

app.use(generalLimiter);

// API Key authentication middleware
const requireAPIKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY;
  
  // Skip auth in development if no API key is set
  if (process.env.NODE_ENV === 'development' && !expectedKey) {
    return next();
  }
  
  if (!apiKey || !expectedKey || apiKey !== expectedKey) {
    logger.warn(`🚫 Unauthorized API access attempt from IP: ${req.ip}`);
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Valid API key required for access'
    });
  }
  
  next();
};

// Health check endpoint - no auth required
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mode: 'production-api-only',
    dashboard: 'disabled'
  });
});

// Apply API key authentication and rate limiting to all API routes
app.use('/api', requireAPIKey);
app.use('/api', apiLimiter);

// Placeholder API routes (replace with actual ElizaOS integration)
app.use('/api', (req, res, next) => {
  res.status(501).json({ 
    error: 'API routes not implemented',
    message: 'Please configure ElizaOS API routes. This is a placeholder production server.'
  });
});

// Block dashboard routes explicitly
const dashboardRoutes = ['/', '/dashboard', '/agents', '/settings', '/logs'];
dashboardRoutes.forEach(route => {
  app.use(route, (req, res) => {
    logger.warn(`🚫 Dashboard access attempt blocked: ${req.path} from IP: ${req.ip}`);
    res.status(403).json({ 
      error: 'Dashboard access disabled',
      message: 'This is an API-only server. Dashboard access is disabled in production mode.'
    });
  });
});

// Catch all other routes - return 404
app.use('*', (req, res) => {
  logger.warn(`🚫 Unknown route accessed: ${req.originalUrl} from IP: ${req.ip}`);
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: 'This API endpoint does not exist'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error:', err.message || err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    error: 'Internal server error',
    message: isDevelopment ? err.message : 'Something went wrong'
  });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`🔒 ElizaOS Production API Server started`);
  logger.info(`📡 Port: ${PORT}`);
  logger.info(`🚫 Dashboard: DISABLED for security`);
  logger.info(`🔑 API Key: ${process.env.API_KEY ? 'REQUIRED' : 'NOT SET (DEVELOPMENT MODE)'}`);
  logger.info(`🌐 CORS: ${allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'ALL ORIGINS (INSECURE)'}`);
  logger.info(`⚡ Rate Limit: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000')) / 60000} minutes`);
});

module.exports = app;
