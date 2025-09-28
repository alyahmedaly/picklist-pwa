import { writeFileSync } from "node:fs";
import { emit } from "../utils/emit.ts";
import { stats } from "../utils/stats.ts";
import type { Product } from "@picklist/types";
import { join } from "node:path";

export function finalizeStats(products: Product[], outDir: string, startTime: number) {
    stats.processProducts(products);
    const finalStats = stats.finalize();
    // Add totalProducts field for integration tests
    const enhancedStats = { ...finalStats, totalProducts: products.length };
    emit('writing-stats', {
        message: 'Writing stats.json with processing statistics',
    });
    const statsPath = join(outDir, 'stats.json');
    writeFileSync(statsPath, JSON.stringify(enhancedStats, null, 2));
    // Build stats summary for final message
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
    // Add totalProducts field for integration tests
    // Core stats
    const coreStats = [
        `${products.length} products (${finalStats.foodProducts} food, ${finalStats.nonFoodProducts} non-food)`,
        `${finalStats.mergedDuplicates} duplicates merged`,
        `${finalStats.excludedColumns.length} sparse columns excluded`,
    ];

    // Nutritional stats (only if we computed nutritional tags)
    const nutritionStats =
        finalStats.nutritionalTagsComputed > 0
            ? [
                finalStats.veganProducts > 0 ? `${finalStats.veganProducts} vegan` : null,
                finalStats.glutenFreeProducts > 0 ? `${finalStats.glutenFreeProducts} gluten-free` : null,
                finalStats.highProteinProducts > 0
                    ? `${finalStats.highProteinProducts} high-protein`
                    : null,
                finalStats.lowCarbProducts > 0 ? `${finalStats.lowCarbProducts} low-carb` : null,
                finalStats.highFiberProducts > 0 ? `${finalStats.highFiberProducts} high-fiber` : null,
            ].filter(Boolean)
            : [];


    // Safety/additive stats (only if we did additive analysis)
    const safetyStats =
        finalStats.additiveAnalysisComputed > 0
            ? [
                finalStats.productsWithChildWarnings > 0
                    ? `${finalStats.productsWithChildWarnings} child warnings`
                    : null,
                finalStats.productsWithPreservatives > 0
                    ? `${finalStats.productsWithPreservatives} preservatives`
                    : null,
                finalStats.productsWithAdditives > 0
                    ? `${finalStats.productsWithAdditives} with additives`
                    : null,
            ].filter(Boolean)
            : [];


    // Dutch localization stats
    const dutchStats = [
        finalStats.dutchAllergenProducts > 0
            ? `${finalStats.dutchAllergenProducts} Dutch allergen products`
            : null,
        finalStats.decimalCommaNormalizedCount > 0
            ? `${finalStats.decimalCommaNormalizedCount} decimal normalizations`
            : null,
    ].filter(Boolean);


    // Personal health extensions stats (only if we computed any extensions)
    const personalHealthStats = [];
    if (finalStats.personalHealthExtensions.halalAnalysisComputed > 0) {
        const haram = finalStats.personalHealthExtensions.halalStatusDistribution.haram;
        const questionable = finalStats.personalHealthExtensions.halalStatusDistribution.questionable;
        personalHealthStats.push(
            `${finalStats.personalHealthExtensions.halalAnalysisComputed} halal analyzed`,
        );
        if (haram > 0) personalHealthStats.push(`${haram} haram`);
        if (questionable > 0) personalHealthStats.push(`${questionable} questionable`);
    }
    if (finalStats.personalHealthExtensions.proteinOptimizationComputed > 0) {
        personalHealthStats.push(
            `${finalStats.personalHealthExtensions.proteinOptimizationComputed} protein scored`,
        );
        if (finalStats.personalHealthExtensions.highProteinDensityProducts > 0) {
            personalHealthStats.push(
                `${finalStats.personalHealthExtensions.highProteinDensityProducts} high-protein`,
            );
        }
    }

    if (finalStats.personalHealthExtensions.satietyAnalysisComputed > 0) {
        personalHealthStats.push(
            `${finalStats.personalHealthExtensions.satietyAnalysisComputed} satiety analyzed`,
        );
        if (finalStats.personalHealthExtensions.highSatietyProducts > 0) {
            personalHealthStats.push(
                `${finalStats.personalHealthExtensions.highSatietyProducts} high-satiety`,
            );
        }
    }
    const postWorkoutCount = products.filter((p) => p.postWorkoutOptimization).length;
    const fatLossCount = products.filter((p) => p.fatLossCompatibility).length;
    const efficiencyCount = products.filter((p) => p.enhancedCalorieEfficiency).length;
    const contextCount = products.filter((p) => p.bodyCompositionContext).length;
    if (postWorkoutCount > 0) personalHealthStats.push(`${postWorkoutCount} post-workout optimized`);
    if (fatLossCount > 0) personalHealthStats.push(`${fatLossCount} fat-loss compatible`);
    if (efficiencyCount > 0) personalHealthStats.push(`${efficiencyCount} calorie-efficient`);
    if (contextCount > 0) personalHealthStats.push(`${contextCount} context-aware`);

    // Build final message with sections on separate lines
    const messageParts = [`Processing complete in ${processingTime}s:`];
    messageParts.push(`  • ${coreStats.join(', ')}`);
    if (nutritionStats.length > 0) messageParts.push(`  • Nutrition: ${nutritionStats.join(', ')}`);
    if (safetyStats.length > 0) messageParts.push(`  • Safety: ${safetyStats.join(', ')}`);
    if (personalHealthStats.length > 0)
        messageParts.push(`  • Personal Health: ${personalHealthStats.join(', ')}`);
    if (dutchStats.length > 0) messageParts.push(`  • Dutch: ${dutchStats.join(', ')}`);

    emit('done', {
        count: products.length,
        stats: enhancedStats,
        processingTimeSeconds: parseFloat(processingTime),
        message: messageParts.join('\n'),
    });
}