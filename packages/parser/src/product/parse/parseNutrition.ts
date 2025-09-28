import type { CSVRow } from '../../types.ts';
import type { Nutrition } from '@picklist/types';

/**
 * Parses Dutch CSV nutritional columns into normalized Nutrition with unit context.
 *
 * Handles:
 * - Dutch column names: "Energie (kcal)", "Koolhydraten", "Voedingsvezel", etc.
 * - Decimal comma normalization: "12,5" → 12.5
 * - Inequality formats: "< 0,1", "≤ 1,5" → numeric values
 * - Missing/empty values: "", "NA" → undefined
 * - Unit context: Values are per 100g (Dutch food labeling standard)
 */
export function parseNutrition(record: CSVRow): Nutrition {
  // Helper function to parse Dutch decimal format
  const parseValue = (value: string | undefined): number | undefined => {
    if (!value || value === '' || value.toUpperCase() === 'NA') {
      return undefined;
    }

    // Handle inequality formats: "< 0,1", "≤ 1,5", "<0,5"
    const inequalityMatch = value.match(/^[<≤]\s*([\d,]+)$/);
    if (inequalityMatch && inequalityMatch[1]) {
      value = inequalityMatch[1];
    }

    // Normalize decimal comma to dot
    const normalized = value.replace(',', '.');
    const parsed = parseFloat(normalized);

    return isNaN(parsed) ? undefined : parsed;
  };

  // Create Nutrition object with unit context - only assign defined values
  const nutrition: Nutrition = {
    unit: 'per 100g',
  };

  const kcal = parseValue(record['Energie (kcal)']);
  if (kcal !== undefined) nutrition.kcal = kcal;

  const kJ = parseValue(record['Energie (kJ)']);
  if (kJ !== undefined) nutrition.kJ = kJ;

  const fat = parseValue(record['Vet']);
  if (fat !== undefined) nutrition.fat = fat;

  const satFat = parseValue(record['waarvan verzadigd']);
  if (satFat !== undefined) nutrition.satFat = satFat;

  const carbs = parseValue(record['Koolhydraten']);
  if (carbs !== undefined) nutrition.carbs = carbs;

  const sugars = parseValue(record['waarvan suikers']);
  if (sugars !== undefined) nutrition.sugars = sugars;

  const fiber = parseValue(record['Voedingsvezel']);
  if (fiber !== undefined) nutrition.fiber = fiber;

  const protein = parseValue(record['Eiwitten']);
  if (protein !== undefined) nutrition.protein = protein;

  const salt = parseValue(record['Zout']);
  if (salt !== undefined) nutrition.salt = salt;

  return nutrition;
}
