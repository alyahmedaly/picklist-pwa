import type { NEVOEntry, GICalculationResult, FoodGroupGI } from '@picklist/types';

/**
 * Composition-Based Glycemic Index Calculator
 *
 * Uses NEVO nutritional composition data to calculate GI values based on
 * scientific literature correlations between carb/fiber/sugar ratios and GI.
 */

/**
 * Base GI values for different food groups based on scientific literature
 */
const FOOD_GROUP_BASE_GI: FoodGroupGI[] = [
  // Grains & Cereals
  {
    group: 'Granen en graanproducten',
    groupEn: 'Cereals and cereal products',
    baseGI: 65,
    confidence: 'high',
    source: 'Foster-Powell 2002',
  },
  { group: 'Rijst', groupEn: 'Rice', baseGI: 70, confidence: 'high', source: 'Atkinson 2008' },
  {
    group: 'Brood',
    groupEn: 'Bread',
    baseGI: 70,
    confidence: 'high',
    source: 'Foster-Powell 2002',
  },

  // Vegetables
  {
    group: 'Aardappelen en knolgewassen',
    groupEn: 'Potatoes and tubers',
    baseGI: 85,
    confidence: 'high',
    source: 'Foster-Powell 2002',
  },
  {
    group: 'Groenten',
    groupEn: 'Vegetables',
    baseGI: 25,
    confidence: 'medium',
    source: 'Atkinson 2008',
  },

  // Fruits
  {
    group: 'Fruit',
    groupEn: 'Fruits',
    baseGI: 45,
    confidence: 'medium',
    source: 'Foster-Powell 2002',
  },

  // Legumes
  {
    group: 'Peulvruchten',
    groupEn: 'Legumes',
    baseGI: 30,
    confidence: 'high',
    source: 'Foster-Powell 2002',
  },

  // Dairy
  {
    group: 'Melk en melkproducten',
    groupEn: 'Milk and dairy products',
    baseGI: 35,
    confidence: 'medium',
    source: 'Atkinson 2008',
  },

  // Default fallback
  { group: 'Overig', groupEn: 'Other', baseGI: 55, confidence: 'low', source: 'WHO/FAO 1998' },
];

/**
 * Calculate GI based on NEVO nutritional composition
 *
 * Uses established correlations:
 * - Higher fiber content → Lower GI
 * - Higher simple sugar ratio → Higher GI
 * - Food group baseline → Context-specific adjustment
 */
export function calculateGIFromComposition(nevoEntry: NEVOEntry): GICalculationResult {
  const { carbs, sugars, starch, fiber, foodGroup, foodGroupEn } = nevoEntry;

  // Get base GI for food group
  const groupGI = getBaseGIForFoodGroup(foodGroup, foodGroupEn);
  let baseGI = groupGI.baseGI;
  let confidence = groupGI.confidence;

  // Skip calculation if no carbohydrates
  if (carbs <= 0) {
    return {
      giValue: 0,
      multiplier: 1.0,
      confidence: 'high',
      source: 'nevo_composition',
      nevoEntry,
      factors: { baseGI: 0, fiberEffect: 0, sugarEffect: 0, starchEffect: 0 },
    };
  }

  // Fiber effect: -2 GI points per gram of fiber per 10g carbs
  // Based on Jenkins et al. 1988 - fiber slows glucose absorption
  const fiberRatio = fiber / carbs;
  const fiberEffect = Math.min(25, fiberRatio * 50); // Cap at 25 point reduction

  // Sugar effect: +1.5 GI points per gram of simple sugars per 10g carbs
  // Simple sugars absorb faster than complex carbs
  const sugarRatio = sugars / carbs;
  const sugarEffect = Math.min(20, sugarRatio * 30); // Cap at 20 point increase

  // Starch effect: Complex starches are generally medium GI
  const starchRatio = starch / carbs;
  const starchEffect = starchRatio * 5; // Small positive effect for pure starch

  // Calculate final GI with bounds
  const calculatedGI = Math.max(
    15,
    Math.min(100, baseGI - fiberEffect + sugarEffect + starchEffect),
  );

  // Convert to multiplier for existing scoring system (1.0 = low, 1.5 = high)
  const multiplier = giToMultiplier(calculatedGI);

  // Determine confidence based on data completeness
  let finalConfidence: 'high' | 'medium' | 'low' = confidence;
  if (fiber === 0 && sugars === 0) {
    finalConfidence = 'low'; // Missing key composition data
  } else if (confidence === 'high' && (fiber > 0 || sugars > 0)) {
    finalConfidence = 'high'; // Good data quality
  } else {
    finalConfidence = 'medium';
  }

  return {
    giValue: Math.round(calculatedGI),
    multiplier: Math.round(multiplier * 100) / 100, // Round to 2 decimals
    confidence: finalConfidence,
    source: 'nevo_composition',
    nevoEntry,
    factors: {
      baseGI,
      fiberEffect: Math.round(fiberEffect),
      sugarEffect: Math.round(sugarEffect),
      starchEffect: Math.round(starchEffect),
    },
  };
}

/**
 * Get base GI for food group with fallback
 */
function getBaseGIForFoodGroup(dutchGroup: string, englishGroup: string): FoodGroupGI {
  // Try exact match first
  let match = FOOD_GROUP_BASE_GI.find(
    (fg) =>
      fg.group.toLowerCase() === dutchGroup.toLowerCase() ||
      fg.groupEn.toLowerCase() === englishGroup.toLowerCase(),
  );

  if (match) return match;

  // Try partial match for specific cases
  const searchTerms = [dutchGroup.toLowerCase(), englishGroup.toLowerCase()];

  for (const term of searchTerms) {
    if (term.includes('rijst') || term.includes('rice')) {
      return FOOD_GROUP_BASE_GI.find((fg) => fg.groupEn === 'Rice')!;
    }
    if (term.includes('aardappel') || term.includes('potato')) {
      return FOOD_GROUP_BASE_GI.find((fg) => fg.groupEn === 'Potatoes and tubers')!;
    }
    if (term.includes('graan') || term.includes('cereal')) {
      return FOOD_GROUP_BASE_GI.find((fg) => fg.groupEn === 'Cereals and cereal products')!;
    }
    if (term.includes('peulvrucht') || term.includes('legume')) {
      return FOOD_GROUP_BASE_GI.find((fg) => fg.groupEn === 'Legumes')!;
    }
  }

  // Default fallback
  return FOOD_GROUP_BASE_GI.find((fg) => fg.groupEn === 'Other')!;
}

/**
 * Convert GI value to multiplier for existing scoring system
 *
 * GI Scale:
 * - Low: ≤55 → 1.0x (best for post-workout)
 * - Medium: 56-69 → 1.1-1.3x
 * - High: ≥70 → 1.4-1.5x (worst for post-workout)
 */
function giToMultiplier(gi: number): number {
  if (gi <= 55) {
    return 1.0; // Low GI - best
  } else if (gi <= 69) {
    // Medium GI - linear scale from 1.0 to 1.3
    return 1.0 + ((gi - 55) / 14) * 0.3;
  } else {
    // High GI - linear scale from 1.3 to 1.5
    return 1.3 + Math.min((gi - 70) / 30, 1.0) * 0.2;
  }
}

/**
 * Calculate GI with pattern fallback if no NEVO match found
 */
export function calculateGIWithFallback(
  productName: string,
  ingredients: string,
  nevoEntry?: NEVOEntry,
): GICalculationResult {
  // Use NEVO composition if available
  if (nevoEntry) {
    return calculateGIFromComposition(nevoEntry);
  }

  // Fallback to improved pattern matching
  return calculateGIFromPattern(productName, ingredients);
}

/**
 * Improved pattern-based GI calculation as fallback
 */
function calculateGIFromPattern(productName: string, ingredients: string): GICalculationResult {
  const text = `${productName} ${ingredients}`.toLowerCase();

  // Low GI patterns (1.0x)
  if (
    /\b(volkoren|whole\s*grain|quinoa|linzen|lentils|kikkererwten|chickpeas|haver|oats)\b/i.test(
      text,
    )
  ) {
    return createPatternResult(45, 1.0, 'pattern_fallback', 'Whole grain/legume pattern');
  }

  // Basmati rice - specifically low GI
  if (/\b(basmati\s*rijst|basmati\s*rice)\b/i.test(text)) {
    return createPatternResult(50, 1.0, 'pattern_fallback', 'Basmati rice - low GI variety');
  }

  // High GI patterns (1.4x+)
  if (/\b(witte?\s*rijst|white\s*rice|aardappel|potato|glucose|dextrose)\b/i.test(text)) {
    return createPatternResult(80, 1.4, 'pattern_fallback', 'High GI ingredient');
  }

  // Medium GI patterns (1.1-1.3x)
  if (/\b(suiker|sugar|honing|honey|banaan|banana)\b/i.test(text)) {
    return createPatternResult(65, 1.2, 'pattern_fallback', 'Medium GI ingredient');
  }

  // Default unknown
  return createPatternResult(55, 1.1, 'pattern_fallback', 'Unknown - medium estimate');
}

/**
 * Helper to create pattern-based GI result
 */
function createPatternResult(
  gi: number,
  multiplier: number,
  source: string,
  _reason: string,
): GICalculationResult {
  return {
    giValue: gi,
    multiplier,
    confidence: 'low',
    source: source as any,
    factors: {
      baseGI: gi,
      fiberEffect: 0,
      sugarEffect: 0,
      starchEffect: 0,
    },
  };
}
