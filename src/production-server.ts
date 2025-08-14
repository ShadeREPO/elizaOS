import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { elizaLogger } from '@elizaos/core';

/**
 * Production ElizaOS Server - API Only (No Dashboard)
 * 
 * This server configuration is designed for production deployment where:
 * - Dashboard access is completely disabled
 * - API access requires authentication via API key
 * - Rate limiting is enforced
 * - CORS is restricted to authorized origins only
 * - Security headers are enabled
 */

const app = express();

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Security middleware - Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: false, // Allow API responses
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration - Only allow authorized origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      elizaLogger.warn(`🚫 CORS blocked request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key', 'Accept', 'Accept-Encoding']
}));

// Rate limiting - Protect against abuse
const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      elizaLogger.warn(`🚨 Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Rate limit exceeded',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
const generalLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  'Too many requests, please try again later'
);

const apiLimiter = createRateLimiter(
  60000, // 1 minute
  20, // 20 requests per minute for API calls
  'API rate limit exceeded'
);

// Apply general rate limiting to all routes
app.use(generalLimiter);

// API Key authentication middleware
const requireAPIKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  const expectedKey = process.env.API_KEY;
  
  // Skip auth in development if no API key is set
  if (process.env.NODE_ENV === 'development' && !expectedKey) {
    return next();
  }
  
  if (!apiKey || !expectedKey || apiKey !== expectedKey) {
    elizaLogger.warn(`🚫 Unauthorized API access attempt from IP: ${req.ip}`);
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

// Import and mount ElizaOS API routes
// Note: This assumes ElizaOS exports API routes separately from dashboard
// You may need to modify this based on ElizaOS's actual export structure
try {
  // Import your ElizaOS API setup here
  // This is a placeholder - replace with actual ElizaOS API mounting
  app.use('/api', (req, res, next) => {
    // Mount your ElizaOS API routes here
    // Example: app.use('/api', elizaAPIRouter);
    res.status(501).json({ 
      error: 'API routes not implemented',
      message: 'Please configure ElizaOS API routes in production-server.ts'
    });
  });
} catch (error) {
  elizaLogger.error('Failed to load ElizaOS API routes:', error);
}

// Block dashboard routes explicitly
const dashboardRoutes = ['/', '/dashboard', '/agents', '/settings', '/logs'];
dashboardRoutes.forEach(route => {
  app.use(route, (req, res) => {
    elizaLogger.warn(`🚫 Dashboard access attempt blocked: ${req.path} from IP: ${req.ip}`);
    res.status(403).json({ 
      error: 'Dashboard access disabled',
      message: 'This is an API-only server. Dashboard access is disabled in production mode.'
    });
  });
});

// Catch all other routes - return 404
app.use('*', (req, res) => {
  elizaLogger.warn(`🚫 Unknown route accessed: ${req.originalUrl} from IP: ${req.ip}`);
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: 'This API endpoint does not exist'
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  elizaLogger.error('Server error:', err);
  
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
  elizaLogger.info(`🔒 ElizaOS Production API Server started`);
  elizaLogger.info(`📡 Port: ${PORT}`);
  elizaLogger.info(`🚫 Dashboard: DISABLED for security`);
  elizaLogger.info(`🔑 API Key: ${process.env.API_KEY ? 'REQUIRED' : 'NOT SET (DEVELOPMENT MODE)'}`);
  elizaLogger.info(`🌐 CORS: ${allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'ALL ORIGINS (INSECURE)'}`);
  elizaLogger.info(`⚡ Rate Limit: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${(parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 60000} minutes`);
});

export default app;
