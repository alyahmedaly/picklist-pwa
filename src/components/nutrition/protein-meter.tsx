import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, classify, nutrition, a11y } from "../../lib/utils";

const proteinMeterVariants = cva(
  "relative flex items-center justify-center font-medium transition-all duration-300",
  {
    variants: {
      variant: {
        default: "flex-col space-y-1",
        compact: "flex-row space-x-2 items-center",
        minimal: "inline-flex items-center space-x-1",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const meterBarVariants = cva(
  "relative overflow-hidden rounded-full bg-muted transition-all duration-300 ease-out",
  {
    variants: {
      size: {
        sm: "h-1.5 w-16",
        md: "h-2 w-20",
        lg: "h-3 w-24",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface ProteinMeterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof proteinMeterVariants> {
  /** Protein amount in grams */
  protein: number;
  /** Target protein for daily goal (defaults to 170g) */
  target?: number;
  /** Serving size in grams for per-100g calculation */
  servingSize?: number;
  /** Unit to display (defaults to 'g') */
  unit?: string;
  /** Show protein level indicator */
  showLevel?: boolean;
  /** Show target progress */
  showTarget?: boolean;
  /** Show per 100g calculation */
  showPer100g?: boolean;
  /** Show protein efficiency ratio */
  showRatio?: boolean;
  /** Calories for efficiency calculation */
  calories?: number;
  /** Enable fill animation */
  animated?: boolean;
  /** Display mode */
  mode?: 'default' | 'daily-progress' | 'per-100g';
}

const ProteinMeter = React.forwardRef<HTMLDivElement, ProteinMeterProps>(
  ({
    className,
    variant,
    size,
    protein,
    target = 170,
    servingSize,
    unit = 'g',
    showLevel = true,
    showTarget = false,
    showPer100g = false,
    showRatio = false,
    calories,
    animated = false,
    mode = 'default',
    ...props
  }, ref) => {
    // Calculate values
    const proteinPer100g = servingSize ? nutrition.per100g(protein, servingSize) : protein;
    const proteinLevel = classify.protein(proteinPer100g);
    const dailyProgress = nutrition.dailyProteinProgress(protein, target);
    const efficiency = calories ? nutrition.proteinEfficiency(protein, calories) : null;
    
    // Determine display values based on mode
    const displayProtein = mode === 'per-100g' ? proteinPer100g : protein;
    const displayProgress = mode === 'daily-progress' ? dailyProgress : (proteinPer100g / 30) * 100; // Max 30g as 100%
    
    // Color classes
    const levelColorClass = {
      low: 'text-[rgb(var(--color-protein-low))]',
      moderate: 'text-[rgb(var(--color-protein-moderate))]',
      high: 'text-[rgb(var(--color-protein-high))]',
    }[proteinLevel];
    
    const barColorClass = {
      low: 'bg-[rgb(var(--color-protein-low))]',
      moderate: 'bg-[rgb(var(--color-protein-moderate))]',
      high: 'bg-[rgb(var(--color-protein-high))]',
    }[proteinLevel];

    // ARIA labels
    const ariaLabel = mode === 'daily-progress' 
      ? `Daily protein progress: ${protein}g of ${target}g target, ${dailyProgress.toFixed(1)}% complete`
      : a11y.nutritionLabel(displayProtein, unit, 'Protein');
    
    const meterAriaProps = {
      role: 'meter' as const,
      'aria-label': ariaLabel,
      'aria-valuenow': Math.round(displayProtein),
      'aria-valuemin': 0,
      'aria-valuemax': mode === 'daily-progress' ? target : 50,
    };

    return (
      <div
        ref={ref}
        className={cn(proteinMeterVariants({ variant, size, className }))}
        data-testid="protein-meter"
        data-protein-level={proteinLevel}
        {...meterAriaProps}
        {...props}
      >
        {/* Protein Value Display */}
        <div className={cn("flex items-center space-x-1", levelColorClass)}>
          <span className="font-semibold">
            {nutrition.formatValue(displayProtein, unit)}
          </span>
          {showLevel && (
            <span className="text-xs opacity-75 capitalize">
              {proteinLevel}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className={cn(meterBarVariants({ size }))}>
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out",
              barColorClass,
              animated && "protein-meter-fill"
            )}
            style={{
              width: `${Math.min(displayProgress, 100)}%`,
            }}
          />
        </div>

        {/* Additional Information */}
        {variant !== 'minimal' && (
          <div className="flex flex-col space-y-1 text-xs text-muted-foreground">
            {showTarget && mode === 'daily-progress' && (
              <div data-testid="target-info">
                Target: {target}{unit} ({dailyProgress.toFixed(1)}%)
              </div>
            )}
            
            {showPer100g && servingSize && mode !== 'per-100g' && (
              <div>
                Per 100g: {nutrition.formatValue(proteinPer100g, unit)}
              </div>
            )}
            
            {showRatio && efficiency !== null && (
              <div>
                Efficiency: {efficiency.toFixed(2)}g/kcal
              </div>
            )}
          </div>
        )}

        {/* Screen reader additional context */}
        <span className="sr-only">
          Protein level: {proteinLevel}.
          {mode === 'daily-progress' && `Daily progress: ${dailyProgress.toFixed(1)}% of target.`}
          {efficiency && `Protein efficiency: ${efficiency.toFixed(2)} grams per calorie.`}
        </span>
      </div>
    );
  }
);

ProteinMeter.displayName = "ProteinMeter";

export { ProteinMeter, proteinMeterVariants };
