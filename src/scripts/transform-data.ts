#!/usr/bin/env node
import { createLogger } from '@picklist/core';
import { convertCSVToProduct, createCSVRow, type CSVRow } from '@picklist/parser';
import { runPipeline } from "@picklist/pipline";
import { cac } from 'cac';
import { resolve } from 'node:path';
import { type StatsAccumulator } from '../../packages/parser/src/stats.ts';
import { type ExtendedCliOptions, type FilterCliOptions } from '../data/transform/cliFilterParser.ts';

export interface RunTransformOptions extends FilterCliOptions {
  input: string;
  outDir: string;
  log?: 'json' | 'human';
  format?: 'standard' | 'ui';
  generateCategoryTree?: boolean;
  cleanOutput?: boolean;
}

export async function runTransform(opts: RunTransformOptions) {
  const inputPath = resolve(opts.input);
  const outDir = resolve(opts.outDir);
  await runPipeline(inputPath, outDir);

}



function processProductMatrix(matrix: string[][], headers: (keyof CSVRow)[], stats: StatsAccumulator) {
  const productsMap = new Map<string, Product>();
  let foodProducts = 0;
  let nonFoodProducts = 0;
  for (const row of matrix) {
    const csvRow = createCSVRow(headers, row);
    const product = convertCSVToProduct(csvRow, stats);
    // Build partial product from CSV row (simplified: id, name, price fields, ingredients, allergens, categories, unit)
    if (!product.id) {
      stats.recordSkippedRow('missing_id', csvRow as Record<string, unknown>);
      continue;
    }

    // Track food vs non-food classification
    if (product.flags?.isFood) {
      foodProducts++;
    } else {
      nonFoodProducts++;
    }

    productsMap.set( product.id, product);
    stats.ingestRow(product as unknown as Record<string, unknown>);
  }

  return { foodProducts, nonFoodProducts, productsMap };
}


export async function main(argv = process.argv) {
  const cli = cac('transform-data');
  cli
    .command('', 'Transform CSV to JSONL with optional filtering and flexible schema generation')
    .option('--input <path>', 'Input CSV file path (required)')
    .option('--outDir <dir>', 'Output directory (required)')
    .option('--log <mode>', 'Log mode: json|human (default: human)')
    .option('--format <mode>', 'Output format: standard|ui (default: standard)')
    .option('--clean-output', 'Clean output directory before generating files (default: true)', { default: true })
    .option('--no-clean-output', 'Skip cleaning output directory')

    // Filter selection
    .option('--filters <list>', 'Comma-separated filters: halal,protein,postworkout,fatloss,budget,context')

    // Halal options
    .option('--halal-strict', 'Enable strict halal requirements', { default: true })
    .option('--halal-exclude-alcohol', 'Exclude products with alcohol')
    .option('--halal-exclude-gelatine', 'Exclude products with gelatine')

    // Protein options
    .option('--protein-min <number>', 'Minimum protein per 100g', { type: [Number] })
    .option('--protein-target <number>', 'Daily protein target in grams', { type: [Number] })
    .option('--protein-efficiency-min <number>', 'Minimum efficiency score 0-100', { type: [Number] })

    // Post-workout options
    .option('--post-workout-min-ratio <number>', 'Min carb:protein ratio', { type: [Number] })
    .option('--post-workout-max-ratio <number>', 'Max carb:protein ratio', { type: [Number] })
    .option('--post-workout-high-gi', 'Prefer high glycemic index foods')

    // Fat loss options
    .option('--fat-loss-max-calories <number>', 'Max calories per 100g', { type: [Number] })
    .option('--fat-loss-min-satiety <number>', 'Min satiety score 0-100', { type: [Number] })
    .option('--fat-loss-high-volume', 'Prefer high volume foods')

    // Budget options
    .option('--budget-max-price <number>', 'Max price per 100g/ml in euros', { type: [Number] })
    .option('--budget-optimize-protein', 'Optimize protein per euro')
    .option('--budget-max-total <number>', 'Max total daily budget in euros', { type: [Number] })

    // Context options
    .option('--training-day', 'Training day context (vs rest day)')
    .option('--meal-timing <timing>', 'Meal timing: pre_workout, post_workout, general')
    .option('--avoid-combinations <list>', 'Comma-separated combinations to avoid')

    // Output options
    .option('--filter-stats', 'Generate detailed filter statistics')
    .option('--generate-filtered-outputs', 'Generate separate filtered JSONL files')
    .option('--generate-category-tree', 'Generate category tree JSON with hierarchical navigation')
    .option('--generate-category-outputs', 'Generate category-specific product JSONL files for efficient UI loading')
    .option('--generate-sqlite', 'Generate SQLite database for wa-sqlite + OPFS browser usage')

    // Flexible schema options (Feature 019)
    .option('--generate-flexible-schema', 'Generate normalized SQLite database with flexible schema for multi-dimensional filtering')
    .option('--flexible-schema-file <name>', 'Custom filename for flexible schema database (default: products-flexible.db)')
    .option('--flexible-schema-validate', 'Run comprehensive validation checks on generated flexible schema')
    .option('--flexible-schema-report', 'Generate detailed normalization report during flexible schema creation')
    .option('--flexible-schema-optimize', 'Optimize flexible schema for query performance (runs ANALYZE and PRAGMA optimize)')
    .option('--flexible-schema-only', 'Generate only flexible schema database, skip standard outputs')

    .action(async (options: ExtendedCliOptions) => {
      const logger = createLogger(options.log || 'human');
      try {
        await runTransform(options);
        if (options.log === 'human') logger.success('Done.');
        process.exit(0);
      } catch (e) {
        const anyErr = e as Error & { exitCode?: number };
        const code = 1;
        if (options.log === 'json') {
          console.log(JSON.stringify({ kind: 'error', message: anyErr.message || 'failed', code }));
        } else {
          logger.error(`Error: ${anyErr.message || 'failed'}`);
        }
        process.exit(code);
      }
    });

  cli.help();
  cli.parse(argv, { run: false });
  await cli.runMatchedCommand();
}

// Only run CLI if executed directly (node path comparison) not when imported for tests.
if (process.argv[1] && import.meta.url === `file://${resolve(process.argv[1])}`) {
  main();
}
