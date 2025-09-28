export interface AdditiveFlags {
  // Safety warnings (mandatory by EU regulations)
  requiresChildWarning: boolean;
  containsAllergenicAdditives: boolean;
  requiresPKUWarning: boolean;
  mayWorsenAsthmaEczema: boolean;

  // Dietary restrictions
  hasAnimalDerivedAdditives: boolean;
  organicCompatible: boolean;

  // Consumer preferences
  hasPreservatives: boolean;
  hasArtificialColors: boolean;
  hasArtificialSweeteners: boolean;
  hasFlavorEnhancers: boolean;

  // Clean label indicators
  hasNaturalAlternatives: boolean;
  allNaturalAdditives: boolean;
}
