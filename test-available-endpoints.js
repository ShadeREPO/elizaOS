/**
 * Discover All Available ElizaOS Endpoints
 */

async function discoverEndpoints() {
  const BASE_URL = 'https://elizaos-production-2d55.up.railway.app';
  const AGENT_ID = 'b850bc30-45f8-0041-a00a-83df46d8555d';
  
  console.log('🔍 Discovering All Available ElizaOS Endpoints');
  console.log('Base URL:', BASE_URL);
  
  const endpoints = [
    // Core API endpoints
    '/api/agents',
    '/api/agents/' + AGENT_ID,
    '/api/memory/' + AGENT_ID + '/memories',
    
    // Sessions API (we know this works)
    '/api/messaging/sessions',
    
    // Frontend is looking for these (likely 404s)
    '/api/memories/' + AGENT_ID + '/conversations',
    '/api/chat/' + AGENT_ID,
    '/api/' + AGENT_ID + '/message',
    '/api/agents/' + AGENT_ID + '/message',
    
    // Alternative patterns
    '/api/conversations',
    '/api/messages',
    '/api/chat',
    '/api/sessions',
    
    // Health and status
    '/health',
    '/ping',
    '/status',
    '/api/status',
    
    // Root endpoints
    '/',
    '/api',
    '/api/',
    
    // Socket.IO
    '/socket.io/',
    '/socket.io/?EIO=4&transport=polling'
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const url = BASE_URL + endpoint;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Key': 'UIxtS%cen8KGBN*3uHO6q0+rjozsaEM9'
        }
      });
      
      const result = {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        exists: response.status !== 404
      };
      
      results.push(result);
      
      const statusIcon = result.exists ? '✅' : '❌';
      console.log(`${statusIcon} ${endpoint} - ${response.status} ${response.statusText}`);
      
    } catch (error) {
      results.push({
        endpoint,
        status: 'ERROR',
        statusText: error.message,
        contentType: null,
        exists: false
      });
      
      console.log(`❌ ${endpoint} - ERROR: ${error.message}`);
    }
  }
  
  console.log('\n📊 ENDPOINT DISCOVERY SUMMARY');
  console.log('================================');
  
  const working = results.filter(r => r.exists);
  const notFound = results.filter(r => !r.exists);
  
  console.log(`✅ Working Endpoints (${working.length}):`);
  working.forEach(r => console.log(`   ${r.endpoint} - ${r.status}`));
  
  console.log(`\n❌ Not Found (${notFound.length}):`);
  notFound.forEach(r => console.log(`   ${r.endpoint} - ${r.status}`));
  
  console.log('\n🎯 FRONTEND COMPATIBILITY ANALYSIS');
  console.log('==================================');
  
  // Check what frontend needs vs what's available
  const frontendNeeds = [
    '/api/memories/' + AGENT_ID + '/conversations',
    '/api/chat/' + AGENT_ID,
    '/api/messaging/sessions'
  ];
  
  frontendNeeds.forEach(need => {
    const found = results.find(r => r.endpoint === need);
    if (found && found.exists) {
      console.log(`✅ ${need} - AVAILABLE`);
    } else {
      console.log(`❌ ${need} - MISSING (Frontend will fail)`);
    }
  });
  
  return results;
}

// Run discovery
discoverEndpoints().catch(console.error);
