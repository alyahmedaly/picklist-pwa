import type { FilterCriteria } from '@picklist/types';

/**
 * Generates filter name from criteria for consistent file naming.
 *
 * @param criteria - Filter criteria object
 * @returns Descriptive filter name
 */


export function generateFilterName(criteria: FilterCriteria): string {
  const parts: string[] = [];

  if (criteria.halal) parts.push('halal');
  if (criteria.protein) parts.push('protein');
  if (criteria.postWorkout) parts.push('postworkout');
  if (criteria.fatLoss) parts.push('fatloss');
  if (criteria.budget) parts.push('budget');
  if (criteria.context) parts.push('context');

  return parts.length > 0 ? parts.join('-') : 'filtered';
}
