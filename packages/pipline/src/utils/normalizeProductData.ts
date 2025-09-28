/**
 * Product Data Normalization Pipeline
 * Feature: 019-flexible-database-schema
 *
 * Orchestrates the normalization of rich Product objects from the existing transform
 * pipeline into the flexible database schema entities with validation and error handling.
 */

import type {
  FlexibleProduct,
  FlexibleCategory,
  FlexibleProductCategory,
  FlexibleProductNutrition,
  FlexibleProductFlag,
  FlexibleProductScore,
  FlexibleProductAdditive,
  FlexibleProductSearchTerm
} from '../../../../src/data/transform/types.ts';
import type { Price, Product } from "@picklist/types";
// Import entity normalizers
import { normalizeProductEntity, validateProductEntity } from '../../../../src/data/transform/entities/productEntity.ts';
import { normalizeCategoryEntities, generateProductCategoryRelations, validateCategoryEntity, validateProductCategoryRelation } from '../../../../src/data/transform/entities/categoryEntity.ts';
import { normalizeNutritionEntity, validateNutritionEntity } from '../../../../src/data/transform/entities/nutritionEntity.ts';
import { normalizeFlagsEntities, validateFlagEntity } from '../../../../src/data/transform/entities/flagsEntity.ts';
import { normalizeScoresEntities, validateScoreEntity } from '../../../../src/data/transform/entities/scoresEntity.ts';
import { normalizeAdditivesEntities, validateAdditiveEntity } from '../../../../src/data/transform/entities/additivesEntity.ts';
import { normalizeSearchTermsEntities, validateSearchTermEntity } from '../../../../src/data/transform/entities/searchTermsEntity.ts';

/**
 * Comprehensive normalized dataset from rich Product objects
 */
export interface NormalizedProductData {
  // Core entities
  products: FlexibleProduct[];
  categories: FlexibleCategory[];
  productCategories: FlexibleProductCategory[];
  productNutrition: FlexibleProductNutrition[];
  productFlags: FlexibleProductFlag[];
  productScores: FlexibleProductScore[];
  productAdditives: FlexibleProductAdditive[];
  productSearchTerms: FlexibleProductSearchTerm[];

  // Processing statistics
  stats: {
    inputProducts: number;
    validProducts: number;
    totalCategories: number;
    totalRelations: number;
    validationErrors: number;
    processingTimeMs: number;
  };

  // Validation results
  errors: NormalizationError[];
  warnings: string[];
}

/**
 * Detailed error information for debugging
 */
export interface NormalizationError {
  productId: string;
  entity: string;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Normalizes an array of rich Product objects into the flexible schema
 */
export function normalizeProductData(products: Product[]): NormalizedProductData {
  const startTime = Date.now();
  const errors: NormalizationError[] = [];
  const warnings: string[] = [];

  // Initialize result collections
  const normalizedProducts: FlexibleProduct[] = [];
  const allCategories: FlexibleCategory[] = [];
  const allProductCategories: FlexibleProductCategory[] = [];
  const allProductNutrition: FlexibleProductNutrition[] = [];
  const allProductFlags: FlexibleProductFlag[] = [];
  const allProductScores: FlexibleProductScore[] = [];
  const allProductAdditives: FlexibleProductAdditive[] = [];
  const allProductSearchTerms: FlexibleProductSearchTerm[] = [];

  // Step 1: Extract all unique categories first for hierarchy building
  const categoryPathsSet = new Set<string>();
  for (const product of products) {
    if (product.categories) {
      for (const category of product.categories) {
        if (category && category.trim()) {
          categoryPathsSet.add(category.trim());
        }
      }
    }
  }

  // Step 2: Build category hierarchy from all collected paths
  if (categoryPathsSet.size > 0) {
    try {
      const categoryResult = normalizeCategoryEntities([...categoryPathsSet]);

      // Validate categories
      for (const category of categoryResult.categories) {
        const validationErrors = validateCategoryEntity(category);
        if (validationErrors.length > 0) {
          for (const error of validationErrors) {
            errors.push({
              productId: 'category_system',
              entity: 'category',
              field: category.id,
              message: error,
              severity: 'error'
            });
          }
        } else {
          allCategories.push(category);
        }
      }

      if (categoryResult.categories.length !== allCategories.length) {
        warnings.push(`${categoryResult.categories.length - allCategories.length} categories failed validation`);
      }
    } catch (error) {
      errors.push({
        productId: 'category_system',
        entity: 'category',
        message: `Failed to build category hierarchy: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    }
    console.log(errors)
  }

  // Step 3: Process each product through all entity normalizers
  let validProductCount = 0;

  for (const product of products) {
    try {
      // Salvage products with missing core data instead of skipping
      const synthesized: string[] = [];
      // Create a mutable clone to adjust missing fields without casting to any
      const mutableProduct: Product = { ...product };
      if (!mutableProduct.id || mutableProduct.id.trim() === '') {
        mutableProduct.id = `synthetic_${validProductCount + normalizedProducts.length + 1}`;
        synthesized.push('id');
      }
      if (!mutableProduct.name || mutableProduct.name.trim() === '') {
        mutableProduct.name = 'Unknown Product';
        synthesized.push('name');
      }
      if (!mutableProduct.price || typeof mutableProduct.price.regular !== 'number' || mutableProduct.price.regular <= 0) {
        const fallbackPrice = mutableProduct.price?.sale && mutableProduct.price.sale > 0 ? mutableProduct.price.sale : 0.01;
        const existing = mutableProduct.price || { currency: 'EUR', regular: fallbackPrice } as Price;
        mutableProduct.price = { ...existing, regular: fallbackPrice };
        synthesized.push('price_regular');
      }
  // Use finalized mutableProduct for all subsequent normalization steps
      if (synthesized.length > 0) {
        errors.push({
          productId: product.id,
          entity: 'product',
          message: `synthesized_fields:${synthesized.join(',')}`,
          severity: 'warning'
        });
      }

      // Normalize core product entity (use possibly synthesized mutableProduct)
      try {
        let normalizedProduct = normalizeProductEntity(mutableProduct);
        // Enforce DB CHECK constraints proactively
        if (normalizedProduct.price_regular <= 0) {
          normalizedProduct = { ...normalizedProduct, price_regular: 0.01 };
        } else if (normalizedProduct.price_regular > 999.99) {
          normalizedProduct = { ...normalizedProduct, price_regular: 999.99 };
        }
        if (normalizedProduct.price_sale !== undefined && normalizedProduct.price_sale !== null) {
          if (normalizedProduct.price_sale <= 0 || normalizedProduct.price_sale >= normalizedProduct.price_regular || normalizedProduct.price_sale > 999.99) {
            // Drop invalid sale price to satisfy implicit business rules
            normalizedProduct = { ...normalizedProduct, price_sale: undefined } as typeof normalizedProduct;
          }
        }
        const productValidationErrors = validateProductEntity(normalizedProduct);

        // Convert core validation errors to warnings to keep product
        if (productValidationErrors.length > 0) {
          for (const error of productValidationErrors) {
            errors.push({
              productId: product.id,
              entity: 'product',
              message: `soft_validation:${error}`,
              severity: 'warning'
            });
          }
        }

        normalizedProducts.push(normalizedProduct);
        validProductCount++;
      } catch (error) {
        errors.push({
          productId: product.id,
          entity: 'product',
          message: `Product normalization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'error'
        });
        continue;
      }

      // Generate product-category relationships
      if (product.categories && product.categories.length > 0) {
        try {
          const categoryRelations = generateProductCategoryRelations(product.id, product.categories);

          for (const relation of categoryRelations) {
            const relationValidationErrors = validateProductCategoryRelation(relation);
            if (relationValidationErrors.length > 0) {
              for (const error of relationValidationErrors) {
                errors.push({
                  productId: product.id,
                  entity: 'product_category',
                  message: error,
                  severity: 'warning'
                });
              }
            } else {
              allProductCategories.push(relation);
            }
          }
        } catch (error) {
          errors.push({
            productId: product.id,
            entity: 'product_category',
            message: `Category relation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'warning'
          });
        }
      }

      // Normalize nutrition data
      if (product.nutrition) {
        try {
          const nutrition = normalizeNutritionEntity(product);
          if (nutrition) {
            const nutritionValidationErrors = validateNutritionEntity(nutrition);
            if (nutritionValidationErrors.length > 0) {
              for (const error of nutritionValidationErrors) {
                errors.push({
                  productId: product.id,
                  entity: 'nutrition',
                  message: error,
                  severity: 'warning'
                });
              }
            } else {
              allProductNutrition.push(nutrition);
            }
          }
        } catch (error) {
          errors.push({
            productId: product.id,
            entity: 'nutrition',
            message: `Nutrition normalization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'warning'
          });
        }
      }

      // Normalize flags
      try {
        const flags = normalizeFlagsEntities(product);
        for (const flag of flags) {
          const flagValidationErrors = validateFlagEntity(flag);
          if (flagValidationErrors.length > 0) {
            for (const error of flagValidationErrors) {
              errors.push({
                productId: product.id,
                entity: 'flag',
                field: flag.flag_type,
                message: error,
                severity: 'warning'
              });
            }
          } else {
            allProductFlags.push(flag);
          }
        }
      } catch (error) {
        errors.push({
          productId: product.id,
          entity: 'flag',
          message: `Flag normalization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'warning'
        });
      }

      // Normalize scores
      try {
        const scores = normalizeScoresEntities(product);
        for (const score of scores) {
          const scoreValidationErrors = validateScoreEntity(score);
          if (scoreValidationErrors.length > 0) {
            for (const error of scoreValidationErrors) {
              errors.push({
                productId: product.id,
                entity: 'score',
                field: score.score_type,
                message: error,
                severity: 'warning'
              });
            }
          } else {
            allProductScores.push(score);
          }
        }
      } catch (error) {
        errors.push({
          productId: product.id,
          entity: 'score',
          message: `Score normalization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'warning'
        });
      }

      // Normalize additives
      try {
        const additives = normalizeAdditivesEntities(product);
        for (const additive of additives) {
          const additiveValidationErrors = validateAdditiveEntity(additive);
          if (additiveValidationErrors.length > 0) {
            for (const error of additiveValidationErrors) {
              errors.push({
                productId: product.id,
                entity: 'additive',
                field: additive.e_number || additive.additive_name,
                message: error,
                severity: 'warning'
              });
            }
          } else {
            allProductAdditives.push(additive);
          }
        }
      } catch (error) {
        errors.push({
          productId: product.id,
          entity: 'additive',
          message: `Additive normalization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'warning'
        });
      }

      // Normalize search terms
      try {
        const searchTerms = normalizeSearchTermsEntities(product);
        for (const searchTerm of searchTerms) {
          const searchTermValidationErrors = validateSearchTermEntity(searchTerm);
          if (searchTermValidationErrors.length > 0) {
            for (const error of searchTermValidationErrors) {
              errors.push({
                productId: product.id,
                entity: 'search_term',
                field: searchTerm.term,
                message: error,
                severity: 'warning'
              });
            }
          } else {
            allProductSearchTerms.push(searchTerm);
          }
        }
      } catch (error) {
        errors.push({
          productId: product.id,
          entity: 'search_term',
          message: `Search term normalization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'warning'
        });
      }

    } catch (error) {
      errors.push({
        productId: product.id || 'unknown',
        entity: 'product',
        message: `Product processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    }
  }

  const processingTimeMs = Date.now() - startTime;

  // Generate warnings for significant data quality issues
  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;

  if (errorCount > 0) {
    warnings.push(`${errorCount} products failed normalization due to critical errors`);
  }

  if (warningCount > products.length * 0.1) {
    warnings.push(`High warning rate: ${warningCount} warnings for ${products.length} products (${Math.round(warningCount / products.length * 100)}%)`);
  }

  if (validProductCount < products.length * 0.9) {
    warnings.push(`Low success rate: Only ${validProductCount}/${products.length} products successfully normalized (${Math.round(validProductCount / products.length * 100)}%)`);
  }

  return {
    products: normalizedProducts,
    categories: allCategories,
    productCategories: allProductCategories,
    productNutrition: allProductNutrition,
    productFlags: allProductFlags,
    productScores: allProductScores,
    productAdditives: allProductAdditives,
    productSearchTerms: allProductSearchTerms,
    stats: {
      inputProducts: products.length,
      validProducts: validProductCount,
      totalCategories: allCategories.length,
      totalRelations: allProductCategories.length,
      validationErrors: errorCount,
      processingTimeMs
    },
    errors: errors.map(e => ({ ...e })),
    warnings
  };
}

/**
 * Filters normalized data by validation criteria
 */
export function filterValidatedData(data: NormalizedProductData, options: {
  excludeErrorProducts?: boolean;
  minConfidenceFlags?: number;
  minConfidenceScores?: number;
}): NormalizedProductData {
  if (!options.excludeErrorProducts && !options.minConfidenceFlags && !options.minConfidenceScores) {
    return data; // No filtering needed
  }

  // Get product IDs to exclude due to errors
  const errorProductIds = new Set<string>();
  if (options.excludeErrorProducts) {
    for (const error of data.errors) {
      if (error.severity === 'error' && error.entity === 'product') {
        errorProductIds.add(error.productId);
      }
    }
  }

  // Filter all entities by valid product IDs
  const validProductIds = new Set(
    data.products
      .filter(p => !errorProductIds.has(p.id))
      .map(p => p.id)
  );

  return {
    ...data,
    products: data.products.filter(p => validProductIds.has(p.id)),
    productCategories: data.productCategories.filter(pc => validProductIds.has(pc.product_id)),
    productNutrition: data.productNutrition.filter(pn => validProductIds.has(pn.product_id)),
    productFlags: data.productFlags.filter(pf =>
      validProductIds.has(pf.product_id) &&
      (!options.minConfidenceFlags || pf.confidence >= options.minConfidenceFlags)
    ),
    productScores: data.productScores.filter(ps =>
      validProductIds.has(ps.product_id)
      // Note: scores don't have confidence, but could filter by score_value ranges
    ),
    productAdditives: data.productAdditives.filter(pa => validProductIds.has(pa.product_id)),
    productSearchTerms: data.productSearchTerms.filter(pst => validProductIds.has(pst.product_id)),
    stats: {
      ...data.stats,
      validProducts: validProductIds.size
    }
  };
}

/**
 * Generates normalization summary report
 */
export function generateNormalizationReport(data: NormalizedProductData): string {
  const { stats, errors, warnings } = data;
  const successRate = Math.round((stats.validProducts / stats.inputProducts) * 100);
  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;

  const lines = [
    '=== Product Data Normalization Report ===',
    '',
    `Input: ${stats.inputProducts} products`,
    `Output: ${stats.validProducts} products (${successRate}% success rate)`,
    `Processing time: ${stats.processingTimeMs}ms`,
    '',
    '--- Entity Counts ---',
    `Products: ${data.products.length}`,
    `Categories: ${data.categories.length}`,
    `Product-Category Relations: ${data.productCategories.length}`,
    `Nutrition Records: ${data.productNutrition.length}`,
    `Flags: ${data.productFlags.length}`,
    `Scores: ${data.productScores.length}`,
    `Additives: ${data.productAdditives.length}`,
    `Search Terms: ${data.productSearchTerms.length}`,
    '',
    `--- Validation Results ---`,
    `Errors: ${errorCount}`,
    `Warnings: ${warningCount}`,
  ];

  if (warnings.length > 0) {
    lines.push('', '--- Warnings ---');
    warnings.forEach(warning => lines.push(`• ${warning}`));
  }

  if (errorCount > 0) {
    lines.push('', '--- Error Summary ---');
    const entityErrorCounts: Record<string, number> = {};
    errors.filter(e => e.severity === 'error').forEach(error => {
      entityErrorCounts[error.entity] = (entityErrorCounts[error.entity] || 0) + 1;
    });

    Object.entries(entityErrorCounts).forEach(([entity, count]) => {
      lines.push(`• ${entity}: ${count} errors`);
    });
  }

  return lines.join('\n');
}