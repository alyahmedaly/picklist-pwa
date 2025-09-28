/**
 * FilterCard Component
 *
 * Navigation card for Ali's filter categories with coverage statistics
 * Extends existing shadcn/ui Card component with nutrition theming
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import type { FilterCardProps } from '../../types/homepage';
import { CheckCircle2, Target } from 'lucide-react';

export const FilterCard: React.FC<FilterCardProps> = ({
  category,
  isActive,
  onClick,
  className = ''
}) => {
  // Handle click and keyboard interactions
  const handleInteraction = () => {
    onClick(category);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleInteraction();
    }
  };

  // Format large numbers with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Get context-specific icon
  const getContextIcon = () => {
    switch (category.context) {
      case 'post-workout':
        return <div data-testid="post-workout-icon" className="w-5 h-5">⚡</div>;
      case 'fat-loss':
        return <div data-testid="cutting-icon" className="w-5 h-5">🎯</div>;
      case 'budget':
        return <div data-testid="budget-icon" className="w-5 h-5">💰</div>;
      case 'training':
        return <div data-testid="training-icon" className="w-5 h-5">💪</div>;
      case 'rest':
        return <div data-testid="rest-icon" className="w-5 h-5">😴</div>;
      default:
        return <div data-testid="daily-icon" className="w-5 h-5">🥗</div>;
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleInteraction}
      onKeyDown={handleKeyDown}
      className={cn(
        // Base mobile-first styles with enhanced touch targets
        "cursor-pointer transition-all duration-200 min-h-[44px]",
        // Mobile: Larger touch targets and better spacing
        "p-4 touch-manipulation",
        // Tablet and up: Refined spacing
        "md:p-6",
        // Enhanced mobile interactions
        "active:scale-[0.98] active:bg-gray-100 dark:active:bg-gray-700",
        // Focus states for mobile accessibility
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        // Active and hover states
        isActive
          ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20"
          : "hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-md hover:scale-[1.02]",
        className
      )}
      aria-pressed={isActive}
      aria-label={`${category.name} filter with ${formatNumber(category.coverage)} products${category.targetProtein ? `, target ${category.targetProtein}g protein` : ''}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getContextIcon()}
            <h3 className="font-semibold text-base">{category.name}</h3>
            {isActive && (
              <CheckCircle2
                data-testid="active-indicator"
                className="w-4 h-4 text-blue-600"
              />
            )}
          </div>

          {category.targetProtein && (
            <Badge variant="outline" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              Target: {category.targetProtein}g protein
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {category.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatNumber(category.coverage)} products
          </div>

          {category.context && (
            <Badge
              variant={isActive ? "default" : "secondary"}
              className="text-xs"
            >
              {category.context.replace('-', ' ')}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterCard;