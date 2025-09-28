import type { Flags } from "../product/Flags.ts";
import type { IngredientInfo } from "../product/IngredientInfo.ts";


export interface ParsedIngredients {
  raw: string;
  tokens: string[];
  flags: Pick<Flags, 'addedSugarFlag' | 'addedSaltFlag' | 'artificialSweetenersFlag'>;
  added?: {
    sugarsPer100?: number;
    saltPer100?: number;
  };
  ingredientInfo: IngredientInfo;
  parsed: string[];
  addedSugar: boolean;
  addedSalt: boolean;
  preservatives: string[];
  conflicts: string[];
}
