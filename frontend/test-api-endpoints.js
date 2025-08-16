/**
 * Test ElizaOS API Endpoints
 * 
 * This script tests various API endpoints to understand the actual
 * ElizaOS API structure on Railway deployment.
 * Testing with Purl Agent (40608b6b-63b6-0e2c-b819-9d9850d060ec)
 */

async function testEndpoint(url, method = 'GET', body = null) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'zK=ogGk@LJZfb58qMB&e%VPnRx+H0!w?'
    }
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    console.log(`\n🧪 Testing ${method} ${url}`);
    const response = await fetch(url, config);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      try {
        const data = await response.json();
        console.log(`   ✅ Success:`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
      } catch (e) {
        console.log(`   ✅ Success: Non-JSON response`);
      }
    } else {
      try {
        const errorData = await response.text();
        console.log(`   ❌ Error:`, errorData.substring(0, 100));
      } catch (e) {
        console.log(`   ❌ Error: Could not read response`);
      }
    }
  } catch (error) {
    console.log(`   💥 Network Error:`, error.message);
  }
}

// Generate proper UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function main() {
  const BASE_URL = 'https://elizaos-production-2d55.up.railway.app';
  const AGENT_ID = '40608b6b-63b6-0e2c-b819-9d9850d060ec';
  const USER_ID = generateUUID(); // Generate proper UUID for user

  console.log('🚀 Testing ElizaOS API Endpoints');
  console.log('Base URL:', BASE_URL);
  console.log('Agent ID:', AGENT_ID);
  console.log('User ID:', USER_ID);

  // Test basic endpoints
  await testEndpoint(`${BASE_URL}/`);
  await testEndpoint(`${BASE_URL}/health`);
  
  // Test the endpoints we think should exist
  await testEndpoint(`${BASE_URL}/api/agents`);
  await testEndpoint(`${BASE_URL}/api/memory/${AGENT_ID}/memories?limit=1`);
  await testEndpoint(`${BASE_URL}/api/messaging/sessions`, 'POST', {
    agentId: AGENT_ID,
    userId: USER_ID,
    metadata: { platform: 'web', username: 'test-user', interface: 'purl-chat-app' }
  });
  
  // Test the endpoint that's failing
  await testEndpoint(`${BASE_URL}/api/chat/${AGENT_ID}`, 'POST', {
    message: 'Hello',
    roomId: 'test-room'
  });

  // Test alternative endpoints
  await testEndpoint(`${BASE_URL}/api/${AGENT_ID}/message`, 'POST', {
    text: 'Hello',
    userId: 'test-user'
  });

  await testEndpoint(`${BASE_URL}/api/agents/${AGENT_ID}/message`, 'POST', {
    text: 'Hello',
    userId: 'test-user'
  });

  // Test plugin routes we added
  await testEndpoint(`${BASE_URL}/helloworld`);

  console.log('\n✅ Testing complete!');
}

// Run if this file is executed directly
if (typeof window === 'undefined') {
  main().catch(console.error);
} else {
  // Export for browser use
  window.testElizaAPI = main;
  console.log('API tester loaded. Run window.testElizaAPI() to test endpoints.');
}
