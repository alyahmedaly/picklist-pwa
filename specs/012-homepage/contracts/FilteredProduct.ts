/**
 * FilteredProduct Interface Contract
 *
 * Product entity optimized for Ali's filtering system with comprehensive nutrition scoring.
 * Represents products that have passed Ali's filter criteria (halal, protein, context-specific).
 */

export interface FilteredProduct {
  /** Unique product identifier */
  id: string;

  /** Product display name */
  name: string;

  /** Food category for grouping and navigation */
  category: string;

  /** Dutch market pricing information */
  price: {
    /** Price per 100g in euros */
    regular: number;
    /** Currency (always EUR for Dutch market) */
    currency: 'EUR';
    /** Optional price per realistic serving size */
    pricePerServing?: number;
  };

  /** Ali's protein optimization metrics */
  proteinOptimization: {
    /** Protein content per 100g */
    proteinContent: number;
    /** Contribution percentage to Ali's 170g daily target */
    proteinContribution: number;
    /** Protein density score (0-100) */
    proteinDensityScore: number;
    /** Protein per euro efficiency ratio */
    proteinEfficiency: number;
  };

  /** Halal compliance validation (strict for Ali) */
  halalCheck: {
    /** Halal status - only 'halal' appears in Ali's filtered outputs */
    status: 'halal' | 'questionable' | 'haram';
    /** Confidence level in halal determination (0-100) */
    confidence: number;
    /** Reasoning for halal classification */
    reasons: string[];
  };

  /** Post-workout recovery optimization (when applicable) */
  postWorkoutOptimization?: {
    /** Carb to protein ratio (optimal 2.0-4.0 for CrossFit) */
    carbProteinRatio: number;
    /** Post-workout recovery score (0-100) */
    postWorkoutScore: number;
    /** Glycemic index boost factor for glycogen replenishment */
    glycemicBoost: number;
    /** Recovery timing window classification */
    recoveryWindow: 'immediate' | 'moderate' | 'extended';
  };

  /** Fat loss compatibility metrics (when applicable) */
  fatLossCompatibility?: {
    /** Calorie density per 100g */
    calorieDensity: number;
    /** Satiety efficiency per calorie */
    satietyEfficiency: number;
    /** Volume advantage for fullness sensation */
    volumeAdvantage: number;
  };

  /** Global health scoring (EU Nutri-Score + AliScore) */
  globalHealthScore: number;
  globalHealthGrade: 'A' | 'B' | 'C' | 'D' | 'E';
  categoryHealthScore: number;
  categoryHealthGrade: 'A' | 'B' | 'C' | 'D' | 'E';
}

/**
 * Static data contract for FilteredProduct loading
 */
export interface FilteredProductLoader {
  /** Load products for specific filter category */
  loadProductsForFilter(categoryId: string): Promise<FilteredProduct[]>;

  /** Load product index for quick search */
  loadProductIndex(categoryId: string): Promise<ProductSearchIndex>;

  /** Load filter statistics */
  loadFilterStats(categoryId: string): Promise<FilterStats>;
}

/**
 * Product search index for performance optimization
 */
export interface ProductSearchIndex {
  [productId: string]: {
    name: string;
    category: string;
    proteinScore: number;
    healthGrade: string;
    price: number;
  };
}

/**
 * Filter statistics for coverage and performance insights
 */
export interface FilterStats {
  totalProducts: number;
  averageProtein: number;
  averagePrice: number;
  healthGradeDistribution: Record<string, number>;
  categoryBreakdown: Record<string, number>;
}