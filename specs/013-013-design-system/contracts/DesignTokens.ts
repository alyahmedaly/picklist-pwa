/**
 * Design Token Interface Contracts
 *
 * Defines the design token system for Ali's nutrition-focused webapp.
 * Provides consistent values for colors, spacing, typography, and breakpoints.
 */

export interface NutritionColors {
  /** Protein content color coding */
  protein: {
    low: string;      // <10g per 100g - light yellow
    moderate: string; // 10-20g per 100g - amber
    high: string;     // >20g per 100g - green
  };

  /** Calorie density color coding */
  calories: {
    low: string;      // <100 kcal per 100g - green
    moderate: string; // 100-200 kcal per 100g - amber
    high: string;     // >200 kcal per 100g - red
  };

  /** Health grade color coding (A-E scale) */
  health: {
    A: string;        // Excellent - dark green
    B: string;        // Good - light green
    C: string;        // Average - amber
    D: string;        // Poor - orange
    E: string;        // Very poor - red
  };
}

export interface HalalColors {
  /** Halal status color coding */
  confirmed: string;    // Confirmed halal - green
  questionable: string; // Needs verification - amber
  prohibited: string;   // Haram - red
}

export interface SemanticColors {
  /** Standard semantic colors */
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  muted: string;
  background: string;
  foreground: string;
}

export interface DesignTokens {
  /** Color system for nutrition and UI elements */
  colors: {
    nutrition: NutritionColors;
    halal: HalalColors;
    semantic: SemanticColors;
  };

  /** Spacing scale for consistent layouts */
  spacing: {
    xs: string;   // 4px - tight component spacing
    sm: string;   // 8px - compact nutrition data
    md: string;   // 16px - standard component gaps
    lg: string;   // 24px - section spacing
    xl: string;   // 32px - page layout spacing
    '2xl': string; // 48px - large section breaks
  };

  /** Typography system */
  typography: {
    /** Font sizes */
    sizes: {
      xs: string;   // 12px - small labels
      sm: string;   // 14px - body text
      md: string;   // 16px - default
      lg: string;   // 18px - headings
      xl: string;   // 20px - large headings
      '2xl': string; // 24px - page titles
    };

    /** Font weights */
    weights: {
      normal: number;   // 400
      medium: number;   // 500
      semibold: number; // 600
      bold: number;     // 700
    };

    /** Line heights */
    lineHeights: {
      tight: number;    // 1.25 - compact data
      normal: number;   // 1.5 - readable text
      relaxed: number;  // 1.75 - comfortable reading
    };
  };

  /** Responsive breakpoints */
  breakpoints: {
    sm: string;   // 640px - mobile landscape
    md: string;   // 768px - tablet
    lg: string;   // 1024px - desktop
    xl: string;   // 1280px - wide desktop
  };

  /** Border radius values */
  radii: {
    none: string;   // 0px
    sm: string;     // 4px
    md: string;     // 8px
    lg: string;     // 12px
    full: string;   // 9999px
  };

  /** Shadow system */
  shadows: {
    sm: string;     // Subtle shadow
    md: string;     // Standard card shadow
    lg: string;     // Prominent shadow
    none: string;   // No shadow
  };
}

/**
 * Design token provider contract
 */
export interface DesignTokenProvider {
  /** Get all design tokens */
  getTokens(): DesignTokens;

  /** Get specific color by path */
  getColor(path: string): string;

  /** Get spacing value */
  getSpacing(size: keyof DesignTokens['spacing']): string;

  /** Check if running in dark mode */
  isDarkMode(): boolean;

  /** Generate CSS custom properties */
  toCSSCustomProperties(): Record<string, string>;
}