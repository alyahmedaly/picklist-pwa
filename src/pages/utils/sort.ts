import type { Product } from "@picklist/types";

export function sortProducts(products: Product[], sortBy: 'name' | 'price' | 'protein' | 'calories' | 'optimal-nutrition' | 'health-grade' | 'global-health-score' | 'category-health-score' | 'category-health-grade' | 'nutri-score' | 'protein-density-score' | 'satiety-score' | 'fat-loss-score' | 'post-workout-score' | 'average'): Product[] {
    return products.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'price':
                return (a.price?.regular || 0) - (b.price?.regular || 0);
            case 'protein':
                return (b.nutrition?.protein || 0) - (a.nutrition?.protein || 0);
            case 'calories':
                return (b.nutrition?.kcal || 0) - (a.nutrition?.kcal || 0);
            case 'optimal-nutrition':
                // Composite score: low calories, high protein, high fiber, low fat
                {
                    const calculateOptimalScore = (product: Product) => {
                        const nutrition = product.nutrition;
                        if (!nutrition) return 0;

                        // Normalize values (0-100 scale)
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

                        // Weighted composite score
                        return (calorieScore * 0.3) + (proteinScore * 0.4) + (fiberScore * 0.2) + (fatScore * 0.1);
                    };
                    return calculateOptimalScore(b) - calculateOptimalScore(a);
                }
            case 'health-grade':
                {
                    const getGradeValue = (grade?: string) => {
                        const gradeMap = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1 };
                        return gradeMap[grade as keyof typeof gradeMap] || 0;
                    };
                    return getGradeValue(b.globalHealthGrade) - getGradeValue(a.globalHealthGrade);
                }
            case 'global-health-score':
                // Sort by globalHealthScore (higher scores first)
                {
                    const aGlobalScore = (product: Product) => {
                        return typeof product.globalHealthScore === 'number' ? product.globalHealthScore :
                            product.globalHealthScore ? parseFloat(String(product.globalHealthScore)) : 0;
                    };
                    return aGlobalScore(b) - aGlobalScore(a);
                }
            case 'category-health-score':
                // Sort by categoryHealthScore (higher scores first)
                {
                    const aCategoryScore = (product: Product) => {
                        return typeof product.categoryHealthScore === 'number' ? product.categoryHealthScore :
                            product.categoryHealthScore ? parseFloat(String(product.categoryHealthScore)) : 0;
                    };
                    return aCategoryScore(b) - aCategoryScore(a);
                }
            case 'category-health-grade':
                // Sort by categoryHealthGrade (A-E scale, A is best)
                {
                    const getCategoryGradeValue = (grade?: string) => {
                        if (!grade) return 0;
                        const gradeMap = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1 };
                        return gradeMap[grade.toUpperCase() as keyof typeof gradeMap] || 0;
                    };
                    const aGrade = (product: Product) => {
                        return getCategoryGradeValue(
                            typeof product.categoryHealthGrade === 'string' ? product.categoryHealthGrade :
                                String(product.categoryHealthGrade || '')
                        );
                    };
                    return aGrade(b) - aGrade(a);
                }
            case 'nutri-score':
                // Sort by Nutri-Score (A-E scale, A is best - lower is better)
                {
                    const getNutriScoreValue = (score?: string) => {
                        if (!score) return 6; // Put missing scores at the end
                        const scoreMap = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };
                        return scoreMap[score.toUpperCase() as keyof typeof scoreMap] || 6;
                    };
                    const aNutriScore = (product: Product) => {
                        return getNutriScoreValue(
                            typeof product.nutriScore === 'string' ? product.nutriScore :
                                String(product.nutriScore || '')
                        );
                    };
                    return aNutriScore(a) - aNutriScore(b);
                }
            case 'protein-density-score':
                // Sort by protein density score (higher scores first)
                {
                    const getProteinDensityScore = (product: Product) => {
                        return product.proteinOptimization?.proteinDensityScore || 0;
                    };
                    return getProteinDensityScore(b) - getProteinDensityScore(a);
                }
            case 'satiety-score':
                // Sort by satiety score (higher scores first)
                {
                    const getSatietyScore = (product: Product) => {
                        return product.satietyAnalysis?.satietyScore || 0;
                    };
                    return getSatietyScore(b) - getSatietyScore(a);
                }
            case 'fat-loss-score':
                // Sort by fat loss score (higher scores first)
                {
                    const getFatLossScore = (product: Product) => {
                        return product.fatLossCompatibility?.fatLossScore || 0;
                    };
                    return getFatLossScore(b) - getFatLossScore(a);
                }
            case 'post-workout-score':
                // Sort by post-workout score (higher scores first)
                {
                    const getPostWorkoutScore = (product: Product) => {
                        return product.postWorkoutOptimization?.postWorkoutScore || 0;
                    };
                    return getPostWorkoutScore(b) - getPostWorkoutScore(a);
                }
            case 'average':
                // Average of all available scores: optimal-nutrition, global-health-score, category-health-score, nutri-score,
                // protein-density-score, satiety-score, fat-loss-score, and post-workout-score
                {
                    const calculateAverageScore = (product: Product) => {
                        const scores: number[] = [];

                        // 1. Optimal nutrition score (normalized to 0-100)
                        // const nutrition = product.nutrition;
                        // if (nutrition) {
                        //     const calories = nutrition.kcal || 0;
                        //     const protein = nutrition.protein || 0;
                        //     const fiber = nutrition.fiber || 0;
                        //     const fat = nutrition.fat || 0;

                        //     // Recalibrated scoring to better align with 0-100 scale
                        //     // Calorie score: 0-300 kcal = 100-70, 300-600 = 70-30, 600+ = 30-0
                        //     const calorieScore = calories <= 300 ?
                        //         100 - (calories * 30 / 300) :
                        //         Math.max(0, 70 - ((calories - 300) * 40 / 300));

                        //     // Protein score: 0-15g = 0-60, 15-30g = 60-100, 30+ = 100
                        //     const proteinScore = protein <= 15 ?
                        //         protein * 4 :
                        //         Math.min(100, 60 + ((protein - 15) * 40 / 15));

                        //     // Fiber score: 0-3g = 0-30, 3-8g = 30-80, 8+ = 80-100
                        //     const fiberScore = fiber <= 3 ?
                        //         fiber * 10 :
                        //         Math.min(100, 30 + ((fiber - 3) * 50 / 5));

                        //     // Fat score: 0-10g = 100-80, 10-25g = 80-40, 25+ = 40-0
                        //     const fatScore = fat <= 10 ?
                        //         100 - (fat * 20 / 10) :
                        //         Math.max(0, 80 - ((fat - 10) * 40 / 15));

                        //     const optimalScore = (calorieScore * 0.3) + (proteinScore * 0.4) + (fiberScore * 0.2) + (fatScore * 0.1);
                        //     scores.push(optimalScore);
                        // }

                        // 2. Global health score (already 0-100)
                        const globalScore = typeof product.globalHealthScore === 'number' ? product.globalHealthScore :
                            product.globalHealthScore ? parseFloat(String(product.globalHealthScore)) : 0;
                        if (globalScore > 0) scores.push(globalScore);

                        // 3. Category health score (already 0-100)
                        // const categoryScore = typeof product.categoryHealthScore === 'number' ? product.categoryHealthScore :
                        //     product.categoryHealthScore ? parseFloat(String(product.categoryHealthScore)) : 0;
                        // if (categoryScore > 0) scores.push(categoryScore);

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

                        const calorieEfficiencyScore = product.satietyAnalysis?.caloriePerSatietyRatio;
                        if (calorieEfficiencyScore && calorieEfficiencyScore > 0) {
                            // Invert calorie efficiency (lower is better)
                            const invertedScore = Math.max(0, 100 - calorieEfficiencyScore);
                            scores.push(invertedScore);
                        }

                        // 7. Fat loss score (already 0-100)
                        const fatLossScore = product.fatLossCompatibility?.fatLossScore;
                        if (fatLossScore && fatLossScore > 0) {
                            scores.push(fatLossScore);
                        }

                        // 8. Post-workout score (already 0-100)
                        // const postWorkoutScore = product.postWorkoutOptimization?.postWorkoutScore;
                        // if (postWorkoutScore && postWorkoutScore > 0) {
                        //     scores.push(postWorkoutScore);
                        // }

                        // Return the average of all available scores, or 0 if no scores available
                        return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
                    };
                    return calculateAverageScore(b) - calculateAverageScore(a);
                }
            default:
                return 0;
        }
    })
}