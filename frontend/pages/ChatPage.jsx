import AgentChatSocket from '../components/AgentChatSocket.jsx';
import Footer from '../components/Footer.jsx';

/**
 * ChatPage - Real-time chat page with Purl
 * 
 * This page provides a structured wrapper around the AgentChatSocket component
 * with proper layout, theme support, and footer integration.
 */
const ChatPage = ({ theme = 'dark' }) => {
  return (
    <main className="app-main chat-main">
      <AgentChatSocket theme={theme} />
      <Footer theme={theme} />
    </main>
  );
};

export default ChatPage;
