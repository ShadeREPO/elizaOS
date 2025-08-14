import React, { useState, useEffect, useRef } from 'react';
import useElizaSession from '../hooks/useElizaSession.js';
import useConversationStorage from '../hooks/useConversationStorage.js';
import AsciiCat from './AsciiCat.jsx';
import './AgentChat.css';

/**
 * AgentChat Component
 * 
 * This component implements the official ElizaOS Sessions API pattern
 * as documented in the Sessions API Guide. It provides a clean,
 * simplified chat interface without channel management complexity.
 */

// Generate UUID for user ID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

function AgentChat({ theme = 'dark' }) {
  // Use the agent ID from your ElizaOS setup
  const [agentId] = useState('b850bc30-45f8-0041-a00a-83df46d8555d');
  const [userId] = useState(() => generateUUID());
  
  // UI state
  const [message, setMessage] = useState('');
  
  // Official Sessions API hook
  const {
    sessionId,
    sessionInfo,
    messages,
    loading,
    connected,
    error,
    sendMessage,
    addSystemMessage,
    clearMessages,
    endSession
  } = useElizaSession(agentId, userId);
  
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
  
  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start conversation tracking when session begins
  useEffect(() => {
    if (sessionId && !currentConversation) {
      console.log('🚀 [Chat API] Starting conversation tracking for session:', sessionId);
      
      startConversation({
        sessionId: sessionId,
        roomId: sessionId, // Use sessionId as roomId for Sessions API
        agentId: agentId,
        userId: userId,
        isPublic: true,
        tags: ['sessions-api', 'polling']
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
      console.log('📝 [Chat API] Tracking message:', latestMessage.type, latestMessage.content?.substring(0, 50) + '...');
      
      addMessage({
        id: latestMessage.id,
        type: latestMessage.type,
        content: latestMessage.content,
        timestamp: latestMessage.timestamp,
        metadata: {
          sessionId: sessionId,
          source: 'sessions-api-chat'
        }
      });
    }
  }, [messages, currentConversation, addMessage, sessionId]);

  // End conversation when component unmounts or session ends
  useEffect(() => {
    return () => {
      if (currentConversation) {
        console.log('🏁 [Chat API] Ending conversation tracking');
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
    if (!message.trim() || loading) return;
    
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
  
  // Handle session restart
  const handleRestart = async () => {
    await endSession();
    clearMessages();
    addSystemMessage('Starting new session...', 'info');
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
            talk to Purl
          </p>
          

        </header>

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
            <div className="chat-box">
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
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${
                msg.isAgent ? 'agent-message' : msg.isSystem ? 'system-message' : 'user-message'
              } ${msg.isThinking ? 'thinking' : ''}`}>
                
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
                      <span className="message-badge realtime">🔴 Live</span>
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
                  ) : (
                    msg.content
                  )}
                </div>
                

                
                {/* Timestamp */}
                {!msg.isSystem && (
                  <div className="message-timestamp">
                    {formatTime(msg.createdAt)}
                  </div>
                )}
              </div>
            ))}
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
                : "Say hello to Purl..."
            }
                    disabled={!connected || loading}
                    className="message-input"
                    autoComplete="off"
                  />
                  
                  <button
                    type="submit"
                    disabled={!message.trim() || !connected || loading}
                    className="send-button"
                  >
                    {loading ? '⏳' : 'Send'}
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

export default AgentChat;
