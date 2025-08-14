#!/usr/bin/env node

/**
 * Railway ElizaOS Endpoint Testing Script
 * 
 * This script tests all the critical endpoints that the frontend uses,
 * with proper authentication and error handling to debug deployment issues.
 */

const RAILWAY_URL = 'https://elizaos-production-2d55.up.railway.app';
const API_KEY = 'zK=ogGk@LJZfb58qMB&e%VPnRx+H0!w?';
const AGENT_ID = 'b850bc30-45f8-0041-a00a-83df46d8555d';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'X-API-Key': API_KEY,
    'User-Agent': 'Purl-Frontend-Test/1.0'
  };
}

async function testEndpoint(name, url, options = {}) {
  log('cyan', `\n🧪 Testing: ${name}`);
  log('blue', `   URL: ${url}`);
  
  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: createAuthHeaders(),
      body: options.body ? JSON.stringify(options.body) : undefined,
      ...options
    });
    
    const duration = Date.now() - startTime;
    const status = response.status;
    const statusText = response.statusText;
    
    // Log response info
    if (status >= 200 && status < 300) {
      log('green', `   ✅ ${status} ${statusText} (${duration}ms)`);
    } else if (status >= 400 && status < 500) {
      log('red', `   ❌ ${status} ${statusText} (${duration}ms)`);
    } else {
      log('yellow', `   ⚠️  ${status} ${statusText} (${duration}ms)`);
    }
    
    // Try to parse response
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
        log('blue', `   📄 Response Type: JSON`);
        
        if (status >= 200 && status < 300) {
          // Log success data summary
          if (Array.isArray(data)) {
            log('green', `   📊 Data: Array with ${data.length} items`);
          } else if (data && typeof data === 'object') {
            const keys = Object.keys(data);
            log('green', `   📊 Data: Object with keys: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
          } else {
            log('green', `   📊 Data: ${JSON.stringify(data).substring(0, 100)}...`);
          }
        } else {
          // Log error details
          if (data.error) {
            log('red', `   💥 Error: ${data.error}`);
          }
          if (data.message) {
            log('red', `   💬 Message: ${data.message}`);
          }
        }
      } catch (e) {
        log('yellow', `   ⚠️  JSON Parse Error: ${e.message}`);
        const text = await response.text();
        log('yellow', `   📄 Raw Response: ${text.substring(0, 200)}...`);
      }
    } else {
      const text = await response.text();
      log('blue', `   📄 Response Type: ${contentType || 'text/plain'}`);
      log('yellow', `   📄 Content: ${text.substring(0, 200)}...`);
    }
    
    return { success: status >= 200 && status < 300, status, data, duration };
    
  } catch (error) {
    log('red', `   💥 Network Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('bright', '🚀 Railway ElizaOS Endpoint Testing');
  log('blue', `Target: ${RAILWAY_URL}`);
  log('blue', `Agent ID: ${AGENT_ID}`);
  log('blue', `API Key: ${API_KEY.substring(0, 10)}...`);
  
  const results = {};
  
  // Test 1: Health Check
  results.health = await testEndpoint(
    'Health Check',
    `${RAILWAY_URL}/health`
  );
  
  // Test 2: Basic Server Ping
  results.ping = await testEndpoint(
    'Server Ping',
    `${RAILWAY_URL}/api/server/ping`
  );
  
  // Test 3: Agents List
  results.agents = await testEndpoint(
    'Agents List',
    `${RAILWAY_URL}/api/agents`
  );
  
  // Test 4: Specific Agent Info
  results.agentInfo = await testEndpoint(
    'Agent Info',
    `${RAILWAY_URL}/api/agents/${AGENT_ID}`
  );
  
  // Test 5: Memory API (used by frontend)
  results.memories = await testEndpoint(
    'Agent Memories',
    `${RAILWAY_URL}/api/memory/${AGENT_ID}/memories?limit=5&includeEmbedding=false`
  );
  
  // Test 6: Conversations (used by CatDisplay)
  results.conversations = await testEndpoint(
    'Agent Conversations',
    `${RAILWAY_URL}/api/memories/${AGENT_ID}/conversations`
  );
  
  // Test 7: Sessions API (used by chat)
  results.sessions = await testEndpoint(
    'Create Session',
    `${RAILWAY_URL}/api/messaging/sessions`,
    {
      method: 'POST',
      body: {
        agentId: AGENT_ID,
        userId: 'test-user-12345',
        metadata: {
          platform: 'web',
          interface: 'endpoint-test',
          timestamp: new Date().toISOString()
        }
      }
    }
  );
  
  // Test 8: Chat Endpoint (if web UI enabled)
  results.chatEndpoint = await testEndpoint(
    'Chat Web UI',
    `${RAILWAY_URL}/chat/${AGENT_ID}`
  );
  
  // Test 9: Socket.IO Endpoint
  results.socketIO = await testEndpoint(
    'Socket.IO Handshake',
    `${RAILWAY_URL}/socket.io/?transport=polling`
  );
  
  // Test 10: Direct Dashboard Access (if enabled)
  results.dashboard = await testEndpoint(
    'Dashboard Root',
    `${RAILWAY_URL}/`
  );
  
  // Summary Report
  log('bright', '\n📊 TEST SUMMARY REPORT');
  log('bright', '='.repeat(50));
  
  const successes = Object.values(results).filter(r => r.success).length;
  const total = Object.keys(results).length;
  
  log('cyan', `Overall Success Rate: ${successes}/${total} (${Math.round(successes/total*100)}%)`);
  
  // Detailed results
  for (const [test, result] of Object.entries(results)) {
    const status = result.success ? '✅' : '❌';
    const info = result.status ? `${result.status}` : 'ERROR';
    const timing = result.duration ? `${result.duration}ms` : '';
    log('blue', `${status} ${test.padEnd(20)} ${info.padEnd(10)} ${timing}`);
  }
  
  // Frontend Compatibility Analysis
  log('bright', '\n🎯 FRONTEND COMPATIBILITY ANALYSIS');
  log('bright', '='.repeat(50));
  
  if (results.health.success) {
    log('green', '✅ Health endpoint working - Railway deployment is live');
  } else {
    log('red', '❌ Health endpoint failed - Server may not be running properly');
  }
  
  if (results.agents.success) {
    log('green', '✅ Agents API working - Frontend can discover agents');
  } else {
    log('red', '❌ Agents API failed - Frontend cannot load agent list');
  }
  
  if (results.memories.success) {
    log('green', '✅ Memory API working - CatDisplay can load conversation data');
  } else {
    log('red', '❌ Memory API failed - CatDisplay will show empty tiles');
  }
  
  if (results.sessions.success) {
    log('green', '✅ Sessions API working - Chat functionality available');
  } else {
    log('red', '❌ Sessions API failed - Chat will not work');
  }
  
  if (results.chatEndpoint.success) {
    log('green', '✅ Chat endpoint working - Web UI enabled');
  } else {
    log('yellow', '⚠️  Chat endpoint failed - Web UI may be disabled (API still works)');
  }
  
  if (results.socketIO.success) {
    log('green', '✅ Socket.IO working - Real-time communication available');
  } else {
    log('red', '❌ Socket.IO failed - No real-time updates');
  }
  
  // Recommendations
  log('bright', '\n💡 RECOMMENDATIONS');
  log('bright', '='.repeat(50));
  
  if (!results.health.success) {
    log('yellow', '• Check Railway deployment logs for startup errors');
  }
  
  if (!results.agents.success || !results.memories.success) {
    log('yellow', '• Verify API_KEY environment variable is set correctly');
    log('yellow', '• Check CORS settings (ALLOWED_ORIGINS)');
  }
  
  if (!results.chatEndpoint.success) {
    log('yellow', '• Add clients: ["direct"] to character configuration');
    log('yellow', '• Set DISABLE_DASHBOARD=false in Railway environment');
  }
  
  if (results.conversations.success) {
    log('green', '• Frontend should work correctly with current backend setup');
  }
  
  log('bright', '\n🎉 Testing Complete!');
  
  return results;
}

// Run the tests
runTests().catch(console.error);

export { runTests, testEndpoint, RAILWAY_URL, API_KEY, AGENT_ID };
