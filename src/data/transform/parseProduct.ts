import type { Product, Price } from './types.ts';
import { parseIngredients } from '../../../packages/parser/src/product/parse/parseIngredients.ts';
import { parseAllergens } from '../../../packages/parser/src/product/parse/parseAllergens.ts';
import { parseUnits } from '../../../packages/parser/src/product/parse/parseUnits.ts';
import { parseNutrition } from '../../../packages/parser/src/product/parse/parseNutrition.ts';
import { classify } from '../../../packages/parser/src/product/classify.ts';
import { computeNutritionalTags } from './compute/computeNutritionalTags.ts';
import { parseAdditives } from '../../../packages/parser/src/product/parse/parseAdditives.ts';
import type { StatsAccumulator } from '../../../packages/parser/src/stats.ts';

/**
 * Parse a single product from CSV record
 *
 * Extracts the core product parsing logic from transform-data.ts for testing
 */
export function parseProduct(record: Record<string, string>, stats?: StatsAccumulator): Product {
  // Build partial product from record
  const id = String(record.ProductId || record.id || record.ID || record.sku || '').trim();
  if (!id) {
    throw new Error('Product must have an ID');
  }

  const price: Price = {
    regular: parseFloat(record.PriceRegular || record.price_regular || record.price || '0') || 0,
    currency: 'USD',
  };
  const saleVal = record.PriceSale
    ? parseFloat(record.PriceSale)
    : record.price_sale
      ? parseFloat(record.price_sale)
      : undefined;
  if (saleVal && saleVal < price.regular) price.sale = saleVal;

  const ingParsed = parseIngredients(record.Ingredients || record.ingredients || '');

  const categories: string[] = [];
  for (let i = 1; i <= 6; i++) {
    const key = `Category${i}`;
    const val = record[key];
    if (val && val !== 'NA') categories.push(val);
  }

  const base: Product = {
    id,
    name: record.ProductName || record.name || record.product_name || 'Unknown',
    price,
    unit: parseUnits(record.ProductUnitSize || record.size || record.unit || '', stats),
    ingredients: ingParsed.tokens,
    allergens: (() => {
      const contained =
        record.ContainedAllergens && record.ContainedAllergens !== 'NA'
          ? record.ContainedAllergens
          : '';
      const may =
        record.MayContainAllergens && record.MayContainAllergens !== 'NA'
          ? record.MayContainAllergens
          : '';
      const combined = [contained && `Contains: ${contained}`, may && `May contain: ${may}`]
        .filter(Boolean)
        .join('. ');
      return parseAllergens(combined, stats);
    })(),
    categories,
  };

  // Parse nutrition and compute classification once
  const nutrition = parseNutrition(record);
  const classification = classify({
    categories,
    ingredients: ingParsed.tokens,
  });

  // Add nutrition and flags to base product
  base.nutrition = nutrition;
  base.flags = {
    isFood: classification.flags.isFood,
    isPetFood: classification.flags.isPetFood,
    addedSugarFlag: ingParsed.flags.addedSugarFlag,
    addedSaltFlag: ingParsed.flags.addedSaltFlag,
    artificialSweetenersFlag: ingParsed.flags.artificialSweetenersFlag,
  };
  base.added = ingParsed.added || {};
  base.duplicate_conflicts = [];
  if (ingParsed.added?.sugarsPer100 !== undefined) {
    (base as Product & { addedSugarsPer100?: number }).addedSugarsPer100 =
      ingParsed.added.sugarsPer100;
  }

  // Add nutritional tags for food products only
  if (classification.flags.isFood && base.nutrition) {
    base.nutritionalTags = computeNutritionalTags(base.nutrition, base.ingredients, base.allergens);
  }

  // Add additive analysis for food products
  if (classification.flags.isFood) {
    const ingredientList = base.ingredients && base.ingredients.length > 0 ? base.ingredients : [];
    const additiveResult = parseAdditives(ingredientList);
    base.additiveInfo = additiveResult.additiveInfo;
    base.additiveFlags = additiveResult.additiveFlags;
  }

  return base;
}
