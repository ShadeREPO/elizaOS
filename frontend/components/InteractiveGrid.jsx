import { useState, useEffect, useRef, useCallback } from 'react';
import { useElizaMemoriesContext } from '../contexts/ElizaMemoriesContext.jsx';

/**
 * InteractiveGrid Component - High Performance Clickable Terminal Grid
 * Features:
 * - CSS-based grid background (no individual DOM elements)
 * - Efficient click detection using mouse coordinates
 * - Hover effects with single overlay element
 * - Theme support (dark/light)
 * - Responsive grid sizing
 * - Performance optimized - only 2-3 DOM elements total
 */
const InteractiveGrid = ({ 
  theme = 'dark', 
  cellSize = 20, 
  onCellClick, 
  isVisible = true,
  opacity = 0.3,
  hoverOpacity = 0.8,
  showHeatMap = true,
  heatMapSeed = 0,
  onClearMarkers
}) => {
  // Memories context (shared across all components)
  const {
    conversations: memoryConversations,
    memories: allMemories,
    loading: memoryLoading,
    error: memoryError,
    refreshMemories
  } = useElizaMemoriesContext();

  // Grid state management
  const [gridDimensions, setGridDimensions] = useState({ rows: 0, cols: 0 });
  const [hoveredCell, setHoveredCell] = useState(null);
  const [clickedCells, setClickedCells] = useState(new Set());
  const [animatingCell, setAnimatingCell] = useState(null);
  
  // Conversation data management
  const [conversationTiles, setConversationTiles] = useState(new Map()); // cellId -> conversation data
  const [newConversationTiles, setNewConversationTiles] = useState(new Set()); // Recently added conversations
  
  // OPTIMIZATION: Cache processed conversation data to prevent repeated localStorage parsing
  const processedConversationsCache = useRef(new Map()); // conversationId -> processed data
  
  // Refs for performance and measurements
  const gridContainerRef = useRef(null);
  const hoverOverlayRef = useRef(null);
  const clickOverlayRef = useRef(null);
  const heatMapCanvasRef = useRef(null);

  /**
   * Calculate grid dimensions based on container size
   */
  const calculateGridDimensions = useCallback(() => {
    if (!gridContainerRef.current) return;
    
    const container = gridContainerRef.current;
    const rect = container.getBoundingClientRect();
    
    const cols = Math.floor(rect.width / cellSize);
    const rows = Math.floor(rect.height / cellSize);
    
    setGridDimensions({ rows, cols });
  }, [cellSize]);

  // OPTIMIZATION: Cache bounding rect to avoid expensive getBoundingClientRect calls
  const cachedRect = useRef(null);
  const lastRectUpdate = useRef(0);
  
  /**
   * Get cached bounding rect with smart invalidation
   */
  const getCachedRect = useCallback(() => {
    const now = performance.now();
    // Update cached rect every 100ms at most
    if (!cachedRect.current || now - lastRectUpdate.current > 100) {
      if (gridContainerRef.current) {
        cachedRect.current = gridContainerRef.current.getBoundingClientRect();
        lastRectUpdate.current = now;
      }
    }
    return cachedRect.current;
  }, []);

  /**
   * OPTIMIZED: Get cell coordinates from mouse position with caching
   */
  const getCellFromMousePosition = useCallback((event) => {
    if (!gridContainerRef.current || gridDimensions.rows === 0) return null;
    
    const rect = getCachedRect();
    if (!rect) return null;
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    
    // Check if coordinates are within grid bounds
    if (col >= 0 && col < gridDimensions.cols && row >= 0 && row < gridDimensions.rows) {
      return { row, col, x: col * cellSize, y: row * cellSize };
    }
    
    return null;
  }, [cellSize, gridDimensions, getCachedRect]);

  /**
   * Initialize grid and set up resize observer
   */
  useEffect(() => {
    calculateGridDimensions();
    
    // OPTIMIZATION: Debounced resize handler to prevent excessive calculations
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Invalidate cached rect on resize
        cachedRect.current = null;
        calculateGridDimensions();
      }, 150);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [calculateGridDimensions]);



  /**
   * Generate hot spots based on seed for randomization
   */
  const generateHotSpots = useCallback((rows, cols, seed) => {
    // Use seed to create different hot spot patterns
    const seedRandom = (x) => {
      const val = Math.sin(x * 12.9898 + seed * 78.233) * 43758.5453;
      return val - Math.floor(val);
    };
    
    return [
      { 
        centerRow: Math.floor(rows * (0.2 + seedRandom(1) * 0.6)), 
        centerCol: Math.floor(cols * (0.2 + seedRandom(2) * 0.6)), 
        strength: 0.8 + seedRandom(3) * 0.2 
      },
      { 
        centerRow: Math.floor(rows * (0.2 + seedRandom(4) * 0.6)), 
        centerCol: Math.floor(cols * (0.2 + seedRandom(5) * 0.6)), 
        strength: 0.7 + seedRandom(6) * 0.2 
      },
      { 
        centerRow: Math.floor(rows * (0.2 + seedRandom(7) * 0.6)), 
        centerCol: Math.floor(cols * (0.2 + seedRandom(8) * 0.6)), 
        strength: 0.6 + seedRandom(9) * 0.3 
      },
      { 
        centerRow: Math.floor(rows * (0.2 + seedRandom(10) * 0.6)), 
        centerCol: Math.floor(cols * (0.2 + seedRandom(11) * 0.6)), 
        strength: 0.5 + seedRandom(12) * 0.3 
      }
    ];
  }, [heatMapSeed]);

  /**
   * Get heat level for a specific cell (calculate on-demand for performance)
   */
  const getCellHeat = useCallback((row, col) => {
    if (!showHeatMap) return 0;
    
    const { rows, cols } = gridDimensions;
    if (rows === 0 || cols === 0) return 0;
    
    let popularity = 0;
    
    // Generate hot spots based on current seed
    const hotSpots = generateHotSpots(rows, cols, heatMapSeed);

    hotSpots.forEach(hotSpot => {
      const distance = Math.sqrt(
        Math.pow(row - hotSpot.centerRow, 2) + 
        Math.pow(col - hotSpot.centerCol, 2)
      );
      const maxDistance = Math.sqrt(rows * rows + cols * cols);
      const normalizedDistance = distance / maxDistance;
      const influence = Math.max(0, (1 - normalizedDistance * 2)) * hotSpot.strength;
      popularity += influence;
    });

    // Add randomness with seed variation
    const random = (Math.sin((row * 2.5 + col * 3.7) + heatMapSeed * 17.4) + 1) / 2;
    popularity += random * 0.3;
    
    // Edge bias
    const edgeDistance = Math.min(row, col, rows - row - 1, cols - col - 1);
    const maxEdgeDistance = Math.min(rows, cols) / 2;
    const edgeBias = Math.min(1, edgeDistance / maxEdgeDistance);
    popularity *= (0.3 + 0.7 * edgeBias);

    return Math.max(0, Math.min(1, popularity));
  }, [gridDimensions, showHeatMap, generateHotSpots, heatMapSeed]);

  /**
   * Calculate conversation tile color based on message count tiers
   * Different colors for different message count ranges
   */
  const getConversationTileColor = useCallback((messageCount, theme) => {
    // Define message count tiers with distinct colors
    let tierInfo;
    
    if (messageCount >= 25) {
      // Tier 5: 25+ messages - Epic/Legendary (Purple/Magenta)
      tierInfo = {
        tier: 5,
        name: 'Epic',
        darkColor: [255, 0, 255], // Bright magenta
        lightColor: [138, 43, 226], // Blue violet
        opacity: 1.0,
        glowIntensity: 1.2
      };
    } else if (messageCount >= 15) {
      // Tier 4: 15-24 messages - High Activity (Blue/Cyan)
      tierInfo = {
        tier: 4,
        name: 'High Activity',
        darkColor: [0, 191, 255], // Deep sky blue
        lightColor: [30, 144, 255], // Dodger blue
        opacity: 0.95,
        glowIntensity: 1.0
      };
    } else if (messageCount >= 10) {
      // Tier 3: 10-14 messages - Active (Yellow/Gold)
      tierInfo = {
        tier: 3,
        name: 'Active',
        darkColor: [255, 215, 0], // Gold
        lightColor: [255, 165, 0], // Orange
        opacity: 0.9,
        glowIntensity: 0.8
      };
    } else if (messageCount >= 4) {
      // Tier 2: 4-9 messages - Moderate (Green/Lime)
      tierInfo = {
        tier: 2,
        name: 'Moderate',
        darkColor: [0, 255, 65], // Bright green
        lightColor: [34, 197, 94], // Emerald green
        opacity: 0.85,
        glowIntensity: 0.7
      };
    } else {
      // Tier 1: 1-3 messages - Light Activity (Orange/Amber)
      tierInfo = {
        tier: 1,
        name: 'Light Activity',
        darkColor: [255, 140, 0], // Dark orange
        lightColor: [251, 146, 60], // Orange
        opacity: 0.8,
        glowIntensity: 0.6
      };
    }
    
    const [r, g, b] = theme === 'dark' ? tierInfo.darkColor : tierInfo.lightColor;
    const baseGlow = 8 + (tierInfo.glowIntensity * 12);
    const insetGlow = 4 + (tierInfo.glowIntensity * 8);
    const shadowOpacity = 0.4 + (tierInfo.glowIntensity * 0.4);
    const insetOpacity = 0.2 + (tierInfo.glowIntensity * 0.4);
    
    return {
      background: `rgba(${r}, ${g}, ${b}, ${tierInfo.opacity})`,
      borderColor: `rgb(${r}, ${g}, ${b})`,
      boxShadow: `0 0 ${baseGlow}px rgba(${r}, ${g}, ${b}, ${shadowOpacity}), inset 0 0 ${insetGlow}px rgba(${r}, ${g}, ${b}, ${insetOpacity})`,
      tier: tierInfo.tier,
      tierName: tierInfo.name
    };
  }, []);

  /**
   * Get heat color based on popularity level - Pearl/Iridescent palette
   */
  const getHeatColor = useCallback((heat, theme) => {
    if (heat < 0.1) return 'transparent';
    
    // Pearl/iridescent color palette
    const colors = {
      pearlWhite: [245, 244, 240],     // #F5F4F0
      creamyBeige: [237, 232, 223],    // #EDE8DF
      softIvory: [226, 219, 208],      // #E2DBD0
      warmShadow: [201, 193, 181],     // #C9C1B5
      iridescentPink: [248, 232, 238], // #F8E8EE
      subtleBlue: [232, 240, 245],     // #E8F0F5
      neutralGray: [163, 158, 149],    // #A39E95
      darkAccent: [122, 115, 106]      // #7A736A
    };

    if (theme === 'dark') {
      // Dark theme: Reversed - darker colors = hotter tiles
      if (heat < 0.2) {
        // Very low: Pearl white (cool/inactive)
        const [r, g, b] = colors.pearlWhite;
        const intensity = heat / 0.2;
        return `rgba(${r}, ${g}, ${b}, ${0.15 + intensity * 0.2})`;
      } else if (heat < 0.4) {
        // Low: Iridescent pink
        const intensity = (heat - 0.2) / 0.2;
        const [r, g, b] = colors.iridescentPink;
        return `rgba(${r}, ${g}, ${b}, ${0.25 + intensity * 0.3})`;
      } else if (heat < 0.6) {
        // Medium: Creamy beige
        const intensity = (heat - 0.4) / 0.2;
        const [r, g, b] = colors.creamyBeige;
        return `rgba(${r}, ${g}, ${b}, ${0.4 + intensity * 0.3})`;
      } else if (heat < 0.8) {
        // High: Soft ivory getting darker
        const intensity = (heat - 0.6) / 0.2;
        const [r, g, b] = colors.softIvory;
        return `rgba(${r}, ${g}, ${b}, ${0.5 + intensity * 0.3})`;
      } else {
        // Very high: Dark accent (hottest)
        const intensity = (heat - 0.8) / 0.2;
        const [r, g, b] = colors.darkAccent;
        return `rgba(${r}, ${g}, ${b}, ${0.6 + intensity * 0.4})`;
      }
    } else {
      // Light theme: Reversed - darker colors = hotter tiles
      if (heat < 0.2) {
        // Very low: Pearl white (cool/inactive)
        const [r, g, b] = colors.pearlWhite;
        const intensity = heat / 0.2;
        return `rgba(${r}, ${g}, ${b}, ${0.15 + intensity * 0.2})`;
      } else if (heat < 0.4) {
        // Low: Subtle blue
        const intensity = (heat - 0.2) / 0.2;
        const [r, g, b] = colors.subtleBlue;
        return `rgba(${r}, ${g}, ${b}, ${0.25 + intensity * 0.25})`;
      } else if (heat < 0.6) {
        // Medium: Soft ivory
        const intensity = (heat - 0.4) / 0.2;
        const [r, g, b] = colors.softIvory;
        return `rgba(${r}, ${g}, ${b}, ${0.35 + intensity * 0.3})`;
      } else if (heat < 0.8) {
        // High: Warm shadow getting darker
        const intensity = (heat - 0.6) / 0.2;
        const [r, g, b] = colors.warmShadow;
        return `rgba(${r}, ${g}, ${b}, ${0.45 + intensity * 0.3})`;
      } else {
        // Very high: Dark accent (hottest)
        const intensity = (heat - 0.8) / 0.2;
        const [r, g, b] = colors.darkAccent;
        return `rgba(${r}, ${g}, ${b}, ${0.55 + intensity * 0.35})`;
      }
    }
  }, []);

  /**
   * Render heat map to canvas
   */
  const renderHeatMapToCanvas = useCallback(() => {
    const canvas = heatMapCanvasRef.current;
    if (!canvas || !showHeatMap || gridDimensions.rows === 0 || gridDimensions.cols === 0) return;

    const ctx = canvas.getContext('2d');
    const { rows, cols } = gridDimensions;

    // Set canvas size to match container
    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Generate hot spots for this render
    const hotSpots = generateHotSpots(rows, cols, heatMapSeed);

    // Generate and render heat map directly
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let popularity = 0;
        
        // Calculate popularity using hot spots
        hotSpots.forEach(hotSpot => {
          const distance = Math.sqrt(
            Math.pow(row - hotSpot.centerRow, 2) + 
            Math.pow(col - hotSpot.centerCol, 2)
          );
          const maxDistance = Math.sqrt(rows * rows + cols * cols);
          const normalizedDistance = distance / maxDistance;
          const influence = Math.max(0, (1 - normalizedDistance * 2)) * hotSpot.strength;
          popularity += influence;
        });

        // Add randomness with seed variation
        const random = (Math.sin((row * 2.5 + col * 3.7) + heatMapSeed * 17.4) + 1) / 2;
        popularity += random * 0.3;
        
        // Edge bias
        const edgeDistance = Math.min(row, col, rows - row - 1, cols - col - 1);
        const maxEdgeDistance = Math.min(rows, cols) / 2;
        const edgeBias = Math.min(1, edgeDistance / maxEdgeDistance);
        popularity *= (0.3 + 0.7 * edgeBias);

        // Clamp
        popularity = Math.max(0, Math.min(1, popularity));

        // Only render if significant heat
        if (popularity > 0.1) {
          const color = getHeatColor(popularity, theme);
          if (color !== 'transparent') {
            ctx.fillStyle = color;
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            
            // Add glow effect for hot tiles
            if (popularity > 0.6) {
              const glowColor = getHeatColor(popularity, theme);
              ctx.shadowColor = glowColor;
              ctx.shadowBlur = cellSize / 4;
              ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
              ctx.shadowBlur = 0;
            }
          }
        }
      }
    }
  }, [gridDimensions, cellSize, theme, showHeatMap, getHeatColor, generateHotSpots, heatMapSeed]);

  /**
   * Generate heat map when grid dimensions change
   */
  useEffect(() => {
    if (showHeatMap && gridDimensions.rows > 0 && gridDimensions.cols > 0) {
      // Render to canvas
      requestAnimationFrame(() => {
        renderHeatMapToCanvas();
      });
    }
  }, [renderHeatMapToCanvas, showHeatMap, gridDimensions]);

  // OPTIMIZATION: Throttle mouse move events for better performance
  const mouseMoveThrottle = useRef(null);
  const lastMouseMoveTime = useRef(0);

  /**
   * OPTIMIZED: Handle mouse events with throttling and efficient coordinate detection
   */
  const handleMouseMove = useCallback((event) => {
    const now = performance.now();
    
    // Throttle to ~60fps for smooth performance
    if (now - lastMouseMoveTime.current < 16) {
      return;
    }
    lastMouseMoveTime.current = now;
    
    const cell = getCellFromMousePosition(event);
    if (cell) {
      const cellId = `${cell.row}-${cell.col}`;
      if (hoveredCell !== cellId) {
        setHoveredCell(cellId);
        
        // Batch DOM updates for better performance
        if (hoverOverlayRef.current) {
          const overlay = hoverOverlayRef.current;
          overlay.style.transform = `translate3d(${cell.x}px, ${cell.y}px, 0)`;
          overlay.style.display = 'block';
        }
      }
    } else {
      if (hoveredCell !== null) {
        setHoveredCell(null);
        if (hoverOverlayRef.current) {
          hoverOverlayRef.current.style.display = 'none';
        }
      }
    }
  }, [getCellFromMousePosition, hoveredCell]);

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
    if (hoverOverlayRef.current) {
      hoverOverlayRef.current.style.display = 'none';
    }
  }, []);

  const handleClick = useCallback((event) => {
    const cell = getCellFromMousePosition(event);
    if (cell) {
      const { row, col } = cell;
      const cellId = `${row}-${col}`;
      
      // Add to clicked cells for persistent state
      setClickedCells(prev => new Set([...prev, cellId]));
      
      // Show click animation with optimized transform
      setAnimatingCell({ ...cell, id: cellId });
      if (clickOverlayRef.current) {
        const overlay = clickOverlayRef.current;
        overlay.style.transform = `translate3d(${cell.x}px, ${cell.y}px, 0) scale(1.2)`;
        overlay.style.display = 'block';
        overlay.classList.add('animating');
      }
      
      // Remove animation after duration
      setTimeout(() => {
        setAnimatingCell(null);
        if (clickOverlayRef.current) {
          clickOverlayRef.current.style.display = 'none';
          clickOverlayRef.current.classList.remove('animating');
        }
      }, 600);
      
      // Get conversation data for this cell if it exists
      const conversationData = conversationTiles.get(cellId);
      const hasConversation = !!conversationData;
      
      // Call parent callback with conversation data
      if (onCellClick) {
        onCellClick({ 
          row, 
          col, 
          cellId, 
          hasConversation,
          conversationData: conversationData || null
        });
      }
      
      console.log(`🔗 Grid cell clicked: [${row}, ${col}] - ${hasConversation ? `Conversation: ${conversationData.logNumber}` : 'Empty tile'}`);
    }
  }, [getCellFromMousePosition, onCellClick]);

  /**
   * Map memory conversations to grid format (same logic as ConversationLogs)
   */
  const mapMemoryConversations = useCallback((memConvs = []) => {
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
  }, []);

  /**
   * OPTIMIZED: Load conversations with caching to prevent repeated localStorage parsing
   */
  const loadConversations = useCallback(() => {
    try {
      const existingTileAssignments = JSON.parse(localStorage.getItem('purl_grid_tile_assignments') || '{}');
      
      const newConversationMap = new Map();
      const newRecentSet = new Set();
      
      // Prefer memory conversations, fallback to localStorage
      let conversations = [];
      if (memoryConversations && memoryConversations.length > 0) {
        conversations = mapMemoryConversations(memoryConversations);
        console.log(`🔄 Loading ${conversations.length} conversations from memories`);
      } else {
        // OPTIMIZATION: Check cache before parsing localStorage repeatedly
        const cacheKey = 'localStorage_conversations';
        if (processedConversationsCache.current.has(cacheKey)) {
          conversations = processedConversationsCache.current.get(cacheKey);
          console.log(`⚡ Using cached localStorage conversations (${conversations.length})`);
        } else {
          // Parse localStorage only once and cache
          const conversationIndex = JSON.parse(localStorage.getItem('purl_conversation_index') || '[]');
          const conversationLogs = JSON.parse(localStorage.getItem('purl_conversation_logs') || '[]');
          
          conversations = conversationIndex.map(conv => {
            const messages = conversationLogs.filter(log => log.conversationId === conv.conversationId);
            return {
              ...conv,
              messageCount: messages.length,
              lastMessage: messages[messages.length - 1]?.content?.slice(0, 50) || 'No messages', // OPTIMIZATION: Truncate
              preview: conv.preview || generatePreview(messages),
            };
          });
          
          // Cache the processed data
          processedConversationsCache.current.set(cacheKey, conversations);
          console.log(`📦 Cached ${conversations.length} localStorage conversations`);
        }
      }
      
      conversations.forEach(conv => {
        let cellId = existingTileAssignments[conv.conversationId];
        
        if (!cellId && gridDimensions.rows > 0 && gridDimensions.cols > 0) {
          // Assign new conversation to a random empty tile
          let attempts = 0;
          do {
            const randomRow = Math.floor(Math.random() * gridDimensions.rows);
            const randomCol = Math.floor(Math.random() * gridDimensions.cols);
            cellId = `${randomRow}-${randomCol}`;
            attempts++;
          } while (newConversationMap.has(cellId) && attempts < 100);
          
          // Save assignment to localStorage
          existingTileAssignments[conv.conversationId] = cellId;
          localStorage.setItem('purl_grid_tile_assignments', JSON.stringify(existingTileAssignments));
          
          // Mark as new conversation
          newRecentSet.add(cellId);
        }
        
        if (cellId) {
          const enrichedConv = {
            ...conv,
            cellId
          };
          
          newConversationMap.set(cellId, enrichedConv);
        }
      });
      
      // Check if we have new conversations
      const previousCount = conversationTiles.size;
      const newCount = newConversationMap.size;
      
      if (newCount > previousCount) {
        console.log(`🆕 New conversation detected! Grid now has ${newCount} conversations (was ${previousCount})`);
      }
      
      setConversationTiles(newConversationMap);
      setNewConversationTiles(newRecentSet);
      
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  }, [gridDimensions, memoryConversations, mapMemoryConversations]);

  /**
   * OPTIMIZED: Generate conversation preview text with content truncation
   */
  const generatePreview = (messages) => {
    const userMessages = messages.filter(m => m.type === 'user').slice(0, 2); // OPTIMIZATION: Reduced from 3 to 2
    if (userMessages.length === 0) return 'No user messages';
    
    return userMessages.map(m => String(m.content || '').slice(0, 30)).join(' | ') + // OPTIMIZATION: Reduced from 50 to 30 chars
           (userMessages.length < messages.filter(m => m.type === 'user').length ? '...' : '');
  };

  /**
   * Clear all clicked cells
   */
  const clearClickedCells = useCallback(() => {
    setClickedCells(new Set());
    if (onClearMarkers) {
      onClearMarkers();
    }
  }, [onClearMarkers]);

  // Expose clear function to parent component
  useEffect(() => {
    if (onClearMarkers && typeof onClearMarkers === 'function') {
      // Store the clear function reference
      window.clearGridMarkers = clearClickedCells;
    }
  }, [clearClickedCells, onClearMarkers]);

  // OPTIMIZATION: Remove redundant data fetching - use shared context data only
  // The ElizaMemoriesContext already handles all data fetching with optimized polling
  
  // Load conversations when memory data changes (passive - no additional API calls)
  useEffect(() => {
    if (gridDimensions.rows > 0 && gridDimensions.cols > 0) {
      loadConversations();
    }
  }, [gridDimensions, loadConversations, memoryConversations]);

  // Listen for new conversations via context updates only (no manual refreshing)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'purl_conversation_index' || e.key === 'purl_conversation_logs') {
        console.log('🔄 Real-time conversation update detected:', e.key);
        // Clear cache when storage changes
        processedConversationsCache.current.clear();
        loadConversations();
      }
    };
    
    // Set up storage listeners only (no manual refresh intervals)
    window.addEventListener('storage', handleStorageChange);
    
    // OPTIMIZATION: Cache cleanup to prevent memory buildup
    const cacheCleanupInterval = setInterval(() => {
      if (processedConversationsCache.current.size > 10) {
        processedConversationsCache.current.clear();
        console.log('🧹 Cleared conversation cache to prevent memory buildup');
      }
    }, 300000); // Clean every 5 minutes
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(cacheCleanupInterval);
      // Clean cache on unmount
      processedConversationsCache.current.clear();
    };
  }, [loadConversations]);

  if (!isVisible) return null;

  const themeColors = theme === 'dark' 
    ? { border: 'rgba(0, 255, 0, 0.15)', hover: 'rgba(0, 255, 0, 0.3)', click: 'rgba(0, 255, 0, 0.5)' }
    : { border: 'rgba(30, 41, 59, 0.15)', hover: 'rgba(30, 41, 59, 0.3)', click: 'rgba(30, 41, 59, 0.5)' };

  return (
    <div 
      ref={gridContainerRef}
      className={`interactive-grid-container ${theme}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'auto',
        zIndex: 3,
        opacity: opacity,
        cursor: 'pointer',
        // CSS Grid background - much more efficient than DOM elements
        backgroundImage: `
          linear-gradient(${themeColors.border} 1px, transparent 1px),
          linear-gradient(90deg, ${themeColors.border} 1px, transparent 1px)
        `,
        backgroundSize: `${cellSize}px ${cellSize}px`
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Heat map canvas - single element for maximum performance */}
      {showHeatMap && (
        <canvas
          ref={heatMapCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 1,
            opacity: 0.8
          }}
        />
      )}

      {/* Conversation tiles markers - indicate tiles with chat logs */}
      {Array.from(conversationTiles.entries()).map(([cellId, conversation]) => {
        const [row, col] = cellId.split('-').map(Number);
        const isNew = newConversationTiles.has(cellId);
        
        // Check if conversation is from the last 10 minutes
        const now = new Date();
        const conversationTime = new Date(conversation.startTime);
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
        const isRecent = conversationTime > tenMinutesAgo;
        
        // Get dynamic color based on message count
        const tileColors = getConversationTileColor(conversation.messageCount, theme);
        
        return (
          <div
            key={`conversation-${cellId}`}
            className="conversation-tile-marker"
            style={{
              position: 'absolute',
              left: col * cellSize,
              top: row * cellSize,
              width: cellSize,
              height: cellSize,
              pointerEvents: 'none',
              zIndex: 3,
              // Dynamic background based on message count - more messages = more saturated
              background: tileColors.background,
              border: `2px solid ${tileColors.borderColor}`,
              borderRadius: '3px',
              boxShadow: tileColors.boxShadow,
              // Use animation only for recent conversations (last 10 minutes)
              animation: isRecent 
                ? (theme === 'dark' 
                  ? 'recentConversationFlashDark 1.5s ease-in-out infinite'
                  : 'recentConversationFlashLight 1.5s ease-in-out infinite')
                : 'none' // No animation for regular tiles - let the saturation do the talking
            }}
          >
            {/* Small indicator dot for additional visibility */}
            <div style={{
              position: 'absolute',
              top: '1px',
              left: '1px',
              width: '4px',
              height: '4px',
              background: theme === 'dark' ? '#ffffff' : '#ffffff',
              borderRadius: '50%',
              boxShadow: theme === 'dark' 
                ? '0 0 4px rgba(255, 255, 255, 0.8)' 
                : '0 0 4px rgba(255, 255, 255, 0.6)'
            }} />
            
            {/* New conversation indicator (pulsing) */}
            {isNew && (
              <div style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '4px',
                height: '4px',
                background: '#ff4444',
                borderRadius: '50%',
                animation: 'newConversationPulse 2s ease-in-out infinite',
                boxShadow: '0 0 6px rgba(255, 68, 68, 0.8)'
              }} />
            )}
            
            {/* Message count indicator for conversation tiles */}
            <div style={{
              position: 'absolute',
              bottom: '1px',
              right: '1px',
              fontSize: '6px',
              fontWeight: 'bold',
              color: theme === 'dark' ? '#000000' : '#ffffff',
              textShadow: theme === 'dark' 
                ? '0 0 2px rgba(0, 0, 0, 0.8)' 
                : '0 0 2px rgba(0, 0, 0, 0.8)',
              lineHeight: '6px',
              minWidth: '6px',
              textAlign: 'center'
            }}>
              {conversation.messageCount > 99 ? '99+' : conversation.messageCount}
            </div>
            

          </div>
        );
      })}

      {/* Clicked tiles markers - persistent visual indicators */}
      {Array.from(clickedCells).map((cellId) => {
        const [row, col] = cellId.split('-').map(Number);
        return (
          <div
            key={`marker-${cellId}`}
            className="clicked-tile-marker"
            style={{
              position: 'absolute',
              left: col * cellSize,
              top: row * cellSize,
              width: cellSize,
              height: cellSize,
              pointerEvents: 'none',
              zIndex: 4,
              // Corner marker style
              '::before': {
                content: '""',
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '6px',
                height: '6px',
                background: theme === 'dark' ? '#00ff00' : '#ba8259',
                borderRadius: '50%',
                boxShadow: theme === 'dark' 
                  ? '0 0 8px #00ff00, inset 0 0 4px rgba(0, 255, 0, 0.8)'
                  : '0 0 8px #ba8259, inset 0 0 4px rgba(186, 130, 89, 0.8)'
              }
            }}
          >
            {/* Theme-aware ultra bright marker with enhanced shine effect */}
            <div style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '8px',
              height: '8px',
              background: theme === 'dark' 
                ? 'linear-gradient(135deg, #00bfff 0%, #ffffff 50%, #00bfff 100%)'
                : 'linear-gradient(135deg, #8b5cf6 0%, #ffffff 50%, #8b5cf6 100%)',
              borderRadius: '50%',
              border: theme === 'dark' 
                ? '1px solid rgba(0, 191, 255, 1)'
                : '1px solid rgba(139, 92, 246, 1)',
              boxShadow: theme === 'dark' 
                ? `
                  0 0 20px rgba(0, 191, 255, 1),
                  0 0 12px rgba(0, 191, 255, 0.9),
                  0 0 6px rgba(255, 255, 255, 0.8),
                  inset 0 1px 2px rgba(255, 255, 255, 0.9),
                  inset 0 -1px 2px rgba(0, 191, 255, 0.5)
                `
                : `
                  0 0 16px rgba(139, 92, 246, 1),
                  0 0 8px rgba(139, 92, 246, 0.9),
                  0 0 4px rgba(255, 255, 255, 0.8),
                  inset 0 1px 2px rgba(255, 255, 255, 0.9),
                  inset 0 -1px 2px rgba(139, 92, 246, 0.5)
                `,
              animation: theme === 'dark' 
                ? 'markerShineBlue 3s ease-in-out infinite'
                : 'markerShinePurple 3s ease-in-out infinite'
            }} />
            
            {/* Theme-aware blue/purple border for clicked tiles */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: theme === 'dark' 
                ? '1px solid rgba(0, 191, 255, 0.8)'
                : '1px solid rgba(139, 92, 246, 0.8)',
              borderRadius: '3px',
              background: theme === 'dark' 
                ? 'rgba(0, 191, 255, 0.15)'
                : 'rgba(139, 92, 246, 0.15)',
              boxShadow: theme === 'dark' 
                ? 'inset 0 0 8px rgba(0, 191, 255, 0.3)'
                : 'inset 0 0 8px rgba(139, 92, 246, 0.3)'
            }} />
          </div>
        );
      })}

      {/* OPTIMIZED: Single hover overlay element with hardware acceleration */}
      <div
        ref={hoverOverlayRef}
        className="grid-hover-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: cellSize,
          height: cellSize,
          border: theme === 'dark' 
            ? `2px solid rgba(0, 255, 65, 0.95)` 
            : `2px solid rgba(255, 107, 53, 0.95)`,
          background: theme === 'dark' 
            ? `rgba(0, 255, 65, 0.35)` 
            : `rgba(255, 107, 53, 0.35)`,
          // OPTIMIZATION: Simplified shadows for better performance
          boxShadow: theme === 'dark' 
            ? `0 0 ${cellSize/2}px rgba(0, 255, 65, 0.6)`
            : `0 0 ${cellSize/2}px rgba(255, 107, 53, 0.6)`,
          display: 'none',
          pointerEvents: 'none',
          // OPTIMIZATION: Use will-change and transform3d for hardware acceleration
          willChange: 'transform',
          transform: 'translate3d(0, 0, 0) scale(1.1)',
          borderRadius: '3px',
          zIndex: 5,
          // OPTIMIZATION: Removed animation to reduce GPU load
          transition: 'opacity 0.1s ease-out'
        }}
      />
      
      {/* Single click animation overlay - vibrant saturated peachy-gold */}
      <div
        ref={clickOverlayRef}
        className="grid-click-overlay"
        style={{
          position: 'absolute',
          width: cellSize,
          height: cellSize,
          border: theme === 'dark' 
            ? `4px solid rgba(0, 255, 65, 1)` 
            : `4px solid rgba(255, 107, 53, 1)`,
          background: theme === 'dark' 
            ? `rgba(0, 255, 65, 0.5)` 
            : `rgba(255, 107, 53, 0.5)`,
          display: 'none',
          pointerEvents: 'none',
          borderRadius: '4px',
          zIndex: 6
        }}
      />
      

      
      <style>{`
        /* Dramatic hover pulse animation */
        @keyframes gridHoverPulse {
          0% {
            opacity: 0.8;
            transform: scale(1.2);
          }
          50% {
            opacity: 1;
            transform: scale(1.25);
          }
          100% {
            opacity: 0.8;
            transform: scale(1.2);
          }
        }
        
        /* Clicked tile marker shine animation - theme-aware ultra bright colors */
        @keyframes markerShine {
          0% {
            opacity: 0.9;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 0.9;
            transform: scale(1);
          }
        }
        
        /* Dark theme neon green marker shine - intense cyberpunk style */
        @keyframes markerShineDark {
          0% {
            opacity: 0.9;
            transform: scale(1);
            box-shadow: 
              0 0 20px rgba(0, 255, 65, 1),
              0 0 12px rgba(0, 255, 65, 0.9),
              0 0 6px rgba(255, 255, 255, 0.8),
              inset 0 1px 2px rgba(255, 255, 255, 0.9),
              inset 0 -1px 2px rgba(0, 255, 65, 0.5);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
            box-shadow: 
              0 0 32px rgba(0, 255, 65, 1),
              0 0 24px rgba(0, 255, 65, 1),
              0 0 16px rgba(255, 255, 255, 1),
              0 0 8px rgba(0, 255, 65, 0.8),
              inset 0 2px 4px rgba(255, 255, 255, 1),
              inset 0 -2px 4px rgba(0, 255, 65, 0.6);
          }
          100% {
            opacity: 0.9;
            transform: scale(1);
            box-shadow: 
              0 0 20px rgba(0, 255, 65, 1),
              0 0 12px rgba(0, 255, 65, 0.9),
              0 0 6px rgba(255, 255, 255, 0.8),
              inset 0 1px 2px rgba(255, 255, 255, 0.9),
              inset 0 -1px 2px rgba(0, 255, 65, 0.5);
          }
        }
        
        /* Blue marker shine animation for dark theme clicked tiles */
        @keyframes markerShineBlue {
          0% {
            opacity: 0.9;
            transform: scale(1);
            box-shadow: 
              0 0 20px rgba(0, 191, 255, 1),
              0 0 12px rgba(0, 191, 255, 0.9),
              0 0 6px rgba(255, 255, 255, 0.8),
              inset 0 1px 2px rgba(255, 255, 255, 0.9),
              inset 0 -1px 2px rgba(0, 191, 255, 0.5);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
            box-shadow: 
              0 0 28px rgba(0, 191, 255, 1),
              0 0 20px rgba(0, 191, 255, 1),
              0 0 12px rgba(255, 255, 255, 1),
              0 0 6px rgba(0, 191, 255, 0.8),
              inset 0 2px 4px rgba(255, 255, 255, 1),
              inset 0 -2px 4px rgba(0, 191, 255, 0.6);
          }
          100% {
            opacity: 0.9;
            transform: scale(1);
            box-shadow: 
              0 0 20px rgba(0, 191, 255, 1),
              0 0 12px rgba(0, 191, 255, 0.9),
              0 0 6px rgba(255, 255, 255, 0.8),
              inset 0 1px 2px rgba(255, 255, 255, 0.9),
              inset 0 -1px 2px rgba(0, 191, 255, 0.5);
          }
        }
        
        /* Purple marker shine animation for light theme clicked tiles */
        @keyframes markerShinePurple {
          0% {
            opacity: 0.9;
            transform: scale(1);
            box-shadow: 
              0 0 16px rgba(139, 92, 246, 1),
              0 0 8px rgba(139, 92, 246, 0.9),
              0 0 4px rgba(255, 255, 255, 0.8),
              inset 0 1px 2px rgba(255, 255, 255, 0.9),
              inset 0 -1px 2px rgba(139, 92, 246, 0.5);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
            box-shadow: 
              0 0 24px rgba(139, 92, 246, 1),
              0 0 16px rgba(139, 92, 246, 1),
              0 0 8px rgba(255, 255, 255, 1),
              0 0 4px rgba(139, 92, 246, 0.8),
              inset 0 2px 4px rgba(255, 255, 255, 1),
              inset 0 -2px 4px rgba(139, 92, 246, 0.6);
          }
          100% {
            opacity: 0.9;
            transform: scale(1);
            box-shadow: 
              0 0 16px rgba(139, 92, 246, 1),
              0 0 8px rgba(139, 92, 246, 0.9),
              0 0 4px rgba(255, 255, 255, 0.8),
              inset 0 1px 2px rgba(255, 255, 255, 0.9),
              inset 0 -1px 2px rgba(139, 92, 246, 0.5);
          }
        }

        /* New conversation pulse animation */
        @keyframes newConversationPulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Recent conversation flash animation (last 10 minutes) - theme-aware */
        @keyframes recentConversationFlash {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        /* Dark theme recent conversation flash - intense neon green */
        @keyframes recentConversationFlashDark {
          0% {
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 0 20px rgba(0, 255, 65, 0.8), 0 0 12px rgba(0, 255, 65, 0.6);
          }
          50% {
            opacity: 0.2;
            transform: scale(0.7);
            box-shadow: 0 0 32px rgba(0, 255, 65, 1), 0 0 20px rgba(0, 255, 65, 0.9), 0 0 12px rgba(255, 255, 255, 0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 0 20px rgba(0, 255, 65, 0.8), 0 0 12px rgba(0, 255, 65, 0.6);
          }
        }
        
        /* Light theme recent conversation flash - bright orange */
        @keyframes recentConversationFlashLight {
          0% {
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 0 16px rgba(255, 107, 53, 0.8), 0 0 8px rgba(255, 107, 53, 0.6);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.8);
            box-shadow: 0 0 24px rgba(255, 107, 53, 1), 0 0 16px rgba(255, 107, 53, 0.9), 0 0 8px rgba(255, 255, 255, 0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 0 16px rgba(255, 107, 53, 0.8), 0 0 8px rgba(255, 107, 53, 0.6);
          }
        }
        
        /* Conversation tile flashing animations - subtle but noticeable */
        @keyframes conversationTileFlashDark {
          0% {
            opacity: 0.8;
            background: rgba(0, 255, 65, 0.8);
            box-shadow: 0 0 8px rgba(0, 255, 65, 0.6), inset 0 0 4px rgba(0, 255, 65, 0.3);
          }
          50% {
            opacity: 1;
            background: rgba(0, 255, 65, 1);
            box-shadow: 0 0 16px rgba(0, 255, 65, 0.8), inset 0 0 8px rgba(0, 255, 65, 0.5), 0 0 4px rgba(255, 255, 255, 0.4);
          }
          100% {
            opacity: 0.8;
            background: rgba(0, 255, 65, 0.8);
            box-shadow: 0 0 8px rgba(0, 255, 65, 0.6), inset 0 0 4px rgba(0, 255, 65, 0.3);
          }
        }
        
        @keyframes conversationTileFlashLight {
          0% {
            opacity: 0.9;
            background: rgba(186, 130, 89, 0.9);
            box-shadow: 0 0 8px rgba(186, 130, 89, 0.5), inset 0 0 4px rgba(186, 130, 89, 0.2);
          }
          50% {
            opacity: 1;
            background: rgba(186, 130, 89, 1);
            box-shadow: 0 0 16px rgba(186, 130, 89, 0.7), inset 0 0 8px rgba(186, 130, 89, 0.4), 0 0 4px rgba(255, 255, 255, 0.3);
          }
          100% {
            opacity: 0.9;
            background: rgba(186, 130, 89, 0.9);
            box-shadow: 0 0 8px rgba(186, 130, 89, 0.5), inset 0 0 4px rgba(186, 130, 89, 0.2);
          }
        }
        
        /* Enhanced click animation for the overlay */
        .grid-click-overlay.animating {
          animation: cellClickBurst 0.6s ease-out;
        }
        
        @keyframes cellClickBurst {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          30% {
            transform: scale(1.6);
            opacity: 0.9;
            box-shadow: 
              inset 0 0 30px currentColor,
              0 0 40px currentColor,
              0 0 60px currentColor;
          }
          70% {
            transform: scale(1.4);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.2);
            opacity: 0.5;
          }
        }
        

      `}</style>
    </div>
  );
};

export default InteractiveGrid;
