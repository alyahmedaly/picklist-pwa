// Filtering related types
export interface HalalFilterCriteria {
  strict: boolean;
  excludeAlcohol?: boolean;
  excludeGelatine?: boolean;
  additiveWhitelist?: string[];
}
