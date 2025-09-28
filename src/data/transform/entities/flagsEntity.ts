/**
 * ProductFlags Entity Implementation
 * Feature: 019-flexible-database-schema
 *
 * Handles dietary and classification flags from monolithic product structure
 * to flexible schema with confidence scoring and source tracking.
 */

import type { Product } from '@picklist/types';
import type { FlexibleProductFlag, ProductFlagType } from '../types';

/**
 * Normalizes flags from monolithic Product to FlexibleProductFlag entities
 */
export function normalizeFlagsEntities(product: Product): FlexibleProductFlag[] {
  const flags: FlexibleProductFlag[] = [];

  if (!product.nutritionalTags) {
    return flags;
  }

  const tags = product.nutritionalTags;

  // Map nutritional tags to flag entities (using actual fields from NutritionalTags interface)
  const flagMappings: Array<{
    sourceField: keyof typeof tags;
    flagType: ProductFlagType;
    confidence?: number;
  }> = [
    { sourceField: 'vegan', flagType: 'is_vegan', confidence: 95 },
    { sourceField: 'vegetarian', flagType: 'is_vegetarian', confidence: 95 },
    { sourceField: 'glutenFree', flagType: 'is_gluten_free', confidence: 90 },
    { sourceField: 'lactoseFree', flagType: 'is_lactose_free', confidence: 90 },
    // Note: halal, kosher, organic are not in NutritionalTags interface
    // They should come from halalCheck field instead
    { sourceField: 'highProtein', flagType: 'is_high_protein', confidence: 85 },
    { sourceField: 'lowCarb', flagType: 'is_low_carb', confidence: 85 },
    { sourceField: 'highFiber', flagType: 'is_high_fiber', confidence: 85 }
  ];

  for (const mapping of flagMappings) {
    const value = tags[mapping.sourceField];

    if (value !== undefined && value !== null) {
      flags.push({
        product_id: product.id,
        flag_type: mapping.flagType,
        flag_value: Boolean(value),
        confidence: mapping.confidence || 80,
        source: 'nutritional_tags'
      });
    }
  }

  // Add halal flags from halalCheck analysis
  if (product.halalCheck) {
    flags.push({
      product_id: product.id,
      flag_type: 'is_halal',
      flag_value: product.halalCheck.status === 'halal',
      confidence: product.halalCheck.confidence === 'high' ? 95 : product.halalCheck.confidence === 'medium' ? 80 : 60,
      source: 'halal_analysis'
    });
  }

  // Add additive-based flags if additiveInfo is available
  if (product.additiveInfo) {
    const additiveFlags = extractAdditiveFlags(product);
    flags.push(...additiveFlags);
  }

  // Add nutrition-derived flags
  if (product.nutrition) {
    const nutritionFlags = deriveNutritionFlags(product);
    flags.push(...nutritionFlags);
  }

  return flags;
}

/**
 * Extracts flags from additive information
 */
function extractAdditiveFlags(product: Product): FlexibleProductFlag[] {
  const flags: FlexibleProductFlag[] = [];

  if (!product.additiveInfo) {
    return flags;
  }

  const additives = product.additiveInfo;

  // Check for artificial colors (Southampton Six)
  const artificialColors = ['E102', 'E104', 'E110', 'E122', 'E124', 'E129'];
  const hasArtificialColors = additives.eNumbers?.some(eNum =>
    artificialColors.includes(eNum.replace(/[^E0-9]/g, ''))
  );

  if (hasArtificialColors) {
    flags.push({
      product_id: product.id,
      flag_type: 'has_artificial_colors',
      flag_value: true,
      confidence: 100,
      source: 'e_number_analysis'
    });
  }

  // Check for preservatives
  const preservatives = ['E200', 'E201', 'E202', 'E203', 'E210', 'E211', 'E212', 'E213', 'E214', 'E215', 'E216', 'E217', 'E218', 'E219', 'E220', 'E221', 'E222', 'E223', 'E224', 'E225', 'E226', 'E227', 'E228'];
  const hasPreservatives = additives.eNumbers?.some(eNum =>
    preservatives.some(p => eNum.replace(/[^E0-9]/g, '').startsWith(p))
  ) || additives.dutchCategories?.some(cat =>
    cat.toLowerCase().includes('conserveermiddel')
  );

  if (hasPreservatives) {
    flags.push({
      product_id: product.id,
      flag_type: 'has_preservatives',
      flag_value: true,
      confidence: 95,
      source: 'additive_analysis'
    });
  }

  // Check for sweeteners
  const sweeteners = ['E950', 'E951', 'E952', 'E954', 'E955', 'E957', 'E959', 'E961', 'E962', 'E967', 'E968'];
  const hasSweeteners = additives.eNumbers?.some(eNum =>
    sweeteners.includes(eNum.replace(/[^E0-9]/g, ''))
  ) || additives.dutchCategories?.some(cat =>
    cat.toLowerCase().includes('zoetstof')
  );

  if (hasSweeteners) {
    flags.push({
      product_id: product.id,
      flag_type: 'has_sweeteners',
      flag_value: true,
      confidence: 95,
      source: 'additive_analysis'
    });
  }

  return flags;
}

/**
 * Derives flags from nutritional data
 */
function deriveNutritionFlags(product: Product): FlexibleProductFlag[] {
  const flags: FlexibleProductFlag[] = [];

  if (!product.nutrition) {
    return flags;
  }

  const nutrition = product.nutrition;

  // High protein (≥20g per 100g)
  if (nutrition.protein && nutrition.protein >= 20) {
    flags.push({
      product_id: product.id,
      flag_type: 'is_high_protein',
      flag_value: true,
      confidence: 100,
      source: 'nutrition_calculation'
    });
  }

  // Low carb (≤5g per 100g)
  if (nutrition.carbs !== undefined && nutrition.carbs <= 5) {
    flags.push({
      product_id: product.id,
      flag_type: 'is_low_carb',
      flag_value: true,
      confidence: 100,
      source: 'nutrition_calculation'
    });
  }

  // High fiber (≥6g per 100g)
  if (nutrition.fiber && nutrition.fiber >= 6) {
    flags.push({
      product_id: product.id,
      flag_type: 'is_high_fiber',
      flag_value: true,
      confidence: 100,
      source: 'nutrition_calculation'
    });
  }

  return flags;
}

/**
 * Validates flag entity against business rules
 */
export function validateFlagEntity(flag: FlexibleProductFlag): string[] {
  const errors: string[] = [];

  // Required field validation
  if (!flag.product_id || flag.product_id.trim() === '') {
    errors.push('Product ID is required');
  }

  // Flag type validation
  const validFlagTypes: ProductFlagType[] = [
    'is_vegan', 'is_vegetarian', 'is_gluten_free', 'is_lactose_free',
    'is_halal', 'is_kosher', 'is_organic',
    'is_high_protein', 'is_low_carb', 'is_high_fiber',
    'has_artificial_colors', 'has_preservatives', 'has_sweeteners'
  ];

  if (!validFlagTypes.includes(flag.flag_type)) {
    errors.push(`Invalid flag type: ${flag.flag_type}. Must be one of: ${validFlagTypes.join(', ')}`);
  }

  // Flag value validation
  if (typeof flag.flag_value !== 'boolean') {
    errors.push('Flag value must be a boolean');
  }

  // Confidence validation
  if (flag.confidence < 0 || flag.confidence > 100) {
    errors.push('Confidence must be between 0 and 100');
  }

  // Source validation
  if (!flag.source || flag.source.trim() === '') {
    errors.push('Source is required');
  }

  if (flag.source && flag.source.length > 50) {
    errors.push('Source must be 50 characters or less');
  }

  return errors;
}

/**
 * Batch normalizes flags for multiple products
 */
export function normalizeFlagsEntitiesForProducts(products: Product[]): {
  flags: FlexibleProductFlag[];
  errors: Array<{ productId: string; errors: string[] }>;
} {
  const allFlags: FlexibleProductFlag[] = [];
  const errors: Array<{ productId: string; errors: string[] }> = [];

  for (const product of products) {
    try {
      const productFlags = normalizeFlagsEntities(product);

      for (const flag of productFlags) {
        const validationErrors = validateFlagEntity(flag);

        if (validationErrors.length > 0) {
          errors.push({
            productId: product.id,
            errors: validationErrors
          });
        } else {
          allFlags.push(flag);
        }
      }
    } catch (error) {
      errors.push({
        productId: product.id || 'unknown',
        errors: [`Failed to normalize flags: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    }
  }

  return {
    flags: allFlags,
    errors
  };
}

/**
 * Merges duplicate flags (same product + flag type) by taking highest confidence
 */
export function mergeDuplicateFlags(flags: FlexibleProductFlag[]): FlexibleProductFlag[] {
  const flagMap = new Map<string, FlexibleProductFlag>();

  for (const flag of flags) {
    const key = `${flag.product_id}:${flag.flag_type}`;
    const existing = flagMap.get(key);

    if (!existing || flag.confidence > existing.confidence) {
      flagMap.set(key, flag);
    }
  }

  return Array.from(flagMap.values());
}

/**
 * Filters flags by criteria
 */
export function filterFlags(flags: FlexibleProductFlag[], criteria: {
  productIds?: string[];
  flagTypes?: ProductFlagType[];
  flagValue?: boolean;
  minConfidence?: number;
  sources?: string[];
}): FlexibleProductFlag[] {
  return flags.filter(flag => {
    if (criteria.productIds && !criteria.productIds.includes(flag.product_id)) {
      return false;
    }

    if (criteria.flagTypes && !criteria.flagTypes.includes(flag.flag_type)) {
      return false;
    }

    if (criteria.flagValue !== undefined && flag.flag_value !== criteria.flagValue) {
      return false;
    }

    if (criteria.minConfidence !== undefined && flag.confidence < criteria.minConfidence) {
      return false;
    }

    if (criteria.sources && !criteria.sources.includes(flag.source)) {
      return false;
    }

    return true;
  });
}

/**
 * Gets flag statistics
 */
export function getFlagStatistics(flags: FlexibleProductFlag[]): {
  totalFlags: number;
  flagTypeDistribution: Record<ProductFlagType, number>;
  averageConfidence: number;
  sourceDistribution: Record<string, number>;
  trueFlags: number;
  falseFlags: number;
} {
  const flagTypeDistribution: Record<string, number> = {};
  const sourceDistribution: Record<string, number> = {};
  let totalConfidence = 0;
  let trueFlags = 0;
  let falseFlags = 0;

  for (const flag of flags) {
    flagTypeDistribution[flag.flag_type] = (flagTypeDistribution[flag.flag_type] || 0) + 1;
    sourceDistribution[flag.source] = (sourceDistribution[flag.source] || 0) + 1;
    totalConfidence += flag.confidence;

    if (flag.flag_value) {
      trueFlags++;
    } else {
      falseFlags++;
    }
  }

  return {
    totalFlags: flags.length,
    flagTypeDistribution: flagTypeDistribution as Record<ProductFlagType, number>,
    averageConfidence: flags.length > 0 ? Math.round(totalConfidence / flags.length * 10) / 10 : 0,
    sourceDistribution,
    trueFlags,
    falseFlags
  };
}

/**
 * Creates a test flag entity
 */
export function createTestFlagEntity(overrides: Partial<FlexibleProductFlag> = {}): FlexibleProductFlag {
  const defaultFlag: FlexibleProductFlag = {
    product_id: 'test-product-001',
    flag_type: 'is_halal',
    flag_value: true,
    confidence: 95,
    source: 'test'
  };

  return { ...defaultFlag, ...overrides };
}