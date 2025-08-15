/**
 * Test Socket.IO Connection (CommonJS version)
 */

// Simple fetch test for Socket.IO endpoint
async function testSocketIOEndpoint() {
  const BASE_URL = 'https://elizaos-production-2d55.up.railway.app';
  
  console.log('🔌 Testing Socket.IO Endpoint');
  console.log('URL:', BASE_URL);
  
  // Test the Socket.IO polling endpoint
  try {
    const response = await fetch(`${BASE_URL}/socket.io/?EIO=4&transport=polling`, {
      method: 'GET',
      headers: {
        'X-API-Key': 'zK=ogGk@LJZfb58qMB&e%VPnRx+H0!w?'
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    if (response.ok) {
      const text = await response.text();
      console.log('✅ Socket.IO endpoint responding');
      console.log('Response preview:', text.substring(0, 100) + '...');
    } else {
      const errorText = await response.text();
      console.log('❌ Socket.IO endpoint error:', errorText);
    }
  } catch (error) {
    console.log('💥 Fetch error:', error.message);
  }
}

// Call the test function
testSocketIOEndpoint().catch(console.error);
