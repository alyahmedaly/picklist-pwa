// Scoring & analysis related types

export interface HalalAnalysis {
  status: 'halal' | 'haram' | 'questionable' | 'unknown';
  flags: {
    hasAnimalGelatine: boolean;
    hasAlcohol: boolean;
    hasPork: boolean;
    hasNonHalalMeat: boolean;
    hasDoubtfulAdditives: boolean;
  };
  details: {
    problematicIngredients: string[];
    eNumberConcerns: string[];
    alcoholContent?: number;
  };
  confidence: 'high' | 'medium' | 'low';
}
