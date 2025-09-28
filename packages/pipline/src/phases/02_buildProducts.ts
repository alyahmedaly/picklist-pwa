import { convertCSVToProduct, createCSVRow, type CSVRow } from "@picklist/parser";
import type { Product } from "@picklist/types";
import { stats } from "../utils/stats.ts";

export function buildProductsPipeline(matrix: string[][], headers: (keyof CSVRow)[]) {
 const productsMap = new Map<string, Product>();
  for (const row of matrix) {
    const csvRow = createCSVRow(headers, row);
    const product = convertCSVToProduct(csvRow, stats);

    // Build partial product from CSV row (simplified: id, name, price fields, ingredients, allergens, categories, unit)
    if (!product.id) {
      stats.recordSkippedRow('missing_id', csvRow as Record<string, unknown>);
      continue;
    }

    productsMap.set( product.id, product);
    stats.ingestRow(product as unknown as Record<string, unknown>);
  }

  return { productsMap };
}
