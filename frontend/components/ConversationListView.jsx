import React, { useState, useEffect } from 'react';
import { useChatData } from '../contexts/ChatDataContext.jsx';

/**
 * ConversationListView - Lightweight Conversation Browser
 * 
 * Demonstrates the new lazy-loading architecture:
 * - Loads only conversation list initially (fast)
 * - Loads individual messages only when user clicks
 * - No massive data over-fetching
 * - Clean, efficient data flow
 */
const ConversationListView = ({ theme = 'dark' }) => {
  const {
    conversationList,
    loading,
    error,
    loadConversationMessages,
    getConversationPreview,
    searchConversations,
    totalConversations,
    cacheSize
  } = useChatData();

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  /**
   * Load full messages for a conversation (lazy loading)
   */
  const handleConversationClick = async (conversation) => {
    setSelectedConversation(conversation);
    setLoadingMessages(true);
    
    try {
      const messages = await loadConversationMessages(conversation.id, 50);
      setConversationMessages(messages);
      console.log(`📖 [ConversationList] Loaded ${messages.length} messages for: ${conversation.id}`);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setConversationMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  /**
   * Get preview for conversation (first 6 messages)
   */
  const handlePreviewClick = async (conversation) => {
    try {
      const preview = await getConversationPreview(conversation.id);
      console.log(`👁️ [ConversationList] Preview for ${conversation.id}:`, preview.slice(0, 2));
    } catch (err) {
      console.error('Error loading preview:', err);
    }
  };

  /**
   * Search conversations
   */
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchConversations(searchQuery, 10);
      setSearchResults(results);
      console.log(`🔍 [ConversationList] Search results:`, results.length);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    }
  };

  if (loading) {
    return (
      <div className={`conversation-list-view ${theme}`}>
        <div className="loading">
          <p>📋 Loading conversation list...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`conversation-list-view ${theme}`}>
        <div className="error">
          <p>❌ Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`conversation-list-view ${theme}`}>
      <div className="header">
        <h2>💬 Conversations ({totalConversations})</h2>
        <p>Cache: {cacheSize} items</p>
        
        {/* Search */}
        <div className="search">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>🔍 Search</button>
        </div>
      </div>

      <div className="content">
        {/* Conversation List */}
        <div className="conversation-list">
          <h3>📋 All Conversations</h3>
          {conversationList.map((conversation) => (
            <div key={conversation.id} className="conversation-item">
              <div className="conversation-info">
                <strong>{conversation.id}</strong>
                <span>{conversation.messageCount} messages</span>
                <span>{new Date(conversation.lastActivity).toLocaleDateString()}</span>
              </div>
              <div className="conversation-actions">
                <button onClick={() => handlePreviewClick(conversation)}>
                  👁️ Preview
                </button>
                <button onClick={() => handleConversationClick(conversation)}>
                  📖 Load Full
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="search-results">
            <h3>🔍 Search Results</h3>
            {searchResults.map((result, index) => (
              <div key={index} className="search-result">
                <strong>{result.conversationId}</strong>
                <p>{result.content}</p>
                <span>{new Date(result.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* Selected Conversation Messages */}
        {selectedConversation && (
          <div className="conversation-messages">
            <h3>📖 Messages: {selectedConversation.id}</h3>
            
            {loadingMessages ? (
              <p>⏳ Loading messages...</p>
            ) : (
              <div className="messages">
                {conversationMessages.map((message, index) => (
                  <div key={index} className={`message ${message.type}`}>
                    <span className="timestamp">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="type">{message.type.toUpperCase()}</span>
                    <span className="content">{message.content}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .conversation-list-view {
          padding: 20px;
          font-family: 'Courier New', monospace;
        }
        
        .conversation-list-view.dark {
          background: #1a1a1a;
          color: #00ff00;
        }
        
        .conversation-list-view.light {
          background: #ffffff;
          color: #333333;
        }
        
        .header {
          margin-bottom: 20px;
          border-bottom: 1px solid #333;
          padding-bottom: 10px;
        }
        
        .search {
          margin-top: 10px;
        }
        
        .search input {
          padding: 5px;
          margin-right: 10px;
          background: transparent;
          border: 1px solid #333;
          color: inherit;
        }
        
        .search button {
          padding: 5px 10px;
          background: transparent;
          border: 1px solid #333;
          color: inherit;
          cursor: pointer;
        }
        
        .conversation-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          border: 1px solid #333;
          margin-bottom: 5px;
        }
        
        .conversation-actions button {
          margin-left: 5px;
          padding: 3px 8px;
          background: transparent;
          border: 1px solid #333;
          color: inherit;
          cursor: pointer;
          font-size: 12px;
        }
        
        .message {
          padding: 5px;
          margin-bottom: 3px;
          border-left: 3px solid #333;
          padding-left: 10px;
        }
        
        .message.user {
          border-left-color: #0099ff;
        }
        
        .message.agent {
          border-left-color: #00ff00;
        }
        
        .timestamp {
          margin-right: 10px;
          opacity: 0.7;
        }
        
        .type {
          margin-right: 10px;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default ConversationListView;


