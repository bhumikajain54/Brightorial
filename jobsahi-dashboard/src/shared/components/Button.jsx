import React from 'react';
import { TAILWIND_COLORS, COLORS } from '../WebConstant';

const baseClasses = 'rounded-lg transition-colors duration-200 inline-flex items-center justify-center';

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-4 py-2 text-sm md:text-base',
  lg: 'px-6 py-3 text-base'
};

const variants = {
  primary: `${TAILWIND_COLORS.BTN_PRIMARY}`,
  outline: 'bg-white border border-secondary text-secondary hover:bg-green-50',
  light: `${TAILWIND_COLORS.BTN_LIGHT}`,
  neutral: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  secondary: `${TAILWIND_COLORS.BTN_SECONDARY}`,
  success: 'bg-success text-white hover:opacity-90',
  warning: 'bg-warning text-white hover:opacity-90',
  danger: 'bg-error text-white hover:opacity-90',
  info: 'bg-info text-white hover:opacity-90',
  unstyled: ''
};

const Button = ({
  children,
  type = 'button',
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth = false,
  loading = false,
  disabled = false,
  as,
  href,
  ...rest
}) => {
  const variantClasses = variants[variant] || variants.primary;
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const widthClass = fullWidth ? 'w-full' : '';
  const isDisabled = disabled || loading;

  const content = (
    <>
      {icon ? <span className="mr-2" aria-hidden>{icon}</span> : null}
      <span>{children}</span>
      {iconRight ? <span className="ml-2" aria-hidden>{iconRight}</span> : null}
      {loading ? (
        <span className="ml-2 inline-flex" aria-hidden>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </span>
      ) : null}
    </>
  );

  const commonProps = {
    onClick,
    className: `${baseClasses} ${sizeClass} ${variantClasses} ${widthClass} ${className}`.trim(),
    'aria-busy': loading || undefined,
    'aria-disabled': isDisabled || undefined,
    ...rest
  };

  if (as === 'a' || href) {
    return (
      <a href={href} {...commonProps}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} disabled={isDisabled} {...commonProps}>
      {content}
    </button>
  );
};

// Helper to create named variant components with default label and displayName
const createNamedVariant = (displayName, variant) => {
  const Comp = ({ children, ...props }) => (
    <Button {...props} variant={variant}>
      {children ?? displayName}
    </Button>
  );
  Comp.displayName = displayName;
  return Comp;
};

// Named variant components for convenience
export const PrimaryButton = createNamedVariant('Primary', 'primary');
export const OutlineButton = createNamedVariant('Outline', 'outline');
export const LightButton = createNamedVariant('Light', 'light');
export const NeutralButton = createNamedVariant('Neutral', 'neutral');
export const SecondaryButton = createNamedVariant('Secondary', 'secondary');
export const SuccessButton = createNamedVariant('Success', 'success');
export const WarningButton = createNamedVariant('Warning', 'warning');
export const DangerButton = createNamedVariant('Danger', 'danger');
export const InfoButton = createNamedVariant('Info', 'info');
export const UnstyledButton = createNamedVariant('Button', 'unstyled');

// Size-specific helpers
export const SmallButton = (props) => <Button {...props} size="sm" />;
export const MediumButton = (props) => <Button {...props} size="md" />;
export const LargeButton = (props) => <Button {...props} size="lg" />;

// Icon-only button
export const IconButton = ({ label, className = '', size = 'sm', ...props }) => (
  <Button
    aria-label={label}
    title={label}
    className={`p-2 ${className}`}
    size={size}
    {...props}
  />
);

// Simple Button group wrapper
export const ButtonGroup = ({ className = '', children, ...rest }) => (
  <div className={`inline-flex items-center gap-3 ${className}`} {...rest}>
    {children}
  </div>
);


// Course Management Buttons
export const ApproveSelectedButton = ({ onClick, className = '', disabled = false, ...props }) => (
  <Button 
    variant="primary" 
    size="md"
    className={`${className}`}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    Approve Selected
  </Button>
);

export const FeatureSelectedButton = ({ onClick, className = '', disabled = false, ...props }) => (
  <Button 
    variant="outline" 
    size="md"
    className={`${className}`}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    Feature Selected
  </Button>
);

export const ApproveButton = ({ onClick, className = '', ...props }) => (
  <Button 
    variant="primary" 
    size="sm"
    className={`${className}`}
    onClick={onClick}
    {...props}
  >
    Approve
  </Button>
);

export const FeatureButton = ({ onClick, className = '', ...props }) => (
  <Button 
    variant="outline" 
    size="sm"
    className={`${className}`}
    onClick={onClick}
    {...props}
  >
    Feature
  </Button>
);

export const AddCategoryButton = ({ onClick, className = '', ...props }) => (
  <Button 
    variant="primary" 
    size="md"
    className={`${className}`}
    onClick={onClick}
    {...props}
  >
    Add Category
  </Button>
);

export const TagAsFeaturedButton = ({ onClick, className = '', ...props }) => (
  <Button 
    variant="primary" 
    size="md"
    className={`${className}`}
    onClick={onClick}
    {...props}
  >
    Tag as Featured
  </Button>
);

// Job Management Buttons
export const ApproveSelectedJobsButton = ({ onClick, className = '', disabled = false, ...props }) => (
  <Button 
    variant="primary" 
    size="md"
    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${TAILWIND_COLORS.BTN_PRIMARY} ${className}`}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    Approve selected
  </Button>
);

export const PromoteSelectedJobsButton = ({ onClick, className = '', disabled = false, ...props }) => (
  <Button 
    variant="light" 
    size="md"
    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${TAILWIND_COLORS.BTN_LIGHT} ${className}`}
    style={{ borderColor: COLORS.GREEN_PRIMARY, color: COLORS.GREEN_PRIMARY }}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    Promote selected
  </Button>
);

export const ApproveJobButton = ({ onClick, className = '', ...props }) => (
  <Button 
    variant="primary" 
    size="sm"
    className={`px-3 py-1 text-xs rounded transition-colors duration-200 ${TAILWIND_COLORS.BTN_PRIMARY} ${className}`}
    onClick={onClick}
    {...props}
  >
    Approve
  </Button>
);

export const PromoteJobButton = ({ onClick, className = '', ...props }) => (
  <Button 
    variant="light" 
    size="sm"
    className={`px-3 py-1 text-xs rounded ${TAILWIND_COLORS.BTN_LIGHT} ${className}`}
    style={{ borderColor: COLORS.GREEN_PRIMARY, color: COLORS.GREEN_PRIMARY }}
    onClick={onClick}
    {...props}
  >
    Promote
  </Button>
);

export const ViewJobButton = ({ onClick, className = '', ...props }) => (
  <Button 
    variant="light" 
    size="md"
    className={`px-4 py-2 rounded-lg ${TAILWIND_COLORS.BTN_LIGHT} ${className}`}
    onClick={onClick}
    {...props}
  >
    View
  </Button>
);

export const PromoteJobManualButton = ({ onClick, className = '', ...props }) => (
  <Button 
    variant="primary" 
    size="md"
    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${TAILWIND_COLORS.BTN_PRIMARY} ${className}`}
    onClick={onClick}
    {...props}
  >
    Promote Job
  </Button>
);

// Custom Radio Button Component
export const RadioButton = ({ 
  checked, 
  onChange, 
  value, 
  label, 
  className = '', 
  ...props 
}) => (
  <label className={`flex items-center gap-3 cursor-pointer select-none ${className}`}>
    <Button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={() => onChange(value)}
      className={`flex items-center justify-center h-6 w-6 rounded-full border-2 transition-colors duration-200 ${
        checked ? '' : 'border-gray-300'
      }`}
      style={{ 
        borderColor: checked ? 'var(--color-secondary)' : undefined, 
        backgroundColor: checked ? 'var(--color-primary-10)' : undefined 
      }}
      variant="unstyled"
      {...props}
    >
      <span 
        className={`h-2.5 w-2.5 rounded-full transition-colors duration-200 ${
          checked ? '' : 'bg-transparent'
        }`} 
        style={{ backgroundColor: checked ? COLORS.GREEN_PRIMARY : undefined }} 
      />
    </Button>
    <span className="text-sm text-gray-800">{label}</span>
  </label>
);

// Campaign Management Buttons
export const LaunchCampaignButton = ({ onClick, loading = false, disabled = false, className = '', ...props }) => (
  <Button 
    variant="primary" 
    size="md"
    className={`font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-30 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    onClick={onClick}
    loading={loading}
    disabled={disabled || loading}
    icon={
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    }
    {...props}
  >
    Launch Campaign
  </Button>
);

export const SaveDraftButton = ({ onClick, className = '', ...props }) => (
  <Button 
    variant="outline" 
    size="md"
    className={`font-semibold focus:outline-none focus:ring-2 focus:ring-primary-30 ${className}`}
    onClick={onClick}
    icon={
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
      </svg>
    }
    {...props}
  >
    Save Draft
  </Button>
);

export const PreviewButton = ({ onClick, className = '', ...props }) => (
  <Button 
    variant="light" 
    size="md"
    className={`font-semibold focus:outline-none focus:ring-2 focus:ring-gray-200 ${className}`}
    onClick={onClick}
    icon={
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    }
    {...props}
  >
    Preview
  </Button>
);

export const FilterButton = ({ onClick, className = '', ...props }) => (
  <Button 
    variant="light" 
    size="md"
    className={`${className}`}
    onClick={onClick}
    icon={
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    }
    {...props}
  >
    Filter
  </Button>
);

export const NewCampaignButton = ({ onClick, className = '', ...props }) => (
  <Button 
    variant="primary" 
    size="md"
    className={`font-medium ${className}`}
    onClick={onClick}
    icon={
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    }
    {...props}
  >
    New Campaign
  </Button>
);

export const ViewCampaignButton = ({ onClick, className = '', ...props }) => (
  <Button 
    variant="unstyled" 
    size="sm"
    className={`text-gray-400 hover:text-gray-600 p-1 ${className}`}
    onClick={onClick}
    icon={
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    }
    {...props}
  />
);

// System Settings Buttons
export const SaveButton = ({ 
  onClick, 
  loading = false, 
  savedTick = false, 
  disabled = false, 
  className = '', 
  children = 'Save',
  ...props 
}) => (
  <div className="relative">
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      variant="primary"
      size="md"
      fullWidth
      className={`${className}`}
      style={{ 
        backgroundColor: 'var(--color-secondary)',
        opacity: loading ? 0.7 : 1
      }}
      {...props}
    >
      {children}
    </Button>
    {savedTick && (
      <div className="absolute inset-y-0 right-3 flex items-center">
        <svg className="h-5 w-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    )}
  </div>
);

export const BackToOverviewButton = ({ 
  onClick, 
  className = '', 
  children = 'Back to overview',
  ...props 
}) => (
  <Button
    onClick={onClick}
    variant="light"
    size="sm"
    className={`rounded-full bg-white hover:bg-emerald-50 text-emerald-700 border px-4 py-2 font-medium flex items-center gap-2 ${className}`}
    style={{ borderColor: 'var(--color-secondary)' }}
    icon={
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    }
    {...props}
  >
    {children}
  </Button>
);

// CMS Editor specific buttons
export const CMSSaveButton = SaveButton;
export const CMSBackButton = BackToOverviewButton;

export { Button };
export default Button;

