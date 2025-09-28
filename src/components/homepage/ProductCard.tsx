/**
 * ProductCard Component
 *
 * Displays product information with nutrition metrics and health grades
 * Supports compact and detailed variants for virtual scrolling performance
 */

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import type { ProductCardProps } from '../../types/homepage';
import { Euro } from 'lucide-react';
import { cn } from '../../lib/utils';

// Design System Components
import { HealthGrade } from '../nutrition/health-grade';
import { HalalBadge } from '../nutrition/halal-badge';
import { VStack, HStack } from '../layout/stack';
import { Macro } from './Macro';
import { ScoresTooltip } from './ScoresTooltip';
import type { Product } from '@picklist/types';

// NutritionFacts component for displaying nutrition metrics
const NutritionFacts: React.FC<{ nutrition?: Product['nutrition'] }> = ({ nutrition }) => {
  if (!nutrition) return null;
  return (
    <div className="flex-shrink-0">
      <div className="border rounded-lg p-2 bg-gray-50 dark:bg-gray-800/50">
        <div className="grid grid-cols-6 gap-2 text-center text-xs">
          <Macro caloriesTotal={nutrition.kcal} label="Calories" value={nutrition.kcal} unit="cal" color="text-orange-600" />
          <Macro caloriesTotal={nutrition.kcal} label="Protein" value={nutrition.protein} unit="g" color="text-blue-600" />
          <Macro caloriesTotal={nutrition.kcal} label="Carbs" value={nutrition.carbs} unit="g" color="text-purple-600" />
          <Macro caloriesTotal={nutrition.sugars} label="Suger" value={nutrition.sugars} unit="g" color="text-purple-600" />
          <Macro caloriesTotal={nutrition.kcal} label="Fat" value={nutrition.fat} unit="g" color="text-red-600" />
          <Macro caloriesTotal={nutrition.kcal} label="Fiber" value={nutrition.fiber} unit="g" color="text-green-600" />
          <Macro caloriesTotal={nutrition.kcal} label="Salt" value={nutrition.salt} unit="g" color="text-gray-700" />
        </div>
      </div>
    </div>
  );
};


// Memoized for performance with 11k+ products
export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  variant = 'compact',
  onSelect,
  className = ''
}) => {
  const [copied, setCopied] = React.useState(false);
  // Handle product selection
  const handleInteraction = async () => {
    try {
      // Copy the complete product JSON to clipboard
      const productJson = JSON.stringify(product, null, 2);
      await navigator.clipboard.writeText(productJson);

      // Show visual feedback
      setCopied(true);
      console.log('Product JSON copied to clipboard:', product.name);

      // Reset the feedback after 2 seconds
      setTimeout(() => setCopied(false), 2000);

      // Also call the original onSelect if provided for compatibility
      if (onSelect) {
        onSelect(product);
      }
    } catch (error) {
      // Fallback for older browsers or when clipboard API is not available
      console.error('Failed to copy to clipboard:', error);
      console.log('Product JSON (manual copy):', JSON.stringify(product, null, 2));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onSelect) {
      e.preventDefault();
      handleInteraction();
    }
  };


  // Highlight search terms
  const highlightText = (text: string, terms?: string[]) => {
    if (!terms || terms.length === 0) return text;

    // Create a single regex pattern that matches all terms
    const escapedTerms = terms.map(term =>
      term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const combinedPattern = `(${escapedTerms.join('|')})`;
    const regex = new RegExp(combinedPattern, 'gi');

    return text.replace(
      regex,
      '<mark data-testid="highlighted-term" class="bg-yellow-200 dark:bg-yellow-900/50">$1</mark>'
    );
  };

  const cardClasses = cn(
    // Base mobile-first styles with enhanced visual appeal
    "transition-all duration-300 cursor-pointer border-2 border-transparent",
    // Mobile touch optimizations
    "touch-manipulation active:scale-[0.96]",
    // Focus states for mobile accessibility
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
    // Ensure card fits in grid properly
    "w-full h-auto",
    // Enhanced hover states with better shadows
    'hover:shadow-xl hover:scale-[1.03] hover:border-blue-200 dark:hover:border-blue-700',
    // Copied state feedback with better styling
    copied && 'ring-2 ring-green-500 shadow-xl bg-green-50 dark:bg-green-950/20 border-green-300',
    // Add subtle background gradient
    'bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800',
    className
  );

  const cardStyle = {
    width: '100%', // Take full width of grid cell
    maxWidth: '100%' // Ensure card fits in grid cell
  };

  // Build comprehensive aria-label
  const ariaLabel = `
    ${copied ? 'Product JSON copied to clipboard. ' : 'Click to copy product JSON. '}
    ${product.name}.
    ${product.categoryTree?.primary || product.categories?.[0] || 'Unknown category'}.
    ${product.price?.regular} ${product.price?.currency}.
    ${product.unit?.raw || ''}.
    ${product.nutrition?.protein ? `${product.nutrition.protein}g protein` : ''}.
    ${product.nutrition?.kcal ? `${product.nutrition.kcal} calories` : ''}.
    ${product.globalHealthGrade ? `Health grade ${product.globalHealthGrade}` : ''}.
    ${product.halalCheck?.status === 'halal' ? 'Halal certified.' : ''}
    ${product.nutritionalTags?.vegan ? 'Vegan.' : ''}
    ${product.nutritionalTags?.glutenFree ? 'Gluten free.' : ''}
  `.replace(/\s+/g, ' ').trim();

  return (
    <Card
      data-testid="product-card"
      role="button"
      tabIndex={onSelect ? 0 : undefined}
      onClick={handleInteraction}
      onKeyDown={handleKeyDown}
      className={cardClasses}
      style={cardStyle}
      aria-label={ariaLabel}
    >
      <CardContent className="p-4">
        <VStack spacing={variant === 'minimal' ? 'sm' : 'md'}>
          {/* Product Image with Overlays */}
          {product.images?.primary && (
            <div className="relative flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={product.images.primary.replace('https://static.ah.nl', '/api/images')}
                alt={product.name}
                className="w-full h-48 object-contain p-3"
                loading="lazy"
                onError={(e) => {
                  // Hide image on error and show placeholder
                  const img = e.target as HTMLImageElement;
                  const container = img.parentElement;
                  if (container) {
                    container.innerHTML = '<div class="w-full h-48 flex items-center justify-center text-gray-400 text-sm bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"><div class="text-center"><div class="text-2xl mb-1">📦</div><div>No Image</div></div></div>';
                  }
                }}
              />

              {/* Price Overlay - Top Right */}
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full shadow-lg">
                <div className="flex items-center gap-1">
                  <Euro className="w-3 h-3" />
                  <span className="font-bold text-sm">
                    {(product.price?.regular || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Health Grade Overlay - Top Left */}
              {product.globalHealthGrade && (
                <div className="absolute top-2 left-2">
                  <HealthGrade
                    grade={product.globalHealthGrade}
                    score={product.globalHealthScore}
                    variant="compact"
                    size="sm"
                  />
                </div>
              )}

              {/* Dietary Tags Overlay - Bottom */}
              <div className="absolute bottom-2 left-2 right-2">
                <HStack spacing="xs" wrap>
                  {product.halalCheck?.status === 'halal' && (
                    <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
                      حلال
                    </div>
                  )}
                  {product.nutritionalTags?.vegan && (
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
                      🌱 Vegan
                    </div>
                  )}
                  {product.nutritionalTags?.highProtein && (
                    <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
                      💪
                    </div>
                  )}
                  {product.nutritionalTags?.glutenFree && (
                    <div className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
                      🌾
                    </div>
                  )}
                </HStack>
              </div>

              {/* Copied Feedback Overlay - Center */}
              {copied && (
                <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center rounded-lg">
                  <div className="bg-white text-green-700 px-4 py-2 rounded-full font-bold shadow-lg animate-pulse">
                    ✓ Copied!
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Product Title - More prominent */}
          <div className="flex-shrink-0">
            <h3
              className="font-bold text-lg line-clamp-2 leading-tight text-gray-900 dark:text-gray-100"
              dangerouslySetInnerHTML={{
                __html: highlightText(product.name, [])
              }}
            />
          </div>

          {/* Unit and Key Protein Info */}
          <HStack justify="between" align="center" className="flex-shrink-0">
            {product.unit?.raw && (
              <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {product.unit.raw}
              </span>
            )}

            {/* Key nutritional highlight */}
            {product.nutrition?.protein && product.nutrition.protein >= 15 && (
              <div className="text-right bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {product.nutrition.protein.toFixed(1)}g
                </div>
                <div className="text-xs text-green-600 font-medium">
                  protein
                </div>
              </div>
            )}
          </HStack>

          {/* Nutrition Facts Component */}
          <NutritionFacts nutrition={product.nutrition} />

          {/* Category Tag with Scores Tooltip */}
          <HStack justify="between" align="center" className="flex-shrink-0">
            <Badge variant="secondary" size="sm" className="text-xs text-gray-600 bg-gray-100">
              {product.categoryTree?.primary || product.categories?.[0] || 'Unknown Category'}
            </Badge>
            <ScoresTooltip product={product} />
          </HStack>
        </VStack>
      </CardContent>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;