/**
 * Calculate percentile rank within dataset using stable ranking algorithm
 *
 * The percentile rank represents the percentage of scores in the dataset that
 * are less than or equal to the given score. Uses a stable algorithm for
 * deterministic results with duplicate scores.
 *
 * @param score - Individual product's Nutri-Score
 * @param allScores - Array of all Nutri-Scores in dataset (can be unsorted)
 * @returns Percentile rank (0-1 scale) with 3 decimal precision
 *
 * @example
 * ```typescript
 * const scores = [-5, -2, 0, 3, 8, 12, 15];
 * const rank = computePercentileRank(8, scores); // Returns ~0.714 (5th out of 7)
 * ```
 */
export function computePercentileRank(score: number, allScores: number[]): number {
  // Validate input
  if (!Array.isArray(allScores) || allScores.length === 0) {
    throw new Error('Cannot compute percentile rank: empty or invalid scores array');
  }

  // Handle single element case
  if (allScores.length === 1) {
    return 0.5;
  }

  // Sort scores for consistent ranking (does not modify original array)
  const sortedScores = [...allScores].sort((a, b) => a - b);

  // Count scores less than the target score
  let countLess = 0;
  // Count scores equal to the target score
  let countEqual = 0;

  for (const s of sortedScores) {
    if (s < score) {
      countLess++;
    } else if (s === score) {
      countEqual++;
    } else {
      // Since array is sorted, no more scores can be <= target
      break;
    }
  }

  // Handle case where score is not in the array
  if (countEqual === 0) {
    // Use interpolation for scores between existing values
    return interpolatePercentileRank(score, sortedScores);
  }

  // Standard percentile rank formula for discrete data
  // Uses the midpoint method: (countLess + 0.5 * countEqual) / totalCount
  const totalCount = sortedScores.length;
  const percentileRank = (countLess + 0.5 * countEqual) / totalCount;

  // Return with 3 decimal precision to avoid floating-point issues
  return Math.round(percentileRank * 1000) / 1000;
}

/**
 * Interpolate percentile rank for scores not present in the dataset
 */
function interpolatePercentileRank(score: number, sortedScores: number[]): number {
  const totalCount = sortedScores.length;

  // Find the position where the score would be inserted
  let insertPosition = 0;
  for (let i = 0; i < sortedScores.length; i++) {
    const currentScore = sortedScores[i];
    if (currentScore !== undefined && currentScore < score) {
      insertPosition++;
    } else {
      break;
    }
  }

  // Handle edge cases
  if (insertPosition === 0) {
    // Score is below all existing scores
    return 0.0;
  }
  if (insertPosition === totalCount) {
    // Score is above all existing scores
    return 1.0;
  }

  // Linear interpolation between adjacent ranks
  const lowerRank = (insertPosition - 0.5) / totalCount;
  const upperRank = (insertPosition + 0.5) / totalCount;

  // For simplicity, use the midpoint between adjacent ranks
  const interpolatedRank = (lowerRank + upperRank) / 2;

  return Math.round(interpolatedRank * 1000) / 1000;
}

/**
 * Alternative implementation using binary search for O(log N) performance
 * (Currently using linear search for simplicity and clarity)
 */
/*
function binarySearchPercentileRank(score: number, sortedScores: number[]): number {
  const totalCount = sortedScores.length;

  // Binary search for first occurrence of score
  let left = 0;
  let right = sortedScores.length - 1;
  let firstIndex = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (sortedScores[mid] === score) {
      firstIndex = mid;
      right = mid - 1; // Continue searching left for first occurrence
    } else if (sortedScores[mid] < score) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  if (firstIndex === -1) {
    // Score not found, use insertion point
    const insertPosition = left;
    return insertPosition / totalCount;
  }

  // Binary search for last occurrence of score
  left = firstIndex;
  right = sortedScores.length - 1;
  let lastIndex = firstIndex;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (sortedScores[mid] === score) {
      lastIndex = mid;
      left = mid + 1; // Continue searching right for last occurrence
    } else {
      right = mid - 1;
    }
  }

  // Calculate percentile using midpoint method
  const countLess = firstIndex;
  const countEqual = lastIndex - firstIndex + 1;
  const percentileRank = (countLess + 0.5 * countEqual) / totalCount;

  return Math.round(percentileRank * 1000) / 1000;
}
*/
