import type { Product } from "@picklist/types";
import { emit } from "../utils/emit.ts";
import { applyPercentileRanking } from "../utils/enhanceWithDualScoring.ts";
import { stats } from "../utils/stats.ts";

export function scoreProducts(products: Product[]) {
    emit('scoring-start', {
        message:
            'Applying enhanced scoring pipeline with personal health and body recomposition extensions',
    });

    const productsWithPercentiles = applyPercentileRanking(products);

    const scoredProductsCount = products.filter((p) => p.nutriScore !== undefined).length;
    const halalProducts = products.filter((p) => p.halalCheck).length;
    const proteinProducts = products.filter((p) => p.proteinOptimization).length;
    const satietyProducts = products.filter((p) => p.satietyAnalysis).length;
    const postWorkoutProducts = products.filter((p) => p.postWorkoutOptimization).length;
    const fatLossProducts = products.filter((p) => p.fatLossCompatibility).length;
    const efficiencyProducts = products.filter((p) => p.enhancedCalorieEfficiency).length;
    const contextProducts = products.filter((p) => p.bodyCompositionContext).length;

    emit('scoring-complete', {
        scored: scoredProductsCount,
        total: products.length,
        halal: halalProducts,
        protein: proteinProducts,
        satiety: satietyProducts,
        postWorkout: postWorkoutProducts,
        fatLoss: fatLossProducts,
        efficiency: efficiencyProducts,
        context: contextProducts,
        message: `Enhanced scoring complete: ${scoredProductsCount}/${products.length} nutrition, ${halalProducts} halal, ${proteinProducts} protein, ${satietyProducts} satiety, ${postWorkoutProducts} post-workout, ${fatLossProducts} fat-loss, ${efficiencyProducts} efficiency, ${contextProducts} context`,
    });

    // sort products by nutriScore ascending (best first), then by name
    productsWithPercentiles.sort((a, b) => {
        if (a.globalHealthScore !== undefined && b.globalHealthScore !== undefined) {
            if (a.globalHealthScore !== b.globalHealthScore) {
                return a.globalHealthScore - b.globalHealthScore;
            }
        } else if (a.globalHealthScore !== undefined) {
            return -1; // a has score, b doesn't
        } else if (b.globalHealthScore !== undefined) {
            return 1; // b has score, a doesn't
        }
        return a.name.localeCompare(b.name);
    });

    return productsWithPercentiles
}
