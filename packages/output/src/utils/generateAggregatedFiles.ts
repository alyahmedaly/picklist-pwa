import type { Product, CategoryDirectoryGroup } from '@picklist/types';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { writeProductsJsonlAtomic } from './writer.ts';

/**
 * Generates aggregated product files for directories with multiple subcategories or files.
 * Creates _all.jsonl files containing all products from the current directory and its subdirectories.
 *
 * @param groups - Category directory groups
 * @param baseCategoryDir - Base category directory path
 */
export async function generateAggregatedFiles(
  groups: CategoryDirectoryGroup[],
  baseCategoryDir: string
): Promise<void> {
  // Build directory hierarchy map
  const directoryMap = new Map<string, {
    files: CategoryDirectoryGroup[];
    subdirectories: Set<string>;
  }>();

  // Build directory structure
  for (const group of groups) {
    const dirPath = group.directoryPath;

    if (!directoryMap.has(dirPath)) {
      directoryMap.set(dirPath, {
        files: [],
        subdirectories: new Set(),
      });
    }

    directoryMap.get(dirPath)!.files.push(group);

    // Track parent directories and their subdirectories
    const pathParts = dirPath.split('/').filter(part => part.length > 0);
    for (let i = 0; i < pathParts.length; i++) {
      const parentPath = pathParts.slice(0, i).join('/');
      const childDir = pathParts[i];

      if (!directoryMap.has(parentPath)) {
        directoryMap.set(parentPath, {
          files: [],
          subdirectories: new Set(),
        });
      }

      if (i > 0) {
        directoryMap.get(parentPath)!.subdirectories.add(childDir);
      }
    }
  }

  // Generate aggregated files for directories with multiple subcategories/files
  for (const [dirPath, dirInfo] of Array.from(directoryMap.entries())) {
    const hasMultipleItems = dirInfo.files.length > 1 || dirInfo.subdirectories.size > 0;

    if (!hasMultipleItems) {
      continue; // Skip directories with only one item
    }

    // Collect all products from this directory and its subdirectories
    const allProducts = collectProductsRecursively(dirPath, directoryMap, groups);

    if (allProducts.length === 0) {
      continue;
    }

    // Apply average sorting (same as CategoryProductsPage default)
    const sortedProducts = sortProductsByAverageScore(allProducts);

    // Generate complete-collection.jsonl file
    const aggregatedFilePath = path.join(baseCategoryDir, dirPath, 'complete-collection.jsonl');
    const aggregatedDir = path.dirname(aggregatedFilePath);

    fs.mkdirSync(aggregatedDir, { recursive: true });
    writeProductsJsonlAtomic(aggregatedFilePath, sortedProducts);

    console.log(`Generated aggregated file: ${dirPath}/complete-collection.jsonl (${sortedProducts.length} products)`);
  }
}

/**
 * Recursively collects all products from a directory and its subdirectories.
 */
function collectProductsRecursively(
  dirPath: string,
  directoryMap: Map<string, { files: CategoryDirectoryGroup[]; subdirectories: Set<string> }>,
  allGroups: CategoryDirectoryGroup[]
): Product[] {
  const products: Product[] = [];
  const dirInfo = directoryMap.get(dirPath);

  if (!dirInfo) {
    return products;
  }

  // Add products from files in this directory
  for (const group of dirInfo.files) {
    products.push(...group.products);
  }

  // Recursively add products from subdirectories
  for (const subdirectory of Array.from(dirInfo.subdirectories)) {
    const subdirPath = dirPath ? `${dirPath}/${subdirectory}` : subdirectory;
    const subdirProducts = collectProductsRecursively(subdirPath, directoryMap, allGroups);
    products.push(...subdirProducts);
  }

  return products;
}

/**
 * Sorts products using the average score algorithm (same as CategoryProductsPage default).
 * Averages all available scores: optimal nutrition, global health, category health, nutri-score,
 * protein density, satiety, fat loss, and post-workout scores.
 */
function sortProductsByAverageScore(products: Product[]): Product[] {
  const calculateAverageScore = (product: Product) => {
    const scores: number[] = [];

    // 1. Optimal nutrition score (normalized to 0-100)
    const nutrition = product.nutrition;
    if (nutrition) {
      const calories = nutrition.kcal || 0;
      const protein = nutrition.protein || 0;
      const fiber = nutrition.fiber || 0;
      const fat = nutrition.fat || 0;

      // Recalibrated scoring to better align with 0-100 scale
      // Calorie score: 0-300 kcal = 100-70, 300-600 = 70-30, 600+ = 30-0
      const calorieScore = calories <= 300 ?
        100 - (calories * 30 / 300) :
        Math.max(0, 70 - ((calories - 300) * 40 / 300));

      // Protein score: 0-15g = 0-60, 15-30g = 60-100, 30+ = 100
      const proteinScore = protein <= 15 ?
        protein * 4 :
        Math.min(100, 60 + ((protein - 15) * 40 / 15));

      // Fiber score: 0-3g = 0-30, 3-8g = 30-80, 8+ = 80-100
      const fiberScore = fiber <= 3 ?
        fiber * 10 :
        Math.min(100, 30 + ((fiber - 3) * 50 / 5));

      // Fat score: 0-10g = 100-80, 10-25g = 80-40, 25+ = 40-0
      const fatScore = fat <= 10 ?
        100 - (fat * 20 / 10) :
        Math.max(0, 80 - ((fat - 10) * 40 / 15));

      const optimalScore = (calorieScore * 0.3) + (proteinScore * 0.4) + (fiberScore * 0.2) + (fatScore * 0.1);
      scores.push(optimalScore);
    }

    // 2. Global health score (already 0-100)
    const globalScore = typeof product.globalHealthScore === 'number' ? product.globalHealthScore :
                       product.globalHealthScore ? parseFloat(String(product.globalHealthScore)) : 0;
    if (globalScore > 0) scores.push(globalScore);

    // 3. Category health score (already 0-100)
    const categoryScore = typeof product.categoryHealthScore === 'number' ? product.categoryHealthScore :
                         product.categoryHealthScore ? parseFloat(String(product.categoryHealthScore)) : 0;
    if (categoryScore > 0) scores.push(categoryScore);

    // 4. Nutri-Score (normalize raw score to 0-100, lower raw score is better)
    if (product.nutriScore) {
      const rawScore = typeof product.nutriScore === 'number' ? product.nutriScore :
          parseFloat(String(product.nutriScore));
      if (!isNaN(rawScore)) {
        // Nutri-Score typically ranges from -15 (best) to 40+ (worst)
        // Clamp to reasonable range and invert (lower raw score = higher normalized score)
        const clampedScore = Math.max(-15, Math.min(40, rawScore));
        const nutriScoreNormalized = 100 - ((clampedScore + 15) * 100 / 55); // Convert to 0-100 scale
        scores.push(nutriScoreNormalized);
      }
    }

    // 5. Protein density score (already 0-100)
    const proteinDensityScore = product.proteinOptimization?.proteinDensityScore;
    if (proteinDensityScore && proteinDensityScore > 0) {
      scores.push(proteinDensityScore);
    }

    // 6. Satiety score (already 0-100)
    const satietyScore = product.satietyAnalysis?.satietyScore;
    if (satietyScore && satietyScore > 0) {
      scores.push(satietyScore);
    }

    // 7. Fat loss score (already 0-100)
    const fatLossScore = product.fatLossCompatibility?.fatLossScore;
    if (fatLossScore && fatLossScore > 0) {
      scores.push(fatLossScore);
    }

    // 8. Post-workout score (already 0-100)
    const postWorkoutScore = product.postWorkoutOptimization?.postWorkoutScore;
    if (postWorkoutScore && postWorkoutScore > 0) {
      scores.push(postWorkoutScore);
    }

    // Return the average of all available scores, or 0 if no scores available
    return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  };

  return [...products].sort((a, b) => calculateAverageScore(b) - calculateAverageScore(a));
}