// ====== WebConstant (Shared) ======

// Legacy COLORS object for backward compatibility (auth section)
// Use CSS variables from index.css for new components
export const COLORS = {
  GREEN_PRIMARY: '#5C9A24', // Keep for auth compatibility
};

// Tailwind utility class tokens used across UI
export const TAILWIND_COLORS = {
  // Layout
  BG_PRIMARY: 'bg-bg-primary',              // overall page background
  HEADER_BG: 'bg-bg-white',                 // header background
  BORDER: 'border-gray-200',                // common border color
  SCROLLBAR: 'scrollbar-thin',              // custom scrollbar from index.css

  // Text tokens
  TEXT_PRIMARY: 'text-text-primary',
  TEXT_MUTED: 'text-text-muted',
  TEXT_INVERSE: 'text-white',
  TEXT_BRAND: 'text-primary',
  TEXT_SUCCESS: 'text-success',
  TEXT_WARNING: 'text-warning',
  TEXT_PURPLE: 'text-purple-600',

  // Nav items (sidebar)
  NAV: 'text-gray-600 hover:bg-primary-10 hover:text-text-primary',
  NAV_ACTIVE: 'bg-primary-10 text-text-primary font-medium',

  // Cards
  CARD: 'bg-bg-white rounded-xl border border-gray-200 shadow-sm',

  // Pills / badges
  BADGE_INFO: 'text-text-primary bg-primary-10',
  BADGE_WARN: 'text-warning bg-yellow-100',
  BADGE_SUCCESS: 'text-success bg-green-100',
  BADGE_ERROR: 'text-error bg-red-100',

  // Buttons
  BTN_PRIMARY: 'bg-secondary hover:bg-secondary-dark text-white',
  BTN_SECONDARY: 'bg-primary hover:bg-primary-dark text-white',
  BTN_LIGHT: 'bg-bg-white hover:bg-gray-100 border border-gray-200 text-gray-600',
};