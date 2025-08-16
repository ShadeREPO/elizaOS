import React, { createContext, useContext } from 'react';
import useElizaMemories from '../hooks/useElizaMemories.js';

/**
 * ElizaMemories Context Provider
 * 
 * Provides a single shared instance of ElizaMemories data to all components,
 * eliminating redundant API calls and reducing log spam.
 * 
 * Benefits:
 * - Single polling instance instead of 4+ separate ones
 * - Shared cache and state across all components
 * - Dramatically reduced API requests and logging
 * - Better performance and resource usage
 * - Centralized error handling
 */

// Create the context
const ElizaMemoriesContext = createContext(null);

/**
 * ElizaMemories Provider Component
 * 
 * Wraps the application and provides shared ElizaMemories data
 * to all child components that need it.
 */
export const ElizaMemoriesProvider = ({ 
  children, 
  agentId = '40608b6b-63b6-0e2c-b819-9d9850d060ec' // Default agent ID
}) => {
  // Debug: Track provider instances
  React.useEffect(() => {
    console.log('🏗️ [ElizaMemoriesProvider] Provider instance created/mounted');
    return () => {
      console.log('🗑️ [ElizaMemoriesProvider] Provider instance destroyed/unmounted');
    };
  }, []);

  // Single instance of the memories hook - shared by all components
  const memoriesData = useElizaMemories(agentId);
  
  // OPTIMIZATION: Fixed infinite re-render - only log on significant changes
  React.useEffect(() => {
    if (memoriesData.memories.length > 0) {
      console.log(`🌐 [ElizaMemoriesProvider] Providing data to all components: ${memoriesData.memories.length} memories, ${memoriesData.conversations.length} conversations`);
    }
  }, [memoriesData.memories.length, memoriesData.conversations.length]); // This is fine - only updates when counts change

  return (
    <ElizaMemoriesContext.Provider value={{
      ...memoriesData,
      agentId // Add agentId to the context value
    }}>
      {children}
    </ElizaMemoriesContext.Provider>
  );
};

/**
 * Hook to consume ElizaMemories context
 * 
 * Use this instead of useElizaMemories directly in components
 * to get the shared data instance.
 */
export const useElizaMemoriesContext = () => {
  const context = useContext(ElizaMemoriesContext);
  
  if (context === null) {
    throw new Error(
      'useElizaMemoriesContext must be used within an ElizaMemoriesProvider. ' +
      'Make sure to wrap your app or component tree with <ElizaMemoriesProvider>.'
    );
  }
  
  return context;
};

/**
 * HOC (Higher-Order Component) for components that need ElizaMemories data
 * 
 * Alternative to using the hook directly - wraps component with context consumer
 */
export const withElizaMemories = (Component) => {
  return function WrappedComponent(props) {
    const memoriesData = useElizaMemoriesContext();
    return <Component {...props} memoriesData={memoriesData} />;
  };
};

/**
 * USAGE EXAMPLES:
 * 
 * 1. Wrap your app:
 * ```jsx
 * <ElizaMemoriesProvider agentId="your-agent-id">
 *   <App />
 * </ElizaMemoriesProvider>
 * ```
 * 
 * 2. Use in components:
 * ```jsx
 * const MyComponent = () => {
 *   const { memories, conversations, loading } = useElizaMemoriesContext();
 *   return <div>{memories.length} memories loaded</div>;
 * };
 * ```
 * 
 * 3. Use with HOC:
 * ```jsx
 * const MyComponent = ({ memoriesData }) => {
 *   return <div>{memoriesData.memories.length} memories</div>;
 * };
 * export default withElizaMemories(MyComponent);
 * ```
 */

export default ElizaMemoriesProvider;
