import { useState, useEffect } from 'react';
import useConversationStorage from '../hooks/useConversationStorage.js';
import { useElizaMemoriesContext } from '../contexts/ElizaMemoriesContext.jsx';
import ChatLogPreview from './ChatLogPreview.jsx';
import { MonitorIcon, DownloadIcon, ClipboardIcon, SearchIcon, EyeIcon, CalendarIcon, ClockIcon, ChatIcon, CheckIcon, BugIcon } from './icons/Icons.jsx';
import './ConversationLogs.css';

/**
 * ConversationLogs Component - Public Directory of Chat Logs
 *
 * Features:
 * - Search conversations by log number
 * - Browse all public conversations
 * - Filter by date range and keywords
 * - Export conversation transcripts
 * - Privacy controls and anonymization
 * - Responsive design for all devices
 * - Deep links: /logs?id={conversationId}&page={n}
 */
const ConversationLogs = ({ theme = 'dark' }) => {
  // Storage hook for persistent conversation data
  const {
    getConversationsForLogs,
    searchConversations,
    conversationStats,
    refreshData,
    syncWithElizaMemory,
    storageError
  } = useConversationStorage();

  // Memories context (shared across all components)
  const {
    conversations: memoryConversations,
    memories: allMemories,
    loading: memoryLoading,
    error: memoryError,
    refreshMemories
  } = useElizaMemoriesContext();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);

  // Message pagination state for viewer
  const [messagePage, setMessagePage] = useState(1);
  const [messagesPerPage] = useState(50);

  // Chat log preview modal state
  const [showChatPreview, setShowChatPreview] = useState(false);
  const [previewCellData, setPreviewCellData] = useState(null);

  // Filter controls
  const [dateFilter, setDateFilter] = useState('all'); // 'today', 'week', 'month', 'all'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'most_active'


  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Pagination (grid of conversations)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  // Header note banner visibility
  const [showNote, setShowNote] = useState(true);
  // Metadata visibility toggle for conversation viewer
  const [showMetadata, setShowMetadata] = useState(false);
  // Calculated stats from actual conversation data
  const [calculatedStats, setCalculatedStats] = useState(null);

  /**
   * Prefer memories-based conversations (terminal method); fall back to local storage
   */
  useEffect(() => {
    const mapMemoryConversations = (memConvs = []) => {
      const now = new Date();
      return memConvs.map((conv) => {
        const start = conv.startTime instanceof Date ? conv.startTime : new Date(conv.startTime);
        const end = conv.endTime instanceof Date ? conv.endTime : (conv.endTime ? new Date(conv.endTime) : null);
        const duration = end ? (end - start) : (now - start);
        const last = Array.isArray(conv.memories) && conv.memories.length > 0
          ? conv.memories[conv.memories.length - 1]
          : null;
        return {
          conversationId: conv.roomId || conv.id,
          roomId: conv.roomId || conv.id,
          logNumber: conv.logNumber,
          startTime: (start).toISOString(),
          messageCount: conv.messageCount,
          userMessages: conv.userMessageCount,
          agentMessages: conv.agentMessageCount,
          duration,
          isActive: !!conv.isActive,
          lastMessage: last ? last.content : 'No messages',
          preview: conv.preview || (last ? String(last.content).slice(0, 50) : 'No messages'),
          isPublic: true,
        };
      });
    };

    if (memoryLoading) {
      setIsLoading(true);
      return;
    }

    if (memoryError) {
      setError(memoryError);
    } else {
      setError(null);
    }

    const memMapped = mapMemoryConversations(memoryConversations || []);

    if (memMapped.length > 0) {
      setConversations(memMapped);
      setCalculatedStats(calculateStats(memMapped));
      setIsLoading(false);
    }
  }, [memoryConversations, memoryLoading, memoryError]);

  /**
   * Initial load + handle URL search param (search and deep-link id/page)
   */
  useEffect(() => {
    refreshMemories();
    loadConversations();

    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) setSearchQuery(searchParam);

    // Handle deep link: /logs?id={conversationId}&page={n}
    const deepId = urlParams.get('id');
    const pageParam = parseInt(urlParams.get('page') || '1', 10);
    if (pageParam > 0) setMessagePage(pageParam);

    if (deepId) {
      // We’ll try to open after conversations load (see next effect)
    }
  }, []);

  /**
   * If URL contains id and conversations are available, open viewer
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const deepId = urlParams.get('id');
    if (!deepId || conversations.length === 0) return;

    const byId = conversations.find(c => c.conversationId === deepId);
    const byLog = conversations.find(c => c.logNumber === deepId);
    const target = byId || byLog;
    if (target) {
      setSelectedConversation(target);
      loadConversationMessages(target.conversationId);
    }
  }, [conversations]);

  /**
   * Filter conversations when search query or filters change
   */
  useEffect(() => {
    filterConversations();
  }, [searchQuery, conversations, dateFilter, sortBy]);

  /**
   * Load conversations from storage service (fallback)
   */
  const loadConversations = async () => {
    setIsLoading(true);
    setError(storageError);

    try {
      const data = getConversationsForLogs();
      const { conversations: conversationLogs, index: conversationIndex, events: conversationEvents } = data;

      const enrichedConversations = conversationIndex.map(conv => {
        const messages = conversationLogs.filter(log => log.conversationId === conv.conversationId);
        const events = conversationEvents.filter(event => event.conversationId === conv.conversationId);

        const startEvent = events.find(e => e.eventType === 'session_start');
        const endEvent = events.find(e => e.eventType === 'session_end');

        return {
          ...conv,
          messageCount: messages.length,
          userMessages: messages.filter(m => m.type === 'user').length,
          agentMessages: messages.filter(m => m.type === 'agent').length,
          duration: endEvent ?
            new Date(endEvent.data.endTime) - new Date(startEvent?.data?.timestamp || conv.startTime) :
            new Date() - new Date(conv.startTime),
          isActive: !endEvent,
          lastMessage: messages[messages.length - 1]?.content || 'No messages',
          preview: conv.preview || generatePreview(messages),
          isPublic: conv.isPublic !== false
        };
      });

      setConversations(prev => {
        const finalConversations = prev && prev.length > 0 ? prev : enrichedConversations;
        setCalculatedStats(calculateStats(finalConversations));
        return finalConversations;
      });
    } catch (err) {
      setError('Failed to load conversations: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /** Generate conversation preview */
  const generatePreview = (messages) => {
    const userMessages = messages.filter(m => m.type === 'user').slice(0, 3);
    if (userMessages.length === 0) return 'No user messages';
    return userMessages.map(m => m.content.slice(0, 50)).join(' | ') +
           (userMessages.length < messages.filter(m => m.type === 'user').length ? '...' : '');
  };

  /** Apply filters */
  const filterConversations = () => {
    let filtered = [...conversations];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv =>
        (conv.logNumber || '').toLowerCase().includes(query) ||
        (conv.preview || '').toLowerCase().includes(query) ||
        (conv.conversationId || '').toLowerCase().includes(query)
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(conv => new Date(conv.startTime) >= today);
        break;
      case 'week':
        filtered = filtered.filter(conv => new Date(conv.startTime) >= weekAgo);
        break;
      case 'month':
        filtered = filtered.filter(conv => new Date(conv.startTime) >= monthAgo);
        break;
      default:
        break;
    }

    // Only show public conversations
    filtered = filtered.filter(conv => conv.isPublic !== false);

    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        break;
      case 'most_active':
        filtered.sort((a, b) => b.messageCount - a.messageCount);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        break;
    }

    setFilteredConversations(filtered);
    setCurrentPage(1);
  };

  /**
   * Load full conversation messages - prefer memories; fallback to local storage
   */
  const loadConversationMessages = (conversationId) => {
    try {
      const memMessages = (allMemories || [])
        .filter(m => (m.roomId || m.channelId) === conversationId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .map(m => ({
          type: m.type === 'agent' ? 'agent' : 'user',
          content: m.content,
          timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
          metadata: { agentId: m.agentId, entityId: m.entityId }
        }));

      if (memMessages.length > 0) {
        setConversationMessages(memMessages);
        return;
      }

      const data = getConversationsForLogs();
      const all = data.conversations;
      const messages = all
        .filter(log => log.conversationId === conversationId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      setConversationMessages(messages);
    } catch (err) {
      setError('Failed to load conversation messages: ' + err.message);
    }
  };

  /** Open viewer and push id/page to URL */
  const viewConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessagePage(1);
    loadConversationMessages(conversation.conversationId);

    const params = new URLSearchParams(window.location.search);
    params.set('id', conversation.conversationId);
    params.delete('page');
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  /** Show preview modal */
  const showConversationPreview = (conversation, row = 0, col = 0) => {
    const cellData = {
      row,
      col,
      hasConversation: true,
      conversationData: {
        conversationId: conversation.conversationId,
        logNumber: conversation.logNumber,
        messageCount: conversation.messageCount,
        startTime: conversation.startTime,
        preview: conversation.preview,
        isActive: conversation.isActive
      }
    };
    setPreviewCellData(cellData);
    setShowChatPreview(true);
  };

  /** Close viewer and clear id/page from URL */
  const closeConversationPreview = () => {
    setShowChatPreview(false);
    setPreviewCellData(null);
  };

  const closeConversationViewer = () => {
    setSelectedConversation(null);
    setConversationMessages([]);
    const params = new URLSearchParams(window.location.search);
    params.delete('id');
    params.delete('page');
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  /** Export as text (prefers memories) */
  const exportConversation = (conversation) => {
    const memMessages = (allMemories || [])
      .filter(m => (m.roomId || m.channelId) === conversation.conversationId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(m => ({
        type: m.type === 'agent' ? 'agent' : 'user',
        content: m.content,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp
      }));

    const messages = conversationMessages.length > 0
      ? conversationMessages
      : (memMessages.length > 0 ? memMessages : JSON.parse(localStorage.getItem('purl_conversation_logs') || '[]').filter(log => log.conversationId === conversation.conversationId));

    const transcript = `
Purl Agent Conversation Log
Log Number: ${conversation.logNumber}
Start Time: ${new Date(conversation.startTime).toLocaleString()}
Duration: ${formatDuration(conversation.duration)}
Message Count: ${conversation.messageCount}

${'='.repeat(50)}

${messages.map(msg => `
[${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.type === 'user' ? 'User' : 'Purl'}: ${msg.content}
`).join('')}

${'='.repeat(50)}

Generated by Purl Agent System - purl.cat
    `.trim();

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purl-conversation-${conversation.logNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /** Calculate statistics from conversation data */
  const calculateStats = (convs) => {
    if (!convs || convs.length === 0) {
      return {
        total: { conversations: 0, messages: 0 },
        today: { conversations: 0, messages: 0 },
        thisWeek: { conversations: 0, messages: 0 }
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalMessages = convs.reduce((sum, conv) => sum + (conv.messageCount || 0), 0);
    
    const todayConvs = convs.filter(conv => new Date(conv.startTime) >= today);
    const todayMessages = todayConvs.reduce((sum, conv) => sum + (conv.messageCount || 0), 0);
    
    const weekConvs = convs.filter(conv => new Date(conv.startTime) >= weekAgo);
    const weekMessages = weekConvs.reduce((sum, conv) => sum + (conv.messageCount || 0), 0);

    return {
      total: { 
        conversations: convs.length, 
        messages: totalMessages 
      },
      today: { 
        conversations: todayConvs.length, 
        messages: todayMessages 
      },
      thisWeek: { 
        conversations: weekConvs.length, 
        messages: weekMessages 
      }
    };
  };

  /** Duration formatting */
  const formatDuration = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  /** Timestamp formatting */
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString([], {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  /** Grid pagination */
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredConversations.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);
    return { paginatedItems, totalPages };
  };

  const { paginatedItems, totalPages } = getPaginatedData();

  /** Message pagination for viewer */
  const getMessagePageSlice = () => {
    const start = (messagePage - 1) * messagesPerPage;
    const end = start + messagesPerPage;
    return conversationMessages.slice(start, end);
  };

  const totalMessagePages = Math.max(1, Math.ceil(conversationMessages.length / messagesPerPage));
  const paginatedMessages = getMessagePageSlice();

  const goToMessagePage = (page) => {
    const clamped = Math.min(Math.max(page, 1), totalMessagePages);
    setMessagePage(clamped);
    const params = new URLSearchParams(window.location.search);
    if (selectedConversation) params.set('id', selectedConversation.conversationId);
    params.set('page', String(clamped));
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  if (selectedConversation) {
    return (
      <div className={`conversation-viewer ${theme}`}>
        <div className="viewer-header">
          <div className="header-top">
            <button onClick={closeConversationViewer} className="back-button">Back to Logs</button>
            <h3 className="conversation-title">{selectedConversation.logNumber}</h3>
          </div>
        </div>

        {/* Stats and Actions Section */}
        <div className="viewer-controls">
          <div className="stats-section">
            <div className="stat-item compact">
              <CalendarIcon />
              <span className="stat-value">{formatTimestamp(selectedConversation.startTime)}</span>
            </div>
            <div className="stat-item compact">
              <ChatIcon />
              <span className="stat-value">{selectedConversation.messageCount}</span>
            </div>
            <div className="stat-item compact">
              <ClockIcon />
              <span className="stat-value">{formatDuration(selectedConversation.duration)}</span>
            </div>
            {selectedConversation.isActive && (
              <div className="stat-item compact status-active">
                <CheckIcon />
                <span className="stat-value">Active</span>
              </div>
            )}
          </div>
          
          <div className="actions-section">
            <button 
              onClick={() => setShowMetadata(!showMetadata)} 
              className={`metadata-toggle ${showMetadata ? 'active' : ''}`} 
              title="Toggle metadata visibility"
            >
              <BugIcon />&nbsp;{showMetadata ? 'Hide' : 'Show'} Metadata
            </button>
            <button onClick={() => exportConversation(selectedConversation)} className="export-button" title="Export conversation">
              <DownloadIcon />&nbsp;Export
            </button>
            <button onClick={() => { navigator.clipboard.writeText(selectedConversation.logNumber); }} className="copy-button" title="Copy log number">
              <ClipboardIcon />&nbsp;Copy ID
            </button>
          </div>
        </div>

        {/* Terminal-style conversation display */}
        <div className="logs-terminal-conversation">
          <div className="logs-terminal-header">
            <div className="logs-terminal-title">
              <span className="logs-terminal-icon" aria-hidden><MonitorIcon /></span>
              <span>Conversation Log: {selectedConversation.logNumber}</span>
            </div>
            <div className="logs-terminal-stats">
              <span className="stat">User: {selectedConversation.userMessages || 0}</span>
              <span className="stat">Agent: {selectedConversation.agentMessages || 0}</span>
              <span className="stat">Total: {conversationMessages.length}</span>
            </div>
          </div>

          <div className="logs-terminal-output">
            {paginatedMessages.length === 0 ? (
              <div className="no-messages">
                <p>No messages found for this conversation</p>
                <p>This might be a conversation index without stored messages.</p>
              </div>
            ) : (
              paginatedMessages.map((message, index) => {
                const timestamp = new Date(message.timestamp).toLocaleTimeString();
                const isUser = message.type === 'user';
                return (
                  <div key={`msg-${index}-${message.timestamp || Date.now()}`} className={`logs-terminal-message ${message.type}-message`}>
                    <div className="message-line">
                      <span className="timestamp">[{timestamp}]</span>
                      <span className={`sender ${isUser ? 'user-sender' : 'agent-sender'}`}>{isUser ? 'USER' : 'PURL'}</span>
                      <span className="message-content">{message.content}</span>
                    </div>
                    {showMetadata && message.metadata && Object.keys(message.metadata).length > 0 && (
                      <div className="message-metadata">
                        {Object.entries(message.metadata).map(([key, value]) => (
                          <span key={key} className="metadata-item">{key}: {JSON.stringify(value)}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Message pagination */}
          {totalMessagePages > 1 && (
            <div className="pagination" style={{ padding: '12px 16px' }}>
              <button className="page-button" onClick={() => goToMessagePage(messagePage - 1)} disabled={messagePage === 1}>← Previous</button>
              <span className="page-info">Page {messagePage} of {totalMessagePages}</span>
              <button className="page-button" onClick={() => goToMessagePage(messagePage + 1)} disabled={messagePage === totalMessagePages}>Next →</button>
            </div>
          )}

          <div className="logs-terminal-footer">
            <div className="conversation-summary">
           <span className="summary-item"><ChatIcon />&nbsp;{conversationMessages.length} total messages</span>
           <span className="summary-item"><ClockIcon />&nbsp;Session duration: {formatDuration(selectedConversation.duration)}</span>
           <span className="summary-item">ID: {selectedConversation.logNumber}</span>
           {selectedConversation.roomId && (<span className="summary-item">Room: {selectedConversation.roomId.substring(0, 8)}...</span>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`conversation-logs ${theme}`}>
      {/* Page Header - Consistent with other pages */}
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Conversation Logs</h1>
          <p className="page-subtitle">Browse and search public conversations with the Purl agent</p>
        </div>

        {calculatedStats && (
          <div className="page-stats">
            <div className="stats-grid">
              <div className="stat-item"><span className="stat-label">Total</span><span className="stat-value">{calculatedStats.total.conversations} conversations</span></div>
              <div className="stat-item"><span className="stat-label">Messages</span><span className="stat-value">{calculatedStats.total.messages} total</span></div>
              <div className="stat-item"><span className="stat-label">Today</span><span className="stat-value">{calculatedStats.today.conversations} chats</span></div>
              <div className="stat-item"><span className="stat-label">This Week</span><span className="stat-value">{calculatedStats.thisWeek.conversations} chats</span></div>
            </div>
          </div>
        )}

        <div className="page-actions" />
      </div>

      {/* Search and Filters */}
      <div className="search-controls">
        <div className="search-bar">
          <input type="text" placeholder="Search by log number or content..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
          <span className="search-icon" aria-hidden><SearchIcon /></span>
        </div>

        <div className="filter-controls">
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="filter-select">
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most_active">Most Active</option>
          </select>


        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span className="result-count">{filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''} found</span>
        <div className="summary-right">
          {showNote && (
            <div className="page-alert" role="status" aria-live="polite">
              <span className="alert-text">Each user's conversation is ongoing.</span>
              <button
                type="button"
                className="alert-close"
                aria-label="Dismiss message"
                onClick={() => setShowNote(false)}
              >
                ×
              </button>
            </div>
          )}
          {searchQuery && (<button onClick={() => setSearchQuery('')} className="clear-search">Clear Search</button>)}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state"><div className="loading-spinner"></div><p>Loading conversations...</p></div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state"><p>❌ {error}</p><button onClick={() => { setError(null); refreshMemories(); loadConversations(); }} className="retry-button">Try Again</button></div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredConversations.length === 0 && (
        <div className="empty-state">
          <p>📝 No conversations found</p>
          {searchQuery ? (<p>Try adjusting your search terms or filters</p>) : (<p>Start chatting with Purl to create your first conversation!</p>)}
        </div>
      )}

      {/* Conversation List */}
      {!isLoading && !error && paginatedItems.length > 0 && (
        <>
          <div className="conversations-grid">
            {paginatedItems.map((conversation) => (
              <div key={conversation.conversationId} className="conversation-card" onClick={() => viewConversation(conversation)}>
                <div className="card-header">
                  <span className="log-number">#{conversation.logNumber}</span>
                  <span className={`status-badge ${conversation.isActive ? 'active' : 'completed'}`}>
                    {conversation.isActive ? 'Active' : formatTimestamp(conversation.startTime)}
                  </span>
                </div>
                <div className="card-content">
                  <div className="conversation-preview">{conversation.preview}</div>
                  <div className="conversation-stats">
                    <span className="stat"><ChatIcon />&nbsp;{conversation.messageCount} messages</span>
                    <span className="stat"><ClockIcon />&nbsp;{formatDuration(conversation.duration)}</span>
                    <span className="stat"><CalendarIcon />&nbsp;{formatTimestamp(conversation.startTime)}</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button onClick={(e) => { e.stopPropagation(); showConversationPreview(conversation, 0, 0); }} className="action-button" title="Preview Conversation"><EyeIcon /></button>
                  <button onClick={(e) => { e.stopPropagation(); exportConversation(conversation); }} className="action-button" title="Export Conversation"><DownloadIcon /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="page-button">← Previous</button>
              <span className="page-info">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="page-button">Next →</button>
            </div>
          )}
        </>
      )}

      {/* Chat Log Preview Modal */}
      <ChatLogPreview isVisible={showChatPreview} onClose={closeConversationPreview} cellData={previewCellData} theme={theme} />
    </div>
  );
};

export default ConversationLogs;
