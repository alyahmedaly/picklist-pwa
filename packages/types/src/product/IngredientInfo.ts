/** Structured ingredient information with core/additives separation */

export interface IngredientInfo {
  /** Core food ingredients (non-additive) */
  core: string[];
  /** E-number additives found in ingredients */
  additives: string[];
  /** Special statements (added sugar/salt warnings) */
  statements: string[];
  /** Total ingredient count */
  total: number;
}
