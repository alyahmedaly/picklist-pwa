/**
 * ProductScores Entity Implementation
 * Feature: 019-flexible-database-schema
 *
 * Handles contextual scoring system from monolithic product structure
 * to flexible schema with multi-dimensional scores and context awareness.
 */

import type { Product } from '@picklist/types';
import type { FlexibleProductScore, ProductScoreType, ProductScoreContext } from '../types';

/**
 * Normalizes scores from monolithic Product to FlexibleProductScore entities
 */
export function normalizeScoresEntities(product: Product): FlexibleProductScore[] {
  const scores: FlexibleProductScore[] = [];

  // Extract protein scores from existing proteinOptimization
  if (product.proteinOptimization) {
    scores.push({
      product_id: product.id,
      score_type: 'protein_efficiency',
      score_value: Math.round(product.proteinOptimization.proteinDensityScore * 100) / 100,
      computed_at: Date.now(),
      metadata: JSON.stringify({
        algorithm: 'protein_optimization_v1',
        proteinContribution: product.proteinOptimization.proteinContribution,
        targetContribution: product.proteinOptimization.targetContribution,
        source: 'existing_transform'
      })
    });
  }

  // Extract satiety scores from existing satietyAnalysis
  if (product.satietyAnalysis) {
    scores.push({
      product_id: product.id,
      score_type: 'satiety_score',
      score_value: Math.round(product.satietyAnalysis.satietyScore * 100) / 100,
      computed_at: Date.now(),
      metadata: JSON.stringify({
        algorithm: 'satiety_intelligence_v1',
        satietyFactors: product.satietyAnalysis.satietyFactors,
        expectedDuration: product.satietyAnalysis.expectedSatietyDuration,
        source: 'existing_transform'
      })
    });
  }

  // Extract global health scores (already computed by hybrid nutrition scoring)
  if (product.globalHealthScore !== undefined) {
    scores.push({
      product_id: product.id,
      score_type: 'health_score',
      score_value: Math.round(product.globalHealthScore * 100) / 100,
      computed_at: Date.now(),
      metadata: JSON.stringify({
        algorithm: 'hybrid_nutrition_v1',
        grade: product.globalHealthGrade,
        nutriScore: product.nutriScore,
        source: 'existing_transform'
      })
    });
  }

  // Extract category health scores for contextual scoring
  if (product.categoryHealthScore !== undefined) {
    scores.push({
      product_id: product.id,
      score_type: 'health_score',
      score_value: Math.round(product.categoryHealthScore * 100) / 100,
      context: 'category_relative',
      computed_at: Date.now(),
      metadata: JSON.stringify({
        algorithm: 'hybrid_nutrition_category_v1',
        grade: product.categoryHealthGrade,
        source: 'existing_transform'
      })
    });
  }

  // Extract post-workout optimization scores (from existing body recomposition scoring)
  if (product.postWorkoutOptimization) {
    scores.push({
      product_id: product.id,
      score_type: 'post_workout_score',
      score_value: Math.round(product.postWorkoutOptimization.postWorkoutScore * 100) / 100,
      context: 'training_day',
      computed_at: Date.now(),
      metadata: JSON.stringify({
        algorithm: 'body_recomposition_post_workout_v1',
        carbProteinRatio: product.postWorkoutOptimization.carbProteinRatio,
        glycemicBoost: product.postWorkoutOptimization.glycemicBoost,
        recoveryWindow: product.postWorkoutOptimization.recoveryWindow,
        source: 'existing_transform'
      })
    });
  }

  // Extract fat loss compatibility scores (from existing body recomposition scoring)
  if (product.fatLossCompatibility) {
    scores.push({
      product_id: product.id,
      score_type: 'fat_loss_score',
      score_value: Math.round(product.fatLossCompatibility.fatLossScore * 100) / 100,
      context: 'cutting',
      computed_at: Date.now(),
      metadata: JSON.stringify({
        algorithm: 'body_recomposition_fat_loss_v1',
        calorieDensity: product.fatLossCompatibility.calorieDensity,
        satietyEfficiency: product.fatLossCompatibility.satietyEfficiency,
        volumeAdvantage: product.fatLossCompatibility.volumeAdvantage,
        source: 'existing_transform'
      })
    });
  }

  // Extract enhanced calorie efficiency (from existing body recomposition scoring)
  if (product.enhancedCalorieEfficiency) {
    scores.push({
      product_id: product.id,
      score_type: 'calorie_efficiency',
      score_value: Math.round(product.enhancedCalorieEfficiency.efficiencyScore * 100) / 100,
      computed_at: Date.now(),
      metadata: JSON.stringify({
        algorithm: 'body_recomposition_calorie_efficiency_v1',
        proteinEfficiency: product.enhancedCalorieEfficiency.proteinEfficiency,
        satietyEfficiency: product.enhancedCalorieEfficiency.satietyEfficiency,
        micronutrientDensity: product.enhancedCalorieEfficiency.micronutrientDensity,
        thermicEffect: product.enhancedCalorieEfficiency.thermicEffect,
        processingPenalty: product.enhancedCalorieEfficiency.processingPenalty,
        source: 'existing_transform'
      })
    });
  }

  // Extract body composition context scores (from existing body recomposition scoring)
  if (product.bodyCompositionContext) {
    const context = product.bodyCompositionContext;

    // Create contextual score based on the body composition phase and meal timing
    const baseScore = 50; // Base score
    let contextualScore = baseScore;

    // Adjust score based on context multipliers
    if (context.contextMultipliers) {
      const avgMultiplier = (
        context.contextMultipliers.proteinScoreMultiplier +
        context.contextMultipliers.satietyScoreMultiplier +
        context.contextMultipliers.efficiencyMultiplier
      ) / 3;

      contextualScore = Math.round((avgMultiplier * baseScore) * 100) / 100;
    }

    scores.push({
      product_id: product.id,
      score_type: 'contextual_score',
      score_value: Math.min(100, Math.max(0, contextualScore)),
      context: context.mealTiming === 'post_workout' ? 'training_day' : 'rest_day',
      computed_at: Date.now(),
      metadata: JSON.stringify({
        algorithm: 'body_recomposition_context_v1',
        bodyCompositionPhase: context.bodyCompositionPhase,
        mealTiming: context.mealTiming,
        recommendationPriority: context.recommendationPriority,
        source: 'existing_transform'
      })
    });
  }

  return scores;
}

/**
 * Calculates dynamic scores based on nutrition and context
 */
export function calculateDynamicScores(
  product: Product,
  context?: ProductScoreContext
): FlexibleProductScore[] {
  const scores: FlexibleProductScore[] = [];

  if (!product.nutrition) {
    return scores;
  }

  const nutrition = product.nutrition;

  // Calculate protein efficiency (protein per kcal * 100)
  if (nutrition.protein && nutrition.kcal && nutrition.kcal > 0) {
    let proteinEfficiency = (nutrition.protein / nutrition.kcal) * 100;

    // Context adjustments
    if (context === 'training_day') {
      proteinEfficiency *= 1.2; // Boost for training days
    } else if (context === 'rest_day') {
      proteinEfficiency *= 0.9; // Slight reduction for rest days
    }

    scores.push({
      product_id: product.id,
      score_type: 'protein_efficiency',
      score_value: Math.min(100, Math.round(proteinEfficiency * 100) / 100),
      context,
      computed_at: Date.now(),
      metadata: JSON.stringify({
        algorithm: 'dynamic_protein_efficiency_v1',
        baseScore: (nutrition.protein / nutrition.kcal) * 100,
        contextMultiplier: context === 'training_day' ? 1.2 : context === 'rest_day' ? 0.9 : 1.0
      })
    });
  }

  // Calculate post-workout score based on carb:protein ratio and glycemic factors
  if (context === 'training_day' && nutrition.protein && nutrition.carbs) {
    const carbProteinRatio = nutrition.carbs / nutrition.protein;
    let postWorkoutScore = 0;

    // Optimal carb:protein ratio for post-workout is 2:1 to 4:1
    if (carbProteinRatio >= 2 && carbProteinRatio <= 4) {
      postWorkoutScore = 90 - Math.abs(carbProteinRatio - 3) * 10; // Peak at 3:1 ratio
    } else if (carbProteinRatio > 0) {
      postWorkoutScore = Math.max(20, 60 - Math.abs(carbProteinRatio - 3) * 15);
    }

    // Bonus for high protein
    if (nutrition.protein >= 20) {
      postWorkoutScore += 10;
    }

    scores.push({
      product_id: product.id,
      score_type: 'post_workout_score',
      score_value: Math.min(100, Math.round(postWorkoutScore * 100) / 100),
      context: 'training_day',
      computed_at: Date.now(),
      metadata: JSON.stringify({
        algorithm: 'dynamic_post_workout_v1',
        carbProteinRatio,
        proteinBonus: nutrition.protein >= 20
      })
    });
  }

  // Calculate fat loss score for cutting context
  if (context === 'cutting' && nutrition.kcal && nutrition.protein) {
    let fatLossScore = 0;

    // Low calorie density is good for fat loss
    if (nutrition.kcal <= 125) {
      fatLossScore += 40;
    } else if (nutrition.kcal <= 200) {
      fatLossScore += 20;
    }

    // High protein is excellent for fat loss
    if (nutrition.protein >= 25) {
      fatLossScore += 40;
    } else if (nutrition.protein >= 15) {
      fatLossScore += 25;
    }

    // High fiber aids satiety
    if (nutrition.fiber && nutrition.fiber >= 8) {
      fatLossScore += 20;
    } else if (nutrition.fiber && nutrition.fiber >= 4) {
      fatLossScore += 10;
    }

    scores.push({
      product_id: product.id,
      score_type: 'fat_loss_score',
      score_value: Math.min(100, Math.round(fatLossScore * 100) / 100),
      context: 'cutting',
      computed_at: Date.now(),
      metadata: JSON.stringify({
        algorithm: 'dynamic_fat_loss_v1',
        calorieScore: nutrition.kcal <= 125 ? 40 : nutrition.kcal <= 200 ? 20 : 0,
        proteinScore: nutrition.protein >= 25 ? 40 : nutrition.protein >= 15 ? 25 : 0,
        fiberScore: nutrition.fiber ? (nutrition.fiber >= 8 ? 20 : nutrition.fiber >= 4 ? 10 : 0) : 0
      })
    });
  }

  return scores;
}

/**
 * Validates score entity against business rules
 */
export function validateScoreEntity(score: FlexibleProductScore): string[] {
  const errors: string[] = [];

  // Required field validation
  if (!score.product_id || score.product_id.trim() === '') {
    errors.push('Product ID is required');
  }

  // Score type validation
  const validScoreTypes: ProductScoreType[] = [
    'protein_efficiency', 'calorie_efficiency', 'satiety_score',
    'nutri_score', 'health_score', 'sustainability_score',
    'post_workout_score', 'fat_loss_score', 'budget_score',
    'contextual_score'
  ];

  if (!validScoreTypes.includes(score.score_type)) {
    errors.push(`Invalid score type: ${score.score_type}. Must be one of: ${validScoreTypes.join(', ')}`);
  }

  // Score value validation
  if (score.score_value < 0 || score.score_value > 100) {
    errors.push('Score value must be between 0 and 100');
  }

  // Context validation
  if (score.context !== undefined) {
    const validContexts: ProductScoreContext[] = [
      'training_day', 
      'rest_day', 
      'cutting', 
      'bulking', 
      'maintenance', 
      'bulking', 
    ];

    if (!validContexts.includes(score.context)) {
      errors.push(`Invalid context: ${score.context}. Must be one of: ${validContexts.join(', ')}`);
    }
  }

  // Computed timestamp validation
  if (score.computed_at <= 0) {
    errors.push('Computed timestamp must be positive');
  }

  // Metadata validation (should be valid JSON if provided)
  if (score.metadata) {
    try {
      JSON.parse(score.metadata);
    } catch {
      errors.push('Metadata must be valid JSON');
    }
  }

  return errors;
}

/**
 * Batch normalizes scores for multiple products
 */
export function normalizeScoresEntitiesForProducts(products: Product[]): {
  scores: FlexibleProductScore[];
  errors: Array<{ productId: string; errors: string[] }>;
} {
  const allScores: FlexibleProductScore[] = [];
  const errors: Array<{ productId: string; errors: string[] }> = [];

  for (const product of products) {
    try {
      const productScores = normalizeScoresEntities(product);

      for (const score of productScores) {
        const validationErrors = validateScoreEntity(score);

        if (validationErrors.length > 0) {
          errors.push({
            productId: product.id,
            errors: validationErrors
          });
        } else {
          allScores.push(score);
        }
      }
    } catch (error) {
      errors.push({
        productId: product.id || 'unknown',
        errors: [`Failed to normalize scores: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    }
  }

  return {
    scores: allScores,
    errors
  };
}

/**
 * Gets best score for a product and score type across all contexts
 */
export function getBestScore(
  scores: FlexibleProductScore[],
  productId: string,
  scoreType: ProductScoreType
): FlexibleProductScore | null {
  const productScores = scores.filter(s =>
    s.product_id === productId && s.score_type === scoreType
  );

  if (productScores.length === 0) {
    return null;
  }

  // Return highest score value
  return productScores.reduce((best, current) =>
    current.score_value > best.score_value ? current : best
  );
}

/**
 * Gets contextual score for a product
 */
export function getContextualScore(
  scores: FlexibleProductScore[],
  productId: string,
  scoreType: ProductScoreType,
  context: ProductScoreContext
): FlexibleProductScore | null {
  return scores.find(s =>
    s.product_id === productId &&
    s.score_type === scoreType &&
    s.context === context
  ) || null;
}

/**
 * Calculates score statistics
 */
export function getScoreStatistics(scores: FlexibleProductScore[], scoreType?: ProductScoreType): {
  count: number;
  average: number;
  median: number;
  min: number;
  max: number;
  percentiles: Record<number, number>;
} {
  const filteredScores = scoreType
    ? scores.filter(s => s.score_type === scoreType)
    : scores;

  if (filteredScores.length === 0) {
    return {
      count: 0,
      average: 0,
      median: 0,
      min: 0,
      max: 0,
      percentiles: {}
    };
  }

  const values = filteredScores.map(s => s.score_value).sort((a, b) => a - b);
  const count = values.length;
  const sum = values.reduce((acc, val) => acc + val, 0);

  return {
    count,
    average: Math.round(sum / count * 100) / 100,
    median: count % 2 === 0
      ? (values[count / 2 - 1] + values[count / 2]) / 2
      : values[Math.floor(count / 2)],
    min: values[0],
    max: values[count - 1],
    percentiles: {
      25: values[Math.floor(count * 0.25)],
      50: values[Math.floor(count * 0.50)],
      75: values[Math.floor(count * 0.75)],
      90: values[Math.floor(count * 0.90)],
      95: values[Math.floor(count * 0.95)]
    }
  };
}

/**
 * Creates a test score entity
 */
export function createTestScoreEntity(overrides: Partial<FlexibleProductScore> = {}): FlexibleProductScore {
  const defaultScore: FlexibleProductScore = {
    product_id: 'test-product-001',
    score_type: 'protein_efficiency',
    score_value: 85.5,
    computed_at: Date.now()
  };

  return { ...defaultScore, ...overrides };
}