// Chart Colors Utility
// This function gets the actual color values for charts since CSS variables don't work directly in Chart.js

export const getChartColors = () => {
  // Check if we're in dark mode
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  
  // Return the same colors for both light and dark mode (as requested)
  return {
    primary: '#5C9A24',      // Secondary Green
    secondary: '#F59E0B',    // Warning Orange
    success: '#16A34A',      // Success Green
    info: '#0C5A8D',         // Primary Light Blue
    warning: '#F59E0B',      // Warning Orange
    error: '#DC2626',        // Error Red
    yellow: '#FDE047',       // Yellow
    purple: '#8B5CF6',       // Purple
    pink: '#EC4899',         // Pink
    emerald: '#10B981',      // Emerald
    blue: '#3B82F6',         // Blue
  };
};

export const getChartColorArray = () => {
  const colors = getChartColors();
  return [
    colors.primary,    // Green
    colors.secondary,  // Orange
    colors.success,    // Green
    colors.info,       // Blue
    colors.error,      // Red
    colors.yellow,     // Yellow
    colors.purple,     // Purple
    colors.pink,       // Pink
    colors.emerald,    // Emerald
    colors.blue,       // Blue
  ];
};

export const getChartTooltipStyle = () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  
  return {
    backgroundColor: isDark ? '#374151' : '#1F2937',
    titleColor: '#F9FAFB',
    bodyColor: '#F9FAFB',
    borderColor: isDark ? '#4B5563' : '#6B7280',
    borderWidth: 1,
    cornerRadius: 8,
  };
};

export const getChartTextColor = () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return isDark ? '#F9FAFB' : '#374151';
};

export const getChartGridColor = () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return isDark ? '#4B5563' : '#E5E7EB';
};
