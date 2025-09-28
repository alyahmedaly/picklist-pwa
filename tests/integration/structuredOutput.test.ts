import { describe, test, expect } from 'vitest';
import { readIntegrationProducts } from '../test-utils';
import type {
  Product,
  CategoryTree,
  IngredientInfo,
  AdditivesSummary,
  Nutrition,
} from '../../src/data/transform/types.ts';

/** T009: Integration test structured JSON output - MUST FAIL before implementation */

describe('Structured JSON Output Integration (T009)', () => {
  test('should enable enhanced UI display with structured product data', () => {
    const products = readIntegrationProducts() as Product[];

    // Find a product with categories
    const productWithCategories = products.find((p) => p.categories && p.categories.length > 0);
    expect(productWithCategories).toBeDefined();

    // This MUST fail - products don't have enhanced structured fields yet
    // Business value: UI can display hierarchical categories, structured ingredients, etc.
    expect(productWithCategories).toHaveProperty('categoryTree');
    expect(productWithCategories).toHaveProperty('ingredientInfo');
    expect(productWithCategories).toHaveProperty('additivesSummary');
    expect(productWithCategories).toHaveProperty('nutrition');
    expect(productWithCategories).toHaveProperty('warnings');
  });

  test('should enable hierarchical category navigation for UI', () => {
    const products = readIntegrationProducts() as Product[];
    const productWithCategories = products.find((p) => p.categories && p.categories.length > 0);

    if (productWithCategories?.categoryTree) {
      const categoryTree = productWithCategories.categoryTree as CategoryTree;

      // Business value: UI can show breadcrumb navigation
      expect(categoryTree.tree).toEqual(productWithCategories.categories);
      expect(categoryTree.primary).toBe(productWithCategories.categories![0]);
      expect(categoryTree.breadcrumbs).toBe(productWithCategories.categories!.join(' > '));
      expect(categoryTree.depth).toBe(productWithCategories.categories!.length);
    }
  });

  test('should enable ingredient transparency for consumers', () => {
    const products = readIntegrationProducts() as Product[];
    const productWithIngredients = products.find((p) => p.ingredients && p.ingredients.length > 0);

    if (productWithIngredients?.ingredientInfo) {
      const ingredientInfo = productWithIngredients.ingredientInfo as IngredientInfo;

      // Business value: Users can distinguish between core ingredients and additives
      expect(ingredientInfo.core).toBeDefined();
      expect(ingredientInfo.additives).toBeDefined();
      expect(ingredientInfo.statements).toBeDefined();
      expect(ingredientInfo.total).toBe(
        ingredientInfo.core.length + ingredientInfo.additives.length,
      );
    }
  });

  test('should provide consumer-friendly additive summaries', () => {
    const products = readIntegrationProducts() as Product[];
    const productWithAdditives = products.find(
      (p) => p.additiveInfo && p.additiveInfo.eNumbers.length > 0,
    );

    if (productWithAdditives?.additivesSummary) {
      const summary = productWithAdditives.additivesSummary as AdditivesSummary;

      // Business value: Consumers get readable additive information
      expect(summary.eNumbers).toBeDefined();
      expect(summary.summary).toBeDefined();
      expect(summary.warnings).toBeDefined();
      expect(summary.dietary).toBeDefined();
      expect(summary.categories).toBeDefined();

      expect(typeof summary.summary).toBe('string');
      expect(Array.isArray(summary.eNumbers)).toBe(true);
      expect(Array.isArray(summary.warnings)).toBe(true);
    }
  });

  test('should provide nutrition data with clear unit context', () => {
    const products = readIntegrationProducts() as Product[];
    const productWithNutrition = products.find((p) => p.nutrition);

    if (productWithNutrition?.nutrition) {
      const nutrition = productWithNutrition.nutrition as Nutrition;

      // Business value: Users understand nutrition values are per 100g
      expect(nutrition.unit).toBe('per 100g');

      // Should have nutrition fields with unit context
      if (nutrition.kcal) {
        expect(typeof nutrition.kcal).toBe('number');
      }
      if (nutrition.protein) {
        expect(typeof nutrition.protein).toBe('number');
      }
    }
  });

  test('should consolidate safety warnings for user awareness', () => {
    const products = readIntegrationProducts() as Product[];
    const productWithFlags = products.find(
      (p) =>
        p.additiveFlags &&
        (p.additiveFlags.requiresChildWarning ||
          p.additiveFlags.containsAllergenicAdditives ||
          p.additiveFlags.requiresPKUWarning),
    );

    if (productWithFlags?.warnings) {
      // Business value: All safety warnings in one place for user safety
      expect(Array.isArray(productWithFlags.warnings)).toBe(true);
      expect(productWithFlags.warnings.length).toBeGreaterThan(0);

      productWithFlags.warnings.forEach((warning) => {
        expect(typeof warning).toBe('string');
        expect(warning.length).toBeGreaterThan(0);
      });
    }
  });
});
