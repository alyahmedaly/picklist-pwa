import type { NEVODatabase } from '@picklist/types';
import { getBestNEVOMatch } from './fuzzyMatcher.ts';
import { calculateGIWithFallback } from './calculateGI.ts';
import { parseNEVOData } from './parseNEVOData.ts';

/**
 * NEVO Integration Layer
 *
 * Provides the main integration point for NEVO database functionality
 * with the existing glycemic index estimation system.
 */

// Global NEVO database instance (lazy loaded)
let nevoDatabase: NEVODatabase | null = null;
let nevoLoadPromise: Promise<NEVODatabase> | null = null;

/**
 * Initialize NEVO database from CSV file
 */
export async function initializeNEVODatabase(csvPath?: string): Promise<NEVODatabase> {
  if (nevoDatabase) {
    return nevoDatabase;
  }

  if (nevoLoadPromise) {
    return nevoLoadPromise;
  }

  nevoLoadPromise = loadNEVOData(csvPath);
  nevoDatabase = await nevoLoadPromise;
  return nevoDatabase;
}

/**
 * Load NEVO data with default path fallback
 */
async function loadNEVOData(csvPath?: string): Promise<NEVODatabase> {
  const defaultPath = 'data/nevo2023_v8.0/NEVO2023_8.0.csv';
  const actualPath = csvPath || defaultPath;

  try {
    const fs = await import('fs/promises');
    const csvText = await fs.readFile(actualPath, 'utf-8');
    console.log(`📊 Loading NEVO database from ${actualPath}`);
    return parseNEVOData(csvText);
  } catch (error) {
    console.warn(`⚠️ Could not load NEVO database from ${actualPath}:`, (error as Error).message);
    console.warn('Falling back to pattern-based GI estimation');

    // Return empty database for fallback mode
    return {
      entries: [],
      nameIndex: new Map(),
      groupIndex: new Map(),
      metadata: {
        version: 'fallback',
        totalEntries: 0,
        lastUpdated: new Date().toISOString(),
      },
    };
  }
}

/**
 * Enhanced glycemic index estimation with NEVO integration
 *
 * Drop-in replacement for the existing estimateGlycemicIndex function.
 * Uses NEVO composition data when available, falls back to patterns.
 */
export function estimateGlycemicIndexWithNEVO(
  ingredients: string[],
  categories: string[],
  productName?: string,
): number {
  // Handle invalid inputs
  if (!Array.isArray(ingredients) || !Array.isArray(categories)) {
    return 1.0;
  }

  // If NEVO database is not loaded, fall back to pattern matching
  if (!nevoDatabase || nevoDatabase.entries.length === 0) {
    return estimateGlycemicIndexPattern(ingredients, categories);
  }

  // Try NEVO lookup for main ingredient
  const searchText = productName || ingredients.join(' ');
  const nevoMatch = getBestNEVOMatch(searchText, nevoDatabase);

  // Calculate GI using NEVO data or fallback
  const giResult = calculateGIWithFallback(searchText, ingredients.join(' '), nevoMatch?.entry);

  // Log NEVO match for debugging (can be removed in production)
  if (nevoMatch && nevoMatch.confidence > 0.7) {
    console.log(
      `🎯 NEVO match for "${searchText}": ${nevoMatch.entry.dutchName} (GI: ${giResult.giValue}, confidence: ${nevoMatch.confidence.toFixed(2)})`,
    );
  }

  return giResult.multiplier;
}

/**
 * Original pattern-based estimation as fallback
 * (copied from bodyRecompositionHelpers.ts for compatibility)
 */
function estimateGlycemicIndexPattern(ingredients: string[], categories: string[]): number {
  // Handle empty arrays
  if (ingredients.length === 0 && categories.length === 0) {
    return 1.0;
  }

  // High GI ingredients (Dutch and English)
  const highGIPatterns = [
    /\b(witte?\s*rijst|wit\s*brood|glucose|maltose|dextrose|suiker|stroop)\b/i,
    /\b(white\s*rice|white\s*bread|glucose|maltose|dextrose|sugar|syrup|corn\s*syrup)\b/i,
  ];

  // Medium GI ingredients - FIXED: Remove basmati rice from medium GI
  const mediumGIPatterns = [
    /\b(banaan|honing|witte?\s*suiker)\b/i,
    /\b(banana|honey|white\s*sugar|sweet\s*potato)\b/i,
  ];

  // Low GI ingredients - FIXED: Add basmati rice to low GI
  const lowGIPatterns = [
    /\b(basmati\s*rijst|basmati\s*rice|linzen|kikkererwten|volkoren|haver|noten|groenten|bonen)\b/i,
    /\b(lentils|chickpeas|whole\s*grain|oats|nuts|vegetables|beans|quinoa)\b/i,
  ];

  const ingredientText = ingredients.join(' ').toLowerCase();

  // Check for high GI ingredients first
  for (const pattern of highGIPatterns) {
    if (pattern.test(ingredientText)) {
      return 1.3;
    }
  }

  // Check for medium GI ingredients
  for (const pattern of mediumGIPatterns) {
    if (pattern.test(ingredientText)) {
      return 1.1;
    }
  }

  // Check for low GI ingredients (including basmati rice)
  for (const pattern of lowGIPatterns) {
    if (pattern.test(ingredientText)) {
      return 1.0;
    }
  }

  // Category-based fallback
  const categoryText = categories.join(' ').toLowerCase();

  // If no categories, return default
  if (categoryText.trim() === '') {
    return 1.0;
  }

  if (
    /\b(graan|granen|brood|pasta|snoep|chocolade|koek|cake)\b/i.test(categoryText) ||
    /\b(grains|bread|pasta|sweets|chocolate|cookies|cake|cereals)\b/i.test(categoryText)
  ) {
    return 1.2;
  }

  if (/\b(fruit|zuivel|dairy)\b/i.test(categoryText)) {
    return 1.1;
  }

  if (
    /\b(groente|groenten|vlees|vis|noten|olie|produce|vegetables|meat|fish|nuts|oils)\b/i.test(
      categoryText,
    )
  ) {
    return 1.0;
  }

  return 1.0;
}

/**
 * Get NEVO database statistics (for debugging/monitoring)
 */
export function getNEVOStats(): { loaded: boolean; entries: number; version: string } {
  return {
    loaded: nevoDatabase !== null && nevoDatabase.entries.length > 0,
    entries: nevoDatabase?.entries.length || 0,
    version: nevoDatabase?.metadata.version || 'not loaded',
  };
}

/**
 * Preload NEVO database for better performance
 * Call this during application startup
 */
export async function preloadNEVODatabase(csvPath?: string): Promise<void> {
  try {
    await initializeNEVODatabase(csvPath);
    console.log('✅ NEVO database preloaded successfully');
  } catch (error) {
    console.warn('⚠️ NEVO database preload failed, will use patterns:', (error as Error).message);
  }
}
