/**
 * Debug Sessions API Request Format
 */

// Generate proper UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function debugSessionsRequest() {
  const BASE_URL = 'https://elizaos-production-2d55.up.railway.app';
  const AGENT_ID = 'b850bc30-45f8-0041-a00a-83df46d8555d';
  const USER_ID = generateUUID();
  
  console.log('🔍 Debugging Sessions API Request Format');
  console.log('Base URL:', BASE_URL);
  console.log('Agent ID:', AGENT_ID);
  console.log('User ID:', USER_ID);
  
  // Test 1: Check what the frontend is actually sending
  console.log('\n1️⃣ Testing Request Data Format...');
  
  const requestData = {
    agentId: AGENT_ID,
    userId: USER_ID,
    metadata: {
      platform: 'web',
      username: 'user',
      interface: 'purl-chat-app'
    }
  };
  
  console.log('Request Data Object:', requestData);
  console.log('Request Data Type:', typeof requestData);
  console.log('Request Data JSON:', JSON.stringify(requestData, null, 2));
  
  // Test 2: Send request with explicit JSON stringification
  console.log('\n2️⃣ Testing with Explicit JSON Stringification...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/messaging/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'UIxtS%cen8KGBN*3uHO6q0+rjozsaEM9'
      },
      body: JSON.stringify(requestData)
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response Body:', responseText);
    
    if (response.ok) {
      console.log('✅ Session created successfully!');
      try {
        const responseData = JSON.parse(responseText);
        console.log('Parsed Response:', responseData);
      } catch (e) {
        console.log('❌ Could not parse response as JSON');
      }
    } else {
      console.log('❌ Session creation failed');
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
  
  // Test 3: Check if there's a Content-Type issue
  console.log('\n3️⃣ Testing Content-Type Variations...');
  
  const testCases = [
    {
      name: 'Standard JSON',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'UIxtS%cen8KGBN*3uHO6q0+rjozsaEM9'
      }
    },
    {
      name: 'JSON with charset',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-API-Key': 'UIxtS%cen8KGBN*3uHO6q0+rjozsaEM9'
      }
    },
    {
      name: 'No Content-Type',
      headers: {
        'X-API-Key': 'UIxtS%cen8KGBN*3uHO6q0+rjozsaEM9'
      }
    }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`\nTesting: ${testCase.name}`);
      
      const response = await fetch(`${BASE_URL}/api/messaging/sessions`, {
        method: 'POST',
        headers: testCase.headers,
        body: JSON.stringify(requestData)
      });
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log('✅ Success!');
        break;
      } else {
        const errorText = await response.text();
        console.log('Error:', errorText);
      }
    } catch (error) {
      console.log('❌ Failed:', error.message);
    }
  }
}

// Run the debug
debugSessionsRequest().catch(console.error);
