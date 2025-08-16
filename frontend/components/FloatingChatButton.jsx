import { Link, useLocation } from 'react-router-dom';
import { MessageCircleIcon } from './icons/Icons.jsx';

/**
 * FloatingChatButton Component - Quick Chat Access for Mobile
 * 
 * Features:
 * - Floating action button for instant chat access
 * - Hides when already on chat page to avoid redundancy
 * - Smooth animations with bounce effect
 * - Dual theme support (dark terminal / light modern)
 * - Touch-optimized with haptic feedback styling
 * - Positioned to not interfere with bottom navigation
 * - Accessibility-friendly with proper ARIA labels
 */
const FloatingChatButton = ({ theme = 'dark' }) => {
  const location = useLocation();
  
  // Hide the FAB when already on chat pages
  const isOnChatPage = location.pathname === '/chat' || location.pathname === '/chat-api';
  
  if (isOnChatPage) {
    return null;
  }

  return (
    <Link
      to="/chat"
      className={`floating-chat-button ${theme}`}
      title="Quick chat with Purl"
      aria-label="Open chat with Purl agent"
      role="button"
    >
      {/* Chat Icon */}
      <div className="fab-icon-container">
        <MessageCircleIcon 
          size={24} 
          className="fab-icon" 
        />
        
        {/* Pulse indicator for attention */}
        <div className="fab-pulse" aria-hidden="true"></div>
      </div>
      
      {/* Ripple effect for touch feedback */}
      <div className="fab-ripple" aria-hidden="true"></div>
    </Link>
  );
};

export default FloatingChatButton;
