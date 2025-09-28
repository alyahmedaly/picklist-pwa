import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const gridVariants = cva(
  "grid",
  {
    variants: {
      cols: {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
        5: "grid-cols-5",
        6: "grid-cols-6",
        12: "grid-cols-12",
        responsive: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        "nutrition-responsive": "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
        "product-grid": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        auto: "grid-cols-[repeat(auto-fit,minmax(200px,1fr))]",
        "auto-sm": "grid-cols-[repeat(auto-fit,minmax(150px,1fr))]",
        "auto-lg": "grid-cols-[repeat(auto-fit,minmax(250px,1fr))]",
      },
      rows: {
        1: "grid-rows-1",
        2: "grid-rows-2",
        3: "grid-rows-3",
        4: "grid-rows-4",
        5: "grid-rows-5",
        6: "grid-rows-6",
        auto: "grid-rows-[repeat(auto-fit,minmax(0,1fr))]",
        none: "",
      },
      gap: {
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
      },
      justify: {
        start: "justify-items-start",
        center: "justify-items-center",
        end: "justify-items-end",
        stretch: "justify-items-stretch",
      },
    },
    defaultVariants: {
      cols: "responsive",
      rows: "none",
      gap: "md",
      align: "stretch",
      justify: "stretch",
    },
  }
);

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  /** Custom element type */
  as?: React.ElementType;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols, rows, gap, align, justify, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(gridVariants({ cols, rows, gap, align, justify, className }))}
        {...props}
      />
    );
  }
);

Grid.displayName = "Grid";

/**
 * Grid Item with span utilities
 */
const gridItemVariants = cva(
  "",
  {
    variants: {
      colSpan: {
        1: "col-span-1",
        2: "col-span-2",
        3: "col-span-3",
        4: "col-span-4",
        5: "col-span-5",
        6: "col-span-6",
        7: "col-span-7",
        8: "col-span-8",
        9: "col-span-9",
        10: "col-span-10",
        11: "col-span-11",
        12: "col-span-12",
        full: "col-span-full",
        auto: "col-auto",
      },
      rowSpan: {
        1: "row-span-1",
        2: "row-span-2",
        3: "row-span-3",
        4: "row-span-4",
        5: "row-span-5",
        6: "row-span-6",
        full: "row-span-full",
        auto: "row-auto",
      },
      colStart: {
        1: "col-start-1",
        2: "col-start-2",
        3: "col-start-3",
        4: "col-start-4",
        5: "col-start-5",
        6: "col-start-6",
        7: "col-start-7",
        8: "col-start-8",
        9: "col-start-9",
        10: "col-start-10",
        11: "col-start-11",
        12: "col-start-12",
        13: "col-start-13",
        auto: "col-start-auto",
      },
      rowStart: {
        1: "row-start-1",
        2: "row-start-2",
        3: "row-start-3",
        4: "row-start-4",
        5: "row-start-5",
        6: "row-start-6",
        7: "row-start-7",
        auto: "row-start-auto",
      },
    },
    defaultVariants: {
      colSpan: "auto",
      rowSpan: "auto",
    },
  }
);

export interface GridItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridItemVariants> {
  /** Custom element type */
  as?: React.ElementType;
}

const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, colSpan, rowSpan, colStart, rowStart, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(gridItemVariants({ colSpan, rowSpan, colStart, rowStart, className }))}
        {...props}
      />
    );
  }
);

GridItem.displayName = "GridItem";

/**
 * Nutrition Grid - specialized for nutrition data display
 */
const NutritionGrid = React.forwardRef<HTMLDivElement, Omit<GridProps, 'cols' | 'gap'>>(
  ({ className, ...props }, ref) => (
    <Grid
      ref={ref}
      cols="nutrition-responsive"
      gap="sm"
      className={cn("nutrition-grid", className)}
      {...props}
    />
  )
);

NutritionGrid.displayName = "NutritionGrid";

/**
 * Product Grid - specialized for product cards
 */
const ProductGrid = React.forwardRef<HTMLDivElement, Omit<GridProps, 'cols'>>(
  ({ className, ...props }, ref) => (
    <Grid
      ref={ref}
      cols="product-grid"
      className={cn("product-grid", className)}
      {...props}
    />
  )
);

ProductGrid.displayName = "ProductGrid";

export { Grid, GridItem, NutritionGrid, ProductGrid, gridVariants, gridItemVariants };
