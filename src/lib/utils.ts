import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { designTokens, type DesignTokens } from './design-tokens'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Design token access utilities
 */
export const tokens = {
  /**
   * Get nutrition color by type and level
   */
  nutrition: {
    protein: (level: 'low' | 'moderate' | 'high') =>
      designTokens.colors.nutrition.protein[level],
    calories: (level: 'low' | 'moderate' | 'high') =>
      designTokens.colors.nutrition.calories[level],
    health: (grade: 'A' | 'B' | 'C' | 'D' | 'E') =>
      designTokens.colors.nutrition.health[grade],
  },

  /**
   * Get halal status color
   */
  halal: (status: 'confirmed' | 'questionable' | 'prohibited') =>
    designTokens.colors.halal[status],

  /**
   * Get semantic color
   */
  semantic: (color: keyof DesignTokens['colors']['semantic']) =>
    designTokens.colors.semantic[color],

  /**
   * Get spacing value
   */
  spacing: (size: keyof DesignTokens['spacing']) =>
    designTokens.spacing[size],
}

/**
 * Nutrition level classification utilities
 */
export const classify = {
  /**
   * Classify protein level based on grams per 100g
   */
  protein: (grams: number): 'low' | 'moderate' | 'high' => {
    if (grams < 10) return 'low';
    if (grams <= 20) return 'moderate';
    return 'high';
  },

  /**
   * Classify calorie level based on kcal per 100g
   */
  calories: (kcal: number): 'low' | 'moderate' | 'high' => {
    if (kcal < 100) return 'low';
    if (kcal <= 200) return 'moderate';
    return 'high';
  },

  /**
   * Get health grade color class
   */
  healthGrade: (grade: 'A' | 'B' | 'C' | 'D' | 'E') => {
    const colors = {
      A: 'bg-health-A text-primary-foreground',
      B: 'bg-health-B text-foreground',
      C: 'bg-health-C text-foreground',
      D: 'bg-health-D text-foreground',
      E: 'bg-health-E text-primary-foreground',
    };
    return colors[grade];
  },
}

/**
 * Ali-specific nutrition utilities
 */
export const nutrition = {
  /**
   * Calculate protein efficiency (protein per calorie)
   */
  proteinEfficiency: (protein: number, calories: number): number => {
    if (calories === 0) return 0;
    return protein / calories;
  },

  /**
   * Calculate daily protein progress for 170g target
   */
  dailyProteinProgress: (currentProtein: number, targetProtein: number = 170): number => {
    return Math.min((currentProtein / targetProtein) * 100, 100);
  },

  /**
   * Normalize nutrition value per 100g
   */
  per100g: (value: number, servingSize: number): number => {
    if (servingSize === 0) return 0;
    return (value / servingSize) * 100;
  },

  /**
   * Format nutrition display value
   */
  formatValue: (value: number, unit: string = 'g', decimals: number = 1): string => {
    return `${value.toFixed(decimals)}${unit}`;
  },
}

/**
 * Accessibility utilities
 */
export const a11y = {
  /**
   * Screen reader only text
   */
  srOnly: 'sr-only',

  /**
   * Focus visible styles
   */
  focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',

  /**
   * Generate ARIA label for nutrition values
   */
  nutritionLabel: (value: number, unit: string, nutrient: string): string => {
    return `${nutrient}: ${value} ${unit}`;
  },

  /**
   * Generate ARIA label for health grade
   */
  healthGradeLabel: (grade: 'A' | 'B' | 'C' | 'D' | 'E', score?: number): string => {
    const base = `Health grade ${grade}`;
    return score ? `${base}, score ${score} out of 100` : base;
  },

  /**
   * Generate ARIA label for halal status
   */
  halalStatusLabel: (status: 'confirmed' | 'questionable' | 'prohibited'): string => {
    const labels = {
      confirmed: 'Halal status: confirmed',
      questionable: 'Halal status: needs verification',
      prohibited: 'Halal status: prohibited (haram)',
    };
    return labels[status];
  },
}
