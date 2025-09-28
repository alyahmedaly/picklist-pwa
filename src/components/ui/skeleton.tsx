import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const skeletonVariants = cva(
  "animate-pulse rounded-md bg-muted",
  {
    variants: {
      shape: {
        rectangle: "",
        circle: "rounded-full",
        text: "rounded-sm",
      },
      animation: {
        pulse: "animate-pulse",
        wave: "animate-pulse",
        none: "",
      },
      preset: {
        none: "",
        "nutrition-card": "h-32 w-full",
        "product-list-item": "h-16 w-full",
        "protein-meter": "h-8 w-24 rounded-full",
        "health-grade": "h-6 w-6 rounded-full",
        "avatar": "h-10 w-10 rounded-full",
        "text-line": "h-4 w-full rounded-sm",
        "text-short": "h-4 w-24 rounded-sm",
      },
    },
    defaultVariants: {
      shape: "rectangle",
      animation: "pulse",
      preset: "none",
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string;
  height?: string;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, shape, animation, preset, width, height, style, ...props }, ref) => {
    const inlineStyles = {
      ...style,
      ...(width && { width }),
      ...(height && { height }),
    };

    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ shape, animation, preset, className }))}
        style={inlineStyles}
        data-testid="skeleton"
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

/**
 * SkeletonGroup for composing multiple skeleton elements
 */
export interface SkeletonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'sm' | 'md' | 'lg';
}

const SkeletonGroup = React.forwardRef<HTMLDivElement, SkeletonGroupProps>(
  ({ className, spacing = 'md', children, ...props }, ref) => {
    const spacingClasses = {
      sm: 'space-y-1',
      md: 'space-y-2',
      lg: 'space-y-4',
    };

    return (
      <div
        ref={ref}
        className={cn('flex flex-col', spacingClasses[spacing], className)}
        data-testid="skeleton-group"
        {...props}
      >
        {children}
      </div>
    );
  }
);

SkeletonGroup.displayName = "SkeletonGroup";

/**
 * Preset skeleton compositions for common nutrition components
 */
const NutritionCardSkeleton = () => (
  <SkeletonGroup className="p-4">
    <Skeleton preset="text-short" />
    <div className="nutrition-grid gap-2">
      <Skeleton height="60px" />
      <Skeleton height="60px" />
      <Skeleton height="60px" />
      <Skeleton height="60px" />
    </div>
    <Skeleton preset="text-line" width="60%" />
  </SkeletonGroup>
);

const ProductListItemSkeleton = () => (
  <div className="flex items-center space-x-3 p-2">
    <Skeleton preset="avatar" />
    <div className="flex-1">
      <Skeleton preset="text-line" width="70%" className="mb-2" />
      <Skeleton preset="text-short" width="40%" />
    </div>
    <Skeleton width="60px" height="24px" shape="rectangle" />
  </div>
);

const ProteinMeterSkeleton = () => (
  <div className="flex items-center space-x-2">
    <Skeleton preset="protein-meter" />
    <Skeleton preset="text-short" />
  </div>
);

export {
  Skeleton,
  SkeletonGroup,
  NutritionCardSkeleton,
  ProductListItemSkeleton,
  ProteinMeterSkeleton,
  skeletonVariants,
};
