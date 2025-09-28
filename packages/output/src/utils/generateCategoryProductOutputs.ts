import type { Product, CategoryOutputConfig, CategoryDirectoryGroup } from '@picklist/types';
import * as fs from 'node:fs';
import * as path from 'path';
import { generateCategoryMetadataIndex } from './generateCategoryMetadataIndex.ts';
import { generateDirectoryIndexes } from './generateDirectoryIndexes.ts';
import { generateCategoryIndex } from './generateCategoryIndex.ts';
import { generateCategoryStats } from './generateCategoryStats.ts';
import { groupProductsByCategoryWithPaths } from './groupProductsByCategoryWithPaths.ts';
import { generateAggregatedFiles } from './generateAggregatedFiles.ts';
import { writeProductsJsonlAtomic, buildIndex } from './writer.ts';

/**
 * Generates category-based product list files with nested directory structure.
 * Creates organized directory hierarchy that mirrors category breadcrumbs.
 *
 * @param products - Source products with category data
 * @param config - Category output configuration
 * @returns Array of generated category groups
 *
 * @example
 * ```typescript
 * const categoryOutputs = await generateCategoryProductOutputs(products, {
 *   outputDir: './out',
 *   subDirectory: 'products-by-category',
 *   generateIndex: true,
 *   generateStats: true,
 *   minProductsPerCategory: 5
 * });
 * // Creates: out/products-by-category/aardappel-groente-fruit/aardappelen/geschild.jsonl
 * ```
 */


export async function generateCategoryProductOutputs(
  products: Product[],
  config: CategoryOutputConfig
): Promise<CategoryDirectoryGroup[]> {
  // Input validation
  if (!products) {
    throw new Error('Products array is required');
  }
  if (!config?.outputDir) {
    throw new Error('Output directory is required');
  }

  // Create category subdirectory
  const categoryDir = path.join(config.outputDir, config.subDirectory);
  try {
    fs.mkdirSync(categoryDir, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create category directory: ${categoryDir}. ${error}`);
  }

  // Group products by category with nested path information
  const categoryGroups = groupProductsByCategoryWithPaths(products, config.minProductsPerCategory);

  // Generate files for each category using nested directory structure
  const generatedGroups: CategoryDirectoryGroup[] = [];
  for (const group of categoryGroups) {
    try {
      // Create nested directory structure
      const fullDirPath = path.join(categoryDir, group.directoryPath);
      fs.mkdirSync(fullDirPath, { recursive: true });

      // Generate JSONL file in nested location
      const fileName = `${group.fileName}.jsonl`;
      const filePath = path.join(fullDirPath, fileName);

      writeProductsJsonlAtomic(filePath, group.products);

      // Generate lightweight index if requested
      if (config.generateIndex) {
        const indexFileName = `${group.fileName}-index.json`;
        const indexPath = path.join(fullDirPath, indexFileName);
        const indexData = buildIndex(group.products);

        fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
      }

      // Generate stats if requested
      if (config.generateStats) {
        const statsFileName = `${group.fileName}-stats.json`;
        const statsPath = path.join(fullDirPath, statsFileName);
        const stats = generateCategoryStats(group);

        fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
      }

      generatedGroups.push(group);
    } catch (error) {
      console.error(`Failed to generate output for category ${group.categoryPath}:`, error);
      // Continue with other categories
    }
  }

  // Generate aggregated files for directories with multiple subcategories/files
  await generateAggregatedFiles(generatedGroups, categoryDir);

  // Generate directory-level indexes for navigation
  if (config.generateIndex) {
    await generateDirectoryIndexes(generatedGroups, categoryDir);

    // Generate master category index for backward compatibility
    const masterIndex = generateCategoryIndex(generatedGroups);
    const indexPath = path.join(categoryDir, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(masterIndex, null, 2));

    // Generate comprehensive category metadata index with hierarchical linking
    generateCategoryMetadataIndex(generatedGroups, categoryDir);
  }

  return generatedGroups;
}
