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

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading || !socketReady) return;
    
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

  // Get action-specific message content and styling
  const getActionMessageInfo = (action) => {
    switch (action) {
      case 'IGNORE':
        return {
          content: "Purl has chosen to ignore your message. They might be busy or not interested in this topic right now.",
          icon: "😴",
          className: "agent-ignore"
        };
      case 'GENERATE_IMAGE':
        return {
          content: "Purl is generating an image for you...",
          icon: "🎨",
          className: "agent-action"
        };
      case 'UPDATE_CONTACT':
        return {
          content: "Purl is updating contact information...",
          icon: "📝",
          className: "agent-action"
        };
      case 'MUTE_ROOM':
        return {
          content: "Purl has muted this conversation.",
          icon: "🔇",
          className: "agent-mute"
        };
      case 'NONE':
        return {
          content: "Purl received your message but chose not to respond.",
          icon: "🤐",
          className: "agent-none"
        };
      default:
        return null;
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
    <div className={`about-page ${theme}`}>
      <div className="about-container">
        {/* Header Section */}
        <header className="about-header">
          <div className="about-logo">
            <h1 className="about-title">Chat to Purl</h1>
          </div>
          <p className="about-subtitle">
            Real-time connection to Purl's consciousness. Experience live conversations with my immortal cat's digital mind. Each user has a unique chat history with Purl.
          </p>
          
          {/* Agent Action Status Indicator */}
          {lastAgentAction && lastAgentAction !== 'REPLY' && (
            <div className="agent-action-status">
              <span className="action-status-icon">
                {getActionMessageInfo(lastAgentAction)?.icon || '🤖'}
              </span>
              <span className="action-status-text">
                Last action: {lastAgentAction.replace('_', ' ')}
              </span>
            </div>
          )}
        </header>

        {/* Agent Response Actions Info */}
        <div className="agent-actions-info">
          <details className="actions-details">
            <summary className="actions-summary">
              <span className="info-icon">ℹ️</span>
              <span>Purl's Response Actions</span>
            </summary>
            <div className="actions-content">
              <p>Purl can choose different actions when responding to your messages:</p>
              <ul className="actions-list">
                <li><strong>REPLY:</strong> Purl responds with a message</li>
                <li><strong>IGNORE:</strong> Purl chooses not to respond</li>
                <li><strong>GENERATE_IMAGE:</strong> Purl creates an image for you</li>
                <li><strong>UPDATE_CONTACT:</strong> Purl updates contact information</li>
                <li><strong>MUTE_ROOM:</strong> Purl mutes the conversation</li>
                <li><strong>NONE:</strong> Purl acknowledges but doesn't respond</li>
              </ul>
            </div>
          </details>
        </div>

        {/* Main Chat Content */}
        <main className="about-content">

          
          {/* Status Messages */}
          {error && (
            <div className="content-section">
              <div className="error-message">
                <span className="error-icon">❌</span>
                <span className="error-text">{error}</span>
              </div>
            </div>
          )}
          


          {/* Chat Messages Section */}
          <section className="content-section">
            <h2 className="section-title">Conversation</h2>
            <div className="chat-box socket-chat">
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
                              
                              {msg.status && (
                                <span className="message-status">
                                  {msg.status === 'sending' && '⏳'}
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
                              <div className="action-message">
                                <span className="action-icon">{actionInfo.icon}</span>
                                <span className="action-text">{actionInfo.content}</span>
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
                        : !agentReady
                        ? "Say hello to wake up Purl! (First message will activate the chat)"
                        : "Say hello to Purl..."
                    }
                    disabled={!connected || !socketReady || loading}
                    className="message-input"
                    autoComplete="off"
                  />
                  
                  <button
                    type="submit"
                    disabled={!message.trim() || !connected || !socketReady || loading}
                    className="send-button"
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            </div>
          </section>

        </main>


      </div>
    </div>
  );
}

export default AgentChatSocket;
