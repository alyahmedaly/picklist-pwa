/**
 * ProductAdditives Entity Implementation
 * Feature: 019-flexible-database-schema
 *
 * Handles food additives and E-numbers from monolithic product structure
 * to flexible schema with safety flags and functional categorization.
 */

import type { Product } from '@picklist/types';
import type { FlexibleProductAdditive } from '../types';

/**
 * Normalizes additives from monolithic Product to FlexibleProductAdditive entities
 */
export function normalizeAdditivesEntities(product: Product): FlexibleProductAdditive[] {
  const additives: FlexibleProductAdditive[] = [];

  if (!product.additiveInfo) {
    return additives;
  }

  const additiveInfo = product.additiveInfo;

  // Process E-numbers with their definitions
  if (additiveInfo.eNumbers && additiveInfo.eNumbers.length > 0) {
    for (const eNumber of additiveInfo.eNumbers) {
      const cleanENumber = cleanENumberFormat(eNumber);
      const definition = getENumberDefinition(cleanENumber);

      additives.push({
        product_id: product.id,
        e_number: cleanENumber,
        additive_name: definition?.name || 'Unknown additive',
        functional_category: definition?.functionalCategory || 'Unknown',
        dutch_category: mapDutchCategory(definition?.functionalCategory),
        safety_flags: JSON.stringify(generateSafetyFlags(cleanENumber, definition)),
        is_natural: definition?.isNatural || false
      });
    }
  }

  // Process Dutch categories without specific E-numbers
  if (additiveInfo.dutchCategories && additiveInfo.dutchCategories.length > 0) {
    const processedENumbers = new Set(additives.map(a => a.e_number));

    for (const dutchCategory of additiveInfo.dutchCategories) {
      // Only add if we don't already have a specific E-number for this category
      const categoryType = normalizeDutchCategory(dutchCategory);

      if (categoryType && !hasMatchingENumber(processedENumbers, categoryType)) {
        additives.push({
          product_id: product.id,
          additive_name: `Generic ${categoryType}`,
          functional_category: mapDutchToFunctional(categoryType),
          dutch_category: dutchCategory.toLowerCase(),
          safety_flags: JSON.stringify([]),
          is_natural: false
        });
      }
    }
  }

  return additives;
}

/**
 * Cleans and normalizes E-number format
 */
function cleanENumberFormat(eNumber: string): string {
  // Extract E-number from various formats like [E300], E-300, etc.
  const match = eNumber.match(/E\d{3,4}/i);
  return match ? match[0].toUpperCase() : eNumber;
}

/**
 * Gets E-number definition from database
 */
function getENumberDefinition(eNumber: string): {
  name: string;
  functionalCategory: string;
  isNatural: boolean;
} | null {
  // This would normally come from a comprehensive E-number database
  // For now, we'll include the most common ones
  const eNumberDatabase: Record<string, { name: string; functionalCategory: string; isNatural: boolean }> = {
    'E300': { name: 'Ascorbic acid (Vitamin C)', functionalCategory: 'Antioxidant', isNatural: true },
    'E330': { name: 'Citric acid', functionalCategory: 'Antioxidant', isNatural: true },
    'E202': { name: 'Potassium sorbate', functionalCategory: 'Preservative', isNatural: false },
    'E211': { name: 'Sodium benzoate', functionalCategory: 'Preservative', isNatural: false },
    'E102': { name: 'Tartrazine', functionalCategory: 'Color', isNatural: false },
    'E104': { name: 'Quinoline Yellow', functionalCategory: 'Color', isNatural: false },
    'E110': { name: 'Sunset Yellow FCF', functionalCategory: 'Color', isNatural: false },
    'E122': { name: 'Azorubine', functionalCategory: 'Color', isNatural: false },
    'E124': { name: 'Ponceau 4R', functionalCategory: 'Color', isNatural: false },
    'E129': { name: 'Allura Red AC', functionalCategory: 'Color', isNatural: false },
    'E150': { name: 'Caramel color', functionalCategory: 'Color', isNatural: true },
    'E407': { name: 'Carrageenan', functionalCategory: 'Stabilizer', isNatural: true },
    'E412': { name: 'Guar gum', functionalCategory: 'Stabilizer', isNatural: true },
    'E415': { name: 'Xanthan gum', functionalCategory: 'Stabilizer', isNatural: true },
    'E440': { name: 'Pectin', functionalCategory: 'Stabilizer', isNatural: true },
    'E500': { name: 'Sodium carbonate', functionalCategory: 'Acidity regulator', isNatural: true },
    'E621': { name: 'Monosodium glutamate (MSG)', functionalCategory: 'Flavor enhancer', isNatural: false },
    'E950': { name: 'Acesulfame K', functionalCategory: 'Sweetener', isNatural: false },
    'E951': { name: 'Aspartame', functionalCategory: 'Sweetener', isNatural: false },
    'E955': { name: 'Sucralose', functionalCategory: 'Sweetener', isNatural: false }
  };

  return eNumberDatabase[eNumber] || null;
}

/**
 * Maps Dutch category names to English functional categories
 */
function mapDutchCategory(functionalCategory?: string): string | undefined {
  if (!functionalCategory) return undefined;

  const mapping: Record<string, string> = {
    'Antioxidant': 'antioxidant',
    'Preservative': 'conserveermiddel',
    'Color': 'kleurstof',
    'Stabilizer': 'stabilisator',
    'Emulsifier': 'emulgator',
    'Sweetener': 'zoetstof',
    'Flavor enhancer': 'smaakversterker',
    'Acidity regulator': 'zuurteregelaar'
  };

  return mapping[functionalCategory];
}

/**
 * Normalizes Dutch category strings
 */
function normalizeDutchCategory(category: string): string | null {
  const normalized = category.toLowerCase().trim();

  const categoryMapping: Record<string, string> = {
    'conserveermiddel': 'preservative',
    'conserveermiddelen': 'preservative',
    'kleurstof': 'color',
    'kleurstoffen': 'color',
    'antioxidant': 'antioxidant',
    'antioxidanten': 'antioxidant',
    'stabilisator': 'stabilizer',
    'stabilisatoren': 'stabilizer',
    'emulgator': 'emulsifier',
    'emulgatoren': 'emulsifier',
    'zoetstof': 'sweetener',
    'zoetstoffen': 'sweetener',
    'smaakversterker': 'flavor_enhancer',
    'smaakversterkers': 'flavor_enhancer',
    'zuurteregelaar': 'acidity_regulator',
    'zuurteregelaars': 'acidity_regulator'
  };

  return categoryMapping[normalized] || null;
}

/**
 * Maps Dutch categories to functional categories
 */
function mapDutchToFunctional(dutchType: string): string {
  const mapping: Record<string, string> = {
    'preservative': 'Preservative',
    'color': 'Color',
    'antioxidant': 'Antioxidant',
    'stabilizer': 'Stabilizer',
    'emulsifier': 'Emulsifier',
    'sweetener': 'Sweetener',
    'flavor_enhancer': 'Flavor enhancer',
    'acidity_regulator': 'Acidity regulator'
  };

  return mapping[dutchType] || 'Unknown';
}

/**
 * Checks if we already have an E-number for a category type
 */
function hasMatchingENumber(processedENumbers: Set<string>, categoryType: string): boolean {
  // This is a simplified check - in reality, you'd have a more comprehensive mapping
  const categoryENumbers: Record<string, string[]> = {
    'preservative': ['E200', 'E201', 'E202', 'E203', 'E210', 'E211', 'E212'],
    'color': ['E102', 'E104', 'E110', 'E122', 'E124', 'E129', 'E150'],
    'sweetener': ['E950', 'E951', 'E952', 'E954', 'E955'],
    'antioxidant': ['E300', 'E301', 'E302', 'E330', 'E331']
  };

  const relevantENumbers = categoryENumbers[categoryType] || [];
  return relevantENumbers.some(eNum => processedENumbers.has(eNum));
}

/**
 * Generates safety flags for an E-number
 */
function generateSafetyFlags(eNumber: string, definition: { name: string; functionalCategory: string; isNatural: boolean } | null): string[] {
  const flags: string[] = [];

  if (!definition) {
    flags.push('unknown_additive');
    return flags;
  }

  // Southampton Six (artificial colors that may affect children's behavior)
  const southamptonSix = ['E102', 'E104', 'E110', 'E122', 'E124', 'E129'];
  if (southamptonSix.includes(eNumber)) {
    flags.push('southampton_six');
    flags.push('may_affect_children');
  }

  // Common allergen additives
  const allergenAdditives = ['E220', 'E221', 'E222', 'E223', 'E224', 'E225', 'E226', 'E227', 'E228']; // Sulfites
  if (allergenAdditives.includes(eNumber)) {
    flags.push('sulfite_allergen');
  }

  // MSG and related
  if (eNumber === 'E621') {
    flags.push('msg');
    flags.push('may_cause_sensitivity');
  }

  // Artificial sweeteners
  const artificialSweeteners = ['E950', 'E951', 'E952', 'E954', 'E955'];
  if (artificialSweeteners.includes(eNumber)) {
    flags.push('artificial_sweetener');
  }

  // Aspartame specific
  if (eNumber === 'E951') {
    flags.push('contains_phenylalanine');
  }

  // Natural vs artificial
  if (definition.isNatural) {
    flags.push('natural_origin');
  } else {
    flags.push('synthetic');
  }

  return flags;
}

/**
 * Validates additive entity against business rules
 */
export function validateAdditiveEntity(additive: FlexibleProductAdditive): string[] {
  const errors: string[] = [];

  // Required field validation
  if (!additive.product_id || additive.product_id.trim() === '') {
    errors.push('Product ID is required');
  }

  if (!additive.additive_name || additive.additive_name.trim() === '') {
    errors.push('Additive name is required');
  }

  if (additive.additive_name && additive.additive_name.length > 200) {
    errors.push('Additive name must be 200 characters or less');
  }

  if (!additive.functional_category || additive.functional_category.trim() === '') {
    errors.push('Functional category is required');
  }

  if (additive.functional_category && additive.functional_category.length > 100) {
    errors.push('Functional category must be 100 characters or less');
  }

  // E-number format validation
  if (additive.e_number) {
    if (!additive.e_number.match(/^E\d{3,4}$/)) {
      errors.push('E-number must be in format E### or E####');
    }
  }

  // Dutch category validation
  if (additive.dutch_category && additive.dutch_category.length > 100) {
    errors.push('Dutch category must be 100 characters or less');
  }

  // Safety flags validation (should be valid JSON array)
  if (additive.safety_flags) {
    try {
      const flags = JSON.parse(additive.safety_flags);
      if (!Array.isArray(flags)) {
        errors.push('Safety flags must be a JSON array');
      }
    } catch {
      errors.push('Safety flags must be valid JSON');
    }
  }

  // Boolean validation
  if (typeof additive.is_natural !== 'boolean') {
    errors.push('is_natural must be a boolean');
  }

  return errors;
}

/**
 * Batch normalizes additives for multiple products
 */
export function normalizeAdditivesEntitiesForProducts(products: Product[]): {
  additives: FlexibleProductAdditive[];
  errors: Array<{ productId: string; errors: string[] }>;
} {
  const allAdditives: FlexibleProductAdditive[] = [];
  const errors: Array<{ productId: string; errors: string[] }> = [];

  for (const product of products) {
    try {
      const productAdditives = normalizeAdditivesEntities(product);

      for (const additive of productAdditives) {
        const validationErrors = validateAdditiveEntity(additive);

        if (validationErrors.length > 0) {
          errors.push({
            productId: product.id,
            errors: validationErrors
          });
        } else {
          allAdditives.push(additive);
        }
      }
    } catch (error) {
      errors.push({
        productId: product.id || 'unknown',
        errors: [`Failed to normalize additives: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    }
  }

  return {
    additives: allAdditives,
    errors
  };
}

/**
 * Filters additives by safety criteria
 */
export function filterAdditivesBySafety(additives: FlexibleProductAdditive[], criteria: {
  excludeSouthamptonSix?: boolean;
  excludeArtificialSweeteners?: boolean;
  excludeAllergens?: boolean;
  naturalOnly?: boolean;
  excludeENumbers?: string[];
}): FlexibleProductAdditive[] {
  return additives.filter(additive => {
    try {
      const safetyFlags = additive.safety_flags ? JSON.parse(additive.safety_flags) : [];

      if (criteria.excludeSouthamptonSix && safetyFlags.includes('southampton_six')) {
        return false;
      }

      if (criteria.excludeArtificialSweeteners && safetyFlags.includes('artificial_sweetener')) {
        return false;
      }

      if (criteria.excludeAllergens && (safetyFlags.includes('sulfite_allergen') || safetyFlags.includes('may_cause_sensitivity'))) {
        return false;
      }

      if (criteria.naturalOnly && !additive.is_natural) {
        return false;
      }

      if (criteria.excludeENumbers && additive.e_number && criteria.excludeENumbers.includes(additive.e_number)) {
        return false;
      }

      return true;
    } catch {
      // If safety flags can't be parsed, exclude to be safe
      return false;
    }
  });
}

/**
 * Gets additive statistics
 */
export function getAdditiveStatistics(additives: FlexibleProductAdditive[]): {
  totalAdditives: number;
  uniqueENumbers: number;
  functionalCategoryDistribution: Record<string, number>;
  naturalVsSynthetic: { natural: number; synthetic: number };
  safetyFlagDistribution: Record<string, number>;
  productsWithAdditives: number;
} {
  const uniqueENumbers = new Set(additives.filter(a => a.e_number).map(a => a.e_number)).size;
  const productsWithAdditives = new Set(additives.map(a => a.product_id)).size;
  const functionalCategoryDistribution: Record<string, number> = {};
  const safetyFlagDistribution: Record<string, number> = {};
  let naturalCount = 0;
  let syntheticCount = 0;

  for (const additive of additives) {
    // Functional categories
    functionalCategoryDistribution[additive.functional_category] =
      (functionalCategoryDistribution[additive.functional_category] || 0) + 1;

    // Natural vs synthetic
    if (additive.is_natural) {
      naturalCount++;
    } else {
      syntheticCount++;
    }

    // Safety flags
    try {
      const safetyFlags = additive.safety_flags ? JSON.parse(additive.safety_flags) : [];
      for (const flag of safetyFlags) {
        safetyFlagDistribution[flag] = (safetyFlagDistribution[flag] || 0) + 1;
      }
    } catch {
      // Skip invalid safety flags
    }
  }

  return {
    totalAdditives: additives.length,
    uniqueENumbers,
    functionalCategoryDistribution,
    naturalVsSynthetic: { natural: naturalCount, synthetic: syntheticCount },
    safetyFlagDistribution,
    productsWithAdditives
  };
}

/**
 * Creates a test additive entity
 */
export function createTestAdditiveEntity(overrides: Partial<FlexibleProductAdditive> = {}): FlexibleProductAdditive {
  const defaultAdditive: FlexibleProductAdditive = {
    product_id: 'test-product-001',
    e_number: 'E300',
    additive_name: 'Ascorbic acid (Vitamin C)',
    functional_category: 'Antioxidant',
    dutch_category: 'antioxidant',
    safety_flags: JSON.stringify(['natural_origin']),
    is_natural: true
  };

  return { ...defaultAdditive, ...overrides };
}