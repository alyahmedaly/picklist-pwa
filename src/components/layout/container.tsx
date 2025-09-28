import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const containerVariants = cva(
  "w-full mx-auto px-4",
  {
    variants: {
      size: {
        sm: "max-w-2xl",
        md: "max-w-4xl",
        lg: "max-w-6xl",
        xl: "max-w-7xl",
        full: "max-w-full",
        content: "max-w-3xl", // Optimized for content reading
        nutrition: "max-w-4xl", // Optimized for nutrition data display
      },
      padding: {
        none: "px-0",
        sm: "px-2",
        md: "px-4",
        lg: "px-6",
        responsive: "px-4 sm:px-6 lg:px-8",
      },
      center: {
        true: "mx-auto",
        false: "",
      },
    },
    defaultVariants: {
      size: "lg",
      padding: "responsive",
      center: true,
    },
  }
);

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  /** Custom element type */
  as?: React.ElementType;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, padding, center, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(containerVariants({ size, padding, center, className }))}
        {...props}
      />
    );
  }
);

Container.displayName = "Container";

export { Container, containerVariants };
