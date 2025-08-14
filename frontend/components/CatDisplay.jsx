import { useState, useEffect, useRef } from 'react';
import { 
  SPRITE_ANIMATION_CONFIG, 
  CAT_STATES, 
  getSpritePosition, 
  getSpriteSize,
  SPRITE_CONFIG 
} from '../assets/spriteFrames.js';
import { 
  ASCII_ANIMATION_CONFIG,
  ASCII_EXPRESSION_FRAMES 
} from '../assets/asciiFrames.js';
import ThoughtBox from './ThoughtBox.jsx';
import InteractiveGrid from './InteractiveGrid.jsx';
import ChatLogPreview from './ChatLogPreview.jsx';
import HeatMapLegend from './HeatMapLegend.jsx';
import OnboardingModal from './OnboardingModal.jsx';
import useAgentThoughts from '../hooks/useAgentThoughts.js';


/**
 * CatDisplay Component - Immersive Full Screen Terminal Cat
 * Features:
 * - Dynamic ASCII art with dual theme support (dark terminal / light modern)
 * - Frame-based animation system
 * - WebSocket integration for AI agent control
 * - Interactive grid showing real conversation data
 * - Thought bubble displaying Purl's consciousness
 * - Real-time chat log previews
 * - Always full screen terminal interface
 */
const CatDisplay = ({ onConnectionChange = null, onThemeChange, initialTheme }) => {
  // Core state management
  const [currentState, setCurrentState] = useState(CAT_STATES.SITTING);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Production mode - debug features disabled
  const renderMode = 'ascii'; // Fixed to ASCII mode for production
  
  // Use theme from parent - no internal theme state needed
  const fullScreenTheme = initialTheme || 'light'; // Default to light theme

  // Real-time agent thoughts system
  const {
    currentThought,
    isThinking,
    chatActivity,
    thoughtHistory,
    triggerThought,
    isActive: thoughtsActive
  } = useAgentThoughts();
  
  // Thought box display state
  const [showThoughtBox, setShowThoughtBox] = useState(true);
  const [bubblePosition, setBubblePosition] = useState('right'); // 'left', 'right', 'center-top', 'bottom'

  // Cat position state for debug controls
  const [catPosition, setCatPosition] = useState('center'); // 'left', 'right', 'center', 'top', 'bottom'
  
  // Interactive grid state
  const [showInteractiveGrid, setShowInteractiveGrid] = useState(true);
  const [gridCellSize, setGridCellSize] = useState(20);
  const [showHeatMap, setShowHeatMap] = useState(false); // OPTIMIZATION: Disabled by default for better performance
  const [heatMapSeed, setHeatMapSeed] = useState(0);
  
  // Chat log preview state
  const [showChatPreview, setShowChatPreview] = useState(false);
  const [selectedCellData, setSelectedCellData] = useState(null);



  // Refs for cleanup and WebSocket management
  const animationInterval = useRef(null);
  const websocket = useRef(null);

  /**
   * Animation Controller - Handles frame cycling for ASCII mode
   * Automatically manages frame transitions based on current state
   */
  useEffect(() => {
    const config = ASCII_ANIMATION_CONFIG[currentState];
    
    // Clear any existing animation
    if (animationInterval.current) {
      clearInterval(animationInterval.current);
    }
    
    // Reset to first frame when state changes
    setCurrentFrame(0);
    
    // Set up animation for multi-frame states
    if (config.frames.length > 1 && config.loop) {
      animationInterval.current = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % config.frames.length);
      }, config.duration);
    }
    
    // Cleanup function
    return () => {
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
      }
    };
  }, [currentState]);

  /**
   * WebSocket Connection - Listens for external AI agent commands
   * Expects messages like: "walk", "eat", "sleep", "jump", "sit"
   */
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        websocket.current = new WebSocket('ws://localhost:8080');
        
        websocket.current.onopen = () => {
        console.log('🔗 Connected to AI agent');
        setIsConnected(true);
        if (onConnectionChange) {
          onConnectionChange(true);
        }
      };
        
        websocket.current.onmessage = (event) => {
          const command = event.data.toLowerCase().trim();
          console.log('📨 Received command:', command);
          
          // Map commands to states
          const commandMap = {
            'walk': CAT_STATES.WALKING,
            'jump': CAT_STATES.JUMPING,
            'eat': CAT_STATES.EATING,
            'sleep': CAT_STATES.SLEEPING,
            'sit': CAT_STATES.SITTING
          };
          
          if (commandMap[command]) {
            const newState = commandMap[command];
            setCurrentState(newState);
            
            // Generate WebSocket command reaction using thoughts system
            const commandReactions = [
              `Received ${command} command! Let me ${command} for you`,
              `WebSocket says: ${command}! On it!`,
              `AI agent wants me to ${command} - roger that!`,
              `Command received: ${command}. Executing now!`,
              `Time to ${command}! Thanks for the direction`
            ];
            const randomReaction = commandReactions[Math.floor(Math.random() * commandReactions.length)];
            triggerThought(randomReaction, 1200);
          }
        };
        
        websocket.current.onclose = () => {
          console.log('🔌 Disconnected from AI agent');
          setIsConnected(false);
          if (onConnectionChange) {
            onConnectionChange(false);
          }
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };
        
        websocket.current.onerror = (error) => {
          console.log('❌ WebSocket error:', error);
          setIsConnected(false);
          if (onConnectionChange) {
            onConnectionChange(false);
          }
        };
        
      } catch (error) {
        console.log('🚫 WebSocket connection failed:', error);
        setIsConnected(false);
        // Retry connection after 5 seconds
        setTimeout(connectWebSocket, 5000);
      }
    };

    // Initialize connection
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (websocket.current) {
        websocket.current.close();
      }
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
      }
    };
  }, [onConnectionChange]);

  // Thought system is now handled by useAgentThoughts hook

  /**
   * Sprite position calculator - Determines background position for sprite sheets
   */
  const getSpritePosition = (frameData) => {
    const { row, col } = frameData;
    const x = col * SPRITE_CONFIG.spriteWidth;
    const y = row * SPRITE_CONFIG.spriteHeight;
    return `-${x}px -${y}px`;
  };

  /**
   * Sprite size calculator - Determines background size for proper scaling
   */
  const getSpriteSize = () => {
    const { sheetWidth, sheetHeight } = SPRITE_CONFIG;
    return `${sheetWidth}px ${sheetHeight}px`;
  };

  /**
   * Manual state change handler for testing - now triggers appropriate thoughts
   */
  const handleStateChange = (newState) => {
    setCurrentState(newState);
    
    // Generate context-aware thoughts based on cat state changes
    const stateThoughts = {
      [CAT_STATES.SITTING]: [
        "Time to sit and observe the conversations...",
        "Settling in to watch the chat activity",
        "Perfect position to monitor everything"
      ],
      [CAT_STATES.WALKING]: [
        "On the move! Exploring the conversation grid",
        "Walking around to get a better view",
        "Let me check different areas of activity"
      ],
      [CAT_STATES.JUMPING]: [
        "Feeling energetic from all the chat activity!",
        "So much happening, it's got me excited!",
        "The conversations are making me jumpy!"
      ],
      [CAT_STATES.EATING]: [
        "All this chat monitoring works up an appetite",
        "Snack time while watching the conversations",
        "Multitasking: eating and observing"
      ],
      [CAT_STATES.SLEEPING]: [
        "The chats are peaceful right now... time for a nap",
        "Resting while the conversations are quiet",
        "Light sleep - I'll wake up if things get busy"
      ]
    };

    const stateReactions = stateThoughts[newState] || stateThoughts[CAT_STATES.SITTING];
    const randomReaction = stateReactions[Math.floor(Math.random() * stateReactions.length)];
    triggerThought(randomReaction, 1500);
  };

  // Get current ASCII frame data
  const getCurrentFrameData = () => {
    const currentAsciiFrame = ASCII_ANIMATION_CONFIG[currentState].frames[currentFrame];
    return {
      type: 'ascii',
      frameData: currentAsciiFrame
    };
  };
  
  const frameData = getCurrentFrameData();



  

  // Cat position control function
  const handleCatPositionChange = (position) => {
    setCatPosition(position);
  };

  // Interactive grid click handler
  const handleGridCellClick = ({ row, col, cellId, hasConversation, conversationData }) => {
    console.log(`🔗 Grid cell clicked: [${row}, ${col}] - ID: ${cellId} - Has conversation: ${hasConversation}`);
    
    // Store cell data and show preview
    setSelectedCellData({ row, col, cellId, hasConversation, conversationData });
    setShowChatPreview(true);
    
    // Generate contextual reaction using the agent thoughts system
    let reactions;
    if (hasConversation) {
      reactions = [
        `Found conversation ${conversationData.logNumber}! Let me open that for you`,
        `Opening chat log: ${conversationData.messageCount} messages to explore`,
        "Loading conversation history... this looks interesting!",
        `Chat from ${new Date(conversationData.startTime).toLocaleDateString()} - bringing back memories`,
        "Here's that conversation! Wonder what they were discussing..."
      ];
    } else {
      reactions = [
        `Empty tile at [${row}, ${col}] - no conversations here yet`,
        "This tile is waiting for its first conversation...",
        "No chat log found here, but maybe someday!",
        "This spot is ready for new conversations to bloom",
        "A quiet corner of the grid... peaceful!"
      ];
    }
    
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    triggerThought(randomReaction, 2000);
  };

  // Chat preview close handler
  const handleCloseChatPreview = () => {
    setShowChatPreview(false);
    setSelectedCellData(null);
    
    // Agent reaction when closing using thoughts system
    const closeReactions = [
      "Hope that was helpful!",
      "Back to monitoring the grid...",
      "Interesting conversation that was!",
      "Ready for the next exploration",
      "What should we look at next?"
    ];
    const randomReaction = closeReactions[Math.floor(Math.random() * closeReactions.length)];
    triggerThought(randomReaction, 1500);
  };

  // Heat map randomization handler
  const handleRandomizeHeatMap = () => {
    const newSeed = Math.floor(Math.random() * 10000);
    setHeatMapSeed(newSeed);
    
    // Agent reaction to randomization using thoughts system
    const reactions = [
      "Ooh, shuffling the heat patterns!",
      "Let's see some new hot spots!",
      "Randomizing the popularity matrix!",
      "Fresh heat map coming up!",
      "Time for new conversation patterns!"
    ];
    
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    triggerThought(randomReaction, 2000);
  };

  // Clear clicked tiles handler (for debug)
  const handleClearMarkers = () => {
    // Agent reaction to clearing markers using thoughts system
    triggerThought("Clearing all clicked markers!", 1500);
  };





  return (
    <div className={`cat-display fullscreen-display fullscreen-${fullScreenTheme}`}>
      {/* Full Screen Terminal Interface */}
      <div className={`tamagotchi-screen fullscreen-screen fullscreen-${fullScreenTheme}`}>
        
        {/* Interactive Grid - clickable cells for future chat log integration */}
        <InteractiveGrid
          theme={fullScreenTheme}
          cellSize={gridCellSize}
          onCellClick={handleGridCellClick}
          isVisible={showInteractiveGrid}
          opacity={0.6}
          hoverOpacity={0.9}
          showHeatMap={showHeatMap}
          heatMapSeed={heatMapSeed}
          onClearMarkers={handleClearMarkers}
        />

        {/* Main ASCII display area */}
        <div className={`ascii-container ${catPosition !== 'center' ? 'cat-' + catPosition : ''}`}>
          <pre className="ascii-cat">{frameData.frameData}</pre>
        </div>


      </div>

      {/* Thought Box - shows cat's thoughts */}
      <ThoughtBox
        thought={currentThought}
        theme={fullScreenTheme}
        isVisible={showThoughtBox}
        isTyping={isThinking}
        debugPosition={bubblePosition}
      />

      {/* Chat Log Preview Modal */}
      <ChatLogPreview
        isVisible={showChatPreview}
        onClose={handleCloseChatPreview}
        cellData={selectedCellData}
        theme={fullScreenTheme}
      />

      {/* Interactive Grid Guide - Always show when grid is visible */}
      <HeatMapLegend
        theme={fullScreenTheme}
        isVisible={showInteractiveGrid}
        onRandomizeHeatMap={handleRandomizeHeatMap}
        showHeatMapControls={false}
      />







      



      {/* First-time user onboarding modal */}
      <OnboardingModal theme={fullScreenTheme} />
    </div>
  );
};

export default CatDisplay;

