import React from 'react';

const DynamicButton = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  // Dynamic styling props
  backgroundColor = 'var(--color-secondary)',
  textColor = 'white',
  width = 'auto',
  height = '44px',
  borderRadius = '8px',
  fontSize = '14px',
  fontWeight = '500',
  padding = '12px 24px',
  border = 'none',
  hoverBackgroundColor = null,
  hoverTextColor = null,
  // Additional props
  fullWidth = false,
  ...rest
}) => {
  const buttonStyle = {
    backgroundColor,
    color: textColor,
    width: fullWidth ? '100%' : width,
    height,
    borderRadius,
    fontSize,
    fontWeight,
    padding,
    border,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.2s ease-in-out',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    outline: 'none',
    ...rest.style
  };

  const handleMouseEnter = (e) => {
    if (!disabled && !loading) {
      e.target.style.backgroundColor = hoverBackgroundColor || backgroundColor;
      e.target.style.color = hoverTextColor || textColor;
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled && !loading) {
      e.target.style.backgroundColor = backgroundColor;
      e.target.style.color = textColor;
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`dynamic-button ${className}`}
      style={buttonStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {loading && (
        <svg 
          className="animate-spin" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none"
        >
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4" 
            opacity="0.25"
          />
          <path 
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" 
            fill="currentColor" 
            opacity="0.75"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default DynamicButton;
