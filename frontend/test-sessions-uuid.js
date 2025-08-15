/**
 * Test Sessions API with proper UUID formats
 */

// Generate proper UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function testSessionsAPI() {
  const BASE_URL = 'https://elizaos-production-2d55.up.railway.app';
  const AGENT_ID = 'b850bc30-45f8-0041-a00a-83df46d8555d'; // Already a valid UUID
  const USER_ID = generateUUID(); // Generate proper UUID for user
  
  console.log('🚀 Testing Sessions API with proper UUIDs');
  console.log('Agent ID:', AGENT_ID);
  console.log('User ID:', USER_ID);
  
  try {
    const response = await fetch(`${BASE_URL}/api/messaging/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'zK=ogGk@LJZfb58qMB&e%VPnRx+H0!w?'
      },
      body: JSON.stringify({
        agentId: AGENT_ID,
        userId: USER_ID,
        metadata: {
          platform: 'web',
          username: 'test-user',
          interface: 'purl-chat-app'
        }
      })
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Session created:', data);
      
      // Test sending a message to the session
      if (data.sessionId) {
        console.log('\n🔄 Testing message sending...');
        const messageResponse = await fetch(`${BASE_URL}/api/messaging/sessions/${data.sessionId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'zK=ogGk@LJZfb58qMB&e%VPnRx+H0!w?'
          },
          body: JSON.stringify({
            content: 'Hello Eliza! This is a test message.',
            metadata: {
              userTimezone: 'America/New_York',
              timestamp: new Date().toISOString()
            }
          })
        });
        
        console.log(`Message Status: ${messageResponse.status} ${messageResponse.statusText}`);
        
        if (messageResponse.ok) {
          const messageData = await messageResponse.json();
          console.log('✅ Message sent successfully:', messageData);
        } else {
          const errorData = await messageResponse.text();
          console.log('❌ Message failed:', errorData);
        }
      }
    } else {
      const errorData = await response.text();
      console.log('❌ FAILED:', errorData);
    }
  } catch (error) {
    console.log('💥 ERROR:', error.message);
  }
}

testSessionsAPI().catch(console.error);
