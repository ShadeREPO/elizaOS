import BackroomTerminal from './BackroomTerminal.jsx';

/**
 * Terminal Component - Dedicated Backroom Surveillance Feed
 * 
 * A dedicated page for the surveillance-style live agent memory feed.
 * Separate from the conversation logs for different user experiences.
 */
const Terminal = ({ theme = 'dark' }) => {
  // ElizaOS Agent ID - you may want to make this configurable
  const AGENT_ID = 'b850bc30-45f8-0041-a00a-83df46d8555d';

  return (
    <div className="terminal-page">
      <BackroomTerminal theme={theme} agentId={AGENT_ID} />
    </div>
  );
};

export default Terminal;
