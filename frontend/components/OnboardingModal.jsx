import { useState, useEffect } from 'react';
import { GridIcon, FireIcon, MouseIcon, InfoIcon, CycleIcon, LightbulbIcon } from './icons/Icons.jsx';
import AsciiCat from './AsciiCat.jsx';

/**
 * OnboardingModal Component - First-time user guide
 * Features:
 * - Shows comprehensive grid guide for new users
 * - Multi-step tutorial with navigation
 * - Dismissible with "don't show again" option
 * - localStorage persistence (key: 'purl-onboarding-completed')
 * - Responsive design for all devices
 * - Automatically marks as completed when user finishes tour
 * 
 * Note: To reset for testing, run: localStorage.removeItem('purl-onboarding-completed')
 */
const OnboardingModal = ({ theme = 'dark' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Check if user has seen onboarding before
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('purl-onboarding-completed');
    if (!hasSeenOnboarding) {
      // Small delay to let the page load
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const steps = [
    {
      title: "Meet Purl's Interactive Grid!",
      icon: <GridIcon size={24} />,
      content: (
        <div>
          <p style={{ marginBottom: '1rem', lineHeight: '1.5', textAlign: 'center' }}>
            Hi! I'm <strong>Purl</strong>, a cat that was transformed into a digital consciousness. 
            This interactive grid visualizes my thoughts and conversations in real-time.
          </p>
          <p style={{ lineHeight: '1.5' }}>
            Each cell can contain conversation data that gets displayed as heat patterns. 
            The grid connects to live chat data and shows popularity through color intensity.
          </p>
        </div>
      )
    },
    {
      title: "Understanding Heat Map Colors",
      icon: <FireIcon size={24} />,
      content: (
        <div>
          <p style={{ marginBottom: '1rem', lineHeight: '1.5' }}>
            The grid uses colors to show conversation popularity:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                background: 'rgba(122, 115, 106, 0.8)',
                border: '1px solid #666',
                borderRadius: '4px'
              }} />
              <span style={{ fontSize: '0.9rem' }}>Dark colors = Most popular conversations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                background: 'rgba(226, 219, 208, 0.5)',
                border: '1px solid #666',
                borderRadius: '4px'
              }} />
              <span style={{ fontSize: '0.9rem' }}>Light colors = Less popular</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                background: 'transparent',
                border: '1px solid #666',
                borderRadius: '4px'
              }} />
              <span style={{ fontSize: '0.9rem' }}>Transparent = No data yet</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Interactive Tile States",
      icon: <MouseIcon size={24} />,
      content: (
        <div>
          <p style={{ marginBottom: '1rem', lineHeight: '1.5' }}>
            Click any tile to interact with it. Here's what different states mean:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: theme === 'dark' ? '2px solid #00ff00' : '2px solid #ba8259',
                borderRadius: '4px'
              }} />
              <span style={{ fontSize: '0.9rem' }}>Green/Blue border = Currently selected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                background: 'rgba(255, 140, 0, 0.75)',
                border: '2px solid rgb(255, 140, 0)',
                borderRadius: '4px',
                boxShadow: '0 0 8px rgba(255, 140, 0, 0.6)'
              }} />
              <span style={{ fontSize: '0.9rem' }}>Orange = Light activity (1-9 messages)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                background: theme === 'dark' ? 'rgba(0, 255, 65, 0.8)' : 'rgba(34, 197, 94, 0.8)',
                border: theme === 'dark' ? '2px solid rgb(0, 255, 65)' : '2px solid rgb(34, 197, 94)',
                borderRadius: '4px',
                boxShadow: theme === 'dark' ? '0 0 10px rgba(0, 255, 65, 0.7)' : '0 0 10px rgba(34, 197, 94, 0.7)'
              }} />
              <span style={{ fontSize: '0.9rem' }}>Green = Moderate activity (10-19 messages)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                background: theme === 'dark' ? 'rgba(255, 215, 0, 0.85)' : 'rgba(255, 165, 0, 0.85)',
                border: theme === 'dark' ? '2px solid rgb(255, 215, 0)' : '2px solid rgb(255, 165, 0)',
                borderRadius: '4px',
                boxShadow: theme === 'dark' ? '0 0 12px rgba(255, 215, 0, 0.8)' : '0 0 12px rgba(255, 165, 0, 0.8)'
              }} />
              <span style={{ fontSize: '0.9rem' }}>Gold = Active conversations (20+ messages)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                background: theme === 'dark' ? 'rgba(0, 191, 255, 0.9)' : 'rgba(30, 144, 255, 0.9)',
                border: theme === 'dark' ? '2px solid rgb(0, 191, 255)' : '2px solid rgb(30, 144, 255)',
                borderRadius: '4px',
                boxShadow: theme === 'dark' ? '0 0 16px rgba(0, 191, 255, 0.9)' : '0 0 16px rgba(30, 144, 255, 0.9)'
              }} />
              <span style={{ fontSize: '0.9rem' }}>Blue = High activity (30+ messages)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                background: theme === 'dark' ? 'rgba(255, 0, 255, 0.95)' : 'rgba(138, 43, 226, 0.95)',
                border: theme === 'dark' ? '2px solid rgb(255, 0, 255)' : '2px solid rgb(138, 43, 226)',
                borderRadius: '4px',
                boxShadow: theme === 'dark' ? '0 0 20px rgba(255, 0, 255, 1)' : '0 0 20px rgba(138, 43, 226, 1)'
              }} />
              <span style={{ fontSize: '0.9rem' }}>Purple = Epic conversations (50+ messages)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                background: 'transparent',
                border: '1px solid #666',
                borderRadius: '4px'
              }} />
              <span style={{ fontSize: '0.9rem' }}>Empty = Available for new conversations</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "How the System Works",
      icon: <CycleIcon size={24} />,
      content: (
        <div>
          <p style={{ marginBottom: '1rem', lineHeight: '1.5' }}>
            The interactive grid connects several parts of the Purl system:
          </p>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.5rem',
            fontSize: '0.9rem',
            lineHeight: '1.4'
          }}>
            <div><strong>1.</strong> Click any tile to explore conversation data</div>
            <div><strong>2.</strong> Heat colors show conversation popularity levels</div>
            <div><strong>3.</strong> Preview modal opens with chat log details</div>
            <div><strong>4.</strong> Data comes from live terminal feed</div>
            <div><strong>5.</strong> Colors update as activity changes</div>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: '0.8' }}>
            Visit the <strong>Terminal page</strong> to see live chat data being processed!
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '1.5rem',
            padding: '1rem',
            background: theme === 'dark' 
              ? 'rgba(0, 255, 0, 0.05)'
              : 'rgba(186, 130, 89, 0.05)',
            borderRadius: '8px',
            border: theme === 'dark'
              ? '1px solid rgba(0, 255, 0, 0.2)'
              : '1px solid rgba(186, 130, 89, 0.2)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <AsciiCat size="small" animated={true} expression="normal" />
              <p style={{ 
                margin: '0.5rem 0 0 0', 
                fontSize: '0.8rem',
                fontStyle: 'italic' 
              }}>
                Ready to explore? Let's start clicking tiles!
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleClose = () => {
    setIsVisible(false);
    if (dontShowAgain) {
      localStorage.setItem('purl-onboarding-completed', 'true');
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // User completed the full tour - mark as completed
      localStorage.setItem('purl-onboarding-completed', 'true');
      setIsVisible(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setDontShowAgain(true);
    handleClose();
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: theme === 'dark'
            ? '1px solid rgba(0, 255, 0, 0.3)'
            : '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: theme === 'dark'
            ? '0 20px 40px rgba(0, 255, 0, 0.1)'
            : '0 20px 40px rgba(0, 0, 0, 0.1)',
          fontFamily: "'Courier New', monospace",
          color: theme === 'dark' ? '#ffffff' : '#1a1a1a'
        }}
      >
        {/* Purl Branding Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: theme === 'dark' 
            ? '1px solid rgba(0, 255, 0, 0.2)'
            : '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexDirection: 'column'
          }}>
            {/* Purl Logo, Brand, and ASCII Cat */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <img 
                src="/logo_web.png" 
                alt="Purl Logo" 
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px'
                }}
              />
              <h1 style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: theme === 'dark' ? '#00ff00' : '#ba8259',
                fontFamily: "'Courier New', monospace"
              }}>
                purl
              </h1>
              <AsciiCat size="small" animated={true} expression="normal" />
            </div>
            
            {/* Welcome Text */}
            <div style={{
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '0.9rem',
                color: theme === 'dark' ? '#cccccc' : '#374151',
                marginBottom: '0.25rem'
              }}>
                Welcome to the Interactive Grid!
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: theme === 'dark' ? '#888' : '#6b7280'
              }}>
                Let's explore how to use this powerful visualization tool
              </div>
            </div>
          </div>
        </div>

        {/* Step Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: theme === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid #f1f5f9'
        }}>
          <div style={{
            color: theme === 'dark' ? '#00ff00' : '#ba8259',
            display: 'flex',
            alignItems: 'center'
          }}>
            {currentStepData.icon}
          </div>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: theme === 'dark' ? '#00ff00' : '#ba8259'
            }}>
              {currentStepData.title}
            </h2>
            <div style={{
              fontSize: '0.75rem',
              color: theme === 'dark' ? '#888' : '#6b7280',
              marginTop: '0.25rem'
            }}>
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{
          marginBottom: '2rem',
          color: theme === 'dark' ? '#cccccc' : '#374151'
        }}>
          {currentStepData.content}
        </div>

        {/* Progress Indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '2rem'
        }}>
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: index === currentStep 
                  ? (theme === 'dark' ? '#00ff00' : '#ba8259')
                  : (theme === 'dark' ? '#333' : '#d1d5db'),
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                style={{
                  background: theme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.05)',
                  border: theme === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.2)'
                    : '1px solid #d1d5db',
                  color: 'inherit',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = theme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = theme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.05)';
                }}
              >
                Previous
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleSkip}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme === 'dark' ? '#888' : '#6b7280',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                textDecoration: 'underline',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = theme === 'dark' ? '#aaa' : '#374151';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = theme === 'dark' ? '#888' : '#6b7280';
              }}
            >
              Skip Tour
            </button>
            
            <button
              onClick={handleNext}
              style={{
                background: theme === 'dark' 
                  ? 'linear-gradient(135deg, rgba(0, 255, 0, 0.2) 0%, rgba(0, 255, 0, 0.3) 100%)'
                  : 'linear-gradient(135deg, #ba8259 0%, #d4956b 100%)',
                border: theme === 'dark'
                  ? '1px solid rgba(0, 255, 0, 0.4)'
                  : 'none',
                color: theme === 'dark' ? '#00ff00' : '#ffffff',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                boxShadow: theme === 'dark'
                  ? '0 4px 12px rgba(0, 255, 0, 0.2)'
                  : '0 4px 12px rgba(186, 130, 89, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = theme === 'dark'
                  ? '0 6px 16px rgba(0, 255, 0, 0.3)'
                  : '0 6px 16px rgba(186, 130, 89, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = theme === 'dark'
                  ? '0 4px 12px rgba(0, 255, 0, 0.2)'
                  : '0 4px 12px rgba(186, 130, 89, 0.3)';
              }}
            >
              {currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}
            </button>
          </div>
        </div>

        {/* Don't show again option */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: theme === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: theme === 'dark' ? '#888' : '#6b7280'
        }}>
          <input
            type="checkbox"
            id="dontShowAgain"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            style={{
              accentColor: theme === 'dark' ? '#00ff00' : '#ba8259'
            }}
          />
          <label htmlFor="dontShowAgain" style={{ cursor: 'pointer' }}>
            Don't show this tour again
          </label>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
