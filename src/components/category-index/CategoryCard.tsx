/**
 * CategoryCard Component
 *
 * Individual category card display with Ali-specific metrics.
 * Supports compact and detailed variants, accessibility, and performance optimization.
 */

import { memo, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { CategoryWithMetrics, AliContext } from '../../types/category-index';

export interface CategoryCardProps {
  category: CategoryWithMetrics;
  isSelected?: boolean;
  onClick: (category: CategoryWithMetrics) => void;
  showMetrics?: boolean;
  variant?: 'compact' | 'detailed';
  className?: string;
}

// Badge configuration following contract specifications
const BADGE_CONFIG = {
  halal: {
    thresholds: { high: 80, medium: 50, low: 0 },
    colors: {
      high: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-red-100 text-red-800 border-red-200',
    },
  },
  protein: {
    highProteinThreshold: 15,
    colors: {
      high: 'bg-blue-100 text-blue-800 border-blue-200',
      normal: 'bg-gray-100 text-gray-800 border-gray-200',
    },
  },
  efficiency: {
    goodValueThreshold: 0.50,
    colors: {
      good: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      normal: 'bg-gray-100 text-gray-800 border-gray-200',
    },
  },
  context: {
    colors: {
      'daily-protein': 'bg-purple-100 text-purple-800',
      'post-workout': 'bg-orange-100 text-orange-800',
      'cutting': 'bg-pink-100 text-pink-800',
      'budget': 'bg-green-100 text-green-800',
      'training-day': 'bg-red-100 text-red-800',
      'rest-day': 'bg-blue-100 text-blue-800',
    },
  },
} as const;

const CONTEXT_LABELS: Record<AliContext, string> = {
  'daily-protein': 'Daily Protein',
  'post-workout': 'Post Workout',
  'cutting': 'Cutting',
  'budget': 'Budget',
  'training-day': 'Training Day',
  'rest-day': 'Rest Day',
};

export const CategoryCard = memo<CategoryCardProps>(({
  category,
  isSelected = false,
  onClick,
  showMetrics = true,
  variant = 'detailed',
  className = '',
}) => {
  // Memoized calculations for performance
  const displayData = useMemo(() => {
    const { aliMetrics } = category;

    // Handle missing metrics gracefully
    if (!aliMetrics || (aliMetrics.halalCompliance === 0 && aliMetrics.averageProtein === 0 && aliMetrics.priceEfficiency === 999)) {
      return {
        hasValidMetrics: false,
        halalBadge: null,
        proteinBadge: null,
        efficiencyBadge: null,
        contextBadges: [],
      };
    }

    // Halal compliance badge
    const halalCompliance = aliMetrics.halalCompliance;
    const halalColor = halalCompliance >= BADGE_CONFIG.halal.thresholds.high ? 'high' :
                      halalCompliance >= BADGE_CONFIG.halal.thresholds.medium ? 'medium' : 'low';

    // Protein density badge
    const proteinDensity = aliMetrics.averageProtein;
    const isHighProtein = proteinDensity >= BADGE_CONFIG.protein.highProteinThreshold;

    // Price efficiency badge
    const priceEfficiency = aliMetrics.priceEfficiency;
    const isGoodValue = priceEfficiency <= BADGE_CONFIG.efficiency.goodValueThreshold;

    // Context badges
    const contextBadges = aliMetrics.recommendedFor.map(context => ({
      context,
      label: CONTEXT_LABELS[context],
      color: BADGE_CONFIG.context.colors[context],
    }));

    return {
      hasValidMetrics: true,
      halalBadge: {
        percentage: halalCompliance,
        color: halalColor,
        text: `${halalCompliance}% Halal`,
        className: BADGE_CONFIG.halal.colors[halalColor],
      },
      proteinBadge: {
        density: proteinDensity,
        isHighProtein,
        text: `${proteinDensity.toFixed(1)}g protein`,
        className: BADGE_CONFIG.protein.colors[isHighProtein ? 'high' : 'normal'],
      },
      efficiencyBadge: {
        score: priceEfficiency,
        isGoodValue,
        text: `€${priceEfficiency.toFixed(2)}/g protein`,
        className: BADGE_CONFIG.efficiency.colors[isGoodValue ? 'good' : 'normal'],
      },
      contextBadges,
    };
  }, [category.aliMetrics]);

  // Memoized aria label for accessibility
  const ariaLabel = useMemo(() => {
    const baseLabel = `${category.name}, ${category.productCount} products`;

    if (!showMetrics || !displayData.hasValidMetrics) {
      return baseLabel;
    }

    const metricsDescription = [
      displayData.halalBadge && `${displayData.halalBadge.percentage}% halal`,
      displayData.proteinBadge && `${displayData.proteinBadge.density.toFixed(1)}g protein`,
      displayData.efficiencyBadge && `€${displayData.efficiencyBadge.score.toFixed(2)} protein efficiency`,
    ].filter(Boolean).join(', ');

    return `${baseLabel}, ${metricsDescription}`;
  }, [category.name, category.productCount, showMetrics, displayData]);

  // Memoized click handler
  const handleClick = useCallback(() => {
    onClick(category);
  }, [onClick, category]);

  // Keyboard event handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  // Determine CSS classes based on variant and state
  const cardClasses = useMemo(() => {
    const baseClasses = [
      'group relative flex flex-col p-4 border rounded-lg transition-all duration-200',
      'hover:shadow-lg hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
      'cursor-pointer touch-target',
    ];

    if (variant === 'compact') {
      baseClasses.push('compact min-h-12 p-3');
    } else {
      baseClasses.push('detailed min-h-24');
    }

    if (isSelected) {
      baseClasses.push('selected bg-primary/5 border-primary shadow-md');
    } else {
      baseClasses.push('bg-card hover:bg-accent/5');
    }

    return baseClasses.join(' ');
  }, [variant, isSelected]);

  return (
    <Button
      variant="ghost"
      className={`${cardClasses} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      tabIndex={0}
    >
      {/* Category Header */}
      <div className="flex flex-col items-start gap-2 w-full">
        <div className="flex items-start justify-between w-full">
          <h3 className="font-medium text-left text-sm leading-tight line-clamp-2">
            {category.name}
          </h3>
          {category.children.length > 0 && (
            <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
              {category.children.length} sub
            </Badge>
          )}
        </div>

        {/* Product Count */}
        <p className="text-xs text-muted-foreground">
          {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
        </p>

        {/* Ali Metrics - Only show if metrics enabled and available */}
        {showMetrics && displayData.hasValidMetrics && variant === 'detailed' && (
          <div className="flex flex-wrap gap-1 mt-2 w-full">
            {/* Halal Compliance Badge */}
            {displayData.halalBadge && (
              <Badge
                variant="outline"
                className={`text-xs ${displayData.halalBadge.className} min-h-6`}
              >
                {displayData.halalBadge.text}
              </Badge>
            )}

            {/* Protein Density Badge */}
            {displayData.proteinBadge && (
              <Badge
                variant="outline"
                className={`text-xs ${displayData.proteinBadge.className} min-h-6`}
              >
                {displayData.proteinBadge.text}
              </Badge>
            )}

            {/* Price Efficiency Badge */}
            {displayData.efficiencyBadge && (
              <Badge
                variant="outline"
                className={`text-xs ${displayData.efficiencyBadge.className} min-h-6`}
              >
                {displayData.efficiencyBadge.text}
              </Badge>
            )}
          </div>
        )}

        {/* Context Badges - Only show if metrics enabled and contexts exist */}
        {showMetrics && displayData.contextBadges.length > 0 && variant === 'detailed' && (
          <div className="flex flex-wrap gap-1 mt-1 w-full">
            {displayData.contextBadges.map(({ context, label, color }) => (
              <Badge
                key={context}
                variant="outline"
                className={`text-xs ${color} min-h-6`}
              >
                {label}
              </Badge>
            ))}
          </div>
        )}

        {/* No metrics available state */}
        {showMetrics && !displayData.hasValidMetrics && (
          <p className="text-xs text-muted-foreground italic mt-1">
            No data available
          </p>
        )}
      </div>

      {/* Breadcrumbs for deeper categories */}
      {category.depth > 1 && variant === 'detailed' && (
        <div className="mt-2 pt-2 border-t border-border/20 w-full">
          <p className="text-xs text-muted-foreground truncate">
            {category.breadcrumbs}
          </p>
        </div>
      )}
    </Button>
  );
});

CategoryCard.displayName = 'CategoryCard';