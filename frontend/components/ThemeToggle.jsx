
import { AngelIcon, DevilIcon } from './icons/Icons.jsx';

/**
 * ThemeToggle Component - Universal theme toggle matching CatDisplay design
 * Features:
 * - Toggles between dark and light themes
 * - Persists theme preference in localStorage
 * - Matches CatDisplay's theme toggle styling
 * - Fixed position bottom-left like original
 * Note: Body classes are managed globally by App.jsx
 */
const ThemeToggle = ({ theme, onThemeChange }) => {
  // Note: Body classes are managed by the active page component (CatDisplay, etc.)

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    // Save to localStorage (keeping compatibility with both keys)
    localStorage.setItem('purl-theme', newTheme);
    localStorage.setItem('purl-fullscreen-theme', newTheme);
    
    // Notify parent component
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  return (
    <div className="theme-toggle">
      <button
        onClick={toggleTheme}
        className="theme-toggle-btn"
        title={`Switch to ${theme === 'dark' ? 'Angel (Light)' : 'Devil (Dark)'} Theme`}
        aria-label={`Switch to ${theme === 'dark' ? 'angel light' : 'devil dark'} theme`}
      >
        {theme === 'dark' ? <AngelIcon size={18} /> : <DevilIcon size={18} />}
      </button>
    </div>
  );
};

export default ThemeToggle;
