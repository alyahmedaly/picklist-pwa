/**
 * @picklist/output - Output generation utilities for Picklist data pipeline
 *
 * Provides utilities for generating organized JSONL files, indexes, and category structures.
 */

// Core writer utilities and types
export {
  writeJsonl,
  writeIndexFile,
  writeSchemaDoc,
  writeProductsJsonlAtomic,
  buildIndex,
  getRuntimeStats,
  type IndexEntry
} from './utils/writer.ts';

// Output generators
export { createFilterStatistics } from './utils/createFilterStatistics.ts';
export { generateCategoryMetadataIndex } from './utils/generateCategoryMetadataIndex.ts';
export { generateCategoryProductOutputs } from './utils/generateCategoryProductOutputs.ts';
export { generateFilteredOutput } from './utils/generateFilteredOutput.ts';
export { generateFilterIndex } from './utils/generateFilterIndex.ts';
export { generateFilterMasterIndex } from './utils/generateFilterMasterIndex.ts';
export { generateFilterName } from './utils/generateFilterName.ts';
export { generateMultipleOutputs } from './utils/generateMultipleOutputs.ts';
// Cleanup utilities
export {
  cleanupOutputDirectory
} from './utils/cleanupOutputDirectory.ts';