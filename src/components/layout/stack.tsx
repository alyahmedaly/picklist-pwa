import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const stackVariants = cva(
  "flex",
  {
    variants: {
      direction: {
        vertical: "flex-col",
        horizontal: "flex-row",
        "responsive-vertical": "flex-col sm:flex-row",
        "responsive-horizontal": "flex-row sm:flex-col",
      },
      spacing: {
        none: "gap-0",
        xs: "gap-1",
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
        xl: "gap-8",
        responsive: "gap-2 sm:gap-4 md:gap-6",
      },
      align: {
        start: "items-start",
        center: "items-center",
        end: "items-end",
        stretch: "items-stretch",
        baseline: "items-baseline",
      },
      justify: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
        around: "justify-around",
        evenly: "justify-evenly",
      },
      wrap: {
        true: "flex-wrap",
        false: "flex-nowrap",
      },
    },
    defaultVariants: {
      direction: "vertical",
      spacing: "md",
      align: "stretch",
      justify: "start",
      wrap: false,
    },
  }
);

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {
  /** Custom element type */
  as?: React.ElementType;
  /** Divider between items */
  divider?: React.ReactNode;
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ 
    className,
    direction,
    spacing,
    align,
    justify,
    wrap,
    as: Component = "div",
    divider,
    children,
    ...props
  }, ref) => {
    // Process children with dividers if provided
    const processedChildren = React.useMemo(() => {
      if (!divider) return children;
      
      const childArray = React.Children.toArray(children);
      const result: React.ReactNode[] = [];
      
      childArray.forEach((child, index) => {
        result.push(child);
        if (index < childArray.length - 1) {
          result.push(
            React.cloneElement(divider as React.ReactElement, {
              key: `divider-${index}`,
            })
          );
        }
      });
      
      return result;
    }, [children, divider]);

    return (
      <Component
        ref={ref}
        className={cn(stackVariants({ direction, spacing, align, justify, wrap, className }))}
        {...props}
      >
        {processedChildren}
      </Component>
    );
  }
);

Stack.displayName = "Stack";

/**
 * Horizontal Stack (shorthand)
 */
const HStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  (props, ref) => (
    <Stack ref={ref} direction="horizontal" {...props} />
  )
);

HStack.displayName = "HStack";

/**
 * Vertical Stack (shorthand)
 */
const VStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  (props, ref) => (
    <Stack ref={ref} direction="vertical" {...props} />
  )
);

VStack.displayName = "VStack";

/**
 * Nutrition Stack - optimized for nutrition data display
 */
const NutritionStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction' | 'spacing'>>(
  ({ className, ...props }, ref) => (
    <Stack
      ref={ref}
      direction="responsive-vertical"
      spacing="sm"
      className={cn("nutrition-scannable", className)}
      {...props}
    />
  )
);

NutritionStack.displayName = "NutritionStack";

export { Stack, HStack, VStack, NutritionStack, stackVariants };
