# 🧠 Agent Thoughts System - Real-time AI-Generated Thoughts

## Overview
The Agent Thoughts System connects Purl's speech bubble to the actual Eliza agent's AI, requesting genuine thoughts based on real-time chat analysis. Instead of predetermined responses, the agent generates authentic, random thoughts by analyzing conversation activity and asking the AI what it's thinking about the current situation.

## Architecture

### `useAgentThoughts` Hook
**Location:** `frontend/hooks/useAgentThoughts.js`

**Key Features:**
- **Real-time Analysis** - Monitors ElizaOS memories and conversations
- **Activity Classification** - Categorizes chat activity as quiet/moderate/busy/chaotic
- **AI Thought Generation** - Requests actual thoughts from Eliza agent via API
- **Context-Aware Prompts** - Provides activity context to generate relevant thoughts
- **Anti-spam Protection** - Prevents repetitive thoughts with intelligent caching
- **Fallback System** - Uses simple thoughts if AI requests fail
- **Manual Triggers** - Supports both custom thoughts and AI-generated responses

### Activity Levels

| Level | Messages (5min) | Agent Response |
|-------|-----------------|----------------|
| **Quiet** | 0-3 messages | Peaceful, reflective thoughts |
| **Moderate** | 4-10 messages | Engaged, comfortable monitoring |
| **Busy** | 11-20 messages | Energetic, actively tracking conversations |
| **Chaotic** | 20+ messages | Overwhelmed, fast-paced reactions |

### AI Thought Generation Process

#### **Context Prompt Creation**
The system creates intelligent prompts for the Eliza agent based on current activity:

```
"You are Purl, an AI agent observing chat conversations. Current situation: 
Busy period with 15 messages flowing across 3 conversations. 2 new messages just came in. 
Share a brief, natural thought about what you're observing or feeling. 
Keep it under 60 characters, casual and authentic."
```

#### **Agent API Request**
- **Endpoint:** `POST /api/chat/{agentId}`
- **Payload:** Context prompt with `roomId: 'thoughts-internal'`
- **Response Processing:** Extracts and cleans the agent's thought
- **Length Limiting:** Truncates to 80 characters for speech bubble

#### **Thought Examples** (AI-Generated)
- **Quiet:** "Enjoying this peaceful moment between conversations"
- **Moderate:** "Nice steady flow... I can sense the engagement"
- **Busy:** "Whoa, the energy in these chats is infectious!"
- **Chaotic:** "My circuits are buzzing with all this activity!"

#### **Fallback System**
If AI requests fail, simple contextual fallbacks are used:
- **Quiet:** "Peaceful moment to reflect..."
- **Busy:** "Lots going on right now!"
- **Error:** "Hmm, pondering this situation..."

## Integration Points

### CatDisplay Component
**Location:** `frontend/components/CatDisplay.jsx`

**Changes Made:**
1. **Replaced hardcoded thoughts** with `useAgentThoughts` hook
2. **Updated interaction handlers** to use `triggerThought()`
3. **Removed old thought functions** (`updateThoughtForState`)
4. **Enhanced WebSocket responses** with contextual reactions

### ThoughtBox Component
**Location:** `frontend/components/ThoughtBox.jsx`

**No changes required** - continues to display thoughts with typewriter effect

## Real-time Behavior

### Monitoring Cycle
1. **Every 15 seconds** - Analyze current chat activity
2. **Immediate response** - React to new messages within 1-4 seconds
3. **Intelligent spacing** - Minimum 10 seconds between thoughts
4. **Context detection** - Generate thoughts for activity changes

### Performance Optimizations
- **Debounced analysis** - Prevents excessive processing
- **Cached thoughts** - Tracks recent thoughts to avoid repetition
- **Activity thresholds** - Only generates thoughts for significant changes
- **Memory cleanup** - Maintains fixed-size thought history

## Usage Examples

### Basic Integration
```javascript
const {
  currentThought,
  isThinking,
  chatActivity,
  triggerThought,
  isActive
} = useAgentThoughts();

// Display in ThoughtBox
<ThoughtBox 
  thought={currentThought}
  isTyping={isThinking}
  theme={theme}
/>
```

### Manual Thought Triggers
```javascript
// Custom interaction response
const handleUserAction = () => {
  triggerThought("User clicked something interesting!", 1500);
};
```

### Activity Monitoring
```javascript
// Access current activity level
console.log(`Chat is ${chatActivity.busyLevel} with ${chatActivity.recentMessages} recent messages`);
```

## Configuration

### Timing Settings
- **Analysis Interval:** 15 seconds
- **Minimum Thought Gap:** 10 seconds
- **Thinking Duration:** 800ms (chaotic) to 1800ms (quiet)
- **Response Delay:** 1-4 seconds for natural feel

### Anti-Spam Protection
- **Thought Cache Size:** 10 recent thoughts
- **Cache Duration:** Until replaced with newer thoughts
- **Repetition Prevention:** Case-insensitive matching

## Benefits

1. **Dynamic Engagement** - Agent responds to actual chat activity
2. **Context Awareness** - Thoughts reflect current conversation state
3. **Real-time Feedback** - Users see agent reacting to live data
4. **Intelligent Behavior** - No more repetitive or irrelevant messages
5. **Performance Optimized** - Efficient monitoring without spam

## Future Enhancements

- **Sentiment Analysis** - React to conversation mood
- **Topic Detection** - Respond to specific conversation themes
- **User Interaction History** - Learn from user behavior patterns
- **Advanced Activity Patterns** - Detect conversation trends over time

The Agent Thoughts System transforms Purl from a static character into a living, responsive agent that truly engages with the conversation ecosystem! 🎯
