import React, { useState, useEffect, useRef } from 'react';
import useElizaSocketIO from '../hooks/useElizaSocketIO.js';
import useConversationStorage from '../hooks/useConversationStorage.js';
import AsciiCat from './AsciiCat.jsx';
import './AgentChatSocket.css';

/**
 * AgentChatSocket Component - Socket.IO Real-time Implementation
 * 
 * This component implements the official ElizaOS Socket.IO integration pattern
 * for real-time WebSocket communication. It uses direct Socket.IO events
 * for immediate message delivery and response.
 */

// Generate UUID for user ID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

function AgentChatSocket({ theme = 'dark' }) {
  // Use the agent ID from your ElizaOS setup
  const [agentId] = useState('40608b6b-63b6-0e2c-b819-9d9850d060ec');
  const [userId] = useState(() => generateUUID());
  
  // UI state
  const [message, setMessage] = useState('');
  
  // Socket.IO real-time hook
  const {
    sessionId,
    sessionInfo,
    messages,
    loading,
    connected,
    socketReady,
    isThinking,
    error,
    agentReady, // New state to track if agent is actually ready
    lastAgentAction, // Track agent's last response action
    sendMessage,
    addSystemMessage,
    clearMessages,
    endSession
  } = useElizaSocketIO(agentId, userId);
  
  // Conversation storage for logs page integration
  const {
    startConversation,
    addMessage,
    endConversation,
    currentConversation
  } = useConversationStorage();
  
  // Refs for auto-scroll and input focus
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Track previous message count to determine if new messages were added
  const prevMessageCount = useRef(0);
  
  // Auto-scroll to bottom when new messages arrive (but not on initial load)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    // Only scroll if we actually have new messages (not on initial load/empty state)
    if (messages.length > 0 && messages.length > prevMessageCount.current) {
      scrollToBottom();
    }
    // Update the previous count
    prevMessageCount.current = messages.length;
  }, [messages]);

  // Start conversation tracking when session begins
  useEffect(() => {
    if (sessionId && !currentConversation) {
      console.log('🚀 [Chat] Starting conversation tracking for session:', sessionId);
      
      startConversation({
        sessionId: sessionId,
        roomId: sessionId, // Use sessionId as roomId for Socket.IO
        agentId: agentId,
        userId: userId,
        isPublic: true,
        tags: ['socket-io', 'real-time']
      });
    }
  }, [sessionId, currentConversation, startConversation, agentId, userId]);

  // Track messages as they come in
  useEffect(() => {
    if (!currentConversation || messages.length === 0) return;
    
    // Get the latest message that hasn't been tracked yet
    const latestMessage = messages[messages.length - 1];
    
    // Only track if this is a real user or agent message (not system messages)
    if (latestMessage && (latestMessage.type === 'user' || latestMessage.type === 'agent')) {
      console.log('📝 [Chat] Tracking message:', latestMessage.type, latestMessage.content?.substring(0, 50) + '...');
      
      addMessage({
        id: latestMessage.id,
        type: latestMessage.type,
        content: latestMessage.content,
        timestamp: latestMessage.timestamp,
        metadata: {
          sessionId: sessionId,
          socketId: latestMessage.socketId,
          source: 'socket-io-chat'
        }
      });
    }
  }, [messages, currentConversation, addMessage, sessionId]);

  // End conversation when component unmounts or session ends
  useEffect(() => {
    return () => {
      if (currentConversation) {
        console.log('🏁 [Chat] Ending conversation tracking');
        endConversation({
          endedBy: 'user',
          endTime: new Date().toISOString()
        });
      }
    };
  }, [currentConversation, endConversation]);

  // Check if user can send a message (Purl must have replied to the last user message)
  const canSendMessage = () => {
    if (!connected || !socketReady || loading || isThinking) return false;
    
    // If no messages yet, user can send first message
    if (messages.length === 0) return true;
    
    // Find the last user message
    const userMessages = messages.filter(msg => !msg.isAgent && !msg.isSystem);
    if (userMessages.length === 0) return true; // No user messages yet
    
    const lastUserMessage = userMessages[userMessages.length - 1];
    
    // Find messages after the last user message
    const lastUserIndex = messages.findLastIndex(msg => msg.id === lastUserMessage.id);
    const messagesAfterLastUser = messages.slice(lastUserIndex + 1);
    
    // Check if Purl has responded with any non-system message
    const purlHasReplied = messagesAfterLastUser.some(msg => 
      msg.isAgent && !msg.isSystem
    );
    
    return purlHasReplied;
  };

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !canSendMessage()) return;
    
    const messageToSend = message.trim();
    setMessage('');
    
    // Focus back to input after sending
    setTimeout(() => inputRef.current?.focus(), 100);
    
    await sendMessage(messageToSend);
  };
  
  // Handle Enter key (send message)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  // Format message timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Enhanced action-specific message content and styling with better UX
  const getActionMessageInfo = (action) => {
    switch (action) {
      case 'IGNORE':
        return {
          content: "Purl has decided to ignore this message",
          subtitle: "They might be busy or not interested in this topic right now",
          icon: "😴",
          progressIcon: "💤",
          className: "agent-ignore",
          actionType: "ignore",
          duration: "instant"
        };
      case 'GENERATE_IMAGE':
        return {
          content: "Purl is creating an image for you",
          subtitle: "This may take a few moments while AI generates your image...",
          icon: "🎨",
          progressIcon: "✨",
          className: "agent-action generating-image",
          actionType: "create",
          duration: "long",
          animated: true
        };
      case 'UPDATE_CONTACT':
        return {
          content: "Purl is updating contact information",
          subtitle: "Processing your contact details...",
          icon: "📝",
          progressIcon: "💾",
          className: "agent-action updating-contact",
          actionType: "update",
          duration: "short"
        };
      case 'MUTE_ROOM':
        return {
          content: "Purl has muted this conversation",
          subtitle: "No further responses will be given until unmuted",
          icon: "🔇",
          progressIcon: "🔕",
          className: "agent-mute",
          actionType: "mute",
          duration: "instant"
        };
      case 'NONE':
        return {
          content: "Purl acknowledged your message",
          subtitle: "They chose not to respond this time",
          icon: "🤐",
          progressIcon: "👁️",
          className: "agent-none",
          actionType: "acknowledge",
          duration: "instant"
        };
      case 'REPLY':
        return {
          content: "Purl is crafting a response",
          subtitle: "They're thinking about what to say...",
          icon: "💭",
          progressIcon: "✍️",
          className: "agent-reply",
          actionType: "reply",
          duration: "medium",
          animated: true
        };
      default:
        return {
          content: `Purl is performing: ${action}`,
          subtitle: "Processing your request...",
          icon: "🤖",
          progressIcon: "⚡",
          className: "agent-action",
          actionType: "custom",
          duration: "medium"
        };
    }
  };

  // Handle session restart
  const handleRestart = async () => {
    await endSession();
    clearMessages();
    addSystemMessage('Starting new chat with Purl...', 'info');
  };

  // Handle image click for full-screen view
  const handleImageClick = (imageUrl, altText) => {
    // Open image in a new tab for full-screen viewing
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Generated Image - ${altText}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                background: #000; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh;
                font-family: system-ui, -apple-system, sans-serif;
              }
              img { 
                max-width: 100%; 
                max-height: 100vh; 
                border-radius: 8px;
                box-shadow: 0 8px 32px rgba(255, 255, 255, 0.1);
              }
              .image-info {
                position: fixed;
                top: 20px;
                left: 20px;
                color: white;
                background: rgba(0, 0, 0, 0.7);
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                backdrop-filter: blur(8px);
              }
              .close-btn {
                position: fixed;
                top: 20px;
                right: 20px;
                color: white;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                padding: 12px 16px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                backdrop-filter: blur(8px);
              }
              .close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
              }
            </style>
          </head>
          <body>
            <div class="image-info">🎨 AI Generated Image by Purl</div>
            <button class="close-btn" onclick="window.close()">✕ Close</button>
            <img src="${imageUrl}" alt="${altText}" />
          </body>
        </html>
      `);
    }
  };

  return (
    <div className={`fullscreen-chat-container ${theme}`}>
      {/* Fixed Header */}
      <header className="chat-header">
        <div className="header-content">
          <div className="chat-title-section">
            <h1 className="chat-title">Chat with Purl</h1>
            <p className="chat-subtitle">
              Real-time AI conversation
            </p>
          </div>
          
          {/* Connection Status */}
          <div className="connection-status">
            <div className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}>
              <div className="status-dot animate-pulse"></div>
              <span className="status-text">
                {!connected ? 'Connecting...' : !socketReady ? 'Initializing...' : 'Connected'}
              </span>
            </div>
            
            {/* Enhanced Agent Action Status */}
            {(lastAgentAction || isThinking) && (
              <div className={`agent-action-status ${isThinking ? 'thinking' : ''} ${lastAgentAction ? lastAgentAction.toLowerCase() : ''}`}>
                <div className="action-status-icon-container">
                  <span className="action-status-icon">
                    {isThinking ? '💭' : (getActionMessageInfo(lastAgentAction)?.icon || '🤖')}
                  </span>
                  {(isThinking || (lastAgentAction && getActionMessageInfo(lastAgentAction)?.animated)) && (
                    <span className="action-status-progress">
                      {isThinking ? '✨' : (getActionMessageInfo(lastAgentAction)?.progressIcon || '⚡')}
                    </span>
                  )}
                </div>
                <div className="action-status-details">
                  <span className="action-status-text">
                    {isThinking ? 'Thinking...' : 
                     lastAgentAction === 'REPLY' ? 'Responding' :
                     getActionMessageInfo(lastAgentAction)?.content || lastAgentAction?.replace('_', ' ')}
                  </span>
                  <span className="action-status-subtitle">
                    {isThinking ? 'Purl is processing your message' :
                     lastAgentAction === 'GENERATE_IMAGE' ? 'Creating your image...' :
                     lastAgentAction === 'IGNORE' ? 'Chose not to respond' :
                     lastAgentAction === 'NONE' ? 'Message acknowledged' :
                     'Action in progress'}
                  </span>
                </div>
                {(isThinking || (lastAgentAction && getActionMessageInfo(lastAgentAction)?.duration !== 'instant')) && (
                  <div className="action-status-indicator">
                    <div className="status-pulse"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="header-error">
            <span className="error-icon">❌</span>
            <span className="error-text">{error}</span>
          </div>
        )}
      </header>

      {/* Main Chat Area */}
      <main className="chat-main">
        <div className="chat-box socket-chat fullscreen">
              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <AsciiCat size="large" animated={true} expression="normal" />
                    </div>
                    <h3 className="empty-title">Ready to chat with Purl!</h3>
                    <p className="empty-description">
                      Start a conversation with Purl. Ask anything!
                    </p>
                    {!connected && (
                      <p className="empty-status">
                        Waking up Purl...
                      </p>
                    )}
                    {connected && !socketReady && (
                      <p className="empty-status">
                        Connecting to Purl...
                      </p>
                    )}
                    {connected && socketReady && !agentReady && (
                      <p className="empty-status">
                        💬 Say hello to wake up Purl! The first message will activate the chat.
                      </p>
                    )}
                    {connected && socketReady && agentReady && (
                      <p className="empty-status">
                        ✅ Purl is ready to chat! They may choose to reply, ignore, or take other actions.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="messages-list">
                    {messages.map((msg) => {
                      // Check if this is a system message with agent action
                      const actionInfo = msg.metadata?.agentAction ? getActionMessageInfo(msg.metadata.agentAction) : null;
                      const isActionMessage = actionInfo && msg.isSystem;
                      
                      return (
                        <div key={msg.id} className={`message ${
                          msg.isAgent ? 'agent-message' : msg.isSystem ? 'system-message' : 'user-message'
                        } ${msg.isThinking ? 'thinking' : ''} ${isActionMessage ? actionInfo.className : ''}`}
                             data-system-type={msg.metadata?.systemType || ''}>
                          
                          {!msg.isSystem && (
                            <div className="message-header">
                              <span className="message-author">
                                {msg.isAgent ? 'Purl' : 'You'}
                              </span>
                              
                              {msg.status && msg.status !== 'sending' && (
                                <span className="message-status">
                                  {msg.status === 'delivered' && '✓'}
                                  {msg.status === 'error' && '❌'}
                                  {msg.status === 'thinking' && '💭'}
                                </span>
                              )}
                              
                              {msg.metadata?.realTime && (
                                <span className="message-badge realtime">⚡ Live</span>
                              )}
                              
                              {msg.metadata?.direct && (
                                <span className="message-badge api">📡 API</span>
                              )}
                            </div>
                          )}
                          
                          {/* Message Content */}
                          <div className="message-content">
                            {msg.isThinking ? (
                              <div className="typing-indicator">
                                <span>{msg.content}</span>
                                <div className="typing-dots">
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                </div>
                              </div>
                            ) : isActionMessage ? (
                              <div className={`action-message ${actionInfo.className} ${actionInfo.animated ? 'animated' : ''}`}>
                                <div className="action-header">
                                  <div className="action-icon-container">
                                    <span className="action-icon">{actionInfo.icon}</span>
                                    {actionInfo.animated && (
                                      <span className="action-progress-icon">{actionInfo.progressIcon}</span>
                                    )}
                                  </div>
                                  <div className="action-details">
                                    <div className="action-title">{actionInfo.content}</div>
                                    {actionInfo.subtitle && (
                                      <div className="action-subtitle">{actionInfo.subtitle}</div>
                                    )}
                                  </div>
                                  <div className="action-status">
                                    <span className={`status-badge ${actionInfo.actionType}`}>
                                      {actionInfo.actionType}
                                    </span>
                                  </div>
                                </div>
                                
                                {actionInfo.duration !== 'instant' && (
                                  <div className="action-progress">
                                    <div className={`progress-bar ${actionInfo.duration}`}>
                                      <div className="progress-fill"></div>
                                    </div>
                                    <span className="progress-text">
                                      {actionInfo.duration === 'long' ? 'This may take a moment...' :
                                       actionInfo.duration === 'medium' ? 'Processing...' : 
                                       'Working...'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="message-text-content">
                                {msg.content}
                                
                                {/* Render image attachments */}
                                {msg.metadata?.attachments && msg.metadata.attachments.length > 0 && (
                                  <div className="message-attachments">
                                    {msg.metadata.attachments
                                      .filter(attachment => attachment.contentType === 'image' || attachment.url?.includes('img-'))
                                      .map((attachment, index) => (
                                        <div key={attachment.id || index} className="image-attachment">
                                          <div className="image-header">
                                            <span className="image-title">
                                              🎨 {attachment.title || 'Generated Image'}
                                            </span>
                                            {msg.metadata?.agentAction === 'GENERATE_IMAGE' && (
                                              <span className="image-badge">AI Generated</span>
                                            )}
                                          </div>
                                          <div className="image-container">
                                            <img 
                                              src={attachment.url} 
                                              alt={attachment.title || msg.content || 'Generated image'}
                                              className="generated-image"
                                              loading="lazy"
                                              onClick={() => handleImageClick(attachment.url, attachment.title || msg.content || 'Generated image')}
                                              onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                              }}
                                            />
                                            <div className="image-error" style={{ display: 'none' }}>
                                              <span className="error-icon">🖼️</span>
                                              <span>Image could not be loaded</span>
                                              <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="image-link">
                                                View Original
                                              </a>
                                            </div>
                                          </div>
                                          {msg.metadata?.thought && (
                                            <div className="image-caption">
                                              <span className="caption-icon">💭</span>
                                              <span className="caption-text">{msg.metadata.thought}</span>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                  </div>
                                )}
                                
                                {/* Render other attachment types */}
                                {msg.metadata?.attachments && msg.metadata.attachments.length > 0 && (
                                  <div className="other-attachments">
                                    {msg.metadata.attachments
                                      .filter(attachment => attachment.contentType !== 'image' && !attachment.url?.includes('img-'))
                                      .map((attachment, index) => (
                                        <div key={attachment.id || index} className="file-attachment">
                                          <span className="file-icon">📎</span>
                                          <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="file-link">
                                            {attachment.title || 'Attachment'}
                                          </a>
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Timestamp */}
                          {!msg.isSystem && (
                            <div className="message-timestamp">
                              {formatTime(msg.createdAt)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Global thinking indicator */}
                    {isThinking && !messages.some(msg => msg.isThinking) && (
                      <div className="message agent-message thinking">
                        <div className="message-header">
                          <span className="message-author">Purl</span>
                          <span className="message-status">💭</span>
                          <span className="message-badge realtime">⚡ Live</span>
                        </div>
                        <div className="message-content">
                          <div className="typing-indicator">
                            <span>Purl is thinking...</span>
                            <div className="typing-dots">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="chat-input-container">
                <form onSubmit={handleSubmit} className="chat-input-form">
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      !connected 
                        ? "Waking up Purl..." 
                        : !socketReady
                        ? "Connecting to Purl..."
                        : isThinking
                        ? "Purl is thinking..."
                        : !canSendMessage() && messages.length > 0
                        ? "Wait for Purl to reply..."
                        : !agentReady
                        ? "Say hello to wake up Purl! (First message will activate the chat)"
                        : "Say hello to Purl..."
                    }
                    disabled={!canSendMessage()}
                    className="message-input"
                    autoComplete="off"
                  />
                  
                  <button
                    type="submit"
                    disabled={!message.trim() || !canSendMessage()}
                    className="send-button"
                  >
                    {loading ? 'Sending...' : 
                     isThinking ? 'Thinking...' :
                     !canSendMessage() && messages.length > 0 ? 'Wait...' : 'Send'}
                  </button>
                </form>
              </div>
            </div>
      </main>

      {/* Action Info Panel (Collapsible) */}
      <div className="action-info-panel">
        <details className="actions-details">
          <summary className="actions-summary">
            <span className="info-icon">ℹ️</span>
            <span>Purl's Actions</span>
          </summary>
          <div className="actions-content">
            <p>Purl can choose different response actions:</p>
            <ul className="actions-list">
              <li><strong>REPLY:</strong> Responds with a message</li>
              <li><strong>IGNORE:</strong> Chooses not to respond</li>
              <li><strong>GENERATE_IMAGE:</strong> Creates an image</li>
              <li><strong>UPDATE_CONTACT:</strong> Updates contact info</li>
              <li><strong>MUTE_ROOM:</strong> Mutes conversation</li>
              <li><strong>NONE:</strong> Acknowledges without response</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
}

export default AgentChatSocket;
