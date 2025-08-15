/**
 * Test script to find the correct API endpoint for adding agents to channels
 * This will help us identify which endpoint actually exists in ElizaOS
 */

const BASE_URL = 'https://elizaos-production-2d55.up.railway.app';
const API_KEY = 'UIxtS%cen8KGBN*3uHO6q0+rjozsaEM9';

// Generate a test channel ID
const TEST_CHANNEL_ID = 'test-channel-123';

async function testEndpoint(url, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    console.log(`🔍 Testing: ${method} ${url}`);
    const response = await fetch(url, options);
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json().catch(() => 'No JSON response');
      console.log(`   ✅ SUCCESS:`, data);
      return true;
    } else {
      const errorText = await response.text().catch(() => 'No error text');
      console.log(`   ❌ FAILED: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testChannelEndpoints() {
  console.log('🚀 Testing Channel Management Endpoints in ElizaOS');
  console.log('Base URL:', BASE_URL);
  console.log('Test Channel ID:', TEST_CHANNEL_ID);
  console.log('='.repeat(60));
  
  // Test 1: Check if central-channels endpoint exists
  console.log('\n1️⃣ Testing /api/messaging/central-channels endpoints...');
  await testEndpoint(`${BASE_URL}/api/messaging/central-channels`);
  await testEndpoint(`${BASE_URL}/api/messaging/central-channels/${TEST_CHANNEL_ID}`);
  await testEndpoint(`${BASE_URL}/api/messaging/central-channels/${TEST_CHANNEL_ID}/agents`, 'POST', {
    agentId: 'b850bc30-45f8-0041-a00a-83df46d8555d'
  });
  await testEndpoint(`${BASE_URL}/api/messaging/central-channels/${TEST_CHANNEL_ID}/participants`);
  
  // Test 2: Check if channels endpoint exists
  console.log('\n2️⃣ Testing /api/messaging/channels endpoints...');
  await testEndpoint(`${BASE_URL}/api/messaging/channels`);
  await testEndpoint(`${BASE_URL}/api/messaging/channels/${TEST_CHANNEL_ID}`);
  await testEndpoint(`${BASE_URL}/api/messaging/channels/${TEST_CHANNEL_ID}/agents`, 'POST', {
    agentId: 'b850bc30-45f8-0041-a00a-83df46d8555d'
  });
  await testEndpoint(`${BASE_URL}/api/messaging/channels/${TEST_CHANNEL_ID}/participants`);
  
  // Test 3: Check if rooms endpoint exists
  console.log('\n3️⃣ Testing /api/messaging/rooms endpoints...');
  await testEndpoint(`${BASE_URL}/api/messaging/rooms`);
  await testEndpoint(`${BASE_URL}/api/messaging/rooms/${TEST_CHANNEL_ID}`);
  await testEndpoint(`${BASE_URL}/api/messaging/rooms/${TEST_CHANNEL_ID}/agents`, 'POST', {
    agentId: 'b850bc30-45f8-0041-a00a-83df46d8555d'
  });
  await testEndpoint(`${BASE_URL}/api/messaging/rooms/${TEST_CHANNEL_ID}/participants`);
  
  // Test 4: Check if participants endpoint exists
  console.log('\n4️⃣ Testing /api/messaging/participants endpoints...');
  await testEndpoint(`${BASE_URL}/api/messaging/participants`);
  await testEndpoint(`${BASE_URL}/api/messaging/participants`, 'POST', {
    channelId: TEST_CHANNEL_ID,
    agentId: 'b850bc30-45f8-0041-a00a-83df46d8555d'
  });
  
  // Test 5: Check if sessions have participant management
  console.log('\n5️⃣ Testing session participant management...');
  await testEndpoint(`${BASE_URL}/api/messaging/sessions/${TEST_CHANNEL_ID}/participants`);
  await testEndpoint(`${BASE_URL}/api/messaging/sessions/${TEST_CHANNEL_ID}/participants`, 'POST', {
    agentId: 'b850bc30-45f8-0041-a00a-83df46d8555d'
  });
  
  console.log('\n✅ Channel endpoint testing complete!');
}

// Run the test
testChannelEndpoints().catch(console.error);
