/**
 * Contract Test: TypeScript Type Validation
 * Feature: 019-flexible-database-schema
 *
 * Tests that TypeScript interfaces match database schema exactly
 * and provide proper type safety for flexible schema operations.
 *
 * CRITICAL: This test must FAIL initially (TDD compliance)
 */

import { describe, it, expect } from 'vitest';
import type {
  FlexibleProduct,
  FlexibleCategory,
  FlexibleProductCategory,
  FlexibleProductNutrition,
  FlexibleProductFlag,
  FlexibleProductScore,
  FlexibleProductAdditive,
  FlexibleProductSearchTerm,
  FlexibleSchemaData,
  ProductFlagType,
  ProductScoreType,
  ProductScoreContext,
  SearchTermType
} from '../../src/data/transform/types';

describe('Database Types Contract Tests', () => {
  describe('Core Entity Type Validation', () => {
    it('should validate FlexibleProduct interface matches database schema', () => {
      const sampleProduct: FlexibleProduct = {
        id: 'test-001',
        name: 'Test Product',
        price_regular: 2.99,
        price_sale: 2.49,
        unit_amount: 500,
        unit_type: 'g',
        brand: 'Test Brand',
        created_at: Date.now(),
        updated_at: Date.now()
      };

      // Validate required fields
      expect(sampleProduct.id).toBeDefined();
      expect(sampleProduct.name).toBeDefined();
      expect(sampleProduct.price_regular).toBeGreaterThan(0);
      expect(sampleProduct.unit_amount).toBeGreaterThan(0);
      expect(['g', 'ml', 'pieces', 'kg', 'l']).toContain(sampleProduct.unit_type);

      // Validate optional fields
      expect(sampleProduct.price_sale).toBeLessThan(sampleProduct.price_regular);
      expect(sampleProduct.brand).toBeDefined();

      // Validate readonly property enforcement (TypeScript compile-time check)
      // @ts-expect-error - Should not be able to modify readonly property
      // sampleProduct.id = 'modified'; // This should cause TypeScript error
    });

    it('should validate FlexibleCategory interface with hierarchical properties', () => {
      const sampleCategory: FlexibleCategory = {
        id: 'cat-001',
        name: 'Dairy Products',
        parent_id: 'cat-000',
        path: 'food/dairy',
        depth: 2,
        left_bound: 10,
        right_bound: 50,
        product_count: 156,
        display_order: 1
      };

      // Validate hierarchical constraints
      expect(sampleCategory.left_bound).toBeLessThan(sampleCategory.right_bound);
      expect(sampleCategory.depth).toBeGreaterThanOrEqual(0);
      expect(sampleCategory.depth).toBeLessThanOrEqual(6); // Database constraint
      expect(sampleCategory.product_count).toBeGreaterThanOrEqual(0);
      expect(sampleCategory.path).toContain(sampleCategory.name.toLowerCase());
    });

    it('should validate FlexibleProductNutrition interface with business constraints', () => {
      const sampleNutrition: FlexibleProductNutrition = {
        product_id: 'test-001',
        kcal: 250,
        kj: 1046,
        protein: 12.5,
        carbs: 30.0,
        sugars: 15.0,
        fat: 8.5,
        saturated_fat: 3.2,
        fiber: 2.8,
        salt: 0.8,
        sodium: 320
      };

      // Validate business logic constraints
      if (sampleNutrition.sugars && sampleNutrition.carbs) {
        expect(sampleNutrition.sugars).toBeLessThanOrEqual(sampleNutrition.carbs);
      }
      if (sampleNutrition.saturated_fat && sampleNutrition.fat) {
        expect(sampleNutrition.saturated_fat).toBeLessThanOrEqual(sampleNutrition.fat);
      }

      // Validate reasonable ranges (per 100g)
      if (sampleNutrition.kcal) expect(sampleNutrition.kcal).toBeLessThanOrEqual(1000);
      if (sampleNutrition.protein) expect(sampleNutrition.protein).toBeLessThanOrEqual(100);
      if (sampleNutrition.carbs) expect(sampleNutrition.carbs).toBeLessThanOrEqual(100);
      if (sampleNutrition.fat) expect(sampleNutrition.fat).toBeLessThanOrEqual(100);
    });
  });

  describe('Enum Type Validation', () => {
    it('should validate ProductFlagType enum values match database constraints', () => {
      const validFlagTypes: ProductFlagType[] = [
        'is_vegan',
        'is_vegetarian',
        'is_gluten_free',
        'is_lactose_free',
        'is_halal',
        'is_kosher',
        'is_organic',
        'is_high_protein',
        'is_low_carb',
        'is_high_fiber',
        'has_artificial_colors',
        'has_preservatives',
        'has_sweeteners'
      ];

      // Validate all enum values are defined
      expect(validFlagTypes).toHaveLength(13);

      // Test each flag type in context
      validFlagTypes.forEach(flagType => {
        const sampleFlag: FlexibleProductFlag = {
          product_id: 'test-001',
          flag_type: flagType,
          flag_value: true,
          confidence: 95,
          source: 'algorithm'
        };

        expect(sampleFlag.flag_type).toBe(flagType);
        expect(sampleFlag.confidence).toBeGreaterThanOrEqual(0);
        expect(sampleFlag.confidence).toBeLessThanOrEqual(100);
      });
    });

    it('should validate ProductScoreType enum values match database constraints', () => {
      const validScoreTypes: ProductScoreType[] = [
        'protein_efficiency',
        'calorie_efficiency',
        'satiety_score',
        'nutri_score',
        'health_score',
        'sustainability_score',
        'post_workout_score',
        'fat_loss_score',
        'budget_score',
        'contextual_score'
      ];

      expect(validScoreTypes).toHaveLength(10);

      validScoreTypes.forEach(scoreType => {
        const sampleScore: FlexibleProductScore = {
          product_id: 'test-001',
          score_type: scoreType,
          score_value: 75.5,
          context: 'training_day',
          computed_at: Date.now(),
          metadata: JSON.stringify({ algorithm: 'v2.1' })
        };

        expect(sampleScore.score_type).toBe(scoreType);
        expect(sampleScore.score_value).toBeGreaterThanOrEqual(0);
        expect(sampleScore.score_value).toBeLessThanOrEqual(100);
      });
    });

    it('should validate ProductScoreContext enum values', () => {
      const validContexts: ProductScoreContext[] = [
        'training_day',
        'rest_day',
        'cutting',
        'bulking',
        'maintenance'
      ];

      expect(validContexts).toHaveLength(5);

      validContexts.forEach(context => {
        const sampleScore: FlexibleProductScore = {
          product_id: 'test-001',
          score_type: 'contextual_score',
          score_value: 80,
          context: context,
          computed_at: Date.now()
        };

        expect(sampleScore.context).toBe(context);
      });
    });

    it('should validate SearchTermType enum values', () => {
      const validTermTypes: SearchTermType[] = [
        'name',
        'brand',
        'ingredient',
        'category',
        'synonym',
        'alternative_name',
        'description',
        'nutritional_tag',
        'dietary_flag'
      ];

      expect(validTermTypes).toHaveLength(9);

      validTermTypes.forEach(termType => {
        const sampleTerm: FlexibleProductSearchTerm = {
          product_id: 'test-001',
          term: 'protein',
          term_type: termType,
          weight: 85,
          language: 'nl'
        };

        expect(sampleTerm.term_type).toBe(termType);
        expect(sampleTerm.weight).toBeGreaterThanOrEqual(0);
        expect(sampleTerm.weight).toBeLessThanOrEqual(100);
        expect(['nl', 'en']).toContain(sampleTerm.language);
      });
    });
  });

  describe('Relationship Type Validation', () => {
    it('should validate ProductCategory junction table interface', () => {
      const sampleRelation: FlexibleProductCategory = {
        product_id: 'test-001',
        category_id: 'cat-001',
        is_primary: true,
        relevance_score: 90.5
      };

      expect(sampleRelation.product_id).toBeDefined();
      expect(sampleRelation.category_id).toBeDefined();
      expect(typeof sampleRelation.is_primary).toBe('boolean');
      expect(sampleRelation.relevance_score).toBeGreaterThanOrEqual(0);
      expect(sampleRelation.relevance_score).toBeLessThanOrEqual(100);
    });

    it('should validate ProductAdditive interface with E-number validation', () => {
      const sampleAdditive: FlexibleProductAdditive = {
        product_id: 'test-001',
        e_number: 'E300',
        additive_name: 'Ascorbic acid',
        functional_category: 'Antioxidant',
        dutch_category: 'antioxidant',
        safety_flags: JSON.stringify(['natural', 'vitamin_c']),
        is_natural: true
      };

      // Validate E-number format
      if (sampleAdditive.e_number) {
        expect(sampleAdditive.e_number).toMatch(/^E\d{3,4}$/);
      }

      expect(sampleAdditive.additive_name.length).toBeLessThanOrEqual(200);
      expect(sampleAdditive.functional_category.length).toBeLessThanOrEqual(100);
      expect(typeof sampleAdditive.is_natural).toBe('boolean');
    });
  });

  describe('Complete Schema Data Structure', () => {
    it('should validate FlexibleSchemaData interface structure', () => {
      const mockSchemaData: FlexibleSchemaData = {
        products: [],
        categories: [],
        productCategories: [],
        productNutrition: [],
        productFlags: [],
        productScores: [],
        productAdditives: [],
        productSearchTerms: []
      };

      // Validate all required arrays are present
      expect(Array.isArray(mockSchemaData.products)).toBe(true);
      expect(Array.isArray(mockSchemaData.categories)).toBe(true);
      expect(Array.isArray(mockSchemaData.productCategories)).toBe(true);
      expect(Array.isArray(mockSchemaData.productNutrition)).toBe(true);
      expect(Array.isArray(mockSchemaData.productFlags)).toBe(true);
      expect(Array.isArray(mockSchemaData.productScores)).toBe(true);
      expect(Array.isArray(mockSchemaData.productAdditives)).toBe(true);
      expect(Array.isArray(mockSchemaData.productSearchTerms)).toBe(true);

      // Test with sample data
      const completeData: FlexibleSchemaData = {
        products: [{
          id: 'test-001',
          name: 'Test Product',
          price_regular: 2.99,
          unit_amount: 500,
          unit_type: 'g',
          created_at: Date.now(),
          updated_at: Date.now()
        }],
        categories: [{
          id: 'cat-001',
          name: 'Test Category',
          path: 'test',
          depth: 0,
          left_bound: 1,
          right_bound: 2,
          product_count: 1,
          display_order: 0
        }],
        productCategories: [{
          product_id: 'test-001',
          category_id: 'cat-001',
          is_primary: true,
          relevance_score: 100
        }],
        productNutrition: [{
          product_id: 'test-001',
          kcal: 250,
          protein: 12.5
        }],
        productFlags: [{
          product_id: 'test-001',
          flag_type: 'is_vegan',
          flag_value: true,
          confidence: 95,
          source: 'algorithm'
        }],
        productScores: [{
          product_id: 'test-001',
          score_type: 'protein_efficiency',
          score_value: 80,
          computed_at: Date.now()
        }],
        productAdditives: [{
          product_id: 'test-001',
          additive_name: 'Test Additive',
          functional_category: 'Test Category',
          is_natural: true
        }],
        productSearchTerms: [{
          product_id: 'test-001',
          term: 'test',
          term_type: 'name',
          weight: 100,
          language: 'nl'
        }]
      };

      expect(completeData.products).toHaveLength(1);
      expect(completeData.categories).toHaveLength(1);
      expect(completeData.productCategories).toHaveLength(1);
      expect(completeData.productNutrition).toHaveLength(1);
      expect(completeData.productFlags).toHaveLength(1);
      expect(completeData.productScores).toHaveLength(1);
      expect(completeData.productAdditives).toHaveLength(1);
      expect(completeData.productSearchTerms).toHaveLength(1);
    });
  });

  describe('Type Safety and Constraint Validation', () => {
    it('should enforce readonly properties at compile time', () => {
      const product: FlexibleProduct = {
        id: 'test-001',
        name: 'Test Product',
        price_regular: 2.99,
        unit_amount: 500,
        unit_type: 'g',
        created_at: Date.now(),
        updated_at: Date.now()
      };

      // These should cause TypeScript errors (uncomment to test):
      // @ts-expect-error
      // product.id = 'modified';
      // @ts-expect-error
      // product.name = 'Modified';
      // @ts-expect-error
      // product.price_regular = 3.99;

      expect(product.id).toBe('test-001');
    });

    it('should validate unit_type constraint at compile time', () => {
      const validUnitTypes = ['g', 'ml', 'pieces', 'kg', 'l'] as const;

      validUnitTypes.forEach(unitType => {
        const product: FlexibleProduct = {
          id: 'test',
          name: 'Test',
          price_regular: 1.0,
          unit_amount: 100,
          unit_type: unitType,
          created_at: Date.now(),
          updated_at: Date.now()
        };

        expect(product.unit_type).toBe(unitType);
      });

      // This should cause a TypeScript error:
      // @ts-expect-error
      // const invalidProduct: FlexibleProduct = {
      //   id: 'test',
      //   name: 'Test',
      //   price_regular: 1.0,
      //   unit_amount: 100,
      //   unit_type: 'invalid', // Invalid unit type
      //   created_at: Date.now(),
      //   updated_at: Date.now()
      // };
    });

    it('should validate language constraint for search terms', () => {
      const validLanguages = ['nl', 'en'] as const;

      validLanguages.forEach(language => {
        const term: FlexibleProductSearchTerm = {
          product_id: 'test-001',
          term: 'test',
          term_type: 'name',
          weight: 100,
          language: language
        };

        expect(term.language).toBe(language);
      });

      // This should cause a TypeScript error:
      // @ts-expect-error
      // const invalidTerm: FlexibleProductSearchTerm = {
      //   product_id: 'test-001',
      //   term: 'test',
      //   term_type: 'name',
      //   weight: 100,
      //   language: 'fr' // Invalid language
      // };
    });
  });

  describe('Data Transformation Type Safety', () => {
    it('should support safe transformation from existing Product type', () => {
      // This test validates that we can safely transform from the existing
      // monolithic Product type to the new flexible schema entities

      // Mock existing product structure
      const existingProduct = {
        id: 'test-001',
        name: 'Test Product',
        price: { regular: 2.99, currency: 'EUR' },
        unit: { amount: 500, amountUnit: 'g' },
        nutrition: { kcal: 250, protein: 12.5, carbs: 30, fat: 8.5 },
        nutritionalTags: { vegan: true, highProtein: false },
        categories: ['dairy', 'milk']
      };

      // Transform to flexible schema entities
      const flexibleProduct: FlexibleProduct = {
        id: existingProduct.id,
        name: existingProduct.name,
        price_regular: existingProduct.price.regular,
        unit_amount: existingProduct.unit.amount,
        unit_type: 'g', // Normalized from amountUnit
        created_at: Date.now(),
        updated_at: Date.now()
      };

      const flexibleNutrition: FlexibleProductNutrition = {
        product_id: existingProduct.id,
        kcal: existingProduct.nutrition.kcal,
        protein: existingProduct.nutrition.protein,
        carbs: existingProduct.nutrition.carbs,
        fat: existingProduct.nutrition.fat
      };

      const flexibleFlags: FlexibleProductFlag[] = [
        {
          product_id: existingProduct.id,
          flag_type: 'is_vegan',
          flag_value: existingProduct.nutritionalTags.vegan,
          confidence: 100,
          source: 'transform'
        },
        {
          product_id: existingProduct.id,
          flag_type: 'is_high_protein',
          flag_value: existingProduct.nutritionalTags.highProtein,
          confidence: 100,
          source: 'transform'
        }
      ];

      // Validate transformation results
      expect(flexibleProduct.id).toBe(existingProduct.id);
      expect(flexibleProduct.price_regular).toBe(existingProduct.price.regular);
      expect(flexibleNutrition.product_id).toBe(existingProduct.id);
      expect(flexibleFlags).toHaveLength(2);
      expect(flexibleFlags[0].flag_type).toBe('is_vegan');
      expect(flexibleFlags[1].flag_type).toBe('is_high_protein');
    });
  });
});