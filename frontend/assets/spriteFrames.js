// Cat Sprite Animation System
// Using sprite sheet for dynamic cat animations
// Each sprite is defined by its position and size in the sprite sheet

import purlSprites from './purl_sprites.png';

// Sprite sheet configuration
export const SPRITE_CONFIG = {
  spriteSheet: purlSprites,
  spriteWidth: 32,    // Width of each individual sprite
  spriteHeight: 32,   // Height of each individual sprite
  columns: 7,         // Number of sprites per row
  rows: 1,            // Number of rows in the sprite sheet
  sheetWidth: 224,    // Total width of sprite sheet (7 * 32)
  sheetHeight: 32     // Total height of sprite sheet (1 * 32)
};

// Define sprite positions in the sheet (0-indexed)
// Based on the sprite sheet layout: sitting, walking, jumping, etc.
export const SPRITE_POSITIONS = {
  // Base sitting/idle poses
  sitting: [
    { row: 0, col: 0 }, // First sprite - basic sitting
  ],
  
  // Walking animation - multiple frames for smooth movement
  walking: [
    { row: 0, col: 1 }, // Walking frame 1
    { row: 0, col: 2 }, // Walking frame 2
    { row: 0, col: 3 }, // Walking frame 3
    { row: 0, col: 1 }, // Walking frame 4 (repeat for smooth loop)
  ],
  
  // Jumping animation - excited poses
  jumping: [
    { row: 0, col: 0 }, // Crouch preparation
    { row: 0, col: 4 }, // Mid-jump
    { row: 0, col: 5 }, // Peak jump
  ],
  
  // Eating animation - cute eating poses
  eating: [
    { row: 0, col: 0 }, // Looking at food
    { row: 0, col: 6 }, // Eating motion
  ],
  
  // Sleeping animation - peaceful rest
  sleeping: [
    { row: 0, col: 0 }, // Resting
    { row: 0, col: 0 }, // Deep sleep (same pose, could add zzz overlay)
  ]
};

// Animation configuration for each state
export const SPRITE_ANIMATION_CONFIG = {
  sitting: {
    frames: SPRITE_POSITIONS.sitting,
    duration: 2000, // Static state, longer duration
    loop: false
  },
  walking: {
    frames: SPRITE_POSITIONS.walking,
    duration: 200, // Fast frame cycling for smooth walk
    loop: true
  },
  jumping: {
    frames: SPRITE_POSITIONS.jumping,
    duration: 300, // Medium speed for jump sequence
    loop: false
  },
  eating: {
    frames: SPRITE_POSITIONS.eating,
    duration: 500, // Moderate speed for eating motion
    loop: true
  },
  sleeping: {
    frames: SPRITE_POSITIONS.sleeping,
    duration: 1000, // Slow, peaceful animation
    loop: true
  }
};

// Available states for external control
export const CAT_STATES = {
  SITTING: 'sitting',
  WALKING: 'walking',
  JUMPING: 'jumping',
  EATING: 'eating',
  SLEEPING: 'sleeping'
};

// Helper function to calculate sprite background position
export const getSpritePosition = (spritePos) => {
  const xPos = -spritePos.col * SPRITE_CONFIG.spriteWidth;
  const yPos = -spritePos.row * SPRITE_CONFIG.spriteHeight;
  return `${xPos}px ${yPos}px`;
};

// Helper function to get sprite size for CSS
export const getSpriteSize = () => {
  return `${SPRITE_CONFIG.sheetWidth}px ${SPRITE_CONFIG.sheetHeight}px`;
};
