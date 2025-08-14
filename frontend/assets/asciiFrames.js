// ASCII Cat Animation Frames - Simple Face Design
// Based on clean, viral-ready cat face template
// Focus on expressions and directions rather than complex body

export const ASCII_FRAMES = {
  // Base sitting state - animated idle with blinking and looking around
  sitting: [
    // Frame 1 - Normal alert look
    `
      
  ^---^
  (=•.•=)
  > ^ <`,
    
    // Frame 2 - Blink
    `
      
  ^---^
  (=-.-=)
  > ^ <`,
    
    // Frame 3 - Back to normal
    `
      
  ^---^
  (=•.•=)
  > ^ <`,
    
    // Frame 4 - Look right (east)
    `
      
  ^---^
  (_='.')
  > ^ <`,
    
    // Frame 5 - Look left (west)
    `
      
  ^---^
  ('.'=_)
  > ^ <`,
    
    // Frame 6 - Back to center
    `
      
  ^---^
  (=•.•=)
  > ^ <`,
    
    // Frame 7 - Ear twitch (left ear up)
    `
      
  ^*--^
  (=•.•=)
  > ^ <`,
    
    // Frame 8 - Both ears normal, content expression
    `
      
  ^---^
  (=^.^=)
  > ^ <`,
    
    // Frame 9 - Back to alert
    `
      
  ^---^
  (=•.•=)
  > ^ <`,
    
    // Frame 10 - Confused/thinking (1 question mark)
    `
  ?
  ^---^
  (=?.?=)
  > ^ <`,
    
    // Frame 11 - Confused/thinking (2 question marks)
    `
  ??
  ^---^
  (=?.?=)
  > ^ <`,
    
    // Frame 12 - Confused/thinking (3 question marks)
    `
  ???
  ^---^
  (=?.?=)
  > ^ <`,
    
    // Frame 13 - Idea! (lightbulb off)
    `
      
  ^---^
  (=!.!=)
  > o <`,
    
    // Frame 14 - Idea! (lightbulb on)
    `
  (*)
  ^---^
  (=!.!=)
  > o <`,
    
    // Frame 15 - Idea! (bright moment)
    `
  *(*)* 
  ^---^
  (=!.!=)
  > o <`,
    
    // Frame 16 - Love/heart eyes (small heart)
    `
  ♥
  ^---^
  (=♥.♥=)
  > u <`,
    
    // Frame 17 - Love/heart eyes (big heart)
    `
  ♥♥
  ^---^
  (=♥.♥=)
  > u <`,
    
    // Frame 18 - Love/heart eyes (heart burst)
    `
  ♥ ♥ ♥
  ^---^
  (=♥.♥=)
  > u <`,
    
    // Frame 19 - Sleepy/tired (yawn)
    `
      
  ^---^
  (=-.o=)
  > ~ <`,
    
    // Frame 20 - Sleepy/tired (eyes closing)
    `
      
  ^---^
  (=-.u=)
  > ~ <`,
    
    // Frame 21 - Sleepy/tired (almost asleep)
    `
      
  ^---^
  (=u.u=)
  > ~ <`,
    
    // Frame 22 - Surprised (single exclamation)
    `
  !
  ^---^
  (=O.O=)
  > o <`,
    
    // Frame 23 - Surprised (double exclamation)
    `
  !!
  ^---^
  (=O.O=)
  > o <`,
    
    // Frame 24 - Surprised (triple exclamation)
    `
  !!!
  ^---^
  (=O.O=)
  > O <`,
    
    // Frame 25 - Back to normal
    `
      
  ^---^
  (=•.•=)
  > ^ <`
  ],

  // Walking animation - Simple directional faces with whiskers
  walking: [
    // Frame 1 - Looking east (right)
    `
      
  ^---^
  (_='.')`,
    
    
    // Frame 2 - Looking forward
    `
      
  ^---^
  ( =•.•= )
  > ^ <`,
    
    // Frame 3 - Looking west (left)
    `
      
  ^---^
  ('.'=_)`,
    
    // Frame 4 - Looking forward again
    `
      
  ^---^
  ( =•.•= )
  > ^ <`
  ],

  // Jumping animation - Excited expressions with whiskers
  jumping: [
    // Frame 1 - Focused, ready to jump
    `
      
  ^---^
  (=>.<=)
  > ^ <`,
    
    // Frame 2 - Mid-jump, excited
    `
      
  ^---^
  (=0.0=)
  > o <`,
    
    // Frame 3 - Happy landing
    `
      
  ^---^
  (=^.^=)
  > v <`
  ],

  // Eating animation - Simple nom expressions with whiskers
  eating: [
    // Frame 1 - Looking down at food
    `
      
  ^---^
  (=v.v=)
  > ^ <`,
    
    // Frame 2 - Happy eating
    `
      
  ^---^
  (=-.-=)
  > o <`
  ],

  // Sleeping animation - Peaceful sleep with whiskers
  sleeping: [
    // Frame 1 - Sleeping peacefully
    `
      
  ^---^
  (=-.-=)
  > w <`,
    
    // Frame 2 - Deep sleep
    `
      
  ^---^
  (=u.u=)
  > ~ <`
  ]
};

// Individual expression animations (for manual testing)
export const ASCII_EXPRESSION_FRAMES = {
  confused: [
    ASCII_FRAMES.sitting[10], // 1 question mark
    ASCII_FRAMES.sitting[11], // 2 question marks  
    ASCII_FRAMES.sitting[12]  // 3 question marks
  ],
  idea: [
    ASCII_FRAMES.sitting[13], // lightbulb off
    ASCII_FRAMES.sitting[14], // lightbulb on
    ASCII_FRAMES.sitting[15]  // bright moment
  ],
  love: [
    ASCII_FRAMES.sitting[16], // small heart
    ASCII_FRAMES.sitting[17], // big heart
    ASCII_FRAMES.sitting[18]  // heart burst
  ],
  sleepy: [
    ASCII_FRAMES.sitting[19], // yawn
    ASCII_FRAMES.sitting[20], // eyes closing
    ASCII_FRAMES.sitting[21]  // almost asleep
  ],
  surprised: [
    ASCII_FRAMES.sitting[22], // single exclamation
    ASCII_FRAMES.sitting[23], // double exclamation
    ASCII_FRAMES.sitting[24]  // triple exclamation
  ]
};

// Animation configuration for each state
export const ASCII_ANIMATION_CONFIG = {
  sitting: {
    frames: ASCII_FRAMES.sitting,
    duration: 1000, // Slower for more expressions to be appreciated
    loop: true
  },
  confused: {
    frames: ASCII_EXPRESSION_FRAMES.confused,
    duration: 800,
    loop: true
  },
  idea: {
    frames: ASCII_EXPRESSION_FRAMES.idea,
    duration: 600,
    loop: true
  },
  love: {
    frames: ASCII_EXPRESSION_FRAMES.love,
    duration: 700,
    loop: true
  },
  sleepy: {
    frames: ASCII_EXPRESSION_FRAMES.sleepy,
    duration: 1200,
    loop: true
  },
  surprised: {
    frames: ASCII_EXPRESSION_FRAMES.surprised,
    duration: 400,
    loop: true
  },
  walking: {
    frames: ASCII_FRAMES.walking,
    duration: 250, // Slightly slower for more natural walk
    loop: true
  },
  jumping: {
    frames: ASCII_FRAMES.jumping,
    duration: 400, // Slower for more dramatic jump
    loop: false
  },
  eating: {
    frames: ASCII_FRAMES.eating,
    duration: 600, // Slower, more deliberate eating
    loop: true
  },
  sleeping: {
    frames: ASCII_FRAMES.sleeping,
    duration: 1200, // Very slow, peaceful breathing
    loop: true
  }
};
