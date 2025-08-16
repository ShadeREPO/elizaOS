import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  MessageCircleIcon, 
  FileTextIcon, 
  TerminalIcon, 
  InfoIcon,
  AngelIcon,
  DevilIcon
} from './icons/Icons.jsx';

/**
 * BottomNavigation Component - Mobile-First Bottom Tab Navigation
 * 
 * Features:
 * - Thumb-friendly navigation for mobile devices
 * - Active route highlighting with smooth animations
 * - Vibrant icon indicators with badges
 * - Dual theme support (dark terminal / light modern)
 * - Touch-optimized tap targets (44px minimum)
 * - Smooth transitions and micro-interactions
 * - Only visible on mobile/tablet devices
 * - Includes theme toggle since header theme toggle is hidden on mobile
 * 
 * This replaces the hamburger menu navigation on mobile devices
 * providing a cleaner, more accessible navigation experience.
 */
const BottomNavigation = ({ theme = 'dark', onThemeChange }) => {
  const location = useLocation();

  // Navigation items with icons and labels
  const navItems = [
    {
      path: '/',
      icon: HomeIcon,
      label: 'Home',
      title: 'Go to home - Watch Purl\'s consciousness'
    },
    {
      path: '/chat',
      icon: MessageCircleIcon,
      label: 'Chat',
      title: 'Chat with Purl agent'
    },
    {
      path: '/logs',
      icon: FileTextIcon,
      label: 'Logs',
      title: 'View conversation history'
    },
    {
      path: '/terminal',
      icon: TerminalIcon,
      label: 'Terminal',
      title: 'Live agent surveillance feed'
    },
    {
      path: '/about',
      icon: InfoIcon,
      label: 'About',
      title: 'Learn more about Purl'
    }
  ];

  // Check if current path is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Theme toggle handler
  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  return (
    <nav className={`bottom-navigation ${theme}`} role="navigation" aria-label="Bottom navigation">
      <div className="bottom-nav-container">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-item ${active ? 'active' : ''}`}
              title={item.title}
              aria-label={item.title}
              aria-current={active ? 'page' : undefined}
            >
              {/* Icon with active indicator */}
              <div className="nav-icon-container">
                <IconComponent 
                  size={20} 
                  className="nav-icon" 
                />
                {active && (
                  <div className="active-indicator" aria-hidden="true"></div>
                )}
              </div>
              
              {/* Label */}
              <span className="nav-label">{item.label}</span>
              
              {/* Ripple effect for touch feedback */}
              <div className="nav-ripple" aria-hidden="true"></div>
            </Link>
          );
        })}
        
        {/* Theme Toggle Button */}
        <button
          onClick={handleThemeToggle}
          className="bottom-nav-item theme-toggle-btn"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          <div className="nav-icon-container">
            {theme === 'dark' ? (
              <AngelIcon size={20} className="nav-icon" />
            ) : (
              <DevilIcon size={20} className="nav-icon" />
            )}
          </div>
          <span className="nav-label">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>
          
          {/* Ripple effect for touch feedback */}
          <div className="nav-ripple" aria-hidden="true"></div>
        </button>
      </div>
      
      {/* Bottom safe area for devices with home indicators */}
      <div className="bottom-safe-area" aria-hidden="true"></div>
    </nav>
  );
};

export default BottomNavigation;
