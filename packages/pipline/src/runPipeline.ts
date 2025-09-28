import { mkdirSync } from 'node:fs';
import { cleanupOutputDirectory } from '@picklist/output';
import { logger } from './utils/logger.ts';
import { emit } from './utils/emit.ts';
import { loadCsv } from './phases/01_loadCsv.ts';
import { buildProductsPipeline } from './phases/02_buildProducts.ts';
import { postProcessProducts } from './phases/03_postProcess.ts';
import { scoreProducts } from './phases/04_scoring.ts';
import { generateNormalizationReport, normalizeProductData } from './utils/normalizeProductData.ts';
import { filterOutputs } from './phases/05_filters.ts';
import { writeProductsJsonlAtomic } from '@picklist/output';
import { join } from 'node:path';
import { finalizeStats } from './phases/05_finalizeStats.ts';
import { writeCategoryTree } from '../../../src/data/transform/writer.ts';
import { generateCategoryProductOutputs } from '@picklist/output';

export async function runPipeline(inputPath: string, outputDir: string) {
    const startTime = Date.now()
    mkdirSync(outputDir, { recursive: true });

    // Clean output directory if requested (default: true)
    await cleanupOutputDirectory(true, outputDir, 'human', logger);

    emit('start', {
        input: inputPath,
        outDir: outputDir,
        message: `Processing ${inputPath} → ${outputDir} with grouped output structure`,
    });

    const { headers, matrix } = loadCsv(inputPath, outputDir);
    const { productsMap } = buildProductsPipeline(matrix, headers);
    let products = Array.from(productsMap.values());

    // Post-process products (e.g., deduplication, sorting)
    products = postProcessProducts(products);
    products = scoreProducts(products);
    const normalizedData = normalizeProductData(products);
    const report = generateNormalizationReport(normalizedData);
    logger.log(report)

    await filterOutputs(products, outputDir);

    emit('writing-products', {
        message: `Writing ${products.length} products to products.jsonl`,
    });

    const productsPath = join(outputDir, 'products.jsonl');
    writeProductsJsonlAtomic(productsPath, products);

    emit('writing-category-tree', {
        message: 'Writing category-tree.json with hierarchical navigation',
    });
    const categoryTreePath = join(outputDir, 'category-tree.json');
    writeCategoryTree(categoryTreePath, products);

    emit('writing-category-outputs', {
        message: 'Generating nested category directory structure with hierarchical JSONL files',
    });

    const categoryGroups = await generateCategoryProductOutputs(products, {
        outputDir: outputDir,
        subDirectory: 'products-by-category',
        generateIndex: true,
        generateStats: true,
        format: 'standard' as const,
        minProductsPerCategory: 5, // Skip categories with fewer than 5 products
    });
    emit('category-outputs-complete', {
        message: `Generated ${categoryGroups.length} nested category directories with navigation indexes`,
        categories: categoryGroups.length,
        totalProducts: categoryGroups.reduce((sum, group) => sum + group.productCount, 0),
        structure: 'nested-hierarchy',
    });

    finalizeStats(products, outputDir, startTime);
}