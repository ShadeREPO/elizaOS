import { useState, useEffect } from 'react';
import useConversationStorage from '../hooks/useConversationStorage.js';
import './RecentConversationTiles.css';

/**
 * RecentConversationTiles Component - Display recent conversations for cat display
 * 
 * Shows a quick overview of recent conversations in an elegant tile format
 * that integrates well with the cat display page.
 */
const RecentConversationTiles = ({ theme = 'dark', maxTiles = 4 }) => {
  const {
    recentConversations,
    conversationStats,
    refreshData,
    storageError
  } = useConversationStorage();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTile, setSelectedTile] = useState(null);

  /**
   * Refresh data periodically
   */
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      refreshData();
    }, 60000); // Refresh every minute

    return () => clearInterval(refreshInterval);
  }, [refreshData]);

  /**
   * Handle tile click
   */
  const handleTileClick = (conversation) => {
    setSelectedTile(selectedTile?.logNumber === conversation.logNumber ? null : conversation);
  };

  /**
   * Navigate to logs page with conversation
   */
  const viewFullConversation = (logNumber) => {
    window.location.href = `/logs?search=${logNumber}`;
  };

  if (storageError) {
    return (
      <div className={`conversation-tiles ${theme}`}>
        <div className="tiles-error">
          <span>⚠️ Unable to load conversations</span>
        </div>
      </div>
    );
  }

  if (!recentConversations || recentConversations.length === 0) {
    return (
      <div className={`conversation-tiles ${theme}`}>
        <div className="tiles-empty">
          <span>💬 No recent conversations</span>
          <button 
            onClick={() => window.location.href = '/chat'}
            className="start-chat-btn"
          >
            Start chatting →
          </button>
        </div>
      </div>
    );
  }

  const displayTiles = isExpanded ? recentConversations : recentConversations.slice(0, maxTiles);

  return (
    <div className={`conversation-tiles ${theme}`}>
      {/* Header */}
      <div className="tiles-header">
        <div className="tiles-title">
          <span className="title-icon">💬</span>
          <span>Recent Chats</span>
          {conversationStats && (
            <span className="total-count">({conversationStats.total.conversations})</span>
          )}
        </div>
        
        <div className="tiles-actions">
          {recentConversations.length > maxTiles && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="expand-btn"
              title={isExpanded ? 'Show less' : 'Show more'}
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          )}
          
          <button
            onClick={() => window.location.href = '/logs'}
            className="view-all-btn"
            title="View all conversations"
          >
            📋
          </button>
        </div>
      </div>

      {/* Conversation Tiles */}
      <div className="tiles-grid">
        {displayTiles.map((conversation) => (
          <div
            key={conversation.logNumber}
            className={`conversation-tile ${conversation.isActive ? 'active' : ''} ${selectedTile?.logNumber === conversation.logNumber ? 'selected' : ''}`}
            onClick={() => handleTileClick(conversation)}
          >
            {/* Tile Header */}
            <div className="tile-header">
              <span className="tile-status">
                {conversation.isActive ? '🟢' : '⚫'}
              </span>
              <span className="tile-log-number">
                #{conversation.logNumber.split('-').pop()}
              </span>
              <span className="tile-time">
                {conversation.timeAgo}
              </span>
            </div>

            {/* Tile Content */}
            <div className="tile-content">
              <div className="tile-preview">
                {conversation.preview}
              </div>
              <div className="tile-stats">
                <span className="message-count">
                  {conversation.messageCount} msg{conversation.messageCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Tile Actions (when selected) */}
            {selectedTile?.logNumber === conversation.logNumber && (
              <div className="tile-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    viewFullConversation(conversation.logNumber);
                  }}
                  className="action-btn view-btn"
                  title="View full conversation"
                >
                  👁️ View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(conversation.logNumber);
                  }}
                  className="action-btn copy-btn"
                  title="Copy log number"
                >
                  📋 Copy
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Stats Summary */}
      {conversationStats && (
        <div className="tiles-stats">
          <div className="stat-item">
            <span className="stat-label">Today:</span>
            <span className="stat-value">{conversationStats.today.conversations} chats</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">This week:</span>
            <span className="stat-value">{conversationStats.thisWeek.messages} messages</span>
          </div>
          {conversationStats.lastSync && (
            <div className="stat-item">
              <span className="stat-label">Last sync:</span>
              <span className="stat-value">
                {new Date(conversationStats.lastSync).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="tiles-footer">
        <button
          onClick={() => window.location.href = '/chat'}
          className="footer-btn primary"
        >
          💬 New Chat
        </button>
        <button
          onClick={() => window.location.href = '/terminal'}
          className="footer-btn secondary"
        >
          🖥️ Live Feed
        </button>
      </div>
    </div>
  );
};

export default RecentConversationTiles;
