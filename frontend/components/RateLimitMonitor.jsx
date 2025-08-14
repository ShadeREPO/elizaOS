import React, { useState, useEffect } from 'react';
import { getConfig, isHighLoadModeEnabled, enableHighLoadMode, disableHighLoadMode } from '../utils/config.js';

/**
 * Rate Limiting Monitor Component
 * Displays current rate limiting status and allows toggling high-load mode
 * Useful for debugging and optimizing for 200+ concurrent users
 */
function RateLimitMonitor({ 
  memoriesHook, 
  sessionHook, 
  socketHook,
  className = '',
  showToggle = true 
}) {
  const [config] = useState(getConfig());
  const [isHighLoad, setIsHighLoad] = useState(isHighLoadModeEnabled());
  const [isExpanded, setIsExpanded] = useState(false);

  // Get status from hooks
  const memoriesStatus = memoriesHook ? {
    rateLimitBackoff: memoriesHook.rateLimitBackoff || 0,
    consecutiveErrors: memoriesHook.consecutiveErrors || 0,
    isCircuitBreakerOpen: memoriesHook.isCircuitBreakerOpen || false,
    pendingRequests: memoriesHook.pendingRequests || 0,
    pollInterval: memoriesHook.pollInterval || 0,
    performanceMetrics: memoriesHook.performanceMetrics || { totalRequests: 0, cacheHits: 0 }
  } : null;

  const sessionStatus = sessionHook ? {
    loading: sessionHook.loading || false,
    error: sessionHook.error,
    lastMessageTime: sessionHook.lastMessageTime || 0
  } : null;

  const socketStatus = socketHook ? {
    connected: socketHook.connected || false,
    connecting: socketHook.connecting || false,
    error: socketHook.error
  } : null;

  // Toggle high-load mode
  const handleToggleHighLoad = () => {
    if (isHighLoad) {
      disableHighLoadMode();
    } else {
      enableHighLoadMode();
    }
    setIsHighLoad(!isHighLoad);
  };

  // Status indicators
  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getSystemStatus = () => {
    if (memoriesStatus?.isCircuitBreakerOpen) return 'error';
    if (memoriesStatus?.rateLimitBackoff > 0) return 'warning';
    if (memoriesStatus?.consecutiveErrors > 0) return 'warning';
    return 'good';
  };

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.round(ms / 60000)}m`;
  };

  const systemStatus = getSystemStatus();

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            systemStatus === 'good' ? 'bg-green-500' : 
            systemStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="font-medium text-gray-200">Rate Limit Monitor</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {showToggle && (
            <button
              onClick={handleToggleHighLoad}
              className={`px-2 py-1 rounded text-xs font-medium ${
                isHighLoad 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
              }`}
            >
              {isHighLoad ? '🚀 High Load' : '⚡ Normal'}
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-200"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {/* Quick Status */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-2">
        <div>Poll: <span className="text-gray-200">{formatTime(config.MEMORIES_POLL_INTERVAL)}</span></div>
        <div>Cache: <span className="text-gray-200">{formatTime(config.CACHE_TTL)}</span></div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-gray-700">
          {/* Configuration */}
          <div>
            <h4 className="text-xs font-medium text-gray-300 mb-1">Configuration</h4>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
              <div>Poll Interval: <span className="text-gray-200">{formatTime(config.MEMORIES_POLL_INTERVAL)}</span></div>
              <div>Cache TTL: <span className="text-gray-200">{formatTime(config.CACHE_TTL)}</span></div>
              <div>Max Concurrent: <span className="text-gray-200">{config.MAX_CONCURRENT_REQUESTS}</span></div>
              <div>Message Limit: <span className="text-gray-200">{formatTime(config.MESSAGE_MIN_INTERVAL)}</span></div>
            </div>
          </div>

          {/* Memories Status */}
          {memoriesStatus && (
            <div>
              <h4 className="text-xs font-medium text-gray-300 mb-1">Memories API</h4>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                <div>Pending: <span className={memoriesStatus.pendingRequests > 2 ? 'text-yellow-400' : 'text-gray-200'}>
                  {memoriesStatus.pendingRequests}
                </span></div>
                <div>Errors: <span className={memoriesStatus.consecutiveErrors > 0 ? 'text-yellow-400' : 'text-gray-200'}>
                  {memoriesStatus.consecutiveErrors}
                </span></div>
                <div>Requests: <span className="text-gray-200">{memoriesStatus.performanceMetrics.totalRequests}</span></div>
                <div>Cache Hits: <span className="text-green-400">
                  {memoriesStatus.performanceMetrics.cacheHits}
                </span></div>
              </div>
              
              {memoriesStatus.rateLimitBackoff > 0 && (
                <div className="text-xs text-yellow-400 mt-1">
                  ⏳ Backoff: {formatTime(memoriesStatus.rateLimitBackoff)}
                </div>
              )}
              
              {memoriesStatus.isCircuitBreakerOpen && (
                <div className="text-xs text-red-400 mt-1">
                  ⚡ Circuit Breaker OPEN
                </div>
              )}
            </div>
          )}

          {/* Session Status */}
          {sessionStatus && (
            <div>
              <h4 className="text-xs font-medium text-gray-300 mb-1">Session API</h4>
              <div className="text-xs text-gray-400">
                Status: <span className={sessionStatus.loading ? 'text-yellow-400' : 'text-gray-200'}>
                  {sessionStatus.loading ? 'Loading' : 'Ready'}
                </span>
                {sessionStatus.error && (
                  <div className="text-red-400 mt-1">Error: {sessionStatus.error}</div>
                )}
              </div>
            </div>
          )}

          {/* Socket Status */}
          {socketStatus && (
            <div>
              <h4 className="text-xs font-medium text-gray-300 mb-1">WebSocket</h4>
              <div className="text-xs text-gray-400">
                Status: <span className={
                  socketStatus.connected ? 'text-green-400' : 
                  socketStatus.connecting ? 'text-yellow-400' : 'text-red-400'
                }>
                  {socketStatus.connected ? 'Connected' : 
                   socketStatus.connecting ? 'Connecting' : 'Disconnected'}
                </span>
                {socketStatus.error && (
                  <div className="text-red-400 mt-1">Error: {socketStatus.error}</div>
                )}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="pt-2 border-t border-gray-700">
            <h4 className="text-xs font-medium text-gray-300 mb-1">Tips for 200+ Users</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Enable High Load mode for better scalability</li>
              <li>• Monitor pending requests (keep under 3)</li>
              <li>• Watch for circuit breaker warnings</li>
              <li>• Use longer polling intervals in production</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default RateLimitMonitor;

