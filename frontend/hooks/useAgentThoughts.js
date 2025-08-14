import { useState, useEffect, useCallback, useRef } from 'react';
import { useElizaMemoriesContext } from '../contexts/ElizaMemoriesContext.jsx';
import { getConfig } from '../utils/config.js';

/**
 * useAgentThoughts Hook - Real-time Agent Thoughts Generator
 * 
 * Analyzes chat activity, message volume, and conversation patterns to generate
 * contextual thoughts for the Purl agent. Creates dynamic, real-time responses
 * based on what's happening in the conversations.
 * 
 * Features:
 * - Real-time chat activity analysis
 * - Dynamic thought generation based on conversation volume
 * - Sentiment-aware responses
 * - Anti-spam filtering to prevent repetitive thoughts
 * - Context-aware reactions to conversation patterns
 */
const useAgentThoughts = () => {
  // Get Eliza memories and conversation data
  const {
    memories,
    conversations,
    loading: memoryLoading,
    error: memoryError,
    agentId
  } = useElizaMemoriesContext();

  // Thought state management
  const [currentThought, setCurrentThought] = useState("I'm observing the conversations...");
  const [isThinking, setIsThinking] = useState(false);
  const [thoughtHistory, setThoughtHistory] = useState([]);
  
  // Analysis state
  const [chatActivity, setChatActivity] = useState({
    totalMessages: 0,
    recentMessages: 0,
    activeConversations: 0,
    busyLevel: 'quiet', // 'quiet', 'moderate', 'busy', 'chaotic'
    lastAnalysis: Date.now()
  });

  // Refs for tracking and preventing spam
  const lastThoughtTime = useRef(Date.now());
  const recentThoughts = useRef(new Set());
  const analysisInterval = useRef(null);
  const previousMemoryCount = useRef(0);
  const previousConversationCount = useRef(0);

  /**
   * Analyze current chat activity level
   */
  const analyzeChatActivity = useCallback(() => {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    const oneMinuteAgo = now - (1 * 60 * 1000);

    // Count recent messages (last 5 minutes)
    const recentMemories = memories.filter(memory => {
      const memoryTime = new Date(memory.timestamp).getTime();
      return memoryTime > fiveMinutesAgo;
    });

    // Count very recent messages (last 1 minute)
    const veryRecentMemories = memories.filter(memory => {
      const memoryTime = new Date(memory.timestamp).getTime();
      return memoryTime > oneMinuteAgo;
    });

    // Count active conversations (with messages in last 5 minutes)
    const activeConversations = conversations.filter(conv => {
      const lastActivity = new Date(conv.lastActivity || conv.startTime).getTime();
      return lastActivity > fiveMinutesAgo;
    });

    // Determine busy level
    let busyLevel = 'quiet';
    const recentCount = recentMemories.length;
    
    if (recentCount > 20) {
      busyLevel = 'chaotic';
    } else if (recentCount > 10) {
      busyLevel = 'busy';
    } else if (recentCount > 3) {
      busyLevel = 'moderate';
    }

    const newActivity = {
      totalMessages: memories.length,
      recentMessages: recentCount,
      veryRecentMessages: veryRecentMemories.length,
      activeConversations: activeConversations.length,
      busyLevel,
      lastAnalysis: now
    };

    setChatActivity(newActivity);
    return newActivity;
  }, [memories, conversations]);

  /**
   * Request a random thought from the Eliza agent based on current context
   */
  const requestAgentThought = useCallback(async (activity, context = {}) => {
    if (!agentId) {
      return "I'm processing the conversations...";
    }

    const config = getConfig();
    const { busyLevel, recentMessages, activeConversations } = activity;
    const { newMessages = 0, newConversations = 0 } = context;

    try {
      // Create a context prompt for the agent based on current activity
      let contextPrompt = `You are Purl, an AI agent observing chat conversations. Current situation: `;
      
      if (busyLevel === 'quiet') {
        contextPrompt += `It's quiet with only ${recentMessages} recent messages. `;
      } else if (busyLevel === 'moderate') {
        contextPrompt += `Moderate activity with ${recentMessages} messages and ${activeConversations} active conversations. `;
      } else if (busyLevel === 'busy') {
        contextPrompt += `Busy period with ${recentMessages} messages flowing across ${activeConversations} conversations. `;
      } else {
        contextPrompt += `Chaotic activity with ${recentMessages} messages! Lots happening across ${activeConversations} conversations. `;
      }

      if (newMessages > 0) {
        contextPrompt += `${newMessages} new messages just came in. `;
      }
      
      if (newConversations > 0) {
        contextPrompt += `${newConversations} new conversations started. `;
      }

      contextPrompt += `Share a brief, natural thought about what you're observing or feeling. Keep it under 60 characters, casual and authentic. No quotes needed.`;

      // Build headers with API key for production
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Add API key for production
      if (config.API_KEY) {
        headers['X-API-Key'] = config.API_KEY;
      }

      // Request thought from Eliza agent
      const response = await fetch(`${config.BASE_URL}/api/chat/${agentId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: contextPrompt,
          roomId: 'thoughts-internal',
          internal: true // Mark as internal thought request
        })
      });

      if (!response.ok) {
        throw new Error(`Agent thought request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the thought from the agent's response
      let agentThought = data.message || data.response || data.text || "Hmm, pondering this situation...";
      
      // Clean up the response (remove quotes, limit length)
      agentThought = agentThought.replace(/^["']|["']$/g, '').trim();
      if (agentThought.length > 80) {
        agentThought = agentThought.substring(0, 77) + '...';
      }

      // Track this thought to prevent immediate repetition
      recentThoughts.current.add(agentThought.toLowerCase());
      
      // Clean up old thoughts (keep only last 10)
      if (recentThoughts.current.size > 10) {
        const thoughtsArray = Array.from(recentThoughts.current);
        recentThoughts.current = new Set(thoughtsArray.slice(-10));
      }

      return agentThought;

    } catch (error) {
      console.error('❌ [AgentThoughts] Failed to get thought from agent:', error);
      
      // Fallback to simple contextual thoughts if API fails
      const fallbackThoughts = {
        quiet: ["Peaceful moment to reflect...", "Observing quietly...", "Taking it all in..."],
        moderate: ["Interesting conversations happening", "Good flow of activity", "Keeping track of things"],
        busy: ["Lots going on right now!", "Busy conversations flowing", "So much to observe"],
        chaotic: ["Wow, so much activity!", "Trying to keep up!", "Intense conversation flow"]
      };

      const fallbacks = fallbackThoughts[busyLevel] || fallbackThoughts.quiet;
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
  }, [agentId]);

  /**
   * Update thoughts based on activity changes
   */
  const updateThoughts = useCallback(() => {
    const now = Date.now();
    const timeSinceLastThought = now - lastThoughtTime.current;
    
    // Don't update thoughts too frequently (minimum 10 seconds between thoughts)
    if (timeSinceLastThought < 10000) {
      return;
    }

    const activity = analyzeChatActivity();
    
    // Check for significant changes
    const newMessages = activity.totalMessages - previousMemoryCount.current;
    const newConversations = activity.activeConversations - previousConversationCount.current;
    
    // Determine if we should generate a new thought
    let shouldGenerateThought = false;
    let context = { newMessages, newConversations };

    // Generate thought for new activity
    if (newMessages > 0 || newConversations > 0) {
      shouldGenerateThought = true;
    }
    
    // Generate periodic thoughts based on activity level
    const timeSinceLastActivity = now - activity.lastAnalysis;
    if (timeSinceLastActivity > 60000) { // 1 minute of no new activity
      if (activity.busyLevel !== 'quiet' && timeSinceLastThought > 30000) {
        shouldGenerateThought = true;
        context = { ...context, periodic: true };
      }
    }

    // Generate thought for activity level changes
    if (activity.busyLevel !== chatActivity.busyLevel) {
      shouldGenerateThought = true;
      context = { ...context, levelChange: true };
    }

    if (shouldGenerateThought) {
      setIsThinking(true);
      
      // Request actual thought from the agent
      requestAgentThought(activity, context).then(agentThought => {
        setCurrentThought(agentThought);
        setIsThinking(false);
        lastThoughtTime.current = now;
        
        // Add to thought history
        setThoughtHistory(prev => [...prev.slice(-19), {
          thought: agentThought,
          timestamp: now,
          activity: activity.busyLevel,
          context,
          source: 'agent'
        }]);
      }).catch(error => {
        console.error('❌ [AgentThoughts] Error updating thoughts:', error);
        setIsThinking(false);
      });
    }

    // Update tracking values
    previousMemoryCount.current = activity.totalMessages;
    previousConversationCount.current = activity.activeConversations;
  }, [analyzeChatActivity, requestAgentThought, chatActivity.busyLevel]);

  /**
   * Initialize thought system and set up monitoring
   */
  useEffect(() => {
    if (!agentId || memoryLoading) {
      return;
    }

    // Initial analysis and thought request
    const initialActivity = analyzeChatActivity();
    setIsThinking(true);
    
    requestAgentThought(initialActivity, { initial: true }).then(initialThought => {
      setCurrentThought(initialThought);
      setIsThinking(false);
    }).catch(error => {
      console.error('❌ [AgentThoughts] Error getting initial thought:', error);
      setCurrentThought("Starting up and observing the conversations...");
      setIsThinking(false);
    });

    // Set up periodic analysis (every 15 seconds)
    analysisInterval.current = setInterval(() => {
      updateThoughts();
    }, 15000);

    return () => {
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current);
      }
    };
  }, [agentId, memoryLoading, analyzeChatActivity, requestAgentThought, updateThoughts]);

  /**
   * React to immediate memory changes (for real-time responsiveness)
   */
  useEffect(() => {
    if (memories.length > previousMemoryCount.current && previousMemoryCount.current > 0) {
      // New messages detected - trigger immediate thought update
      const delay = Math.random() * 3000 + 1000; // 1-4 second delay for more natural feel
      setTimeout(() => {
        updateThoughts();
      }, delay);
    }
  }, [memories.length, updateThoughts]);

  /**
   * Manual thought trigger for external events (like grid clicks)
   * Can accept either a custom thought or request one from the agent with context
   */
  const triggerThought = useCallback((thoughtOrContext, thinkingDuration = 1500, useAgent = false) => {
    setIsThinking(true);
    
    if (useAgent && typeof thoughtOrContext === 'object') {
      // Request thought from agent with provided context
      const activity = analyzeChatActivity();
      requestAgentThought(activity, { manual: true, ...thoughtOrContext }).then(agentThought => {
        setCurrentThought(agentThought);
        setIsThinking(false);
        lastThoughtTime.current = Date.now();
        
        // Add to history
        setThoughtHistory(prev => [...prev.slice(-19), {
          thought: agentThought,
          timestamp: Date.now(),
          activity: 'manual-agent',
          context: { manual: true, ...thoughtOrContext },
          source: 'agent'
        }]);
      }).catch(error => {
        console.error('❌ [AgentThoughts] Error in manual agent thought:', error);
        setCurrentThought("Hmm, thinking about that...");
        setIsThinking(false);
      });
    } else {
      // Use provided custom thought directly
      setTimeout(() => {
        setCurrentThought(typeof thoughtOrContext === 'string' ? thoughtOrContext : "Thinking...");
        setIsThinking(false);
        lastThoughtTime.current = Date.now();
        
        // Add to history
        setThoughtHistory(prev => [...prev.slice(-19), {
          thought: typeof thoughtOrContext === 'string' ? thoughtOrContext : "Thinking...",
          timestamp: Date.now(),
          activity: 'manual',
          context: { manual: true },
          source: 'custom'
        }]);
      }, thinkingDuration);
    }
  }, [analyzeChatActivity, requestAgentThought]);

  return {
    // Current thought state
    currentThought,
    isThinking,
    
    // Activity analysis
    chatActivity,
    
    // Thought history for debugging
    thoughtHistory,
    
    // Manual controls
    triggerThought,
    
    // System status
    isActive: !memoryLoading && !memoryError && !!agentId
  };
};

export default useAgentThoughts;
