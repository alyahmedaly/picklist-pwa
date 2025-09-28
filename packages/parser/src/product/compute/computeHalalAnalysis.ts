import type { HalalAnalysis } from '@picklist/types';

/**
 * Analyze product for Halal compliance based on ingredients and E-numbers
 *
 * Implements Islamic dietary guidelines with conservative approach for uncertain cases.
 * Leverages existing E-number database and ingredient parsing utilities.
 *
 * @param input - Object containing ingredients string and eNumbers array
 * @returns HalalAnalysis object with status, flags, details, and confidence
 *
 * @example
 * ```typescript
 * const analysis = computeHalalAnalysis({
 *   ingredients: "kipfilet, zout, kruiden",
 *   eNumbers: ["E300"]
 * });
 * // Returns: { status: 'halal', flags: {...}, details: {...}, confidence: 'high' }
 * ```
 */
export function computeHalalAnalysis(input: {
  ingredients: string;
  eNumbers: string[];
}): HalalAnalysis {
  // Initialize result structure
  const flags = {
    hasAnimalGelatine: false,
    hasAlcohol: false,
    hasPork: false,
    hasNonHalalMeat: false,
    hasDoubtfulAdditives: false,
  };

  const details: {
    problematicIngredients: string[];
    eNumberConcerns: string[];
    alcoholContent?: number;
  } = {
    problematicIngredients: [],
    eNumberConcerns: [],
  };

  const { ingredients, eNumbers } = input;

  // Handle empty or insufficient data
  if (!ingredients || ingredients.trim().length === 0) {
    return {
      status: 'unknown',
      flags,
      details,
      confidence: 'low',
    };
  }

  const ingredientList = ingredients.toLowerCase().trim();

  // Pork detection (Dutch and English terms) - using word boundary matching
  const porkTerms = [
    'varkensvlees',
    'varken',
    'spek',
    'bacon',
    'ham',
    'pork',
    // Additional Dutch pork products
    'worst',
    'salami',
    'chorizo',
    'pancetta',
    'prosciutto',
    // Compound pork terms
    'varkensspek',
    'varkensvet',
    'varkensworst',
    'varkensham',
    // Processed pork products
    'rookworst',
    'metworst',
    'leverworst',
  ];
  for (const term of porkTerms) {
    // Use word boundary regex to match whole words only
    const wordBoundaryRegex = new RegExp(
      `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'i',
    );
    if (wordBoundaryRegex.test(ingredientList)) {
      flags.hasPork = true;
      details.problematicIngredients.push(term);
    }
  }

  // Alcohol detection (Dutch terms) - using word boundary matching to avoid false positives
  const alcoholTerms = [
    'alcohol',
    'ethanol',
    'wijn',
    'bier',
    // Spirits and liquors
    'rum',
    'whisky',
    'whiskey',
    'cognac',
    'brandy',
    'vodka',
    'gin',
    // Dutch alcoholic beverages
    'jenever',
    'advocaat',
    'sherry',
    'port',
    'madeira',
    // Alcohol-based extracts and flavorings
    'vanille-extract',
    'rumextract',
    'brandyextract',
    'alcoholextract',
    // Wine and beer variants
    'rode wijn',
    'witte wijn',
    'champagne',
    'prosecco',
    'pils',
    'lager',
  ];
  for (const term of alcoholTerms) {
    // Use word boundary regex to match whole words only, avoiding false positives like "rum" in "durumtarwegriesmeel"
    const wordBoundaryRegex = new RegExp(
      `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'i',
    );
    if (wordBoundaryRegex.test(ingredientList)) {
      flags.hasAlcohol = true;
      details.problematicIngredients.push(term);

      // Try to extract alcohol percentage
      const percentMatch = ingredientList.match(
        new RegExp(
          `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s]*([0-9]+[.,]?[0-9]*)\\s*%`,
          'i',
        ),
      );
      if (percentMatch && percentMatch[1]) {
        const percentage = parseFloat(percentMatch[1].replace(',', '.'));
        details.alcoholContent = percentage;
      }
    }
  }

  // Gelatin detection with source analysis
  const gelatinTerms = ['gelatine', 'gelatina'];
  const halalGelatinSources = [
    'visgelatine',
    'rundgelatine',
    'halal gelatine',
    'halal gecertificeerd',
  ];
  const haramGelatinSources = ['varkensgelatine', 'pork gelatin'];

  let gelatinDetected = false;
  let isHalalGelatin = false;
  let isHaramGelatin = false;

  for (const term of gelatinTerms) {
    // Use word boundary regex to match whole words only
    const wordBoundaryRegex = new RegExp(
      `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'i',
    );
    if (wordBoundaryRegex.test(ingredientList)) {
      gelatinDetected = true;
      details.problematicIngredients.push(term);
    }
  }

  // Check for specific gelatin sources
  for (const source of halalGelatinSources) {
    // For compound terms like "visgelatine", use word boundary matching
    const wordBoundaryRegex = new RegExp(
      `\\b${source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'i',
    );
    if (wordBoundaryRegex.test(ingredientList)) {
      isHalalGelatin = true;
      break;
    }
  }

  for (const source of haramGelatinSources) {
    // For compound terms like "varkensgelatine", use word boundary matching
    const wordBoundaryRegex = new RegExp(
      `\\b${source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'i',
    );
    if (wordBoundaryRegex.test(ingredientList)) {
      isHaramGelatin = true;
      flags.hasPork = true; // Pork gelatin is also pork
      details.problematicIngredients.push(source); // Add the haram gelatin source to problematic ingredients
      break;
    }
  }

  if (gelatinDetected && !isHalalGelatin) {
    flags.hasAnimalGelatine = true;
  }

  // E-number analysis for Halal concerns
  const halalProblematicENumbers = [
    'E120', // Cochineal (insect-derived)
    'E441', // Gelatin (potentially pork-derived)
    'E542', // Bone phosphate
    'E631', // Disodium inosinate (potentially non-halal)
    'E635', // Disodium ribonucleotides (potentially non-halal)
    // Additional insect-derived colors
    'E904', // Shellac (insect-derived)
    // Additional animal enzymes
    'E1105', // Lysozyme (from egg whites, potential animal source)
  ];

  const doubtfulENumbers = [
    'E471', // Mono/diglycerides (can be animal-derived)
    'E472a',
    'E472b',
    'E472c',
    'E472d',
    'E472e',
    'E472f', // Fatty acid esters
    'E481',
    'E482', // Sodium/calcium stearoyl lactylates
    'E570', // Fatty acids (can be animal-derived)
    // Additional questionable lecithins and emulsifiers
    'E322', // Lecithin (can be from various sources)
    'E476', // Polyglycerol polyricinoleate (can be animal-derived)
    // Sorbitan esters (can be animal-derived)
    'E491',
    'E492',
    'E493',
    'E494',
    'E495',
    'E496',
    // Additional fatty acid derivatives
    'E473',
    'E474',
    'E475', // Sucrose esters
    'E477', // Propylene glycol esters
    'E479b', // Thermally oxidized soya bean oil
    'E483', // Stearyl tartrate
    // Waxes and coatings (can be animal-derived)
    'E901', // Beeswax
    'E902', // Candelilla wax (plant-based but processed with animal products)
    'E903', // Carnauba wax (plant-based but processed with animal products)
  ];

  for (const eNumber of eNumbers) {
    if (halalProblematicENumbers.includes(eNumber)) {
      if (eNumber === 'E441') {
        flags.hasAnimalGelatine = true;
      } else {
        flags.hasDoubtfulAdditives = true;
      }
      details.eNumberConcerns.push(eNumber);
    } else if (doubtfulENumbers.includes(eNumber)) {
      flags.hasDoubtfulAdditives = true;
      details.eNumberConcerns.push(eNumber);
    }
  }

  // Non-halal meat detection (context-dependent)
  // Conservative approach: only flag if clearly non-halal
  const nonHalalMeatTerms = ['varkensvlees', 'spek', 'bacon', 'ham'];
  for (const term of nonHalalMeatTerms) {
    // Use word boundary regex to match whole words only
    const wordBoundaryRegex = new RegExp(
      `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'i',
    );
    if (wordBoundaryRegex.test(ingredientList)) {
      flags.hasNonHalalMeat = true;
      // Already captured in problematicIngredients above
    }
  }

  // Determine status based on flags
  let status: HalalAnalysis['status'];
  if (flags.hasPork || flags.hasAlcohol || isHaramGelatin || flags.hasNonHalalMeat) {
    status = 'haram';
  } else if (flags.hasDoubtfulAdditives || (flags.hasAnimalGelatine && !isHalalGelatin)) {
    // Conservative approach: questionable if uncertain
    status = 'questionable';
  } else if (ingredientList.length > 10 && eNumbers.length >= 0) {
    // Sufficient data for analysis
    status = 'halal';
  } else {
    status = 'unknown';
  }

  // Enhanced confidence scoring algorithm
  let confidence: HalalAnalysis['confidence'];

  // Data quality indicators
  const hasSubstantialIngredients = ingredientList.length > 30;
  const hasModerateIngredients = ingredientList.length > 15;
  const hasENumberData = eNumbers.length > 0;
  const hasExplicitSources = isHalalGelatin || isHaramGelatin;

  // Violation clarity indicators
  const hasClearViolation = flags.hasPork || flags.hasAlcohol || isHaramGelatin;
  const hasSpecificDetection =
    details.problematicIngredients.length > 0 || details.eNumberConcerns.length > 0;
  const hasOnlyDoubtfulAdditives = flags.hasDoubtfulAdditives && !hasClearViolation;

  // Enhanced confidence determination
  if (hasClearViolation && (hasSubstantialIngredients || hasExplicitSources)) {
    confidence = 'high'; // Clear violation with good data
  } else if (hasClearViolation && hasModerateIngredients) {
    confidence = 'high'; // Clear violation with moderate data
  } else if (status === 'halal' && hasSubstantialIngredients && hasENumberData) {
    confidence = 'high'; // Clean product with comprehensive data
  } else if (hasSpecificDetection || hasExplicitSources) {
    confidence = 'high'; // Specific ingredient-level detection
  } else if (hasOnlyDoubtfulAdditives && hasSubstantialIngredients) {
    confidence = 'medium'; // Only E-number concerns with good ingredient data
  } else if (hasModerateIngredients || hasENumberData) {
    confidence = 'medium'; // Moderate data quality
  } else {
    confidence = 'low'; // Insufficient data for reliable classification
  }

  // Special handling for alcohol content <0.5% (naturally occurring)
  if (flags.hasAlcohol && details.alcoholContent !== undefined && details.alcoholContent < 0.5) {
    // Some Islamic scholars allow <0.5% naturally occurring alcohol
    status = 'questionable';
    confidence = 'medium';
  }

  return {
    status,
    flags,
    details,
    confidence,
  };
}
