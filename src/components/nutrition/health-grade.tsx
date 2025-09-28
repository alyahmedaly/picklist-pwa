import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, classify, a11y } from "../../lib/utils";
import { Skeleton } from "../ui/skeleton";

const healthGradeVariants = cva(
  "inline-flex items-center justify-center font-bold transition-all duration-200 ease-out cursor-default",
  {
    variants: {
      variant: {
        default: "rounded-full",
        compact: "rounded px-2 py-1",
        badge: "rounded-full border-2 border-white shadow-sm",
        minimal: "rounded-sm",
      },
      size: {
        xs: "h-4 w-4 text-xs",
        sm: "h-6 w-6 text-sm",
        md: "h-8 w-8 text-base",
        lg: "h-10 w-10 text-lg",
        xl: "h-12 w-12 text-xl",
      },
      responsive: {
        true: "h-4 w-4 text-xs sm:h-6 sm:w-6 sm:text-sm md:h-8 md:w-8 md:text-base",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      responsive: false,
    },
  }
);

export type Grade = 'A' | 'B' | 'C' | 'D' | 'E';

export interface HealthGradeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof healthGradeVariants> {
  /** Health grade (A-E) */
  grade: Grade | null;
  /** Numeric score (0-100) */
  score?: number;
  /** Show score alongside grade */
  showScore?: boolean;
  /** Context for scoring (global vs category) */
  context?: 'global' | 'category';
  /** Category grade for comparison */
  categoryGrade?: Grade;
  /** Category score for comparison */
  categoryScore?: number;
  /** EU Nutri-Score base calculation */
  nutriScore?: number;
  /** Show EU Nutri-Score */
  showNutriScore?: boolean;
  /** Improvement suggestions */
  suggestions?: string[];
  /** Comparison mode */
  mode?: 'default' | 'comparison';
  /** Comparison target grade */
  compareToGrade?: Grade;
  /** Comparison target score */
  compareToScore?: number;
  /** Enable animation */
  animated?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Click handler */
  onClick?: () => void;
}

const HealthGrade = React.forwardRef<HTMLDivElement, HealthGradeProps>(
  ({
    className,
    variant,
    size,
    responsive,
    grade,
    score,
    showScore = false,
    context = 'global',
    categoryGrade,
    categoryScore,
    nutriScore,
    showNutriScore = false,
    suggestions = [],
    mode = 'default',
    compareToGrade,
    compareToScore,
    animated = false,
    loading = false,
    onClick,
    ...props
  }, ref) => {
    // Loading state
    if (loading) {
      return (
        <Skeleton
          ref={ref}
          className={cn(healthGradeVariants({ variant, size, responsive, className }))}
          shape="circle"
          {...props}
        />
      );
    }

    // Handle null/missing grade
    if (!grade) {
      return (
        <div
          ref={ref}
          className={cn(
            healthGradeVariants({ variant, size, responsive }),
            "bg-muted text-muted-foreground",
            className
          )}
          data-testid="health-grade"
          role="img"
          aria-label="Health grade: unknown"
          {...props}
        >
          ?
        </div>
      );
    }

    // Grade styling
    const gradeColorClass = classify.healthGrade(grade);
    
    // ARIA labels
    const ariaLabel = a11y.healthGradeLabel(grade, score);
    const fullAriaLabel = context === 'global' && categoryGrade
      ? `${ariaLabel}. Category grade: ${categoryGrade}`
      : ariaLabel;

    // Animation classes
    const animationClass = animated ? "fade-in" : "";

    // Interactive behavior
    const isClickable = Boolean(onClick);
    const interactiveClasses = isClickable
      ? "cursor-pointer hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      : "";

    const keyDownHandler = (event: React.KeyboardEvent) => {
      if (isClickable && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick?.();
      }
    };

    return (
      <div className="inline-flex flex-col items-center space-y-1">
        {/* Main Grade Display */}
        <div
          ref={ref}
          className={cn(
            healthGradeVariants({ variant, size, responsive }),
            gradeColorClass,
            animationClass,
            interactiveClasses,
            className
          )}
          data-testid="health-grade"
          data-grade={grade}
          role={isClickable ? "button" : "img"}
          aria-label={fullAriaLabel}
          tabIndex={isClickable ? 0 : undefined}
          onClick={onClick}
          onKeyDown={keyDownHandler}
          {...props}
        >
          {grade}
        </div>

        {/* Score Display */}
        {showScore && score !== undefined && (
          <span
            className="text-xs font-medium text-muted-foreground"
            data-testid="score-text"
          >
            {score}
          </span>
        )}

        {/* Comparison Mode */}
        {mode === 'comparison' && compareToGrade && (
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-muted-foreground">vs</span>
            <div className={cn(
              "inline-flex items-center justify-center h-4 w-4 rounded-full text-xs font-bold",
              classify.healthGrade(compareToGrade)
            )}>
              {compareToGrade}
            </div>
            {compareToScore && (
              <span className="text-muted-foreground">({compareToScore})</span>
            )}
          </div>
        )}

        {/* Context Information */}
        {context === 'global' && categoryGrade && variant !== 'minimal' && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <span>Cat:</span>
            <div className={cn(
              "inline-flex items-center justify-center h-3 w-3 rounded-full text-xs font-bold",
              classify.healthGrade(categoryGrade)
            )}>
              {categoryGrade}
            </div>
            {categoryScore && (
              <span>({categoryScore})</span>
            )}
          </div>
        )}

        {/* EU Nutri-Score */}
        {showNutriScore && nutriScore !== undefined && variant !== 'minimal' && (
          <div className="text-xs text-muted-foreground">
            EU: {nutriScore > 0 ? '+' : ''}{nutriScore}
          </div>
        )}

        {/* Improvement Suggestions */}
        {suggestions.length > 0 && variant === 'default' && (
          <div className="text-xs text-muted-foreground max-w-32 text-center">
            {suggestions[0]}
          </div>
        )}

        {/* Screen reader additional context */}
        <span className="sr-only">
          {context === 'global' ? 'Global health grade' : 'Category health grade'}: {grade}.
          {score && `Score: ${score} out of 100.`}
          {categoryGrade && context === 'global' && `Category grade: ${categoryGrade}.`}
          {nutriScore !== undefined && `EU Nutri-Score: ${nutriScore}.`}
          {suggestions.length > 0 && `Improvement suggestion: ${suggestions[0]}.`}
        </span>
      </div>
    );
  }
);

HealthGrade.displayName = "HealthGrade";

export { HealthGrade, healthGradeVariants };
