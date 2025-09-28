import type { Product } from '@picklist/types';
import type { PortionInfo } from './PortionInfo.ts';
import type { FilterMatchIndicators } from './FilterMatchIndicators.ts';

/**
 * Extended product interface with filter match indicators and recommendations.
 */

export interface FilteredProduct extends Product {
  /** Indicates which filter criteria were matched */
  filterMatch: FilterMatchIndicators;
  /** Optional composite filter score (0-100) */
  filterScore?: number;
  /** Optional portion recommendations for the product */
  portionRecommendation?: PortionInfo;
}
