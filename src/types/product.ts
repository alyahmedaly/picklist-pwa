
export interface Nutrition {
  unit?: string;
  kcal?: number;
  kJ?: number;
  fat?: number;
  satFat?: number;
  carbs?: number;
  sugars?: number;
  fiber?: number;
  protein?: number;
  salt?: number;
}

export interface Product {
  id: string;
  name: string;
  price?: { regular: number; currency: string };
  ingredients?: string[];
  allergens?: { contains: string[]; mayContain?: string[] };
  categories?: string[];
  unit?: { raw?: string; amount?: number; amountUnit?: string; [k: string]: unknown };
  nutrition?: Nutrition;
  nutriScore?: number;
  warnings?: string[];
  globalHealthGrade?: string;
  halalCheck?: { status?: string; confidence?: string; flags?: Record<string, boolean> };
  nutritionalTags?: { vegan?: boolean; vegetarian?: boolean; highProtein?: boolean; [k: string]: unknown };
  additiveInfo?: { totalAdditives?: number; eNumbers?: string[]; [k: string]: unknown };
  // Allow any additional fields from the JSONL
  [key: string]: unknown;
}
