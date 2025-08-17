import React from 'react';

const Svg = ({ children, size = 16, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const MonitorIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M8 20h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 16v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const GlobeIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M3 12h18" stroke="currentColor" strokeWidth="2" />
    <path d="M12 3c3 3 3 15 0 18c-3-3-3-15 0-18z" stroke="currentColor" strokeWidth="2" fill="none" />
  </Svg>
);

export const PlayIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <path d="M8 5l10 7-10 7V5z" fill="currentColor" />
  </Svg>
);

export const PauseIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <rect x="7" y="5" width="3" height="14" fill="currentColor" />
    <rect x="14" y="5" width="3" height="14" fill="currentColor" />
  </Svg>
);

export const RefreshIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <path d="M4 12a8 8 0 1 0 2.34-5.66L4 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 4v4h4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ArrowUpIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <path d="M12 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 11l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const DownloadIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <path d="M12 3v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 9l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const BugIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    <path d="M5 12h14M12 5v4M7 7l3 3M17 7l-3 3M7 17l3-3M17 17l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const StatusCircle = ({ active, size = 10, className }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" className={className} aria-hidden="true">
    <circle cx="5" cy="5" r="5" fill={active ? '#00c853' : '#555555'} />
  </svg>
);

export const ClipboardIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <rect x="7" y="4" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
    <rect x="5" y="2" width="8" height="4" rx="1" fill="currentColor" />
  </Svg>
);

export const SearchIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const EyeIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </Svg>
);

export const CalendarIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M7 3v4M17 3v4M3 10h18" stroke="currentColor" strokeWidth="2" />
  </Svg>
);

export const ClockIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const ChatIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <rect x="3" y="5" width="18" height="12" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M7 19l-2 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const CheckIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const GridIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" strokeWidth="2" />
    <line x1="15" y1="3" x2="15" y2="21" stroke="currentColor" strokeWidth="2" />
    <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2" />
    <line x1="3" y1="15" x2="21" y2="15" stroke="currentColor" strokeWidth="2" />
  </Svg>
);

export const FireIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <path d="M12 2c1.5 2.5 3 5.5 3 8.5a6 6 0 1 1-12 0c0-3 1.5-6 3-8.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 7c.5 1 1 2.5 1 4a2 2 0 1 1-4 0c0-1.5.5-3 1-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const MouseIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <rect x="6" y="3" width="12" height="16" rx="6" stroke="currentColor" strokeWidth="2" fill="none" />
    <line x1="12" y1="7" x2="12" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const InfoIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
    <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="8" r="1" fill="currentColor" />
  </Svg>
);

export const LightbulbIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <path d="M9 21h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 17a4 4 0 0 0 4-4c0-2-1-3.5-2.5-5S12 6 12 6s-1.5 1.5-3 3S7 11 7 13a4 4 0 0 0 4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const DiceIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="8" cy="8" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="16" cy="16" r="1" fill="currentColor" />
  </Svg>
);

export const CycleIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <path d="M4 12a8 8 0 1 1 8 8v-2a6 6 0 1 0-6-6H4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 8l-4 4 4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const AngelIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    {/* Halo */}
    <ellipse cx="12" cy="6" rx="6" ry="1.5" stroke="currentColor" strokeWidth="2" fill="none" />
    {/* Head */}
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
    {/* Body */}
    <path d="M12 13v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Wings */}
    <path d="M9 14c-2-1-4-2-3-4s3 1 3 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M15 14c2-1 4-2 3-4s-3 1-3 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Arms */}
    <path d="M9 15l-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M15 15l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Legs */}
    <path d="M10 18l-1 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M14 18l1 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const DevilIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    {/* Horns */}
    <path d="M9 4l1 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M15 4l-1 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Head */}
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
    {/* Body */}
    <path d="M12 13v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Wings (bat-like) */}
    <path d="M9 14c-2 0-3-1-4-2s0-2 2-1c1 0 2 1 2 3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.3" />
    <path d="M15 14c2 0 3-1 4-2s0-2-2-1c-1 0-2 1-2 3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.3" />
    {/* Arms */}
    <path d="M9 15l-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M15 15l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Legs */}
    <path d="M10 18l-1 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M14 18l1 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Tail */}
    <path d="M12 18c1 1 2 2 3 1s0-2-1-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

// Navigation Icons for Mobile Navigation
export const HomeIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const MessageCircleIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const FileTextIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const TerminalIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <polyline points="4,17 10,11 4,5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="19" x2="20" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const BookOpenIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Additional icons for documentation
export const RocketIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const BuildingIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 12H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 9h2a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 6h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 10h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 14h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const GamepadIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="16" cy="8" r="1" fill="currentColor" />
    <circle cx="8" cy="16" r="1" fill="currentColor" />
  </Svg>
);

export const StarIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CatIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    {/* Cat ears */}
    <path d="M6 6L8 2l2 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 6l2-4 2 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {/* Cat head */}
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
    {/* Cat eyes */}
    <circle cx="9" cy="10" r="1" fill="currentColor" />
    <circle cx="15" cy="10" r="1" fill="currentColor" />
    {/* Cat nose */}
    <path d="M12 13l-1 1 1 1 1-1-1-1z" fill="currentColor" />
    {/* Cat whiskers */}
    <path d="M6 12h2M16 12h2M7 10h2M15 10h2M7 14h2M15 14h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </Svg>
);

export const WrenchIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CodeIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <polyline points="16,18 22,12 16,6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="8,6 2,12 8,18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const PhoneIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ListIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const UserIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
  </Svg>
);

export const CpuIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="2" fill="none" />
    <line x1="9" y1="1" x2="9" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="15" y1="1" x2="15" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="9" y1="20" x2="9" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="15" y1="20" x2="15" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="20" y1="9" x2="23" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="20" y1="14" x2="23" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="1" y1="9" x2="4" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="1" y1="14" x2="4" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const SettingsIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const MoonIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const SunIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
    <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const ExternalLinkIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="15,3 21,3 21,9" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const RobotIcon = ({ size = 16, className }) => (
  <Svg size={size} className={className}>
    <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M12 7v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="8" y1="21" x2="8" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="16" y1="21" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="9" cy="15" r="1" fill="currentColor" />
    <circle cx="15" cy="15" r="1" fill="currentColor" />
  </Svg>
);

export default {
  MonitorIcon,
  GlobeIcon,
  PlayIcon,
  PauseIcon,
  RefreshIcon,
  ArrowUpIcon,
  DownloadIcon,
  BugIcon,
  StatusCircle,
  ClipboardIcon,
  SearchIcon,
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  ChatIcon,
  CheckIcon,
  GridIcon,
  FireIcon,
  MouseIcon,
  InfoIcon,
  LightbulbIcon,
  DiceIcon,
  CycleIcon,
  AngelIcon,
  DevilIcon,
  HomeIcon,
  MessageCircleIcon,
  FileTextIcon,
  TerminalIcon,
  BookOpenIcon,
  // New documentation icons
  RocketIcon,
  BuildingIcon,
  GamepadIcon,
  StarIcon,
  CatIcon,
  WrenchIcon,
  CodeIcon,
  PhoneIcon,
  ListIcon,
  UserIcon,
  CpuIcon,
  SettingsIcon,
  MoonIcon,
  SunIcon,
  ExternalLinkIcon,
  RobotIcon,
};


