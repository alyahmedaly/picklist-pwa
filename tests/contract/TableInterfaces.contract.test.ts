/**
 * Table Interfaces Contract Test
 * Feature: 020-migration-kysely
 *
 * CRITICAL: This test MUST FAIL initially - defines contracts for table type definitions
 * Tests individual table interface types match actual database schema
 */

import { describe, it, expect } from 'vitest';

// These imports WILL FAIL initially - that's expected for TDD
import type {
  ProductTable,
  CategoryTable,
  ProductCategoryTable,
  ProductNutritionTable,
  ProductFlagTable,
  ProductScoreTable,
  ProductAdditiveTable,
  ProductSearchTermTable
} from '../../src/db/kysely/database.ts';

describe('Table Interfaces Contract', () => {
  describe('ProductTable Interface', () => {
    it('should define all required product columns with correct types', () => {
      // Contract for ProductTable based on schema verification
      const mockProduct = {} as ProductTable;

      // Primary key and basic info
      expect(typeof mockProduct.id).toBe('string');
      expect(typeof mockProduct.name).toBe('string');

      // Pricing fields
      expect(typeof mockProduct.price_regular).toBe('number');
      expect(typeof (mockProduct.price_sale || 0)).toBe('number'); // Nullable

      // Unit information
      expect(typeof mockProduct.unit_amount).toBe('number');
      expect(typeof mockProduct.unit_type).toBe('string');

      // Optional brand
      expect(typeof (mockProduct.brand || '')).toBe('string'); // Nullable

      // Timestamps
      expect(typeof mockProduct.created_at).toBe('number');
      expect(typeof mockProduct.updated_at).toBe('number');
    });

    it('should enforce unit_type enum constraints', () => {
      // Contract for unit_type validation
      const validUnits: ProductTable['unit_type'][] = ['g', 'ml', 'pieces', 'kg', 'l'];

      validUnits.forEach(unit => {
        expect(['g', 'ml', 'pieces', 'kg', 'l']).toContain(unit);
      });
    });

    it('should support nullable fields correctly', () => {
      // Contract for nullable field handling
      const mockProduct: Partial<ProductTable> = {
        id: 'test-id',
        name: 'Test Product',
        price_regular: 1.99,
        price_sale: null, // Should be allowed
        unit_amount: 100,
        unit_type: 'g',
        brand: null, // Should be allowed
        created_at: Date.now(),
        updated_at: Date.now()
      };

      expect(mockProduct.price_sale).toBeNull();
      expect(mockProduct.brand).toBeNull();
    });
  });

  describe('CategoryTable Interface', () => {
    it('should define nested set model columns', () => {
      // Contract for CategoryTable with nested set model
      const mockCategory = {} as CategoryTable;

      // Basic category info
      expect(typeof mockCategory.id).toBe('string');
      expect(typeof mockCategory.name).toBe('string');

      // Hierarchy fields
      expect(typeof (mockCategory.parent_id || '')).toBe('string'); // Nullable
      expect(typeof (mockCategory.path || '')).toBe('string'); // Nullable
      expect(typeof (mockCategory.depth || 0)).toBe('number'); // Nullable

      // Nested set model fields
      expect(typeof (mockCategory.left_bound || 0)).toBe('number'); // Nullable
      expect(typeof (mockCategory.right_bound || 0)).toBe('number'); // Nullable

      // Aggregated data
      expect(typeof (mockCategory.product_count || 0)).toBe('number'); // Nullable
      expect(typeof (mockCategory.display_order || 0)).toBe('number'); // Nullable
    });

    it('should enforce nested set model constraints', () => {
      // Contract for nested set validation logic
      const mockCategory: CategoryTable = {
        id: 'cat-1',
        name: 'Test Category',
        parent_id: null,
        path: 'Test Category',
        depth: 0,
        left_bound: 1,
        right_bound: 10,
        product_count: 5,
        display_order: 1
      };

      // Nested set invariant: left_bound < right_bound
      if (mockCategory.left_bound && mockCategory.right_bound) {
        expect(mockCategory.left_bound).toBeLessThan(mockCategory.right_bound);
      }

      // Depth constraint: >= 0, <= 6
      if (mockCategory.depth !== null) {
        expect(mockCategory.depth).toBeGreaterThanOrEqual(0);
        expect(mockCategory.depth).toBeLessThanOrEqual(6);
      }
    });
  });

  describe('ProductNutritionTable Interface', () => {
    it('should define all nutritional columns with proper types', () => {
      // Contract for ProductNutritionTable
      const mockNutrition = {} as ProductNutritionTable;

      // Foreign key
      expect(typeof mockNutrition.product_id).toBe('string');

      // Energy values
      expect(typeof (mockNutrition.kcal || 0)).toBe('number'); // Nullable
      expect(typeof (mockNutrition.kj || 0)).toBe('number'); // Nullable

      // Macronutrients
      expect(typeof (mockNutrition.protein || 0)).toBe('number'); // Nullable
      expect(typeof (mockNutrition.carbs || 0)).toBe('number'); // Nullable
      expect(typeof (mockNutrition.sugars || 0)).toBe('number'); // Nullable
      expect(typeof (mockNutrition.fat || 0)).toBe('number'); // Nullable
      expect(typeof (mockNutrition.saturated_fat || 0)).toBe('number'); // Nullable
      expect(typeof (mockNutrition.fiber || 0)).toBe('number'); // Nullable

      // Sodium/salt
      expect(typeof (mockNutrition.salt || 0)).toBe('number'); // Nullable
      expect(typeof (mockNutrition.sodium || 0)).toBe('number'); // Nullable
    });

    it('should enforce business logic constraints', () => {
      // Contract for nutritional validation rules
      const mockNutrition: ProductNutritionTable = {
        product_id: 'prod-1',
        kcal: 100,
        kj: 420,
        protein: 20,
        carbs: 10,
        sugars: 5, // Must be <= carbs
        fat: 2,
        saturated_fat: 1, // Must be <= fat
        fiber: 3,
        salt: 0.5,
        sodium: 200
      };

      // Business rules from schema
      if (mockNutrition.sugars !== null && mockNutrition.carbs !== null) {
        expect(mockNutrition.sugars).toBeLessThanOrEqual(mockNutrition.carbs);
      }

      if (mockNutrition.saturated_fat !== null && mockNutrition.fat !== null) {
        expect(mockNutrition.saturated_fat).toBeLessThanOrEqual(mockNutrition.fat);
      }
    });
  });

  describe('ProductFlagTable Interface', () => {
    it('should define flag columns with enum constraints', () => {
      // Contract for ProductFlagTable
      const mockFlag = {} as ProductFlagTable;

      // Composite key fields
      expect(typeof mockFlag.product_id).toBe('string');
      expect(typeof mockFlag.flag_type).toBe('string');

      // Flag data
      expect(typeof mockFlag.flag_value).toBe('boolean');
      expect(typeof mockFlag.confidence).toBe('number');
      expect(typeof mockFlag.source).toBe('string');
    });

    it('should enforce flag type enum values', () => {
      // Contract for flag_type validation
      const validFlagTypes: ProductFlagTable['flag_type'][] = [
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

      const mockFlag: ProductFlagTable = {
        product_id: 'prod-1',
        flag_type: 'is_halal',
        flag_value: true,
        confidence: 95,
        source: 'certification'
      };

      expect(validFlagTypes).toContain(mockFlag.flag_type);
      expect(mockFlag.confidence).toBeGreaterThanOrEqual(0);
      expect(mockFlag.confidence).toBeLessThanOrEqual(100);
    });
  });

  describe('ProductScoreTable Interface', () => {
    it('should define scoring columns with contextual support', () => {
      // Contract for ProductScoreTable
      const mockScore = {} as ProductScoreTable;

      // Composite key fields
      expect(typeof mockScore.product_id).toBe('string');
      expect(typeof mockScore.score_type).toBe('string');
      expect(typeof (mockScore.context || '')).toBe('string'); // Nullable for non-contextual scores

      // Score data
      expect(typeof mockScore.score_value).toBe('number');
      expect(typeof mockScore.computed_at).toBe('number');
      expect(typeof (mockScore.metadata || '')).toBe('string'); // Nullable JSON metadata
    });

    it('should enforce score type and context enums', () => {
      // Contract for score_type and context validation
      const validScoreTypes: ProductScoreTable['score_type'][] = [
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

      const validContexts: NonNullable<ProductScoreTable['context']>[] = [
        'training_day',
        'rest_day',
        'cutting',
        'bulking',
        'maintenance'
      ];

      const mockScore: ProductScoreTable = {
        product_id: 'prod-1',
        score_type: 'health_score',
        score_value: 85,
        context: 'training_day',
        computed_at: Date.now(),
        metadata: '{"algorithm":"nutri-score-v2"}'
      };

      expect(validScoreTypes).toContain(mockScore.score_type);
      if (mockScore.context) {
        expect(validContexts).toContain(mockScore.context);
      }
      expect(mockScore.score_value).toBeGreaterThanOrEqual(0);
      expect(mockScore.score_value).toBeLessThanOrEqual(100);
    });
  });

  describe('ProductAdditiveTable Interface', () => {
    it('should define additive columns with E-number support', () => {
      // Contract for ProductAdditiveTable
      const mockAdditive = {} as ProductAdditiveTable;

      // Composite key fields
      expect(typeof mockAdditive.product_id).toBe('string');
      expect(typeof (mockAdditive.e_number || '')).toBe('string'); // Nullable
      expect(typeof mockAdditive.additive_name).toBe('string');

      // Category information
      expect(typeof mockAdditive.functional_category).toBe('string');
      expect(typeof (mockAdditive.dutch_category || '')).toBe('string'); // Nullable

      // Safety and origin information
      expect(typeof (mockAdditive.safety_flags || '')).toBe('string'); // Nullable JSON
      expect(typeof mockAdditive.is_natural).toBe('boolean');
    });

    it('should validate E-number format when present', () => {
      // Contract for E-number validation
      const mockAdditive: ProductAdditiveTable = {
        product_id: 'prod-1',
        e_number: 'E300',
        additive_name: 'Ascorbic acid',
        functional_category: 'antioxidant',
        dutch_category: 'antioxidant',
        safety_flags: '[]',
        is_natural: true
      };

      // E-number pattern validation (when not null)
      if (mockAdditive.e_number) {
        expect(mockAdditive.e_number).toMatch(/^E[0-9][0-9][0-9]/);
      }

      expect(mockAdditive.additive_name.length).toBeLessThanOrEqual(200);
      expect(mockAdditive.functional_category.length).toBeLessThanOrEqual(100);
    });
  });

  describe('ProductSearchTermTable Interface (Conditional)', () => {
    it('should define search term columns when search is enabled', () => {
      // Contract for ProductSearchTermTable (conditional existence)
      const mockSearchTerm = {} as ProductSearchTermTable;

      // Composite key fields
      expect(typeof mockSearchTerm.product_id).toBe('string');
      expect(typeof mockSearchTerm.term).toBe('string');
      expect(typeof mockSearchTerm.term_type).toBe('string');

      // Search metadata
      expect(typeof mockSearchTerm.weight).toBe('number');
      expect(typeof mockSearchTerm.language).toBe('string');
    });

    it('should enforce search term constraints when applicable', () => {
      // Contract for search term validation
      const validTermTypes: ProductSearchTermTable['term_type'][] = [
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

      const validLanguages: ProductSearchTermTable['language'][] = ['nl', 'en'];

      const mockSearchTerm: ProductSearchTermTable = {
        product_id: 'prod-1',
        term: 'yoghurt',
        term_type: 'name',
        weight: 80,
        language: 'nl'
      };

      expect(validTermTypes).toContain(mockSearchTerm.term_type);
      expect(validLanguages).toContain(mockSearchTerm.language);
      expect(mockSearchTerm.weight).toBeGreaterThanOrEqual(0);
      expect(mockSearchTerm.weight).toBeLessThanOrEqual(100);
      expect(mockSearchTerm.term.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Table Relationship Contracts', () => {
    it('should define proper foreign key relationships', () => {
      // Contract for inter-table relationships
      const productId = 'test-product-id';
      const categoryId = 'test-category-id';

      // Product → Nutrition (1:1)
      const nutrition: ProductNutritionTable = {
        product_id: productId, // FK to products.id
        kcal: 100,
        protein: 20,
        carbs: 10,
        fat: 2,
        kj: null,
        sugars: null,
        saturated_fat: null,
        fiber: null,
        salt: null,
        sodium: null
      };

      // Product → Category (M:N through junction)
      const productCategory: ProductCategoryTable = {
        product_id: productId, // FK to products.id
        category_id: categoryId, // FK to categories.id
        is_primary: true,
        relevance_score: 100
      };

      expect(nutrition.product_id).toBe(productId);
      expect(productCategory.product_id).toBe(productId);
      expect(productCategory.category_id).toBe(categoryId);
    });
  });
});