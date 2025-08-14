import { useState } from 'react';
import { getConfig } from '../utils/config.js';

/**
 * MemoryDebugger - Test component to debug ElizaOS Memory API
 * 
 * This component allows manual testing of the memory API to see
 * what data is actually being returned.
 */
const MemoryDebugger = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const AGENT_ID = 'b850bc30-45f8-0041-a00a-83df46d8555d';
  const BASE_URL = getConfig().BASE_URL;
  
  const testMemoryAPI = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('🧪 [Debug] Testing memory API...');
      
      const url = `${BASE_URL}/api/memory/${AGENT_ID}/memories?tableName=messages&includeEmbedding=false`;
      console.log('🧪 [Debug] Fetching from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🧪 [Debug] Response status:', response.status);
      console.log('🧪 [Debug] Response headers:', Object.fromEntries(response.headers));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('🧪 [Debug] Raw response data:', data);
      
      setResult({
        status: response.status,
        data: data,
        memoriesCount: data?.data?.memories?.length || 0,
        timestamp: new Date().toLocaleTimeString()
      });
      
    } catch (err) {
      console.error('🧪 [Debug] Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearResults = () => {
    setResult(null);
    setError(null);
  };
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace', 
      backgroundColor: '#001100', 
      color: '#00ff00',
      margin: '20px',
      borderRadius: '8px',
      border: '1px solid #003300'
    }}>
      <h3 style={{ color: '#00ccff', marginTop: 0 }}>🧪 Memory API Debugger</h3>
      
      <div style={{ marginBottom: '16px' }}>
        <strong>Agent ID:</strong> {AGENT_ID}
        <br />
        <strong>Endpoint:</strong> {BASE_URL}/api/memory/{AGENT_ID}/memories
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <button 
          onClick={testMemoryAPI}
          disabled={isLoading}
          style={{
            backgroundColor: '#003300',
            color: '#00ff00',
            border: '1px solid #005500',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '8px'
          }}
        >
          {isLoading ? '🔄 Testing...' : '🧪 Test Memory API'}
        </button>
        
        <button 
          onClick={clearResults}
          style={{
            backgroundColor: '#330000',
            color: '#ff6600',
            border: '1px solid #550000',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🗑️ Clear
        </button>
      </div>
      
      {error && (
        <div style={{ 
          backgroundColor: '#330000', 
          color: '#ff4444', 
          padding: '12px', 
          borderRadius: '4px',
          marginBottom: '16px',
          border: '1px solid #550000'
        }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div style={{ 
          backgroundColor: '#002200', 
          padding: '12px', 
          borderRadius: '4px',
          border: '1px solid #004400'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>✅ Response Status:</strong> {result.status}
            <br />
            <strong>📊 Memories Count:</strong> {result.memoriesCount}
            <br />
            <strong>⏰ Timestamp:</strong> {result.timestamp}
          </div>
          
          <details style={{ marginTop: '12px' }}>
            <summary style={{ cursor: 'pointer', color: '#00ccff' }}>
              📋 View Raw Response Data
            </summary>
            <pre style={{ 
              backgroundColor: '#000000', 
              padding: '12px', 
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '400px',
              fontSize: '10px',
              marginTop: '8px',
              border: '1px solid #003300'
            }}>
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </details>
          
          {result.data?.data?.memories && result.data.data.memories.length > 0 && (
            <details style={{ marginTop: '12px' }}>
              <summary style={{ cursor: 'pointer', color: '#00ccff' }}>
                🔍 View Memory Samples (First 3)
              </summary>
              <div style={{ marginTop: '8px' }}>
                {result.data.data.memories.slice(0, 3).map((memory, index) => (
                  <div key={index} style={{ 
                    backgroundColor: '#000000', 
                    padding: '8px', 
                    marginBottom: '8px',
                    borderRadius: '4px',
                    border: '1px solid #003300'
                  }}>
                    <div><strong>ID:</strong> {memory.id}</div>
                    <div><strong>Agent ID:</strong> {memory.agentId}</div>
                    <div><strong>Room ID:</strong> {memory.roomId}</div>
                    <div><strong>Entity ID:</strong> {memory.entityId}</div>
                    <div><strong>Created At:</strong> {memory.createdAt}</div>
                    <div><strong>Content:</strong></div>
                    <pre style={{ fontSize: '9px', marginLeft: '16px', color: '#cccccc' }}>
                      {JSON.stringify(memory.content, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
      
      <div style={{ 
        marginTop: '16px', 
        fontSize: '10px', 
        color: '#666666',
        borderTop: '1px solid #003300',
        paddingTop: '8px'
      }}>
        💡 <strong>Usage:</strong> Click "Test Memory API" to fetch current memories from ElizaOS.
        Check browser console for detailed logs.
      </div>
    </div>
  );
};

export default MemoryDebugger;
