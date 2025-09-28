export interface AdditiveInfo {
  // Core identification
  eNumbers: string[];
  dutchCategories: string[];
  functionalCategories: string[];

  // Detection metadata
  totalAdditives: number;
  naturalAdditives: string[];
  syntheticAdditives: string[];

  // Specific additive collections by function
  preservatives: string[];
  colors: string[];
  antioxidants: string[];
  stabilizers: string[];
  sweeteners: string[];
  flavorEnhancers: string[];
}
