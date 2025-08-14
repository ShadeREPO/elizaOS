import { useState, useEffect } from 'react';

/**
 * Emergency Rate Limit Monitor - Shows when rate limit protection is active
 * Displays current polling status and helps debug rate limiting issues
 */
const EmergencyRateLimitMonitor = ({ theme = 'dark' }) => {
  const [rateLimitStatus, setRateLimitStatus] = useState({
    isProtected: false,
    lastError: null,
    requestCount: 0,
    cooldownEnds: null
  });

  useEffect(() => {
    // Listen for rate limit events
    const handleRateLimit = (event) => {
      setRateLimitStatus(prev => ({
        ...prev,
        isProtected: true,
        lastError: event.detail.error,
        cooldownEnds: Date.now() + 300000 // 5 minutes
      }));
    };

    window.addEventListener('rateLimitHit', handleRateLimit);
    
    return () => {
      window.removeEventListener('rateLimitHit', handleRateLimit);
    };
  }, []);

  const resetStatus = () => {
    setRateLimitStatus({
      isProtected: false,
      lastError: null,
      requestCount: 0,
      cooldownEnds: null
    });
  };

  const themeClasses = theme === 'dark' 
    ? 'bg-black border-green-500 text-green-400'
    : 'bg-gray-100 border-gray-400 text-gray-800';

  return (
    <div className={`fixed top-4 right-4 p-4 border rounded-lg max-w-sm z-50 ${themeClasses}`}>
      <h3 className="text-sm font-bold mb-2">⚡ Rate Limit Monitor</h3>
      
      {rateLimitStatus.isProtected ? (
        <div className="space-y-2">
          <div className="text-red-500 font-bold">🚨 RATE LIMIT PROTECTION ACTIVE</div>
          <div className="text-xs">
            <div>Polling disabled for 5 minutes</div>
            <div>Last error: {rateLimitStatus.lastError}</div>
            {rateLimitStatus.cooldownEnds && (
              <div>
                Cooldown ends: {new Date(rateLimitStatus.cooldownEnds).toLocaleTimeString()}
              </div>
            )}
          </div>
          <button 
            onClick={resetStatus}
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
          >
            Force Reset
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="text-green-500 font-bold">✅ Normal Operation</div>
          <div className="text-xs">
            <div>Polling: Every 60 seconds</div>
            <div>Cache: 5 minute TTL</div>
            <div>Requests: Conservative</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyRateLimitMonitor;
