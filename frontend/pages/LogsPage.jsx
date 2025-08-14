import ConversationLogs from '../components/ConversationLogs.jsx';
import Footer from '../components/Footer.jsx';

/**
 * LogsPage - Conversation logs browser page
 * 
 * This page provides a structured wrapper around the ConversationLogs component
 * with proper layout, theme support, and footer integration.
 */
const LogsPage = ({ theme = 'dark' }) => {
  return (
    <main className="app-main logs-main">
      <ConversationLogs theme={theme} />
      <Footer theme={theme} />
    </main>
  );
};

export default LogsPage;
