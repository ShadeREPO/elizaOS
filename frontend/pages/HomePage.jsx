import CatDisplay from '../components/CatDisplay.jsx';

/**
 * HomePage - Immersive cat display page
 * 
 * This page provides the main Purl experience with the ASCII cat display,
 * interactive grid, and full theme support.
 */
const HomePage = ({ theme, onThemeChange, onConnectionChange }) => {
  return (
    <main className="app-main fullscreen-main">
      <CatDisplay 
        onConnectionChange={onConnectionChange}
        onThemeChange={onThemeChange}
        initialTheme={theme}
      />
    </main>
  );
};

export default HomePage;
