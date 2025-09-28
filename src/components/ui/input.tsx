import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const inputVariants = cva(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-10 px-3 py-2",
        sm: "h-9 px-2 py-1 text-sm",
        lg: "h-11 px-4 py-3",
      },
      variant: {
        default: "",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-[rgb(var(--color-protein-high))] focus-visible:ring-[rgb(var(--color-protein-high))]",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, variant, error, ...props }, ref) => {
    const finalVariant = error ? "error" : variant;
    
    return (
      <input
        type={type}
        className={cn(inputVariants({ size, variant: finalVariant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };
