
/**
 * Individual filter combination for generating multiple outputs.
 */

import type { FilterCriteria } from "./FilterCriteria.ts";

export interface FilterCombination {
  name: string;
  criteria: FilterCriteria;
}
