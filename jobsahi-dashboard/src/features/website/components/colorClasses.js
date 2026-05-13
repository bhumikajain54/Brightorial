/**
 * Website color system tokens (hex values).
 * Mirrors the structure of `src/shared/WebConstant.js` for consistency.
 */
export const WEBSITE_COLORS = Object.freeze({
  PRIMARY: Object.freeze({
    NAVY: '#00395B',
    DEEP_BLUE: '#0B537D',
    MEDIUM_BLUE: '#1976D2',
  }),
  ACCENT: Object.freeze({
    GREEN: '#5C9A24',
    GREEN_DARK: '#2E7D32',
    LIME: '#A1E366',
    SKY: '#A2DDFF',
  }),
  NEUTRAL: Object.freeze({
    SLATE: '#5C6A6D',
    BLUE_GRAY: '#8C9BA0',
    WHITE: '#FFFFFF',
  }),
  SURFACE: Object.freeze({
    PALE_BLUE: '#EAF5FB',
    SOFT_BLUE: '#E8F3F5',
    SOFT_GREEN: '#E8F5E9',
    MUTED_GREEN: '#D9EAD3',
  }),
  HOVER: Object.freeze({
    NAVY: '#094670',
    ACCENT_GREEN: '#4A7A1D',
    ACCENT_GREEN_DARK: '#4A7D1F',
    ACCENT_GREEN_DEEP: '#4A8220',
    ACCENT_LIME: '#8BCB4F',
  }),
});

/**
 * Tailwind utility class tokens for website colors.
 * Use these instead of hard-coded classes in components.
 */
export const WEBSITE_COLOR_CLASSES = Object.freeze({
  BG: Object.freeze({
    PRIMARY_NAVY: 'bg-[#00395B]',
    PRIMARY_DEEP_BLUE: 'bg-[#0B537D]',
    PRIMARY_MEDIUM_BLUE: 'bg-[#1976D2]',
    ACCENT_GREEN: 'bg-[#5C9A24]',
    ACCENT_GREEN_DARK: 'bg-[#2E7D32]',
    ACCENT_LIME: 'bg-[#A1E366]',
    SURFACE_PALE_BLUE: 'bg-[#EAF5FB]',
    SURFACE_SOFT_BLUE: 'bg-[#E8F3F5]',
    SURFACE_SOFT_GREEN: 'bg-[#E8F5E9]',
    SURFACE_MUTED_GREEN: 'bg-[#D9EAD3]',
    NEUTRAL_WHITE: 'bg-[#FFFFFF]',
  }),
  TEXT: Object.freeze({
    PRIMARY_NAVY: 'text-[#00395B]',
    PRIMARY_DEEP_BLUE: 'text-[#0B537D]',
    ACCENT_GREEN: 'text-[#5C9A24]',
    ACCENT_GREEN_DARK: 'text-[#2E7D32]',
    ACCENT_LIME: 'text-[#A1E366]',
    ACCENT_SKY: 'text-[#A2DDFF]',
    NEUTRAL_SLATE: 'text-[#5C6A6D]',
    NEUTRAL_BLUE_GRAY: 'text-[#8C9BA0]',
    NEUTRAL_WHITE: 'text-[#FFFFFF]',
  }),
  BORDER: Object.freeze({
    PRIMARY_NAVY: 'border-[#00395B]',
    PRIMARY_DEEP_BLUE: 'border-[#0B537D]',
    ACCENT_GREEN: 'border-[#5C9A24]',
    NEUTRAL_WHITE: 'border-[#FFFFFF]',
  }),
  HOVER_BG: Object.freeze({
    PRIMARY_NAVY: 'hover:bg-[#00395B]',
    PRIMARY_NAVY_DARK: 'hover:bg-[#094670]',
    ACCENT_GREEN: 'hover:bg-[#5C9A24]',
    ACCENT_GREEN_DARK: 'hover:bg-[#4A7A1D]',
    ACCENT_GREEN_DARKER: 'hover:bg-[#4A7D1F]',
    ACCENT_GREEN_DARKEST: 'hover:bg-[#4A8220]',
    ACCENT_LIME: 'hover:bg-[#8BCB4F]',
    NEUTRAL_WHITE: 'hover:bg-[#FFFFFF]',
  }),
  HOVER_TEXT: Object.freeze({
    PRIMARY_DEEP_BLUE: 'hover:text-[#0B537D]',
    ACCENT_GREEN_DARK: 'hover:text-[#4A7A1D]',
    ACCENT_LIME: 'hover:text-[#A1E366]',
  }),
  GROUP_HOVER: Object.freeze({
    BG_ACCENT_GREEN_DARKER: 'group-hover:bg-[#4A7D1F]',
    TEXT_ACCENT_LIME: 'group-hover:text-[#A1E366]',
  }),
});

/**
 * Legacy camelCase utility accessors for backwards compatibility.
 * These mirror the naming conventions used in older components.
 */
const LEGACY_BG = Object.freeze({
  navy: WEBSITE_COLOR_CLASSES.BG.PRIMARY_NAVY,
  deepBlue: WEBSITE_COLOR_CLASSES.BG.PRIMARY_DEEP_BLUE,
  mediumBlue: WEBSITE_COLOR_CLASSES.BG.PRIMARY_MEDIUM_BLUE,
  accentGreen: WEBSITE_COLOR_CLASSES.BG.ACCENT_GREEN,
  accentGreenDark: WEBSITE_COLOR_CLASSES.BG.ACCENT_GREEN_DARK,
  accentLime: WEBSITE_COLOR_CLASSES.BG.ACCENT_LIME,
  surfacePaleBlue: WEBSITE_COLOR_CLASSES.BG.SURFACE_PALE_BLUE,
  surfaceSoftBlue: WEBSITE_COLOR_CLASSES.BG.SURFACE_SOFT_BLUE,
  surfaceSoftGreen: WEBSITE_COLOR_CLASSES.BG.SURFACE_SOFT_GREEN,
  surfaceMutedGreen: WEBSITE_COLOR_CLASSES.BG.SURFACE_MUTED_GREEN,
  pureWhite: WEBSITE_COLOR_CLASSES.BG.NEUTRAL_WHITE,
});

const LEGACY_TEXT = Object.freeze({
  navy: WEBSITE_COLOR_CLASSES.TEXT.PRIMARY_NAVY,
  deepBlue: WEBSITE_COLOR_CLASSES.TEXT.PRIMARY_DEEP_BLUE,
  accentGreen: WEBSITE_COLOR_CLASSES.TEXT.ACCENT_GREEN,
  accentGreenDark: WEBSITE_COLOR_CLASSES.TEXT.ACCENT_GREEN_DARK,
  accentLime: WEBSITE_COLOR_CLASSES.TEXT.ACCENT_LIME,
  accentSky: WEBSITE_COLOR_CLASSES.TEXT.ACCENT_SKY,
  neutralSlate: WEBSITE_COLOR_CLASSES.TEXT.NEUTRAL_SLATE,
  neutralBlueGray: WEBSITE_COLOR_CLASSES.TEXT.NEUTRAL_BLUE_GRAY,
  pureWhite: WEBSITE_COLOR_CLASSES.TEXT.NEUTRAL_WHITE,
});

const LEGACY_BORDER = Object.freeze({
  navy: WEBSITE_COLOR_CLASSES.BORDER.PRIMARY_NAVY,
  deepBlue: WEBSITE_COLOR_CLASSES.BORDER.PRIMARY_DEEP_BLUE,
  accentGreen: WEBSITE_COLOR_CLASSES.BORDER.ACCENT_GREEN,
  pureWhite: WEBSITE_COLOR_CLASSES.BORDER.NEUTRAL_WHITE,
});

const LEGACY_HOVER_BG = Object.freeze({
  navy: WEBSITE_COLOR_CLASSES.HOVER_BG.PRIMARY_NAVY,
  navyDark: WEBSITE_COLOR_CLASSES.HOVER_BG.PRIMARY_NAVY_DARK,
  accentGreen: WEBSITE_COLOR_CLASSES.HOVER_BG.ACCENT_GREEN,
  accentGreenDark: WEBSITE_COLOR_CLASSES.HOVER_BG.ACCENT_GREEN_DARK,
  accentGreenDarker: WEBSITE_COLOR_CLASSES.HOVER_BG.ACCENT_GREEN_DARKER,
  accentGreenDarkest: WEBSITE_COLOR_CLASSES.HOVER_BG.ACCENT_GREEN_DARKEST,
  accentLime: WEBSITE_COLOR_CLASSES.HOVER_BG.ACCENT_LIME,
  pureWhite: WEBSITE_COLOR_CLASSES.HOVER_BG.NEUTRAL_WHITE,
});

const LEGACY_HOVER_TEXT = Object.freeze({
  deepBlue: WEBSITE_COLOR_CLASSES.HOVER_TEXT.PRIMARY_DEEP_BLUE,
  accentGreenDark: WEBSITE_COLOR_CLASSES.HOVER_TEXT.ACCENT_GREEN_DARK,
  accentLime: WEBSITE_COLOR_CLASSES.HOVER_TEXT.ACCENT_LIME,
});

const LEGACY_GROUP_HOVER = Object.freeze({
  bgAccentGreenDarker: WEBSITE_COLOR_CLASSES.GROUP_HOVER.BG_ACCENT_GREEN_DARKER,
  textAccentLime: WEBSITE_COLOR_CLASSES.GROUP_HOVER.TEXT_ACCENT_LIME,
});

/**
 * Helper utilities to fetch hex values or class names with graceful fallbacks.
 */
export const getWebsiteColor = (path, fallback = null) => {
  const segments = Array.isArray(path) ? path : String(path).split('.');
  return segments.reduce((acc, key) => (acc && acc[key] ? acc[key] : null), WEBSITE_COLORS) ?? fallback;
};

export const getWebsiteColorClass = (path, fallback = '') => {
  const segments = Array.isArray(path) ? path : String(path).split('.');
  return segments.reduce((acc, key) => (acc && acc[key] ? acc[key] : null), WEBSITE_COLOR_CLASSES) ?? fallback;
};

// Backward compatibility exports
export const COLORS = WEBSITE_COLORS;
export const COLOR_CLASSES = Object.freeze({
  ...WEBSITE_COLOR_CLASSES,
  bg: LEGACY_BG,
  text: LEGACY_TEXT,
  border: LEGACY_BORDER,
  hoverBg: LEGACY_HOVER_BG,
  hoverText: LEGACY_HOVER_TEXT,
  groupHover: LEGACY_GROUP_HOVER,
});