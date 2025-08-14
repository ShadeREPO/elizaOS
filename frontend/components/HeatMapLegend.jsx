import { useState } from 'react';
import { GridIcon, FireIcon, MouseIcon, ChatIcon, InfoIcon, CycleIcon, DiceIcon, LightbulbIcon } from './icons/Icons.jsx';

/**
 * HeatMapLegend Component - Interactive Grid & Heat Map Guide
 * Features:
 * - Comprehensive explanation of the interactive grid system
 * - Heat map color meanings and popularity indicators
 * - Click interaction guide and tile states
 * - Connection to terminal chat logs
 * - Collapsible for space efficiency
 * - Theme-aware design
 */
const HeatMapLegend = ({ theme = 'dark', isVisible = true, onRandomizeHeatMap, showHeatMapControls = true }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  const legendItems = theme === 'dark' ? [
    { heat: 0.9, label: 'Dark Accent', description: 'Most popular conversations' },
    { heat: 0.7, label: 'Ivory', description: 'Frequently viewed chats' },
    { heat: 0.5, label: 'Creamy', description: 'Moderately popular' },
    { heat: 0.3, label: 'Iridescent', description: 'Some interest' },
    { heat: 0.15, label: 'Pearl', description: 'Rarely viewed' }
  ] : [
    { heat: 0.9, label: 'Dark Accent', description: 'Most popular conversations' },
    { heat: 0.7, label: 'Warm Shadow', description: 'Frequently viewed chats' },
    { heat: 0.5, label: 'Ivory', description: 'Moderately popular' },
    { heat: 0.3, label: 'Subtle Blue', description: 'Some interest' },
    { heat: 0.1, label: 'Pearl', description: 'Rarely viewed' }
  ];

  const getHeatColor = (heat) => {
    if (heat < 0.1) return 'transparent';
    
    // Pearl/iridescent color palette - matching InteractiveGrid
    const colors = {
      pearlWhite: [245, 244, 240],     // #F5F4F0
      creamyBeige: [237, 232, 223],    // #EDE8DF
      softIvory: [226, 219, 208],      // #E2DBD0
      warmShadow: [201, 193, 181],     // #C9C1B5
      iridescentPink: [248, 232, 238], // #F8E8EE
      subtleBlue: [232, 240, 245],     // #E8F0F5
      neutralGray: [163, 158, 149],    // #A39E95
      darkAccent: [122, 115, 106]      // #7A736A
    };

    if (theme === 'dark') {
      // Dark theme: Reversed - darker colors = hotter tiles
      if (heat < 0.2) {
        // Very low: Pearl white (cool/inactive)
        const [r, g, b] = colors.pearlWhite;
        const intensity = heat / 0.2;
        return `rgba(${r}, ${g}, ${b}, ${0.15 + intensity * 0.2})`;
      } else if (heat < 0.4) {
        // Low: Iridescent pink
        const intensity = (heat - 0.2) / 0.2;
        const [r, g, b] = colors.iridescentPink;
        return `rgba(${r}, ${g}, ${b}, ${0.25 + intensity * 0.3})`;
      } else if (heat < 0.6) {
        // Medium: Creamy beige
        const intensity = (heat - 0.4) / 0.2;
        const [r, g, b] = colors.creamyBeige;
        return `rgba(${r}, ${g}, ${b}, ${0.4 + intensity * 0.3})`;
      } else if (heat < 0.8) {
        // High: Soft ivory getting darker
        const intensity = (heat - 0.6) / 0.2;
        const [r, g, b] = colors.softIvory;
        return `rgba(${r}, ${g}, ${b}, ${0.5 + intensity * 0.3})`;
      } else {
        // Very high: Dark accent (hottest)
        const intensity = (heat - 0.8) / 0.2;
        const [r, g, b] = colors.darkAccent;
        return `rgba(${r}, ${g}, ${b}, ${0.6 + intensity * 0.4})`;
      }
    } else {
      // Light theme: Reversed - darker colors = hotter tiles
      if (heat < 0.2) {
        // Very low: Pearl white (cool/inactive)
        const [r, g, b] = colors.pearlWhite;
        const intensity = heat / 0.2;
        return `rgba(${r}, ${g}, ${b}, ${0.15 + intensity * 0.2})`;
      } else if (heat < 0.4) {
        // Low: Subtle blue
        const intensity = (heat - 0.2) / 0.2;
        const [r, g, b] = colors.subtleBlue;
        return `rgba(${r}, ${g}, ${b}, ${0.25 + intensity * 0.25})`;
      } else if (heat < 0.6) {
        // Medium: Soft ivory
        const intensity = (heat - 0.4) / 0.2;
        const [r, g, b] = colors.softIvory;
        return `rgba(${r}, ${g}, ${b}, ${0.35 + intensity * 0.3})`;
      } else if (heat < 0.8) {
        // High: Warm shadow getting darker
        const intensity = (heat - 0.6) / 0.2;
        const [r, g, b] = colors.warmShadow;
        return `rgba(${r}, ${g}, ${b}, ${0.45 + intensity * 0.3})`;
      } else {
        // Very high: Dark accent (hottest)
        const intensity = (heat - 0.8) / 0.2;
        const [r, g, b] = colors.darkAccent;
        return `rgba(${r}, ${g}, ${b}, ${0.55 + intensity * 0.35})`;
      }
    }
  };

  return (
    <div
      className={`heat-map-legend ${theme} ${isExpanded ? 'expanded' : 'collapsed'}`}
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 50,
        background: theme === 'dark' 
          ? 'rgba(0, 0, 0, 0.9)' 
          : 'rgba(255, 255, 255, 0.95)',
        border: theme === 'dark'
          ? '1px solid rgba(0, 255, 0, 0.3)'
          : '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: isExpanded ? '1rem' : '0.5rem',
        backdropFilter: 'blur(8px)',
        fontFamily: "'Courier New', monospace",
        fontSize: '0.8rem',
        maxWidth: isExpanded ? '300px' : 'auto',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        boxShadow: theme === 'dark'
          ? '0 4px 20px rgba(0, 255, 0, 0.1)'
          : '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: theme === 'dark' ? '#00ff00' : '#374151',
        fontWeight: 'bold'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GridIcon size={14} />
          Interactive Grid Guide
        </span>
        <span style={{
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease',
          fontSize: '0.7rem'
        }}>
          ▼
        </span>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{ marginTop: '0.75rem' }}>
          {/* What is this grid */}
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            background: theme === 'dark' 
              ? 'rgba(0, 255, 0, 0.05)' 
              : 'rgba(186, 130, 89, 0.05)',
            border: theme === 'dark'
              ? '1px solid rgba(0, 255, 0, 0.2)'
              : '1px solid rgba(186, 130, 89, 0.2)',
            borderRadius: '6px'
          }}>
            <div style={{
              color: theme === 'dark' ? '#00ff00' : '#ba8259',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              marginBottom: '0.5rem'
            }}>
              <InfoIcon size={12} style={{ marginRight: '0.3rem' }} />
              What is this grid?
            </div>
            <div style={{
              color: theme === 'dark' ? '#a0a0a0' : '#6b7280',
              fontSize: '0.7rem',
              lineHeight: '1.4'
            }}>
              This interactive grid represents chat log locations from the terminal. Each cell can contain conversation data that gets displayed as heat patterns based on popularity and activity.
            </div>
          </div>

          {/* Heat Map Legend - Only show if heat map controls are enabled */}
          {showHeatMapControls && (
            <div style={{
              marginBottom: '1rem'
            }}>
              <div style={{
                color: theme === 'dark' ? '#00ff00' : '#374151',
                fontWeight: 'bold',
                fontSize: '0.75rem',
                marginBottom: '0.5rem'
              }}>
                <FireIcon size={12} style={{ marginRight: '0.3rem' }} />
                Heat Map Colors
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {legendItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        background: getHeatColor(item.heat),
                        border: theme === 'dark'
                          ? '1px solid rgba(0, 255, 0, 0.2)'
                          : '1px solid #e2e8f0',
                        borderRadius: '2px',
                        flexShrink: 0,
                        boxShadow: item.heat > 0.6 
                          ? `inset 0 0 3px ${getHeatColor(item.heat)}` 
                          : 'none'
                      }}
                    />
                    <div style={{
                      color: theme === 'dark' ? '#cccccc' : '#374151',
                      fontSize: '0.65rem'
                    }}>
                      {item.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Count Tiers */}
          <div style={{
            marginBottom: '1rem'
          }}>
            <div style={{
              color: theme === 'dark' ? '#00ff00' : '#374151',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              marginBottom: '0.5rem'
            }}>
              <ChatIcon size={12} style={{ marginRight: '0.3rem' }} />
              Message Count Tiers
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {/* Tier 1: Light Activity (1-9 messages) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '14px', height: '14px', borderRadius: '2px',
                  background: theme === 'dark' ? 'rgba(255, 140, 0, 0.75)' : 'rgba(251, 146, 60, 0.75)',
                  border: theme === 'dark' ? '2px solid rgb(255, 140, 0)' : '2px solid rgb(251, 146, 60)',
                  boxShadow: theme === 'dark' ? '0 0 8px rgba(255, 140, 0, 0.6)' : '0 0 8px rgba(251, 146, 60, 0.6)',
                  flexShrink: 0
                }} />
                <div style={{
                  color: theme === 'dark' ? '#cccccc' : '#374151',
                  fontSize: '0.65rem'
                }}>
                  Light (1-9 msgs) - Orange
                </div>
              </div>
              
              {/* Tier 2: Moderate (10-19 messages) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '14px', height: '14px', borderRadius: '2px',
                  background: theme === 'dark' ? 'rgba(0, 255, 65, 0.8)' : 'rgba(34, 197, 94, 0.8)',
                  border: theme === 'dark' ? '2px solid rgb(0, 255, 65)' : '2px solid rgb(34, 197, 94)',
                  boxShadow: theme === 'dark' ? '0 0 10px rgba(0, 255, 65, 0.7)' : '0 0 10px rgba(34, 197, 94, 0.7)',
                  flexShrink: 0
                }} />
                <div style={{
                  color: theme === 'dark' ? '#cccccc' : '#374151',
                  fontSize: '0.65rem'
                }}>
                  Moderate (10-19 msgs) - Green
                </div>
              </div>
              
              {/* Tier 3: Active (20-29 messages) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '14px', height: '14px', borderRadius: '2px',
                  background: theme === 'dark' ? 'rgba(255, 215, 0, 0.85)' : 'rgba(255, 165, 0, 0.85)',
                  border: theme === 'dark' ? '2px solid rgb(255, 215, 0)' : '2px solid rgb(255, 165, 0)',
                  boxShadow: theme === 'dark' ? '0 0 12px rgba(255, 215, 0, 0.8)' : '0 0 12px rgba(255, 165, 0, 0.8)',
                  flexShrink: 0
                }} />
                <div style={{
                  color: theme === 'dark' ? '#cccccc' : '#374151',
                  fontSize: '0.65rem'
                }}>
                  Active (20-29 msgs) - Gold
                </div>
              </div>
              
              {/* Tier 4: High Activity (30-49 messages) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '14px', height: '14px', borderRadius: '2px',
                  background: theme === 'dark' ? 'rgba(0, 191, 255, 0.9)' : 'rgba(30, 144, 255, 0.9)',
                  border: theme === 'dark' ? '2px solid rgb(0, 191, 255)' : '2px solid rgb(30, 144, 255)',
                  boxShadow: theme === 'dark' ? '0 0 16px rgba(0, 191, 255, 0.9)' : '0 0 16px rgba(30, 144, 255, 0.9)',
                  flexShrink: 0
                }} />
                <div style={{
                  color: theme === 'dark' ? '#cccccc' : '#374151',
                  fontSize: '0.65rem'
                }}>
                  High Activity (30-49 msgs) - Blue
                </div>
              </div>
              
              {/* Tier 5: Epic (50+ messages) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '14px', height: '14px', borderRadius: '2px',
                  background: theme === 'dark' ? 'rgba(255, 0, 255, 0.95)' : 'rgba(138, 43, 226, 0.95)',
                  border: theme === 'dark' ? '2px solid rgb(255, 0, 255)' : '2px solid rgb(138, 43, 226)',
                  boxShadow: theme === 'dark' ? '0 0 20px rgba(255, 0, 255, 1)' : '0 0 20px rgba(138, 43, 226, 1)',
                  flexShrink: 0
                }} />
                <div style={{
                  color: theme === 'dark' ? '#cccccc' : '#374151',
                  fontSize: '0.65rem'
                }}>
                  Epic (50+ msgs) - Purple
                </div>
              </div>
            </div>
          </div>

          {/* Interaction Guide */}
          <div style={{
            marginBottom: '1rem'
          }}>
            <div style={{
              color: theme === 'dark' ? '#00ff00' : '#374151',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              marginBottom: '0.5rem'
            }}>
              <MouseIcon size={12} style={{ marginRight: '0.3rem' }} />
              Tile Interactions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '14px',
                  height: '14px',
                  background: theme === 'dark' 
                    ? 'rgba(0, 191, 255, 0.15)' 
                    : 'rgba(139, 92, 246, 0.15)',
                  border: theme === 'dark'
                    ? '2px solid #00bfff'
                    : '2px solid #8b5cf6',
                  borderRadius: '2px',
                  flexShrink: 0,
                  boxShadow: theme === 'dark'
                    ? '0 0 6px rgba(0, 191, 255, 0.4)'
                    : '0 0 6px rgba(139, 92, 246, 0.4)'
                }} />
                <div style={{
                  color: theme === 'dark' ? '#cccccc' : '#374151',
                  fontSize: '0.65rem'
                }}>
                  Clicked tile - shows selection
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '14px',
                  height: '14px',
                  background: theme === 'dark' 
                    ? 'rgba(0, 255, 65, 0.8)' 
                    : 'rgba(186, 130, 89, 0.9)',
                  border: theme === 'dark'
                    ? '1px solid #00ff41'
                    : '1px solid #ba8259',
                  borderRadius: '2px',
                  flexShrink: 0,
                  boxShadow: theme === 'dark' 
                    ? '0 0 4px rgba(0, 255, 65, 0.6)' 
                    : '0 0 4px rgba(186, 130, 89, 0.5)',
                  animation: theme === 'dark' 
                    ? 'pulse-green 3s ease-in-out infinite' 
                    : 'pulse-orange 3s ease-in-out infinite'
                }} />
                <div style={{
                  color: theme === 'dark' ? '#cccccc' : '#374151',
                  fontSize: '0.65rem'
                }}>
                  Contains chat log data (saturation = message count)
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '14px',
                  height: '14px',
                  background: 'transparent',
                  border: theme === 'dark'
                    ? '1px solid rgba(0, 255, 0, 0.2)'
                    : '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '2px',
                  flexShrink: 0
                }} />
                <div style={{
                  color: theme === 'dark' ? '#cccccc' : '#374151',
                  fontSize: '0.65rem'
                }}>
                  Empty tile - no data yet
                </div>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            background: theme === 'dark' 
              ? 'rgba(255, 255, 255, 0.03)' 
              : 'rgba(0, 0, 0, 0.03)',
            border: theme === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '6px'
          }}>
            <div style={{
              color: theme === 'dark' ? '#00ff00' : '#374151',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              marginBottom: '0.5rem'
            }}>
              <CycleIcon size={12} style={{ marginRight: '0.3rem' }} />
              How It Works
            </div>
            <div style={{
              color: theme === 'dark' ? '#a0a0a0' : '#6b7280',
              fontSize: '0.65rem',
              lineHeight: '1.4'
            }}>
              1. Click any tile to explore<br/>
              2. Colors show message count tiers<br/>
              3. Orange → Green → Gold → Blue → Purple<br/>
              4. Preview opens full chat data<br/>
              5. Real-time updates from terminal
            </div>
          </div>

          {/* Randomize button - Only show if heat map controls are enabled */}
          {onRandomizeHeatMap && showHeatMapControls && (
            <div style={{
              marginBottom: '1rem'
            }}>
              <button
                onClick={onRandomizeHeatMap}
                style={{
                  width: '100%',
                  background: theme === 'dark' 
                    ? 'rgba(0, 255, 0, 0.1)' 
                    : 'rgba(186, 130, 89, 0.1)',
                  border: theme === 'dark'
                    ? '1px solid rgba(0, 255, 0, 0.3)'
                    : '1px solid rgba(186, 130, 89, 0.3)',
                  color: theme === 'dark' ? '#00ff00' : '#ba8259',
                  padding: '0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontFamily: "'Courier New', monospace",
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = theme === 'dark' 
                    ? 'rgba(0, 255, 0, 0.2)' 
                    : 'rgba(186, 130, 89, 0.2)';
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = theme === 'dark' 
                    ? 'rgba(0, 255, 0, 0.1)' 
                    : 'rgba(186, 130, 89, 0.1)';
                  e.target.style.transform = 'scale(1)';
                }}
                              >
                <DiceIcon size={12} style={{ marginRight: '0.3rem' }} />
                Randomize Demo Data
              </button>
            </div>
          )}

          {/* Footer tip */}
          <div style={{
            padding: '0.5rem',
            background: theme === 'dark' 
              ? 'rgba(255, 215, 0, 0.1)' 
              : 'rgba(255, 193, 7, 0.1)',
            border: theme === 'dark'
              ? '1px solid rgba(255, 215, 0, 0.3)'
              : '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '6px',
            fontSize: '0.65rem',
            color: theme === 'dark' ? '#ffd700' : '#d97706',
            textAlign: 'center',
            lineHeight: '1.3'
          }}>
            <LightbulbIcon size={12} style={{ marginRight: '0.3rem' }} />
            <strong>Pro Tip:</strong> Visit the Terminal page to see live chat data feeding into this grid system!
          </div>
        </div>
      )}
      
      {/* CSS animations for legend indicators */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes pulse-green {
          0% {
            opacity: 0.8;
            box-shadow: 0 0 4px rgba(0, 255, 65, 0.6);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 8px rgba(0, 255, 65, 0.8);
          }
          100% {
            opacity: 0.8;
            box-shadow: 0 0 4px rgba(0, 255, 65, 0.6);
          }
        }
        
        @keyframes pulse-orange {
          0% {
            opacity: 0.9;
            box-shadow: 0 0 4px rgba(186, 130, 89, 0.5);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 8px rgba(186, 130, 89, 0.7);
          }
          100% {
            opacity: 0.9;
            box-shadow: 0 0 4px rgba(186, 130, 89, 0.5);
          }
        }
        `
      }} />
    </div>
  );
};

export default HeatMapLegend;
