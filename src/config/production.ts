import { elizaLogger } from '@elizaos/core';

/**
 * Production Configuration for ElizaOS
 * 
 * This configuration ensures secure deployment with:
 * - API-only access (no dashboard)
 * - Rate limiting
 * - CORS protection
 * - Authentication requirements
 */

export const productionConfig = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    
    // Security settings
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
      credentials: false,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-API-Key', 'Accept', 'Accept-Encoding']
    },
    
    // Rate limiting
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      message: 'Too many requests, please try again later'
    }
  },
  
  // Security configuration
  security: {
    apiKey: process.env.API_KEY,
    requireApiKey: process.env.REQUIRE_API_KEY === 'true' || process.env.NODE_ENV === 'production',
    disableDashboard: process.env.DISABLE_DASHBOARD === 'false' || process.env.NODE_ENV === 'production',
    apiOnlyMode: process.env.API_ONLY_MODE === 'false' || process.env.NODE_ENV === 'production'
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'info'),
    enableDashboardLogs: process.env.NODE_ENV !== 'production'
  }
};

/**
 * Validate production configuration
 */
export function validateProductionConfig(): boolean {
  const config = productionConfig;
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Validate required production settings
    if (!config.security.apiKey) {
      elizaLogger.error('🚨 PRODUCTION ERROR: API_KEY is required in production mode');
      return false;
    }
    
    if (config.server.cors.origin.length === 0) {
      elizaLogger.warn('⚠️ SECURITY WARNING: No CORS origins specified. This allows all origins.');
    }
    
    if (!config.security.disableDashboard) {
      elizaLogger.error('🚨 SECURITY ERROR: Dashboard must be disabled in production (DISABLE_DASHBOARD=true)');
      return false;
    }
    
    elizaLogger.info('✅ Production configuration validated successfully');
    elizaLogger.info(`🔒 Security Mode: API-only (dashboard disabled)`);
    elizaLogger.info(`🔑 API Key: Required`);
    elizaLogger.info(`🌐 CORS Origins: ${config.server.cors.origin.join(', ') || 'ALL (INSECURE)'}`);
  }
  
  return true;
}

export default productionConfig;
