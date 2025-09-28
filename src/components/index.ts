/**
 * Design System Component Exports
 *
 * This file provides a clean, organized API for importing all design system components.
 * Import from this file for better tree-shaking and consistent component access.
 *
 * @example
 * ```typescript
 * import { Button, Card, ProteinMeter } from '@/components';
 * ```
 */

// ============================================================================
// Design System Provider & Context
// ============================================================================
export {
  DesignSystemProvider,
  useDesignSystem,
  useDesignSystemOptional,
  ThemeToggle,
  LocaleSelector,
  AliPreferencesPanel,
  type DesignSystemProviderProps,
  type ThemeToggleProps,
  type LocaleSelectorProps,
  type AliPreferencesPanelProps,
} from './design-system-provider';

// ============================================================================
// UI Components (Base Components)
// ============================================================================

// Button
export {
  Button,
  buttonVariants,
  type ButtonProps,
} from './ui/button';

// Card
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
  type CardProps,
} from './ui/card';

// Badge
export {
  Badge,
  badgeVariants,
  type BadgeProps,
} from './ui/badge';

// Input
export {
  Input,
  inputVariants,
  type InputProps,
} from './ui/input';

// Skeleton
export {
  Skeleton,
  SkeletonGroup,
  NutritionCardSkeleton,
  ProductListItemSkeleton,
  ProteinMeterSkeleton,
  skeletonVariants,
  type SkeletonProps,
  type SkeletonGroupProps,
} from './ui/skeleton';

// ============================================================================
// Nutrition Components (Ali-Specific Components)
// ============================================================================

// Protein Meter
export {
  ProteinMeter,
  proteinMeterVariants,
  type ProteinMeterProps,
} from './nutrition/protein-meter';

// Nutrition Card
export {
  NutritionCard,
  nutritionCardVariants,
  type NutritionCardProps,
  type Nutrition,
} from './nutrition/nutrition-card';

// Health Grade
export {
  HealthGrade,
  healthGradeVariants,
  type HealthGradeProps,
  type Grade,
} from './nutrition/health-grade';

// Halal Badge
export {
  HalalBadge,
  halalBadgeVariants,
  type HalalBadgeProps,
  type HalalStatus,
} from './nutrition/halal-badge';

// ============================================================================
// Layout Components
// ============================================================================

// Container
export {
  Container,
  containerVariants,
  type ContainerProps,
} from './layout/container';

// Stack
export {
  Stack,
  HStack,
  VStack,
  NutritionStack,
  stackVariants,
  type StackProps,
} from './layout/stack';

// Grid
export {
  Grid,
  GridItem,
  NutritionGrid,
  ProductGrid,
  gridVariants,
  gridItemVariants,
  type GridProps,
  type GridItemProps,
} from './layout/grid';

// ============================================================================
// Utility Re-exports
// ============================================================================

// Design tokens and utilities
export { designTokenProvider } from '../lib/design-tokens';
export { cn, tokens, classify, nutrition, a11y } from '../lib/utils';

// ============================================================================
// JSDoc Documentation for IntelliSense
// ============================================================================

/**
 * @fileoverview Design System Components Index
 *
 * This file serves as the main entry point for the design system components.
 * It provides organized exports for all components, utilities, and types.
 *
 * ## Usage Examples
 *
 * ### Individual Imports
 * ```typescript
 * import { Button, Card } from '@/components';
 * import { ProteinMeter } from '@/components';
 * ```
 *
 * ### With Design System Provider
 * ```typescript
 * import { DesignSystemProvider, Button, ProteinMeter } from '@/components';
 *
 * function App() {
 *   return (
 *     <DesignSystemProvider defaultLocale="en" defaultTheme="system">
 *       <Button>Click me</Button>
 *       <ProteinMeter protein={25} servingSize={100} />
 *     </DesignSystemProvider>
 *   );
 * }
 * ```
 */