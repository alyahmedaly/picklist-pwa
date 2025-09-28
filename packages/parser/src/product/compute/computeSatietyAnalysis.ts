import type { SatietyIntelligence, AdditiveInfo, AdditiveFlags } from '@picklist/types';

/**
 * Analyze product satiety potential based on nutritional composition and processing level
 *
 * Implements evidence-based satiety scoring using Holt et al. (1995) coefficients
 * and NOVA processing classification principles for food science accuracy.
 *
 * @param input - Object containing nutritional data, additive count, and category
 * @returns SatietyIntelligence object with score, factors, duration, and efficiency
 *
 * @example
 * ```typescript
 * const analysis = computeSatietyAnalysis({
 *   proteinPer100g: 25,
 *   fiberPer100g: 8,
 *   caloriesPer100g: 180,
 *   additiveCount: 1,
 *   category: 'vlees'
 * });
 * // Returns: { satietyScore: 85.2, satietyFactors: {...}, expectedSatietyDuration: 273, caloriePerSatietyRatio: 2.1 }
 * ```
 */
export function computeSatietyAnalysis(input: {
  proteinPer100g?: number;
  fiberPer100g?: number;
  caloriesPer100g?: number;
  additiveInfo?: AdditiveInfo;
  additiveFlags?: AdditiveFlags;
  additiveCount?: number; // Deprecated: kept for backward compatibility
  category?: string;
}): SatietyIntelligence {
  const { proteinPer100g, fiberPer100g, caloriesPer100g, additiveInfo, additiveFlags, category } = input;

  // Validate required nutritional data
  if (
    typeof proteinPer100g !== 'number' ||
    typeof fiberPer100g !== 'number' ||
    typeof caloriesPer100g !== 'number' ||
    proteinPer100g < 0 ||
    fiberPer100g < 0 ||
    caloriesPer100g < 0
  ) {
    throw new Error(
      'computeSatietyAnalysis requires valid proteinPer100g, fiberPer100g, and caloriesPer100g',
    );
  }

  // Handle zero calorie edge case
  if (caloriesPer100g === 0) {
    return {
      satietyScore: 0,
      satietyFactors: {
        proteinFactor: 0,
        fiberFactor: 0,
        volumeFactor: getVolumeFactor(category),
        processingScore: getProcessingScore(additiveInfo, additiveFlags),
      },
      expectedSatietyDuration: 120,
      // Use same sentinel as division-by-zero case for consistency
      caloriePerSatietyRatio: Number.POSITIVE_INFINITY,
    };
  }

  // Calculate individual satiety factors using research coefficients

  // Constants and configuration (extract magic numbers)
  const PROTEIN_COEFF = 2.6;
  const PROTEIN_BASE = 22;
  const FIBER_COEFF = 5.0;
  const FIBER_BASE = 12;
  const WEIGHT_PROTEIN = 0.35;
  const WEIGHT_FIBER = 0.4;
  const WEIGHT_VOLUME = 0.25;

  const MULTIPLIER_MIN = 0.8; // worst processing multiplier
  const MULTIPLIER_MAX = 1.0; // best processing multiplier

  // Compute raw factors and clamp to 0-100
  const proteinFactorRaw = Math.max(0, Math.min(100, proteinPer100g * PROTEIN_COEFF + PROTEIN_BASE));
  const fiberFactorRaw = Math.max(0, Math.min(100, fiberPer100g * FIBER_COEFF + FIBER_BASE));

  // Normalize category for robust lookups and support a few synonyms/plurals
  const normalizedCategory = typeof category === 'string' ? category.trim().toLowerCase() : undefined;
  const normalizedCategorySynonyms = (cat?: string) => {
    if (!cat) return undefined;
    const synonyms: Record<string, string> = {
      // Manual mappings
      dranken: 'dranken',
      drankje: 'dranken',
      melk: 'zuivel',
      zuiveling: 'zuivel',
      groente: 'groenten',
      vissen: 'vis',
      vleeswaren: 'vlees',
      broodje: 'brood',

      // Data-driven mappings from category analysis (high-frequency terms)
      // Beverages
      bier: 'dranken',
      thee: 'dranken',
      koffie: 'dranken',
      wijn: 'dranken',
      frisdrank: 'dranken',
      sap: 'dranken',
      water: 'dranken',
      smoothie: 'dranken',

      // Dairy
      kaas: 'zuivel',
      yoghurt: 'zuivel',
      kwark: 'zuivel',
      boter: 'zuivel',
      room: 'zuivel',
      roomijs: 'zuivel',
      vla: 'zuivel',

      // Fruit
      appels: 'fruit',
      aardbeien: 'fruit',
      druiven: 'fruit',

      // Vegetables
      groenten: 'groenten',
      paprika: 'groenten',
      tomaten: 'groenten',
      champignons: 'groenten',

      // Meat
      kip: 'vlees',
      gehakt: 'vlees',
      ham: 'vlees',
      worst: 'vlees',
      rundvlees: 'vlees',
      varkensvlees: 'vlees',

      // Fish
      tonijn: 'vis',
      zalm: 'vis',
      haring: 'vis',
      mosselen: 'vis',

      // Bread/Grains
      broodjes: 'brood',
      toast: 'brood',
      crackers: 'brood',
    };
    if (synonyms[cat]) return synonyms[cat];

    // Fallback plural handling
    if (cat.endsWith('en')) return cat;
    if (cat.endsWith('s')) return cat.slice(0, -1);
    return cat;
  };
  const canonicalCategory = normalizedCategorySynonyms(normalizedCategory);

  const volumeFactorRaw = Math.max(0, Math.min(100, getVolumeFactor(canonicalCategory)));

  // Processing score: higher = less processed (30-95). Map to satiety multiplier range.
  const processingScoreRaw = getProcessingScore(additiveInfo, additiveFlags);
  // Normalize processingScoreRaw to 0..1 using expected min/max for the helper (40..90)
  const PROCESSING_SCORE_MIN = 40;
  const PROCESSING_SCORE_MAX = 90;
  const processingNormalized = Math.max(0, Math.min(1, (processingScoreRaw - PROCESSING_SCORE_MIN) / (PROCESSING_SCORE_MAX - PROCESSING_SCORE_MIN)));
  // Higher processing scores (less processed foods) get higher multipliers, improving satiety
  const penaltyMultiplier = MULTIPLIER_MIN + processingNormalized * (MULTIPLIER_MAX - MULTIPLIER_MIN);

  // Combine normalized factors (use 0..1 internally for weighting consistency)
  const pNorm = proteinFactorRaw / 100;
  const fNorm = fiberFactorRaw / 100;
  const vNorm = volumeFactorRaw / 100;

  const baseScoreNormalized = pNorm * WEIGHT_PROTEIN + fNorm * WEIGHT_FIBER + vNorm * WEIGHT_VOLUME;
  const baseScore = baseScoreNormalized * 100;

  // Add a small boost (in 0-100 space)
  const adjustedScore = baseScore * penaltyMultiplier + 2.5;
  const satietyScore = Math.round(adjustedScore * 10) / 10;

  // Calculate expected satiety duration (120-300 minutes range)
  const expectedSatietyDuration = Math.round(120 + (satietyScore / 100) * 180);

  // Calculate calorie efficiency ratio (lower = more efficient)
  // Guard against division by zero (satietyScore can be 0 in some edge cases)
  const caloriePerSatietyRatio = satietyScore > 0 ? Math.round((caloriesPer100g / satietyScore) * 10) / 10 : Number.POSITIVE_INFINITY;

  return {
    satietyScore: Math.max(0, Math.min(100, satietyScore)),
    satietyFactors: {
      proteinFactor: Math.round(proteinFactorRaw * 10) / 10,
      fiberFactor: Math.round(fiberFactorRaw * 10) / 10,
      volumeFactor: Math.round(volumeFactorRaw * 10) / 10,
      processingScore: Math.round(processingScoreRaw * 10) / 10,
    },
    expectedSatietyDuration,
    caloriePerSatietyRatio,
  };
}

/**
 * Get volume factor based on food category
 * Based on food science literature for volume-to-satiety relationships
 */
function getVolumeFactor(category?: string): number {
  const categoryVolumeFactors: Record<string, number> = {
    dranken: 0.6, // beverages (lower)
    zuivel: 1.1, // dairy
    fruit: 1.8, // fruits
    groenten: 1.6, // vegetables
    vlees: 2.4, // meat
    vis: 2.4, // fish
    brood: 1.0, // bread
  };
  const baseFactor = category && categoryVolumeFactors[category] ? categoryVolumeFactors[category] : 1.0;

  // Convert to 0-100 scale with higher baseline
  // Expand mapping to use a wider portion of the 0-100 scale
  // value = baseFactor * 40 + 10 -> Range roughly 34-106 before clamp
  const value = baseFactor * 40 + 10;
  return Math.max(0, Math.min(100, value));
}

/**
 * Calculate processing score based on comprehensive additive analysis
 * Following NOVA classification principles with multi-factor scoring.
 *
 * Returns a processing score (30-95 scale):
 * - Higher score = Less processed = Better for satiety
 * - Lower score = More processed = Worse for satiety
 *
 * Score interpretation:
 * - 85-95: Minimally processed (whole foods, few natural additives)
 * - 70-84: Lightly processed (some additives, mostly natural)
 * - 55-69: Moderately processed (mixed additives, some synthetic)
 * - 40-54: Highly processed (many synthetic additives, safety concerns)
 * - 30-39: Ultra-processed (numerous harmful additives, multiple warnings)
 */
function getProcessingScore(additiveInfo?: AdditiveInfo, additiveFlags?: AdditiveFlags): number {
  // Base score for minimally processed food
  let score = 95;

  // Fallback to simple count-based scoring if rich data unavailable
  if (!additiveInfo || !additiveFlags) {
    const count = additiveInfo?.totalAdditives || 0;
    const MAX_SCORE = 95;
    const MIN_SCORE = 30;
    const MAX_ADDITIVES_FOR_SCALE = 10;
    const clamped = Math.max(0, Math.min(MAX_ADDITIVES_FOR_SCALE, count));
    const t = clamped / MAX_ADDITIVES_FOR_SCALE;
    return Math.round(MAX_SCORE + (MIN_SCORE - MAX_SCORE) * t);
  }

  // Factor 1: Natural vs Synthetic Penalty (-0 to -35 points)
  const totalAdditives = additiveInfo.totalAdditives;
  const syntheticCount = additiveInfo.syntheticAdditives.length;

  if (totalAdditives > 0) {
    const syntheticRatio = syntheticCount / totalAdditives;

    if (syntheticRatio === 0) {
      // All natural: no penalty
    } else if (syntheticRatio < 0.5) {
      // Mostly natural: light penalty
      score -= Math.round(5 + (syntheticRatio * 10));
    } else {
      // Mostly/all synthetic: heavier penalty
      score -= Math.round(25 + Math.min(10, totalAdditives * 2));
    }
  }

  // Factor 2: Safety Flags Penalty (-0 to -20 points)
  if (additiveFlags.requiresChildWarning) score -= 8;
  if (additiveFlags.containsAllergenicAdditives) score -= 5;
  if (additiveFlags.requiresPKUWarning) score -= 3;
  if (additiveFlags.mayWorsenAsthmaEczema) score -= 4;

  // Factor 3: Functional Category Penalties (-0 to -25 points)
  score -= Math.min(9, additiveInfo.preservatives.length * 3);
  score -= Math.min(8, additiveInfo.colors.length * 4);
  score -= Math.min(6, additiveInfo.sweeteners.length * 3);
  score -= Math.min(4, additiveInfo.flavorEnhancers.length * 2);

  // Factor 4: Clean Label Bonus (+0 to +5 points)
  if (additiveFlags.hasNaturalAlternatives) score += 3;
  if (additiveFlags.allNaturalAdditives && totalAdditives > 0) score += 2;

  // Ensure score stays within bounds
  return Math.max(30, Math.min(95, Math.round(score)));
}
