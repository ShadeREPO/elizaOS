# 🔒 ElizaOS Production Security Guide

## 🚨 Security Issue
When hosting ElizaOS in the cloud, the default configuration exposes the full ElizaOS dashboard at the API URL, allowing anyone to access and modify your agents. This is a **critical security vulnerability** in production.

## 🎯 Solution Architecture

### Two-Codebase Deployment Strategy
1. **ElizaOS Backend** - API-only server (no dashboard)
2. **Frontend Application** - Your custom Purl interface

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│  ElizaOS API    │
│   (Public)      │    │   (Secured)     │
│                 │    │                 │
│ • Purl UI       │    │ • API Only      │
│ • User Access   │    │ • No Dashboard  │
│ • Custom Domain │    │ • Rate Limited  │
└─────────────────┘    └─────────────────┘
```

## 🛡️ ElizaOS Security Configuration

### 1. Disable Dashboard Access

Create a production configuration file to disable the dashboard:

**`config/production.json`**
```json
{
  "server": {
    "dashboard": {
      "enabled": false,
      "publicAccess": false
    },
    "api": {
      "enabled": true,
      "cors": {
        "origin": ["https://your-frontend-domain.com"],
        "credentials": false
      }
    }
  },
  "security": {
    "rateLimit": {
      "windowMs": 900000,
      "max": 100
    },
    "apiKey": {
      "required": true,
      "header": "X-API-Key"
    }
  }
}
```

### 2. Environment Variables for Production

**`.env.production`**
```bash
# Core Configuration
NODE_ENV=production
LOG_LEVEL=warn

# Security Settings
DISABLE_DASHBOARD=true
API_ONLY_MODE=true
REQUIRE_API_KEY=true
API_KEY=your-secure-api-key-here

# CORS Configuration  
ALLOWED_ORIGINS=https://your-frontend-domain.com
ALLOW_CREDENTIALS=false

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_ENABLED=true

# Database (use production DB)
DATABASE_URL=postgresql://user:pass@production-db/elizaos

# AI Provider Keys (keep these secure)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Disable unnecessary features
IGNORE_BOOTSTRAP=true
DISABLE_PLUGINS=discord,twitter,telegram
```

### 3. Modify ElizaOS Startup Configuration

**`src/production-index.ts`** (Create this file)
```typescript
import { startAgent } from '@elizaos/core';
import { character } from './character.js';

// Production-only configuration
const productionConfig = {
  // Disable dashboard completely
  dashboard: false,
  
  // API-only mode
  api: {
    enabled: true,
    port: process.env.PORT || 3000,
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
      credentials: false
    }
  },
  
  // Security middleware
  security: {
    rateLimit: true,
    apiKey: process.env.API_KEY,
    helmet: true // Security headers
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'warn',
    dashboard: false // No dashboard logs
  }
};

// Start agent with production config
startAgent(character, productionConfig);
```

### 4. Custom Server Configuration

**`src/production-server.ts`**
```typescript
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { elizaAPI } from '@elizaos/core';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow API responses
  crossOriginEmbedderPolicy: false
}));

// CORS - only allow your frontend
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: false,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-API-Key']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', limiter);

// API Key authentication middleware
const requireAPIKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
};

// Apply API key to all routes
app.use('/api', requireAPIKey);

// Mount ElizaOS API (without dashboard)
app.use('/api', elizaAPI);

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Block all other routes (no dashboard)
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔒 ElizaOS API server running on port ${PORT} (Production Mode)`);
  console.log(`🚫 Dashboard access disabled for security`);
});
```

## 🚀 Deployment Instructions

### 1. ElizaOS Backend (API Server)

**Deploy to Railway/Render/Heroku:**

```bash
# Package.json scripts
{
  "scripts": {
    "start": "node dist/production-index.js",
    "build": "tsc && node dist/production-index.js",
    "start:production": "NODE_ENV=production node dist/production-server.js"
  }
}
```

**Docker Configuration:**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S elizaos -u 1001
USER elizaos

EXPOSE 3000
CMD ["npm", "run", "start:production"]
```

### 2. Frontend Deployment

**Update frontend config to use production API:**

```javascript
// frontend/utils/config.js
const config = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-elizaos-api.railway.app'  // Your secure API URL
    : 'http://localhost:3000',
    
  API_KEY: process.env.REACT_APP_API_KEY, // Set in deployment env vars
  
  // Production optimizations
  MEMORIES_POLL_INTERVAL: 30000, // 30 seconds
  CACHE_TTL: 300000, // 5 minutes
  MAX_CONCURRENT_REQUESTS: 2
};
```

**Frontend Environment Variables:**
```bash
# Vercel/Netlify environment
REACT_APP_API_KEY=your-secure-api-key-here
REACT_APP_API_URL=https://your-elizaos-api.railway.app
```

## 🔐 Security Headers for API Requests

**Update all API calls in frontend:**

```javascript
// In your hooks (useElizaMemories.js, etc.)
const response = await fetch(url, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': config.API_KEY, // Required for production
    'Accept': 'application/json'
  }
});
```

## 🧪 Testing Security

### 1. Verify Dashboard is Disabled
```bash
# Should return 404
curl https://your-elizaos-api.railway.app/

# Should return API error
curl https://your-elizaos-api.railway.app/api/agents
```

### 2. Test API Key Protection
```bash
# Should return 401
curl https://your-elizaos-api.railway.app/api/memory/agent-id

# Should work
curl -H "X-API-Key: your-key" https://your-elizaos-api.railway.app/api/memory/agent-id
```

### 3. Verify CORS Protection
```bash
# Should be blocked from unauthorized origins
curl -H "Origin: https://malicious-site.com" https://your-elizaos-api.railway.app/api/memory/agent-id
```

## 📋 Production Deployment Checklist

### Security
- [ ] Dashboard access disabled (`DISABLE_DASHBOARD=true`)
- [ ] API key authentication enabled
- [ ] CORS configured for frontend domain only
- [ ] Rate limiting enabled
- [ ] Security headers (Helmet) configured
- [ ] Non-root user in Docker container

### Performance
- [ ] Production environment variables set
- [ ] Database connection pooling configured
- [ ] Logging level set to 'warn' or 'error'
- [ ] Unnecessary plugins disabled

### Monitoring
- [ ] Health check endpoint available
- [ ] Error logging configured
- [ ] Rate limit monitoring enabled

## 🚨 Emergency Access

If you need admin access to your production agent:

1. **Temporary SSH tunnel** (if using VPS):
```bash
# Create secure tunnel to production server
ssh -L 3001:localhost:3000 user@your-server
# Access dashboard via http://localhost:3001 (local only)
```

2. **Separate admin deployment** (recommended):
```bash
# Deploy second instance with dashboard enabled for admin use only
# Use different subdomain: admin-elizaos.your-domain.com
# Restrict access by IP or VPN
```

This configuration ensures your ElizaOS API is secure while maintaining full functionality for your frontend application! 🔒
