/**
 * NEVO Database Integration for Glycemic Index Calculation
 *
 * Provides systematic GI estimation using Dutch national nutrition database
 * instead of pattern-based matching for more accurate post-workout scoring.
 */

export { parseNEVOData, loadNEVODatabase } from './parseNEVOData.ts';
export { calculateGIFromComposition, calculateGIWithFallback } from './calculateGI.ts';
export { findNEVOMatches, getBestNEVOMatch } from './fuzzyMatcher.ts';
export {
  initializeNEVODatabase,
  estimateGlycemicIndexWithNEVO,
  getNEVOStats,
  preloadNEVODatabase,
} from './nevoIntegration.ts';
