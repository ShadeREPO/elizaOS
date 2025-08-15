/**
 * Debug Sessions API 500 Error
 */

// Generate proper UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function debugSessionsAPI() {
  const BASE_URL = 'https://elizaos-production-2d55.up.railway.app';
  const AGENT_ID = 'b850bc30-45f8-0041-a00a-83df46d8555d';
  const USER_ID = generateUUID();
  
  console.log('🔍 Debugging Sessions API 500 Error');
  console.log('Base URL:', BASE_URL);
  console.log('Agent ID:', AGENT_ID);
  console.log('User ID:', USER_ID);
  
  // Test 1: Check if sessions endpoint exists
  console.log('\n1️⃣ Testing Sessions Endpoint Existence...');
  try {
    const response = await fetch(`${BASE_URL}/api/messaging/sessions`, {
      method: 'OPTIONS',
      headers: {
        'X-API-Key': 'UIxtS%cen8KGBN*3uHO6q0+rjozsaEM9'
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
  } catch (error) {
    console.log('❌ OPTIONS request failed:', error.message);
  }
  
  // Test 2: Try to create session with detailed error logging
  console.log('\n2️⃣ Testing Session Creation with Error Details...');
  try {
    const sessionData = {
      agentId: AGENT_ID,
      userId: USER_ID,
      metadata: { 
        platform: 'web',
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('Request Data:', JSON.stringify(sessionData, null, 2));
    
    const response = await fetch(`${BASE_URL}/api/messaging/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'UIxtS%cen8KGBN*3uHO6q0+rjozsaEM9'
      },
      body: JSON.stringify(sessionData)
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response Body:', responseText);
    
    if (response.ok) {
      console.log('✅ Session created successfully!');
    } else {
      console.log('❌ Session creation failed');
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error Details:', JSON.stringify(errorData, null, 2));
      } catch (e) {
        console.log('Raw Error Response:', responseText);
      }
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
  
  // Test 3: Check database connectivity
  console.log('\n3️⃣ Testing Database Connectivity...');
  try {
    const response = await fetch(`${BASE_URL}/api/agents`, {
      headers: {
        'X-API-Key': 'UIxtS%cen8KGBN*3uHO6q0+rjozsaEM9'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Database connectivity confirmed');
      console.log('Available agents:', data.data?.length || 0);
    } else {
      console.log('❌ Database connectivity issue');
    }
  } catch (error) {
    console.log('❌ Database test failed:', error.message);
  }
}

// Run the debug
debugSessionsAPI().catch(console.error);
