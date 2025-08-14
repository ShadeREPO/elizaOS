import { useState, useEffect } from 'react';
import { ASCII_FRAMES } from '../assets/asciiFrames.js';

/**
 * Simple ASCII Cat Component for Chat Interface
 * Displays a cute ASCII cat with basic blinking animation
 * Used in chat empty states to represent Purl character
 */
const AsciiCat = ({ 
  size = 'medium', // 'small', 'medium', 'large'
  animated = true, // Whether to show blinking animation
  expression = 'normal' // 'normal', 'happy', 'sleepy'
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);

  // Simple frames for chat interface
  const chatFrames = {
    normal: [
      // Normal alert look
      `  ^---^
 (=•.•=)
 > ^ <`,
      // Blink
      `  ^---^
 (=-.-=)
 > ^ <`,
      // Back to normal
      `  ^---^
 (=•.•=)
 > ^ <`
    ],
    happy: [
      // Happy content look
      `  ^---^
 (=^.^=)
 > v <`,
      // Blink happy
      `  ^---^
 (=-.-=)
 > v <`,
      // Back to happy
      `  ^---^
 (=^.^=)
 > v <`
    ],
    sleepy: [
      // Sleepy look
      `  ^---^
 (=-.u=)
 > ~ <`,
      // Very sleepy
      `  ^---^
 (=u.u=)
 > ~ <`,
      // Back to sleepy
      `  ^---^
 (=-.u=)
 > ~ <`
    ]
  };

  // Animation logic - simple blink every few seconds
  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        const frames = chatFrames[expression] || chatFrames.normal;
        return (prev + 1) % frames.length;
      });
    }, 2000); // Slow blink every 2 seconds

    return () => clearInterval(interval);
  }, [animated, expression]);

  // Get current frame
  const frames = chatFrames[expression] || chatFrames.normal;
  const currentAsciiFrame = frames[currentFrame];

  // Size classes
  const sizeClass = `ascii-cat-${size}`;

  return (
    <div className={`ascii-cat-container ${sizeClass}`}>
      <pre className="ascii-cat-display">{currentAsciiFrame}</pre>
    </div>
  );
};

export default AsciiCat;
