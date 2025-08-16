import BackroomTerminal from './BackroomTerminal.jsx';

/**
 * Terminal Component - Dedicated Backroom Surveillance Feed
 * 
 * A dedicated page for the surveillance-style live agent memory feed.
 * Separate from the conversation logs for different user experiences.
 */
const Terminal = ({ theme = 'dark' }) => {
  // ElizaOS Agent ID - you may want to make this configurable
  const AGENT_ID = '40608b6b-63b6-0e2c-b819-9d9850d060ec';

  return (
    <div className="terminal-page">
      <BackroomTerminal theme={theme} agentId={AGENT_ID} />
    </div>
  );
};

export default Terminal;
