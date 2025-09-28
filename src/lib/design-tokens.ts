/**
 * Design Tokens for Ali's Nutrition-Focused Design System
 *
 * Provides consistent design values for colors, spacing, typography, and breakpoints
 * optimized for nutrition data visualization and mobile-first usage.
 */

export interface NutritionColors {
  protein: {
    low: string;      // <10g per 100g
    moderate: string; // 10-20g per 100g
    high: string;     // >20g per 100g
  };
  calories: {
    low: string;      // <100 kcal per 100g
    moderate: string; // 100-200 kcal per 100g
    high: string;     // >200 kcal per 100g
  };
  health: {
    A: string;        // Excellent
    B: string;        // Good
    C: string;        // Average
    D: string;        // Poor
    E: string;        // Very poor
  };
}

export interface HalalColors {
  confirmed: string;    // Confirmed halal
  questionable: string; // Needs verification
  prohibited: string;   // Haram
}

export interface SemanticColors {
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
  colors: {
    nutrition: NutritionColors;
    halal: HalalColors;
    semantic: SemanticColors;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  typography: {
    sizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
    weights: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeights: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  radii: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    none: string;
  };
}

// Ali's nutrition-focused design tokens
export const designTokens: DesignTokens = {
  colors: {
    nutrition: {
      protein: {
        low: '#fef3c7',     // Light amber for <10g protein
        moderate: '#fbbf24', // Amber for 10-20g protein
        high: '#16a34a',    // Green for >20g protein
      },
      calories: {
        low: '#dcfce7',     // Light green for <100 kcal
        moderate: '#fed7aa', // Light orange for 100-200 kcal
        high: '#fecaca',    // Light red for >200 kcal
      },
      health: {
        A: '#16a34a',       // Dark green
        B: '#65a30d',       // Light green
        C: '#f59e0b',       // Amber
        D: '#ea580c',       // Orange
        E: '#dc2626',       // Red
      },
    },
    halal: {
      confirmed: '#16a34a',   // Green
      questionable: '#f59e0b', // Amber
      prohibited: '#dc2626',   // Red
    },
    semantic: {
      primary: '#16a34a',     // Nutrition green
      secondary: '#6b7280',   // Gray
      success: '#16a34a',     // Green
      warning: '#f59e0b',     // Amber
      error: '#dc2626',       // Red
      muted: '#9ca3af',       // Light gray
      background: '#ffffff',   // White
      foreground: '#111827',   // Dark gray
    },
  },
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
  },
  typography: {
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      md: '1rem',       // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  breakpoints: {
    sm: '640px',      // Mobile landscape
    md: '768px',      // Tablet
    lg: '1024px',     // Desktop
    xl: '1280px',     // Wide desktop
  },
  radii: {
    none: '0px',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    none: '0 0 #0000',
  },
};

/**
 * Design token provider utilities
 */
export class DesignTokenProvider {
  private tokens: DesignTokens;

  constructor(tokens: DesignTokens = designTokens) {
    this.tokens = tokens;
  }

  getTokens(): DesignTokens {
    return this.tokens;
  }

  getColor(path: string): string {
    const keys = path.split('.');
    let current: any = this.tokens.colors;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        throw new Error(`Color token not found: ${path}`);
      }
    }

    if (typeof current !== 'string') {
      throw new Error(`Color token path does not resolve to a string: ${path}`);
    }

    return current;
  }

  getSpacing(size: keyof DesignTokens['spacing']): string {
    return this.tokens.spacing[size];
  }

  isDarkMode(): boolean {
    // For now, always return false. Dark mode can be implemented later.
    return false;
  }

  toCSSCustomProperties(): Record<string, string> {
    const cssVars: Record<string, string> = {};

    // Convert nutrition colors
    Object.entries(this.tokens.colors.nutrition).forEach(([category, colors]) => {
      Object.entries(colors as Record<string, string>).forEach(([level, color]) => {
        cssVars[`--color-${category}-${level}`] = color;
      });
    });

    // Convert halal colors
    Object.entries(this.tokens.colors.halal).forEach(([status, color]) => {
      cssVars[`--color-halal-${status}`] = color;
    });

    // Convert semantic colors
    Object.entries(this.tokens.colors.semantic).forEach(([name, color]) => {
      cssVars[`--color-${name}`] = color;
    });

    // Convert spacing
    Object.entries(this.tokens.spacing).forEach(([size, value]) => {
      cssVars[`--spacing-${size}`] = value;
    });

    return cssVars;
  }
}

// Export default instance
export const designTokenProvider = new DesignTokenProvider();

// Helper functions for easy access
export const getColor = (path: string): string => designTokenProvider.getColor(path);
export const getSpacing = (size: keyof DesignTokens['spacing']): string => designTokenProvider.getSpacing(size);

// Types are already exported above