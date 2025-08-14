import { useState, useEffect, useRef } from 'react';
import { tilePreviewService } from '../services/TilePreviewService.js';

/**
 * ChatLogPreview Component - Modal Preview for Chat Logs
 * Features:
 * - Displays real chat log preview with actual user/agent messages
 * - Terminal/retro styling matching the app theme
 * - Shows conversation messages with proper formatting
 * - Link to view full chat log in logs page
 * - Smooth animations and backdrop
 * - Close on escape key or outside click
 */
const ChatLogPreview = ({ 
  isVisible, 
  onClose, 
  cellData, 
  theme = 'dark' 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [previewMessages, setPreviewMessages] = useState([]);
  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  // Load conversation messages on-demand when tile is clicked
  useEffect(() => {
    if (cellData?.hasConversation && cellData?.conversationData?.conversationId) {
      const conversationId = cellData.conversationData.conversationId;
      
      const loadMessages = async () => {
        setLoadingMessages(true);
        try {
          console.log(`🎯 [TilePreview] Loading messages for conversation: ${conversationId}`);
          const preview = await tilePreviewService.getConversationPreview(conversationId);
          setPreviewMessages(preview.messages || []);
          
          if (preview.source) {
            console.log(`📦 [TilePreview] Loaded ${preview.messages.length} messages from ${preview.source}`);
          }
        } catch (error) {
          console.error('❌ [TilePreview] Failed to load messages:', error);
          setPreviewMessages([]);
        } finally {
          setLoadingMessages(false);
        }
      };

      loadMessages();
    } else {
      setPreviewMessages([]);
    }
  }, [cellData?.conversationData?.conversationId]);

  let chatData = null;
  
  if (cellData) {
    const { row, col, hasConversation, conversationData } = cellData;
    
    if (hasConversation && conversationData) {      
      // Use real conversation data with on-demand loaded messages
      chatData = {
        id: conversationData.conversationId,
        title: `Chat Log ${conversationData.logNumber}`,
        participants: [
          { name: 'User', role: 'Human' },
          { name: 'Purl', role: 'Digital Cat' }
        ],
        messageCount: conversationData.messageCount,
        lastActivity: new Date(conversationData.startTime),
        messages: previewMessages, // On-demand loaded messages
        status: conversationData.isActive ? 'active' : 'completed',
        tags: ['real-chat', 'public-log', conversationData.isActive ? 'ongoing' : 'finished'],
        logNumber: conversationData.logNumber,
        isEmpty: false,
        loading: loadingMessages // Show loading state
      };
    } else {
      // Empty tile - no preview data
      chatData = {
        id: `empty-${row}-${col}`,
        title: `Empty Tile [${row}, ${col}]`,
        participants: [],
        messageCount: 0,
        lastActivity: new Date(),
        messages: [],
        status: 'empty',
        tags: ['empty-tile'],
        isEmpty: true
      };
    }
  }

  // OPTIMIZATION: Removed automatic refreshMemories() - use cached data from context only
  // This prevents hundreds of API requests when clicking tiles

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose]);

  // Handle backdrop click to close
  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  // Format timestamp for display
  const formatTimestamp = (date) => {
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  // Get status color based on theme and status
  const getStatusColor = (status) => {
    const colors = {
      dark: {
        resolved: '#10b981', // green
        active: '#f59e0b',   // amber
        archived: '#6b7280'  // gray
      },
      light: {
        resolved: '#059669',
        active: '#d97706',
        archived: '#4b5563'
      }
    };
    return colors[theme][status] || colors[theme].archived;
  };

  if (!isVisible || !chatData) return null;

  // Simple popup for empty tiles
  if (chatData.isEmpty) {
    return (
      <div 
        ref={backdropRef}
        className={`chat-preview-backdrop ${theme} ${isAnimating ? 'animating' : ''}`}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme === 'dark' 
            ? 'rgba(0, 0, 0, 0.8)' 
            : 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          opacity: isAnimating ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      >
        <div 
          className={`empty-tile-popup ${theme}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: theme === 'dark' ? '#0a0a0a' : '#ffffff',
            border: theme === 'dark' 
              ? '1px solid rgba(0, 255, 0, 0.3)' 
              : '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            maxWidth: '300px',
            boxShadow: theme === 'dark'
              ? '0 0 30px rgba(0, 255, 0, 0.1), inset 0 0 20px rgba(0, 255, 0, 0.05)'
              : '0 20px 50px rgba(0, 0, 0, 0.1)',
            transform: isAnimating ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
            transition: 'transform 0.3s ease',
            fontFamily: "'Courier New', monospace"
          }}
        >
          <div style={{
            fontSize: '2rem',
            marginBottom: '1rem'
          }}>
            🚫
          </div>
          <div style={{
            color: theme === 'dark' ? '#fff' : '#0f172a',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}>
            No logs here!
          </div>
          <div style={{
            color: theme === 'dark' ? '#a0a0a0' : '#64748b',
            fontSize: '0.9rem',
            marginBottom: '1.5rem'
          }}>
            This tile is empty - no conversation data yet.
          </div>
          <button
            onClick={onClose}
            style={{
              background: theme === 'dark' ? '#ba8259' : '#a67c52',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = theme === 'dark' ? '#d4946b' : '#8b5cf6';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = theme === 'dark' ? '#ba8259' : '#a67c52';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Got it!
          </button>
        </div>
      </div>
    );
  }

  // Full modal for tiles with conversation data
  return (
    <div 
      ref={backdropRef}
      className={`chat-preview-backdrop ${theme} ${isAnimating ? 'animating' : ''}`}
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: theme === 'dark' 
          ? 'rgba(0, 0, 0, 0.8)' 
          : 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        opacity: isAnimating ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
    >
      <div 
        ref={modalRef}
        className={`chat-preview-modal ${theme}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme === 'dark' ? '#0a0a0a' : '#ffffff',
          border: theme === 'dark' 
            ? '1px solid rgba(0, 255, 0, 0.3)' 
            : '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1.5rem',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: theme === 'dark'
            ? '0 0 30px rgba(0, 255, 0, 0.1), inset 0 0 20px rgba(0, 255, 0, 0.05)'
            : '0 20px 50px rgba(0, 0, 0, 0.1)',
          transform: isAnimating ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
          transition: 'transform 0.3s ease',
          fontFamily: "'Courier New', monospace"
        }}
      >
        {/* CSS Styles for ChatLogPreview */}
        <style jsx>{`
          .preview-message.user {
            padding: 8px 12px;
            margin: 4px 0;
            border-radius: 6px;
            border-left: 3px solid ${theme === 'dark' ? '#8b5cf6' : '#7c3aed'};
            background: ${theme === 'dark' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)'};
          }
          
          .preview-message.agent {
            padding: 8px 12px;
            margin: 4px 0;
            border-radius: 6px;
            border-left: 3px solid ${theme === 'dark' ? '#ba8259' : '#a67c52'};
            background: ${theme === 'dark' ? 'rgba(186, 130, 89, 0.15)' : 'rgba(186, 130, 89, 0.1)'};
          }
          
          .message-sender.user-sender {
            color: ${theme === 'dark' ? '#a78bfa' : '#7c3aed'};
            font-weight: bold;
          }
          
          .message-sender.agent-sender {
            color: ${theme === 'dark' ? '#fbbf24' : '#ba8259'};
            font-weight: bold;
          }
          
          .message-content {
            color: ${theme === 'dark' ? '#e5e7eb' : '#374151'};
          }
          
          .preview-action-btn.primary {
            background: ${theme === 'dark' ? '#ba8259' : '#a67c52'};
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-family: inherit;
            font-weight: 500;
            transition: all 0.2s ease;
          }
          
          .preview-action-btn.primary:hover:not(:disabled) {
            background: ${theme === 'dark' ? '#d4946b' : '#d4946b'};
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(186, 130, 89, 0.3);
          }
          
          .preview-action-btn.primary:disabled {
            background: ${theme === 'dark' ? '#666' : '#9ca3af'};
            cursor: not-allowed;
            opacity: 0.6;
          }
          
          .preview-action-btn.secondary {
            background: transparent;
            color: ${theme === 'dark' ? '#a0a0a0' : '#64748b'};
            border: 1px solid ${theme === 'dark' ? '#333' : '#e2e8f0'};
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.2s ease;
          }
          
          .preview-action-btn.secondary:hover {
            background: ${theme === 'dark' ? '#1a1a1a' : '#f8fafc'};
            border-color: ${theme === 'dark' ? '#555' : '#cbd5e1'};
          }
          
          .preview-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid ${theme === 'dark' ? '#333' : '#e2e8f0'};
          }
          
          .preview-header h3 {
            margin: 0;
            color: ${theme === 'dark' ? '#fff' : '#0f172a'};
            font-size: 1.2rem;
            font-weight: 600;
          }
          
          .preview-close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: ${theme === 'dark' ? '#a0a0a0' : '#64748b'};
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: all 0.2s ease;
          }
          
          .preview-close-btn:hover {
            background: ${theme === 'dark' ? '#1a1a1a' : '#f8fafc'};
            color: ${theme === 'dark' ? '#fff' : '#0f172a'};
          }
          
          .preview-participants, .preview-messages, .preview-tags {
            margin-bottom: 1.5rem;
          }
          
          .preview-participants h4, .preview-messages h4 {
            margin: 0 0 0.75rem 0;
            color: ${theme === 'dark' ? '#e5e7eb' : '#374151'};
            font-size: 1rem;
            font-weight: 600;
          }
          
          .participants-list {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
          
          .participant-tag {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            border: 1px solid;
            font-weight: 500;
          }
          
          .participant-tag.user-participant {
            background: ${theme === 'dark' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)'};
            color: ${theme === 'dark' ? '#a78bfa' : '#7c3aed'};
            border-color: ${theme === 'dark' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'};
          }
          
          .participant-tag.agent-participant {
            background: ${theme === 'dark' ? 'rgba(186, 130, 89, 0.15)' : 'rgba(186, 130, 89, 0.1)'};
            color: ${theme === 'dark' ? '#fbbf24' : '#ba8259'};
            border-color: ${theme === 'dark' ? 'rgba(186, 130, 89, 0.3)' : 'rgba(186, 130, 89, 0.2)'};
          }
          
          .messages-container {
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid ${theme === 'dark' ? '#333' : '#e2e8f0'};
            border-radius: 6px;
            padding: 8px;
            background: ${theme === 'dark' ? '#1a1a1a' : '#f8fafc'};
          }
          
          .empty-preview {
            text-align: center;
            padding: 2rem 1rem;
          }
          
          .more-messages {
            text-align: center;
            color: ${theme === 'dark' ? '#888' : '#64748b'};
            font-style: italic;
            padding: 8px 0;
            font-size: 0.9rem;
          }
          
          .tags-container {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
          }
          
          .tag-item {
            background: ${theme === 'dark' ? '#0d4f3c' : '#dcfce7'};
            color: ${theme === 'dark' ? '#34d399' : '#166534'};
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.75rem;
            font-weight: 500;
          }
          
          .preview-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid ${theme === 'dark' ? '#333' : '#e2e8f0'};
          }
        `}</style>

        {/* Header */}
        <div className="preview-header">
          <div>
            <h3>
              {chatData.title}
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '0.5rem',
              fontSize: '0.9rem',
              color: theme === 'dark' ? '#a0a0a0' : '#64748b'
            }}>
              <span>Grid [{cellData.row}, {cellData.col}]</span>
              <span>•</span>
              <span>{formatTimestamp(chatData.lastActivity)}</span>
              <span>•</span>
              <span style={{ color: getStatusColor(chatData.status) }}>
                {chatData.status.toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="preview-close-btn"
          >
            ×
          </button>
        </div>

        {/* Participants */}
        <div className="preview-participants">
          <h4>
            Participants ({chatData.participants.length})
          </h4>
          <div className="participants-list">
            {chatData.participants.map((participant, index) => (
              <span
                key={index}
                className={`participant-tag ${participant.name.toLowerCase() === 'user' ? 'user-participant' : 'agent-participant'}`}
              >
                {participant.name} ({participant.role})
              </span>
            ))}
          </div>
        </div>

        {/* Message Preview */}
        <div className="preview-messages">
          <h4>
            Recent Messages {chatData.loading && <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>- Loading...</span>}
          </h4>
          <div className="messages-container">
            {chatData.loading ? (
              <div className="loading-preview">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem 1rem',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: `2px solid ${theme === 'dark' ? '#333' : '#e2e8f0'}`,
                    borderTop: `2px solid ${theme === 'dark' ? '#ba8259' : '#a67c52'}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <span style={{ 
                    color: theme === 'dark' ? '#a0a0a0' : '#64748b',
                    fontStyle: 'italic',
                    fontSize: '0.9rem'
                  }}>
                    Loading messages from server...
                  </span>
                </div>
                <style jsx>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : chatData.isEmpty ? (
              <div className="empty-preview">
                <span style={{ 
                  color: theme === 'dark' ? '#666' : '#9ca3af',
                  fontStyle: 'italic' 
                }}>
                  No conversation data available for this tile
                </span>
              </div>
            ) : chatData.messages && chatData.messages.length > 0 ? (
              <>
                {chatData.messages.slice(0, 4).map((message, index) => (
                  <div
                    key={index}
                    className={`preview-message ${message.type}`}
                  >
                    <span className={`message-sender ${message.type === 'user' ? 'user-sender' : 'agent-sender'}`}>
                      {message.sender}:
                    </span>{' '}
                    <span className="message-content">
                      {message.content && message.content.length > 150 
                        ? message.content.substring(0, 150) + '...' 
                        : message.content || 'No content'
                      }
                    </span>
                  </div>
                ))}
                {chatData.messageCount > chatData.messages.length && (
                  <div className="more-messages">
                    ... and {chatData.messageCount - chatData.messages.length} more messages
                  </div>
                )}
              </>
            ) : (
              <div className="empty-preview">
                <span style={{ 
                  color: theme === 'dark' ? '#666' : '#9ca3af',
                  fontStyle: 'italic' 
                }}>
                  No messages found for this conversation
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {chatData.tags.length > 0 && (
          <div className="preview-tags">
            <div className="tags-container">
              {chatData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="tag-item"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="preview-actions">
          <button
            onClick={onClose}
            className="preview-action-btn secondary"
          >
            Close
          </button>
          <button
            onClick={() => {
              console.log(`🔗 Opening full chat log: ${chatData.id}`);
              // Navigate directly to the specific conversation
              window.location.href = `/logs?id=${encodeURIComponent(chatData.id)}`;
            }}
            className="preview-action-btn primary"
          >
            View Full Chat →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatLogPreview;
