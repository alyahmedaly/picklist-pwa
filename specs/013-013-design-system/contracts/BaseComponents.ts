/**
 * Base Component Interface Contracts
 *
 * Defines the foundation UI components built on shadcn/ui.
 * All components support accessibility and responsive design.
 */

import React from 'react';

/**
 * Base props inherited by all components
 */
export interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;

  /** Test identifier for automated testing */
  'data-testid'?: string;

  /** Component children */
  children?: React.ReactNode;

  /** Disabled state */
  disabled?: boolean;
}

/**
 * Accessibility props for components
 */
export interface AccessibilityProps {
  /** ARIA role */
  role?: string;

  /** ARIA label for screen readers */
  'aria-label'?: string;

  /** ARIA described by reference */
  'aria-describedby'?: string;

  /** ARIA live region */
  'aria-live'?: 'off' | 'polite' | 'assertive';
}

/**
 * Button component contract
 */
export interface ButtonProps extends BaseComponentProps, AccessibilityProps {
  /** Button visual variant */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'nutrition';

  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';

  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /** Button type */
  type?: 'button' | 'submit' | 'reset';

  /** Loading state */
  loading?: boolean;

  /** Icon before text */
  startIcon?: React.ReactNode;

  /** Icon after text */
  endIcon?: React.ReactNode;
}

/**
 * Card component contract
 */
export interface CardProps extends BaseComponentProps {
  /** Card visual variant */
  variant?: 'default' | 'nutrition' | 'filter' | 'product';

  /** Card header content */
  header?: React.ReactNode;

  /** Card footer content */
  footer?: React.ReactNode;

  /** Clickable card handler */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;

  /** Hover effect */
  hoverable?: boolean;
}

/**
 * Badge component contract
 */
export interface BadgeProps extends BaseComponentProps, AccessibilityProps {
  /** Badge visual variant */
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'error';

  /** Badge size */
  size?: 'default' | 'sm' | 'lg';

  /** Badge shape */
  shape?: 'default' | 'rounded' | 'pill';

  /** Health grade specific styling */
  healthGrade?: 'A' | 'B' | 'C' | 'D' | 'E';

  /** Halal status specific styling */
  halalStatus?: 'confirmed' | 'questionable' | 'prohibited';
}

/**
 * Input component contract
 */
export interface InputProps extends BaseComponentProps, AccessibilityProps {
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';

  /** Input value */
  value?: string | number;

  /** Default value for uncontrolled inputs */
  defaultValue?: string | number;

  /** Placeholder text */
  placeholder?: string;

  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;

  /** Focus handler */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;

  /** Blur handler */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;

  /** Input size */
  size?: 'default' | 'sm' | 'lg';

  /** Error state */
  error?: boolean;

  /** Error message */
  errorMessage?: string;

  /** Helper text */
  helperText?: string;

  /** Required field */
  required?: boolean;

  /** Readonly state */
  readOnly?: boolean;

  /** Input prefix icon or text */
  prefix?: React.ReactNode;

  /** Input suffix icon or text */
  suffix?: React.ReactNode;
}

/**
 * Skeleton component contract for loading states
 */
export interface SkeletonProps extends BaseComponentProps {
  /** Width of skeleton */
  width?: string | number;

  /** Height of skeleton */
  height?: string | number;

  /** Shape of skeleton */
  variant?: 'text' | 'circular' | 'rectangular';

  /** Animation type */
  animation?: 'pulse' | 'wave' | false;

  /** Number of text lines to show */
  lines?: number;
}

/**
 * Component variant configuration
 */
export interface ComponentVariant {
  /** Variant name */
  name: string;

  /** CSS classes for this variant */
  className: string;

  /** When to use this variant */
  description: string;

  /** Example usage */
  example?: string;
}

/**
 * Component testing utilities
 */
export interface ComponentTestUtils {
  /** Render component with providers */
  renderWithProviders: (component: React.ReactElement) => any;

  /** Mock design tokens */
  mockDesignTokens: () => any;

  /** Accessibility test helpers */
  testAccessibility: (component: React.ReactElement) => Promise<void>;

  /** Visual regression test */
  testVisualRegression: (storyName: string) => Promise<void>;
}