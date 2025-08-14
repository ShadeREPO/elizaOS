/**
 * Simple test script to check ElizaOS connectivity
 * Run this before testing the chat integration
 */

async function testElizaConnection() {
  console.log('🧪 Testing ElizaOS Connection...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server availability...');
    const serverResponse = await fetch('http://localhost:3000/');
    console.log(`   ✅ Server status: ${serverResponse.status} ${serverResponse.statusText}`);
    
    // Test 2: Check agents endpoint
    console.log('\n2️⃣ Testing agents endpoint...');
    const agentsResponse = await fetch('http://localhost:3000/api/agents');
    
    if (agentsResponse.ok) {
      const agentsData = await agentsResponse.json();
      console.log('   ✅ Agents endpoint accessible');
      console.log('   📋 Available agents:');
      
      if (agentsData.agents && agentsData.agents.length > 0) {
        agentsData.agents.forEach((agent, index) => {
          console.log(`      ${index + 1}. ${agent.name} (ID: ${agent.id})`);
        });
      } else {
        console.log('      ⚠️  No agents found');
      }
    } else {
      console.log(`   ❌ Agents endpoint failed: ${agentsResponse.status}`);
    }
    
    // Test 3: Check if Socket.IO endpoint is available
    console.log('\n3️⃣ Testing Socket.IO endpoint...');
    const socketResponse = await fetch('http://localhost:3000/socket.io/');
    console.log(`   ✅ Socket.IO status: ${socketResponse.status}`);
    
    console.log('\n🎉 Connection test completed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Make sure ElizaOS is running: bun start');
    console.log('   2. Open your frontend app and go to /chat');
    console.log('   3. Try sending a message');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure ElizaOS is running on localhost:3000');
    console.log('   2. Check if the ElizaOS server started successfully');
    console.log('   3. Verify no firewall is blocking the connection');
  }
}

// Run the test
testElizaConnection();
