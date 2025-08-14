import { useState, useEffect } from 'react';

/**
 * ThoughtBox Component
 * 
 * Displays the cat's thoughts in an ASCII-styled thought bubble.
 * Features terminal aesthetics with typewriter effect and ASCII art borders.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.thought - The thought text to display
 * @param {string} props.theme - Current theme ('dark' or 'light')
 * @param {boolean} props.isVisible - Whether the thought box should be visible
 * @param {boolean} props.isTyping - Whether to show typing animation
 */
const ThoughtBox = ({ 
  thought = "I'm thinking about virtual treats...", 
  theme = 'dark', 
  isVisible = true,
  isTyping = false,
  debugPosition = 'right'
}) => {
  const [displayedThought, setDisplayedThought] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  // Typewriter effect for displaying thoughts
  useEffect(() => {
    if (!thought || !isVisible) {
      setDisplayedThought('');
      return;
    }

    let timeoutId;
    let currentIndex = 0;

    const typeWriter = () => {
      if (currentIndex <= thought.length) {
        setDisplayedThought(thought.slice(0, currentIndex));
        currentIndex++;
        timeoutId = setTimeout(typeWriter, 50 + Math.random() * 50); // Vary typing speed
      }
    };

    // Reset and start typing
    setDisplayedThought('');
    currentIndex = 0;
    typeWriter();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [thought, isVisible]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 600);

    return () => clearInterval(cursorInterval);
  }, []);

  // Don't render if not visible
  if (!isVisible) return null;

  // Generate ASCII border based on content length
  const maxLineLength = Math.max(
    ...displayedThought.split('\n').map(line => line.length),
    20 // Minimum width
  );
  const borderWidth = Math.min(maxLineLength + 4, 50); // Max width constraint

  // ASCII thought bubble parts
  const topBorder = '╭' + '─'.repeat(borderWidth - 2) + '╮';
  const bottomBorder = '╰' + '─'.repeat(borderWidth - 2) + '╯';
  const thoughtTail = '   ○ ○ ○';

  // Format thought text with proper padding
  const formatThoughtLines = (text) => {
    const lines = text.split('\n');
    return lines.map(line => {
      const padding = Math.max(0, borderWidth - line.length - 4);
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      return '│ ' + ' '.repeat(leftPad) + line + ' '.repeat(rightPad) + ' │';
    });
  };

  const thoughtLines = formatThoughtLines(displayedThought);

  return (
    <div className={`thought-box ${theme} ${debugPosition !== 'right' ? 'debug-' + debugPosition : ''}`}>
      <div className="thought-bubble">
        {/* ASCII Thought Bubble */}
        <div className="ascii-bubble">
          <div className="bubble-line">{topBorder}</div>
          {thoughtLines.map((line, index) => (
            <div key={index} className="bubble-line">{line}</div>
          ))}
          {/* Show cursor on last line if typing or thinking */}
          {(isTyping || displayedThought.length < thought.length) && (
            <div className="bubble-line">
              │ {showCursor ? '█' : ' '} {' '.repeat(borderWidth - 5)} │
            </div>
          )}
          <div className="bubble-line">{bottomBorder}</div>
          <div className="thought-tail">{thoughtTail}</div>
        </div>

        {/* Thought status indicator - only show animated dots when thinking */}
        {isTyping && (
          <div className="thought-status">
            <span className="status-indicator typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThoughtBox;
