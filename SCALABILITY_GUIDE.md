# 🚀 Scalability Guide: Supporting 200+ Concurrent Users

This guide explains how to configure and optimize your PURL Agent to handle high-load scenarios with 200+ concurrent users while avoiding rate limit issues.

## 🔧 Quick Fix for Current Rate Limit Issues

If you're seeing rate limit warnings with just one browser connection, apply these immediate fixes:

### 1. Enable High Load Mode

Add this to your URL or component:
```javascript
import { enableHighLoadMode } from './frontend/utils/config.js';

// Enable high load mode
enableHighLoadMode();
```

Or visit: `http://localhost:5174?highload=true`

### 2. Environment Variables

Create a `.env` file with these settings:
```bash
# High-load rate limiting configuration
API_RATE_LIMIT_REQUESTS=500
MEMORY_API_RATE_LIMIT_REQUESTS=200
FRONTEND_POLL_INTERVAL=90000
FRONTEND_CACHE_TTL=45000
```

## 📊 Current Optimizations Applied

### Frontend Optimizations ✅

1. **Increased Polling Intervals**
   - Memories API: 60-90 seconds (was 30s)
   - Session API: 5-7 seconds (was 1.5s)
   - Adaptive backoff up to 30 minutes

2. **Enhanced Caching**
   - Cache TTL: 30-45 seconds (was 10s)
   - Smarter cache invalidation
   - Request deduplication

3. **Rate Limiting Intelligence**
   - Exponential backoff with jitter
   - Circuit breaker pattern (opens after 5 errors)
   - Request throttling (max 2-3 concurrent)
   - Message limiting (2-3 seconds between messages)

4. **Configuration System**
   - Environment-based configuration
   - High-load mode toggle
   - Development vs production settings

### Backend Considerations 📝

The rate limiting is implemented at the ElizaOS core level using `express-rate-limit`. The optimizations focus on reducing frontend request frequency and implementing intelligent backoff strategies.

## 🎛️ Configuration Options

### High Load Configuration (200+ Users)

```javascript
// In frontend/utils/config.js
const HIGH_LOAD_CONFIG = {
  MEMORIES_POLL_INTERVAL: 90000, // 1.5 minutes
  SESSION_POLL_INTERVAL: 7000,   // 7 seconds
  CACHE_TTL: 45000,              // 45 seconds
  MESSAGE_MIN_INTERVAL: 3000,    // 3 seconds between messages
  MAX_CONCURRENT_REQUESTS: 2,    // Fewer concurrent requests
};
```

### Normal Configuration (< 50 Users)

```javascript
const DEFAULT_CONFIG = {
  MEMORIES_POLL_INTERVAL: 60000, // 1 minute
  SESSION_POLL_INTERVAL: 5000,   // 5 seconds
  CACHE_TTL: 30000,              // 30 seconds
  MESSAGE_MIN_INTERVAL: 2000,    // 2 seconds between messages
  MAX_CONCURRENT_REQUESTS: 3,
};
```

## 🔍 Monitoring and Debugging

### Use the Rate Limit Monitor

Add the monitoring component to your app:

```jsx
import RateLimitMonitor from './components/RateLimitMonitor.jsx';
import useElizaMemories from './hooks/useElizaMemories.js';

function App() {
  const memoriesHook = useElizaMemories(agentId);
  
  return (
    <div>
      {/* Your app content */}
      
      {/* Rate limit monitor - remove in production */}
      <RateLimitMonitor 
        memoriesHook={memoriesHook}
        className="fixed bottom-4 right-4 w-80"
      />
    </div>
  );
}
```

### Key Metrics to Watch

1. **Pending Requests**: Should stay under 3
2. **Consecutive Errors**: Watch for spikes
3. **Circuit Breaker**: Should rarely open
4. **Cache Hit Rate**: Higher is better
5. **Poll Intervals**: Should adapt to load

## 🚨 Troubleshooting Rate Limits

### Symptoms
- "Rate limit exceeded for IP: 127.0.0.1" warnings
- Slow or failed API responses
- Circuit breaker opening frequently

### Solutions

1. **Immediate Relief**
   ```bash
   # Enable high load mode
   localStorage.setItem('highLoadMode', 'true');
   window.location.reload();
   ```

2. **Long-term Scaling**
   - Increase server rate limits (if you control the backend)
   - Use CDN for static assets
   - Implement server-side caching
   - Consider WebSocket for real-time updates

3. **Frontend Optimizations**
   - Reduce polling frequency during inactivity
   - Implement smarter caching strategies
   - Use request batching
   - Add connection pooling

## ⚡ Performance Best Practices

### For 200+ Concurrent Users

1. **Polling Strategy**
   - Use 90+ second intervals for memories
   - Implement user activity detection
   - Reduce polling when user is inactive

2. **Caching Strategy**
   - Cache responses for 45+ seconds
   - Use browser storage for frequently accessed data
   - Implement cache warming

3. **Request Management**
   - Limit concurrent requests to 2 per user
   - Use request queuing
   - Implement request prioritization

4. **Error Handling**
   - Graceful degradation on rate limits
   - User-friendly error messages
   - Automatic retry with backoff

## 📈 Scaling Beyond 200 Users

For even higher loads (500+ users):

1. **Backend Optimizations**
   - Increase ElizaOS rate limits
   - Use Redis for session storage
   - Implement horizontal scaling

2. **Frontend Architecture**
   - Consider WebSocket for real-time updates
   - Implement request batching
   - Use service workers for background requests

3. **Infrastructure**
   - Use load balancers
   - Implement CDN
   - Database read replicas

## 🛠️ Implementation Checklist

- [x] Frontend polling intervals optimized
- [x] Intelligent caching implemented
- [x] Rate limiting with backoff and circuit breaker
- [x] Configuration system for different load levels
- [x] Monitoring component for debugging
- [ ] Connection pooling and request batching
- [ ] WebSocket fallback for high-load scenarios
- [ ] Server-side rate limit configuration

## 🔧 Environment Variables Reference

```bash
# Rate limiting
API_RATE_LIMIT_REQUESTS=500          # Requests per minute per IP
MEMORY_API_RATE_LIMIT_REQUESTS=200   # Memory API requests per minute
WS_MAX_CONNECTIONS_PER_IP=10         # WebSocket connections per IP

# Frontend performance
FRONTEND_POLL_INTERVAL=90000         # Polling interval in ms
FRONTEND_CACHE_TTL=45000             # Cache timeout in ms
FRONTEND_MAX_CONCURRENT=2            # Max concurrent requests

# Circuit breaker
CIRCUIT_BREAKER_THRESHOLD=5          # Errors before opening
CIRCUIT_BREAKER_TIMEOUT=300000       # Timeout before retry (5 min)
```

## 📞 Support

If you continue to experience rate limiting issues:

1. Check the Rate Limit Monitor for specific metrics
2. Enable high load mode
3. Verify environment variables are set correctly
4. Consider backend rate limit adjustments if you control the ElizaOS instance

The optimizations implemented should handle 200+ concurrent users effectively while maintaining a responsive user experience.

