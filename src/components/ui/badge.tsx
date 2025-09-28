import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-white dark:text-black hover:bg-destructive/80",
        outline: "text-foreground",
        // Ali's nutrition-themed variants
        "protein-low": "border-transparent bg-protein-low text-black dark:text-black",
        "protein-moderate": "border-transparent bg-protein-moderate text-black dark:text-black",
        "protein-medium": "border-transparent bg-protein-moderate text-black dark:text-black",
        "protein-high": "border-transparent bg-protein-high text-white dark:text-black",
        "calories-low": "border-transparent bg-calories-low text-black dark:text-black",
        "calories-moderate": "border-transparent bg-calories-moderate text-black dark:text-black",
        "calories-high": "border-transparent bg-calories-high text-black dark:text-black",
        "health-A": "border-transparent bg-health-A text-white",
        "health-B": "border-transparent bg-health-B text-white dark:text-black",
        "health-C": "border-transparent bg-health-C text-white dark:text-black",
        "health-D": "border-transparent bg-health-D text-white dark:text-black",
        "health-E": "border-transparent bg-health-E text-white",
        "halal-confirmed": "border-transparent bg-halal-confirmed text-white dark:text-black",
        "halal-questionable": "border-transparent bg-halal-questionable text-black dark:text-black",
        "halal-prohibited": "border-transparent bg-halal-prohibited text-white dark:text-black",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
