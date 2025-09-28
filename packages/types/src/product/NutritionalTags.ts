export interface NutritionalTags {
  netCarbs?: number;
  netCarbsBucket?: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  lowCarb?: boolean;
  highProtein?: boolean;
  proteinDensity?: 'low' | 'moderate' | 'high';
  highFiber?: boolean;
  lactoseFree?: boolean;
  glutenFree?: boolean;
  vegan?: boolean;
  vegetarian?: boolean;
  plantBased?: boolean;
}
