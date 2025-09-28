/** Hierarchical category structure for enhanced JSON output */

export interface CategoryTree {
  /** Original flat array of categories */
  tree: string[];
  /** Primary category (first in array) */
  primary: string;
  /** Breadcrumb path joined with " > " */
  breadcrumbs: string;
  /** Category depth (array length) */
  depth: number;
}
