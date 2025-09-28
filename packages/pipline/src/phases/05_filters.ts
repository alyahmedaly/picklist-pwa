import type { FilterCombination, Product } from "@picklist/types";
import { createAliFilterCombinations } from "../utils/aliFilterProfiles.ts";
import { generateMultipleOutputs } from "@picklist/output";
import { emit } from "../utils/emit.ts";

export async function filterOutputs(products: Product[], outDir: string) {
    const combinations: FilterCombination[] = [];
    const aliCombinations = createAliFilterCombinations();
    combinations.push(...aliCombinations);

    emit('generating-filtered-outputs', {
        message: `Generating ${combinations.length} Ali filter combinations in grouped structure`,
        profiles: combinations.map(c => c.name),
    });

    const filteredOutputs = await generateMultipleOutputs(products, combinations, {
        outputDir: outDir,
        generateIndex: true,
        generateStats: true,
        format: 'standard' as const,
    });

    emit('filtered-outputs', {
        count: filteredOutputs.length,
        message: `Generated ${filteredOutputs.length} filtered output files in filtered/ali/ directory`,
    });

    for (const output of filteredOutputs) {
        // Calculate coverage percentage from existing FilterStatistics structure
        const coveragePercentage = output.statistics.originalCount > 0
            ? (output.statistics.filteredCount / output.statistics.originalCount) * 100
            : 0;

        emit('filter-result', {
            filterName: output.filterName,
            products: output.products.length,
            coverage: coveragePercentage,
            message: `${output.filterName}: ${output.products.length} products (${coveragePercentage.toFixed(1)}% coverage)`,
        });
    }

    return filteredOutputs;
}