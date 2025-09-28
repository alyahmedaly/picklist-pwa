import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { cn } from "../../lib/utils";

const nutritionCardVariants = cva(
  "nutrition-card",
  {
    variants: {
      variant: {
        default: "",
        compact: "nutrition-compact",
        scannable: "nutrition-scannable",
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
      layout: {
        default: "",
        "mobile-compact": "mobile-stack-dense",
        "mobile-priority": "mobile-stack",
        responsive: "mobile-stack md:nutrition-grid",
        grid: "nutrition-grid",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      layout: "default",
    },
  }
);

export interface Nutrition {
  protein?: number | null;
  calories?: number | null;
  carbs?: number | null;
  fat?: number | null;
  fiber?: number | null;
  sodium?: number | null;
  sugar?: number | null;
  saturatedFat?: number | null;
}

export interface NutritionCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof nutritionCardVariants> {
  /** Nutrition data to display */
  nutrition?: Nutrition;
  /** Serving size in grams */
  servingSize?: number;
  /** Nutrients to highlight */
  highlight?: (keyof Nutrition)[];
  /** Show per 100g calculations */
  showPer100g?: boolean;
  /** Show protein efficiency */
  showProteinEfficiency?: boolean;
  /** Show macro distribution */
  showMacroDistribution?: boolean;
  /** Daily values for percentage calculations */
  dailyValues?: Partial<Record<keyof Nutrition, number>>;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string;
}

const NutritionCard = React.forwardRef<HTMLDivElement, NutritionCardProps>(
  ({
    className,
    variant,
    size,
    layout,
    nutrition = {},
    servingSize = 100,
    highlight = [],
    showPer100g = false,
    showProteinEfficiency = false,
    showMacroDistribution = false,
    dailyValues = { protein: 170 }, // Ali's 170g protein target
    loading = false,
    error,
    ...props
  }, ref) => {
    // Loading state
    if (loading) {
      return (
        <Card ref={ref} className={cn(nutritionCardVariants({ variant, size, layout, className }))} {...props}>
          <CardContent className="p-4">
            <div className="nutrition-grid gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton height="12px" width="60px" />
                  <Skeleton height="20px" width="40px" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Error state
    if (error) {
      return (
        <Card ref={ref} className={cn(nutritionCardVariants({ variant, size, layout, className }))} {...props}>
          <CardContent className="p-4 text-center text-destructive">
            <p>{error}</p>
          </CardContent>
        </Card>
      );
    }

    // Calculate values
    const displayNutrition = showPer100g && servingSize !== 100
      ? Object.entries(nutrition).reduce((acc, [key, value]) => {
          acc[key as keyof Nutrition] = value ? (value / servingSize) * 100 : null;
          return acc;
        }, {} as Nutrition)
      : nutrition;

    // Calculate protein efficiency if both protein and calories are available
    const proteinEfficiency = (displayNutrition.protein && displayNutrition.calories)
      ? displayNutrition.protein / displayNutrition.calories
      : null;

    // Calculate macro distribution
    const macroDistribution = React.useMemo(() => {
      const { protein, carbs, fat, calories } = displayNutrition;
      if (!protein || !carbs || !fat || !calories) return null;

      const proteinCals = protein * 4;
      const carbsCals = carbs * 4;
      const fatCals = fat * 9;
      const totalMacroCals = proteinCals + carbsCals + fatCals;

      return {
        protein: (proteinCals / totalMacroCals) * 100,
        carbs: (carbsCals / totalMacroCals) * 100,
        fat: (fatCals / totalMacroCals) * 100,
      };
    }, [displayNutrition]);

    // Nutrition items configuration
    const nutritionItems = [
      { key: 'protein', label: 'Protein', unit: 'g', priority: 1 },
      { key: 'calories', label: 'Calories', unit: 'kcal', priority: 1 },
      { key: 'carbs', label: 'Carbs', unit: 'g', priority: 2 },
      { key: 'fat', label: 'Fat', unit: 'g', priority: 2 },
      { key: 'fiber', label: 'Fiber', unit: 'g', priority: 3 },
      { key: 'sodium', label: 'Sodium', unit: 'mg', priority: 3 },
    ] as const;

    // Filter items based on layout
    const visibleItems = layout === 'mobile-priority'
      ? nutritionItems.filter(item => item.priority === 1 || displayNutrition[item.key as keyof Nutrition] !== null)
      : nutritionItems.filter(item => displayNutrition[item.key as keyof Nutrition] !== null);

    return (
      <Card
        ref={ref}
        className={cn(nutritionCardVariants({ variant, size, layout, className }))}
        data-testid="nutrition-card"
        role="region"
        aria-label="Nutrition information"
        {...props}
      >
        <CardContent className="p-4">
          {/* Main nutrition grid */}
          <div className={cn(
            "grid gap-3",
            layout === 'grid' ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "nutrition-grid"
          )}>
            {visibleItems.map(({ key, label, unit }) => {
              const value = displayNutrition[key as keyof Nutrition];
              if (value === null || value === undefined) return null;

              const isHighlighted = highlight.includes(key as keyof Nutrition);
              const dailyValue = dailyValues[key as keyof Nutrition];
              const dailyPercentage = dailyValue ? (value / dailyValue) * 100 : null;

              return (
                <div
                  key={key}
                  className={cn(
                    "flex flex-col space-y-1 p-2 rounded",
                    isHighlighted && "bg-accent ring-1 ring-primary/20"
                  )}
                  data-testid={`nutrient-${key}`}
                >
                  <span className="text-xs text-muted-foreground font-medium">
                    {label}
                  </span>
                  <span className={cn(
                    "font-semibold",
                    isHighlighted && "nutrition-highlight"
                  )}>
                    {value.toFixed(1)}{unit}
                  </span>
                  {dailyPercentage && (
                    <span className="text-xs text-muted-foreground">
                      {dailyPercentage.toFixed(0)}% DV
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Additional information */}
          {(showProteinEfficiency || showMacroDistribution || showPer100g) && (
            <div className="mt-4 pt-3 border-t border-border space-y-2">
              {showProteinEfficiency && proteinEfficiency && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Protein Efficiency:</span>
                  <span className="font-medium">{proteinEfficiency.toFixed(2)}g/kcal</span>
                </div>
              )}
              
              {showMacroDistribution && macroDistribution && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Macro Distribution:</p>
                  <div className="flex text-xs space-x-4">
                    <span>P: {macroDistribution.protein.toFixed(0)}%</span>
                    <span>C: {macroDistribution.carbs.toFixed(0)}%</span>
                    <span>F: {macroDistribution.fat.toFixed(0)}%</span>
                  </div>
                </div>
              )}
              
              {showPer100g && servingSize !== 100 && (
                <p className="text-xs text-muted-foreground">
                  Values shown per 100g (serving: {servingSize}g)
                </p>
              )}
            </div>
          )}
        </CardContent>

        {/* Screen reader summary */}
        <span className="sr-only">
          Nutrition summary: 
          {displayNutrition.protein && `Protein ${displayNutrition.protein}g, `}
          {displayNutrition.calories && `Calories ${displayNutrition.calories}, `}
          {displayNutrition.carbs && `Carbohydrates ${displayNutrition.carbs}g, `}
          {displayNutrition.fat && `Fat ${displayNutrition.fat}g`}
          {proteinEfficiency && `. Protein efficiency: ${proteinEfficiency.toFixed(2)} grams per calorie`}
        </span>
      </Card>
    );
  }
);

NutritionCard.displayName = "NutritionCard";

export { NutritionCard, nutritionCardVariants };
