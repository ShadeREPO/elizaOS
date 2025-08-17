import { useState, useEffect, useRef } from 'react';
import { 
  ASCII_ANIMATION_CONFIG,
  ASCII_EXPRESSION_FRAMES 
} from '../assets/asciiFrames.js';
import { CAT_STATES } from '../assets/spriteFrames.js';
import InteractiveGrid from './InteractiveGrid.jsx';

/**
 * MaintenancePage Component - Blurred Cat Display with Maintenance Message
 * 
 * Features:
 * - Blurred version of the main CatDisplay
 * - Centered maintenance message overlay
 * - Animated ASCII cat in background
 * - Interactive grid (blurred)
 * - Controlled by VITE_MAINTENANCE_MODE environment variable
 */
const MaintenancePage = ({ theme = 'dark' }) => {
  // Cat animation state
  const [currentState, setCurrentState] = useState(CAT_STATES.SITTING);
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // Animation ref
  const animationInterval = useRef(null);

  /**
   * Animation Controller - Handles frame cycling for ASCII cat
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

  // Cycle through sleeping and resting states for maintenance
  useEffect(() => {
    const stateRotation = [
      CAT_STATES.SLEEPING,
      CAT_STATES.SITTING,
      CAT_STATES.SLEEPING,
      CAT_STATES.SLEEPING
    ];
    
    let stateIndex = 0;
    const stateInterval = setInterval(() => {
      stateIndex = (stateIndex + 1) % stateRotation.length;
      setCurrentState(stateRotation[stateIndex]);
    }, 10000); // Change state every 10 seconds, mostly sleeping
    
    return () => clearInterval(stateInterval);
  }, []);

  // Get current ASCII frame data
  const getCurrentFrameData = () => {
    const currentAsciiFrame = ASCII_ANIMATION_CONFIG[currentState].frames[currentFrame];
    return currentAsciiFrame;
  };
  
  const frameData = getCurrentFrameData();

  return (
    <div className={`maintenance-page fullscreen-display fullscreen-${theme}`}>
      {/* Blurred Background - Cat Display */}
      <div className={`maintenance-background tamagotchi-screen fullscreen-screen fullscreen-${theme}`}>
        
        {/* Blurred Interactive Grid */}
        <InteractiveGrid
          theme={theme}
          cellSize={20}
          onCellClick={() => {}} // Disabled during maintenance
          isVisible={true}
          opacity={0.3}
          hoverOpacity={0.3}
          showHeatMap={true}
          heatMapSeed={42}
          disabled={true}
        />

        {/* Blurred ASCII Cat */}
        <div className="ascii-container maintenance-cat">
          <pre className="ascii-cat">{frameData}</pre>
        </div>
      </div>

      {/* Maintenance Message Overlay */}
      <div className="maintenance-overlay">
        <div className="maintenance-content">
          {/* Purl Logo/Icon */}
          <div className="maintenance-logo">
            <img 
              src="/logo_web.png" 
              alt="Purl Logo" 
              className="maintenance-logo-image"
            />
          </div>
          
          {/* Main Message */}
          <h1 className="maintenance-title">
            Purl is Sleeping
          </h1>
          
          <div className="maintenance-message">
            <p>
              Our digital cat is currently fast asleep, dreaming of digital mice and virtual sunbeams.
            </p>
            <p>
              She'll wake up soon and be ready to chat again!
            </p>
          </div>
          
          {/* Status Indicator */}
          <div className="maintenance-status">
            <div className="status-indicator">
              <div className="status-dot"></div>
              <span>Purl is Dreaming</span>
            </div>
          </div>
          

        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
