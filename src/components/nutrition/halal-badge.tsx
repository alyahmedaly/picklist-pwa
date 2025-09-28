import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, a11y } from "../../lib/utils";
import { Skeleton } from "../ui/skeleton";

const halalBadgeVariants = cva(
  "inline-flex items-center justify-center font-medium transition-all duration-200 ease-out",
  {
    variants: {
      variant: {
        default: "rounded-full px-2 py-1",
        compact: "rounded px-1.5 py-0.5",
        minimal: "rounded-sm px-1 py-0.5",
        icon: "rounded-full p-1",
      },
      size: {
        xs: "text-xs h-5",
        sm: "text-xs h-6",
        md: "text-sm h-7",
        lg: "text-base h-8",
      },
      responsive: {
        true: "text-xs h-5 sm:text-sm sm:h-6 md:text-base md:h-7",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
      responsive: false,
    },
  }
);

export type HalalStatus = 'confirmed' | 'questionable' | 'prohibited' | 'unknown';

export interface HalalBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof halalBadgeVariants> {
  /** Halal status */
  status: HalalStatus;
  /** Confidence level (0-100) */
  confidence?: number;
  /** Custom text override */
  text?: string;
  /** Source of verification */
  source?: 'ingredient-analysis' | 'certification' | 'manual-review' | 'database';
  /** Show confidence level */
  showConfidence?: boolean;
  /** Show source information */
  showSource?: boolean;
  /** Ingredient flags that caused questionable/prohibited status */
  flags?: string[];
  /** Show flags in tooltip/hover */
  showFlags?: boolean;
  /** Locale for text display */
  locale?: 'en' | 'nl' | 'ar';
  /** Last verification timestamp */
  lastVerified?: Date;
  /** Show timestamp */
  showTimestamp?: boolean;
  /** Tooltip content */
  tooltip?: string;
  /** Enable animation */
  animated?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Click handler */
  onClick?: () => void;
}

const HalalBadge = React.forwardRef<HTMLDivElement, HalalBadgeProps>(
  ({
    className,
    variant,
    size,
    responsive,
    status,
    confidence,
    text,
    source,
    showConfidence = false,
    showSource = false,
    flags = [],
    showFlags = false,
    locale = 'en',
    lastVerified,
    showTimestamp = false,
    tooltip,
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
          className={cn(halalBadgeVariants({ variant, size, responsive, className }))}
          width="60px"
          {...props}
        />
      );
    }

    // Status styling
    const statusColorClass = status === 'unknown'
      ? "bg-muted text-muted-foreground"
      : {
          confirmed: "bg-halal-confirmed text-white dark:text-black",
          questionable: "bg-halal-questionable text-black dark:text-black",
          prohibited: "bg-halal-prohibited text-white dark:text-black",
        }[status as 'confirmed' | 'questionable' | 'prohibited'];

    // Default text based on status and locale
    const getDefaultText = () => {
      if (text) return text;
      
      const texts = {
        en: {
          confirmed: responsive ? 'حلال' : 'Halal Verified',
          questionable: responsive ? '؟' : 'Needs Verification',
          prohibited: responsive ? 'حرام' : 'Haram',
          unknown: responsive ? '?' : 'Unknown',
        },
        nl: {
          confirmed: responsive ? 'حلال' : 'Halal Bevestigd',
          questionable: responsive ? '؟' : 'Verificatie Nodig',
          prohibited: responsive ? 'حرام' : 'Haram',
          unknown: responsive ? '?' : 'Onbekend',
        },
        ar: {
          confirmed: 'حلال',
          questionable: 'يحتاج تحقق',
          prohibited: 'حرام',
          unknown: 'غير معروف',
        },
      };
      
      return texts[locale][status];
    };

    const displayText = getDefaultText();

    // ARIA labels
    const ariaLabel = status === 'unknown'
      ? 'Halal status unknown'
      : a11y.halalStatusLabel(status as 'confirmed' | 'questionable' | 'prohibited');
    const fullAriaLabel = confidence
      ? `${ariaLabel}. Confidence: ${confidence}%`
      : ariaLabel;

    // Animation classes
    const animationClass = animated ? "fade-in" : "";

    // Interactive behavior
    const isClickable = Boolean(onClick);
    const interactiveClasses = isClickable
      ? "cursor-pointer hover:opacity-80 focus:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      : "";

    const keyDownHandler = (event: React.KeyboardEvent) => {
      if (isClickable && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick?.();
      }
    };

    // Tooltip content
    const tooltipContent = tooltip || (
      showFlags && flags.length > 0
        ? `Concerns: ${flags.join(', ')}`
        : undefined
    );

    return (
      <div className="inline-flex flex-col items-center space-y-1">
        {/* Main Badge */}
        <div
          ref={ref}
          className={cn(
            halalBadgeVariants({ variant, size, responsive }),
            statusColorClass,
            animationClass,
            interactiveClasses,
            className
          )}
          data-testid="halal-badge"
          data-status={status}
          role={isClickable ? "button" : "img"}
          aria-label={fullAriaLabel}
          title={tooltipContent}
          tabIndex={isClickable ? 0 : undefined}
          onClick={onClick}
          onKeyDown={keyDownHandler}
          {...props}
        >
          {displayText}
        </div>

        {/* Confidence Level */}
        {showConfidence && confidence !== undefined && variant !== 'minimal' && (
          <span className="text-xs text-muted-foreground font-medium">
            {confidence}%
          </span>
        )}

        {/* Source Information */}
        {showSource && source && variant === 'default' && (
          <span className="text-xs text-muted-foreground capitalize">
            {source.replace('-', ' ')}
          </span>
        )}

        {/* Timestamp */}
        {showTimestamp && lastVerified && variant === 'default' && (
          <span className="text-xs text-muted-foreground">
            {lastVerified.toLocaleDateString()}
          </span>
        )}

        {/* Flags (visible in default variant) */}
        {showFlags && flags.length > 0 && variant === 'default' && (
          <div className="text-xs text-muted-foreground max-w-32 text-center">
            {flags[0]}
            {flags.length > 1 && ` +${flags.length - 1}`}
          </div>
        )}

        {/* Screen reader additional context */}
        <span className="sr-only">
          Halal status: {status}.
          {confidence && `Confidence level: ${confidence} percent.`}
          {source && `Verification source: ${source.replace('-', ' ')}.`}
          {flags.length > 0 && `Concerns identified: ${flags.join(', ')}.`}
          {lastVerified && `Last verified: ${lastVerified.toLocaleDateString()}.`}
        </span>
      </div>
    );
  }
);

HalalBadge.displayName = "HalalBadge";

export { HalalBadge, halalBadgeVariants };
