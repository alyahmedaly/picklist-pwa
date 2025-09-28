// Type Contract: Body Recomposition Scoring Extensions
// This file defines the TypeScript interfaces for the new scoring features
// These types MUST be implemented exactly as specified to maintain contract compliance

export interface PostWorkoutScore {
  postWorkoutScore: number; // 0-100 scale
  carbProteinRatio: number; // Carbs to protein ratio, 0 if missing data
  glycemicBoost: number; // 1.0-1.5 multiplier for high-GI carbs
  recoveryWindow: 'immediate' | 'delayed' | 'general'; // Timing suitability
  confidence: 'high' | 'medium' | 'low'; // Data quality indicator
}

export interface FatLossScore {
  fatLossScore: number; // 0-100 scale
  calorieDensity: number; // kcal per 100g
  calorieDensityClass: 'low' | 'moderate' | 'high'; // <125, 125-225, >225 kcal/100g
  satietyEfficiency: number; // Satiety per calorie ratio
  volumeAdvantage: boolean; // High volume, low calorie benefit
  confidence: 'high' | 'medium' | 'low'; // Data quality indicator
}

export interface CalorieEfficiencyScore {
  efficiencyScore: number; // 0-100 scale - overall efficiency
  proteinEfficiency: number; // 0-100 scale - protein per calorie
  satietyEfficiency: number; // 0-100 scale - satiety per calorie
  micronutrientDensity: number; // 0-100 scale - estimated richness
  thermicEffect: number; // 0-20 scale - metabolic cost bonus
  processingPenalty: number; // 0-30 scale - NOVA-based penalty
  confidence: 'high' | 'medium' | 'low'; // Data quality indicator
}

export interface ContextMultipliers {
  proteinScoreMultiplier: number; // 0.5-2.0 range
  satietyScoreMultiplier: number; // 0.5-2.0 range
  postWorkoutMultiplier: number; // 0.5-2.0 range
  fatLossMultiplier: number; // 0.5-2.0 range
  efficiencyMultiplier: number; // 0.5-2.0 range
}

export interface BodyCompositionContext {
  bodyCompositionPhase: 'cutting' | 'bulking' | 'maintenance' | 'recomposition';
  mealTiming: 'pre_workout' | 'post_workout' | 'general';
  contextMultipliers: ContextMultipliers;
  recommendationPriority: 'protein' | 'satiety' | 'efficiency' | 'recovery';
  conflictResolution: 'prioritize_goal' | 'balanced' | 'context_specific';
}

// Product interface extension (backward compatible)
export interface ProductWithBodyRecomposition {
  // Existing fields maintained...
  id: string;
  name: string;
  // ... all existing Product fields

  // NEW: Body recomposition scoring fields (all optional)
  postWorkoutOptimization?: PostWorkoutScore;
  fatLossCompatibility?: FatLossScore;
  enhancedCalorieEfficiency?: CalorieEfficiencyScore;
  bodyCompositionContext?: BodyCompositionContext;
}

// Validation functions (contract enforcement)
export function validatePostWorkoutScore(score: PostWorkoutScore): boolean {
  return (
    score.postWorkoutScore >= 0 &&
    score.postWorkoutScore <= 100 &&
    score.carbProteinRatio >= 0 &&
    score.glycemicBoost >= 1.0 &&
    score.glycemicBoost <= 1.5 &&
    ['immediate', 'delayed', 'general'].includes(score.recoveryWindow) &&
    ['high', 'medium', 'low'].includes(score.confidence)
  );
}

export function validateFatLossScore(score: FatLossScore): boolean {
  return (
    score.fatLossScore >= 0 &&
    score.fatLossScore <= 100 &&
    score.calorieDensity >= 0 &&
    ['low', 'moderate', 'high'].includes(score.calorieDensityClass) &&
    score.satietyEfficiency >= 0 &&
    typeof score.volumeAdvantage === 'boolean' &&
    ['high', 'medium', 'low'].includes(score.confidence)
  );
}

export function validateCalorieEfficiencyScore(score: CalorieEfficiencyScore): boolean {
  return (
    score.efficiencyScore >= 0 &&
    score.efficiencyScore <= 100 &&
    score.proteinEfficiency >= 0 &&
    score.proteinEfficiency <= 100 &&
    score.satietyEfficiency >= 0 &&
    score.satietyEfficiency <= 100 &&
    score.micronutrientDensity >= 0 &&
    score.micronutrientDensity <= 100 &&
    score.thermicEffect >= 0 &&
    score.thermicEffect <= 20 &&
    score.processingPenalty >= 0 &&
    score.processingPenalty <= 30 &&
    ['high', 'medium', 'low'].includes(score.confidence)
  );
}

export function validateContextMultipliers(multipliers: ContextMultipliers): boolean {
  const validRange = (val: number) => val >= 0.5 && val <= 2.0;
  return (
    validRange(multipliers.proteinScoreMultiplier) &&
    validRange(multipliers.satietyScoreMultiplier) &&
    validRange(multipliers.postWorkoutMultiplier) &&
    validRange(multipliers.fatLossMultiplier) &&
    validRange(multipliers.efficiencyMultiplier)
  );
}

export function validateBodyCompositionContext(context: BodyCompositionContext): boolean {
  return (
    ['cutting', 'bulking', 'maintenance', 'recomposition'].includes(context.bodyCompositionPhase) &&
    ['pre_workout', 'post_workout', 'general'].includes(context.mealTiming) &&
    validateContextMultipliers(context.contextMultipliers) &&
    ['protein', 'satiety', 'efficiency', 'recovery'].includes(context.recommendationPriority) &&
    ['prioritize_goal', 'balanced', 'context_specific'].includes(context.conflictResolution)
  );
}
