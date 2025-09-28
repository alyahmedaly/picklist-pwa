/**
 * Product Display Transformer
 *
 * Transforms raw product data from JSONL files into ProductDisplay format
 * optimized for UI rendering and virtual scrolling
 */

import type { ProductDisplay, FilterCategory } from '../../types/homepage';

// Standard display height for virtual scrolling
const PRODUCT_CARD_HEIGHT = 120; // pixels

/**
 * Transform a single product to ProductDisplay format
 */
export function transformToDisplayProduct(
  product: any,
  context: FilterCategory
): ProductDisplay {
  // Extract core product data with fallbacks
  const id = product.id || '';
  const name = product.name || 'Unknown Product';
  const brand = product.brand || 'Unknown Brand';
  const price = parseFloat(product.price) || 0;
  const currency = product.currency || '€';

  // Extract nutrition data with validation
  const nutrition = product.nutrition || {};
  const protein = parseFloat(nutrition.protein) || 0;
  const carbs = parseFloat(nutrition.carbs) || parseFloat(nutrition.carbohydrates) || 0;
  const fat = parseFloat(nutrition.fat) || 0;
  const calories = parseFloat(nutrition.calories) || parseFloat(nutrition.energy) || 0;

  // Extract health scoring
  const healthGrade = (product.categoryHealthGrade || product.globalHealthGrade || 'E') as 'A' | 'B' | 'C' | 'D' | 'E';
  const healthScore = parseFloat(product.categoryHealthScore) || parseFloat(product.globalHealthScore) || 0;

  // Extract compliance data
  const isHalal = Boolean(product.isHalal) || Boolean(product.halal);

  // Calculate context-specific scoring
  const contextScore = calculateContextScore(product, context);
  const contextLabel = generateContextLabel(product, context);
  const targetContribution = calculateTargetContribution(protein, context);

  return {
    id,
    name,
    brand,
    price,
    currency,
    protein,
    carbs,
    fat,
    calories,
    healthGrade,
    healthScore,
    isHalal,
    contextScore,
    contextLabel,
    targetContribution,
    displayHeight: PRODUCT_CARD_HEIGHT,
    isVisible: false // Will be set by virtual scrolling
  };
}

/**
 * Batch transform multiple products
 */
export function batchTransformProducts(
  products: any[],
  context: FilterCategory
): ProductDisplay[] {
  return products
    .filter(product => validateProduct(product))
    .map(product => transformToDisplayProduct(product, context))
    .sort((a, b) => {
      // Sort by context score (desc), then by protein (desc)
      if (a.contextScore && b.contextScore) {
        if (b.contextScore !== a.contextScore) {
          return b.contextScore - a.contextScore;
        }
      }
      return b.protein - a.protein;
    });
}

/**
 * Calculate context-specific score based on filter type
 */
function calculateContextScore(product: any, context: FilterCategory): number | undefined {
  switch (context.context) {
    case 'daily':
      // Daily protein: protein efficiency + health score
      const proteinPer100g = parseFloat(product.nutrition?.protein) || 0;
      const healthScore = parseFloat(product.categoryHealthScore) || 0;
      return (proteinPer100g * 0.7) + (healthScore * 0.3);

    case 'post-workout':
      // Post-workout: carb:protein ratio + fast absorption
      const carbs = parseFloat(product.nutrition?.carbs) || 0;
      const protein = parseFloat(product.nutrition?.protein) || 0;
      const postWorkoutScore = parseFloat(product.postWorkoutOptimization?.recoveryScore) || 0;
      if (protein > 0) {
        const carbProteinRatio = carbs / protein;
        return postWorkoutScore + (carbProteinRatio > 2 ? 20 : 0);
      }
      return postWorkoutScore;

    case 'fat-loss':
      // Cutting: satiety efficiency + low calorie density
      const fatLossScore = parseFloat(product.fatLossCompatibility?.satiationEfficiency) || 0;
      const calories = parseFloat(product.nutrition?.calories) || 1;
      const caloriesPerGram = calories / 100; // calories per 100g
      const lowCalorieDensityBonus = caloriesPerGram < 200 ? 10 : 0;
      return fatLossScore + lowCalorieDensityBonus;

    case 'budget':
      // Budget: protein per euro + value score
      const pricePerKg = parseFloat(product.price) || 0;
      const proteinPerKg = (parseFloat(product.nutrition?.protein) || 0) * 10; // protein per kg
      if (pricePerKg > 0) {
        const proteinPerEuro = proteinPerKg / pricePerKg;
        return proteinPerEuro * 10; // Scale for display
      }
      return 0;

    case 'training':
      // Training day: enhanced calorie efficiency + carb content
      const enhancedEfficiency = parseFloat(product.enhancedCalorieEfficiency?.overallScore) || 0;
      const carbContent = parseFloat(product.nutrition?.carbs) || 0;
      return enhancedEfficiency + (carbContent > 30 ? 10 : 0);

    case 'rest':
      // Rest day: protein efficiency with lower carbs
      const restProtein = parseFloat(product.nutrition?.protein) || 0;
      const restCarbs = parseFloat(product.nutrition?.carbs) || 0;
      const lowCarbBonus = restCarbs < 15 ? 10 : 0;
      return restProtein + lowCarbBonus;

    default:
      return undefined;
  }
}

/**
 * Generate context-specific label for the product
 */
function generateContextLabel(product: any, context: FilterCategory): string | undefined {
  switch (context.context) {
    case 'daily':
      const dailyProtein = parseFloat(product.nutrition?.protein) || 0;
      if (dailyProtein > 20) return 'High Protein';
      if (dailyProtein > 10) return 'Good Protein';
      return 'Low Protein';

    case 'post-workout':
      const carbs = parseFloat(product.nutrition?.carbs) || 0;
      const protein = parseFloat(product.nutrition?.protein) || 0;
      if (protein > 0) {
        const ratio = carbs / protein;
        if (ratio > 3) return 'Fast Recovery';
        if (ratio > 1.5) return 'Balanced Recovery';
        return 'Protein Focus';
      }
      return 'Recovery Food';

    case 'fat-loss':
      const calories = parseFloat(product.nutrition?.calories) || 0;
      if (calories < 150) return 'Very Low Cal';
      if (calories < 250) return 'Low Cal';
      return 'Moderate Cal';

    case 'budget':
      const price = parseFloat(product.price) || 0;
      if (price < 2) return 'Great Value';
      if (price < 4) return 'Good Value';
      return 'Premium';

    case 'training':
      const trainingCarbs = parseFloat(product.nutrition?.carbs) || 0;
      if (trainingCarbs > 40) return 'High Carb';
      if (trainingCarbs > 20) return 'Moderate Carb';
      return 'Low Carb';

    case 'rest':
      const restCarbs = parseFloat(product.nutrition?.carbs) || 0;
      if (restCarbs < 10) return 'Very Low Carb';
      if (restCarbs < 20) return 'Low Carb';
      return 'Higher Carb';

    default:
      return undefined;
  }
}

/**
 * Calculate contribution to daily protein target
 */
function calculateTargetContribution(protein: number, context: FilterCategory): string | undefined {
  if (!context.targetProtein) return undefined;

  const contribution = (protein / context.targetProtein) * 100;

  if (contribution >= 20) return `${Math.round(contribution)}% of daily target`;
  if (contribution >= 10) return `${Math.round(contribution)}% of target`;
  if (contribution >= 5) return `${contribution.toFixed(1)}% of target`;

  return undefined;
}

/**
 * Validate product data before transformation
 */
function validateProduct(product: any): boolean {
  // Must have basic required fields
  if (!product.id || !product.name) return false;

  // Must have some nutrition data
  if (!product.nutrition) return false;

  // Must have a valid price
  const price = parseFloat(product.price);
  if (isNaN(price) || price < 0) return false;

  return true;
}

/**
 * Filter products by search query
 */
export function filterProductsBySearch(
  products: ProductDisplay[],
  query: string
): ProductDisplay[] {
  if (!query.trim()) return products;

  const searchTerms = query.toLowerCase().trim().split(/\s+/);

  return products
    .map(product => {
      const searchableText = `${product.name} ${product.brand}`.toLowerCase();
      const matchedTerms: string[] = [];

      const matches = searchTerms.every(term => {
        if (searchableText.includes(term)) {
          matchedTerms.push(term);
          return true;
        }
        return false;
      });

      if (matches) {
        return {
          ...product,
          matchedTerms,
          isHighlighted: true
        };
      }

      return null;
    })
    .filter((product): product is ProductDisplay => product !== null);
}

/**
 * Sort products by specified criteria
 */
export function sortProducts(
  products: ProductDisplay[],
  sortBy: string,
  direction: 'asc' | 'desc'
): ProductDisplay[] {
  const multiplier = direction === 'desc' ? -1 : 1;

  return [...products].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'protein-desc':
      case 'protein-asc':
        comparison = (b.protein - a.protein) * multiplier;
        break;

      case 'price-asc':
      case 'price-desc':
        comparison = (a.price - b.price) * multiplier;
        break;

      case 'health-grade':
        const gradeOrder = { A: 5, B: 4, C: 3, D: 2, E: 1 };
        comparison = (gradeOrder[b.healthGrade] - gradeOrder[a.healthGrade]) * multiplier;
        break;

      case 'calories-asc':
      case 'calories-desc':
        comparison = (a.calories - b.calories) * multiplier;
        break;

      case 'name':
        comparison = a.name.localeCompare(b.name) * multiplier;
        break;

      default:
        // Default to context score if available, then protein
        if (a.contextScore && b.contextScore) {
          comparison = (b.contextScore - a.contextScore) * multiplier;
        } else {
          comparison = (b.protein - a.protein) * multiplier;
        }
    }

    return comparison;
  });
}